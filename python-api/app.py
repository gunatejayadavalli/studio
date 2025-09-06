
import mysql.connector,os,io,json,logging,requests,configparser
from flask import Flask, jsonify, request
from openai import OpenAI
from datetime import date
from pypdf import PdfReader
from flask_cors import CORS
import vector_db_service

# --- Logging Configuration ---
# Configure logging to write to a file named 'app.log'
# This will capture INFO level messages and above, with timestamps.
logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

config = configparser.ConfigParser()
config.read('config.ini')

# --- Database Configuration ---
db_env = os.getenv('DB_ENV', 'local')

db_config = {
    'host': config.get(db_env, 'DB_HOST', fallback=None),
    'port': config.get(db_env, 'DB_PORT', fallback=None),
    'user': config.get(db_env, 'DB_USER', fallback=None),
    'password': config.get(db_env, 'DB_PASSWORD', fallback=None),
    'database': config.get(db_env, 'DB_NAME', fallback=None)
}

# --- OpenAI Configuration ---
openai_api_key = config.get('openai', 'OPENAI_API_KEY', fallback=None)

if openai_api_key:
    client = OpenAI(api_key=openai_api_key)
    print("OpenAI client initialized successfully.")
    vector_db_service.initialize(client)
else:
    print("Warning: OPENAI_API_KEY not found. AI endpoints will not work.")
    client = None

# --- Dynamic App Configuration ---
app_config = {
    'insurance_context_method': config.get('app', 'insurance_context_method', fallback='pdf_extract')
}

# --- Helper function to get database connection ---
def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        logging.info("Successfully connected to the database.")
        return conn
    except mysql.connector.Error as err:
        logging.error(f"Error connecting to MySQL: {err}")
        return None

# --- Flask App Initialization ---
app = Flask(__name__)
logging.info("Flask application starting up...")

# Allow all origins for any route. The context path is handled by the deployment environment.
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers="*", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

port = os.getenv('port', 7075)
context = os.getenv('context', '/airbnbliteapi')
logging.info(f"Application configured with context path '{context}' on port '{port}'")

# --- Helper functions for data transformation ---
def property_to_dict(prop_tuple):
    return {
        "id": prop_tuple[0],
        "hostId": prop_tuple[1],
        "title": prop_tuple[2],
        "location": prop_tuple[3],
        "pricePerNight": float(prop_tuple[4]),
        "rating": float(prop_tuple[5]),
        "thumbnail": prop_tuple[6],
        "images": prop_tuple[7].split('|') if prop_tuple[7] else [],
        "description": prop_tuple[8],
        "amenities": prop_tuple[9].split(',') if prop_tuple[9] else [],
        "propertyInfo": prop_tuple[10],
        "data_ai_hint": prop_tuple[11]
    }

def booking_to_dict(booking_tuple):
    return {
        "id": booking_tuple[0],
        "userId": booking_tuple[1],
        "propertyId": booking_tuple[2],
        "checkIn": booking_tuple[3].strftime('%Y-%m-%d') if isinstance(booking_tuple[3], date) else booking_tuple[3],
        "checkOut": booking_tuple[4].strftime('%Y-%m-%d') if isinstance(booking_tuple[4], date) else booking_tuple[4],
        "totalCost": float(booking_tuple[5]),
        "insurancePlanId": booking_tuple[6] if booking_tuple[6] else None,
        "guests": int(booking_tuple[7]),
        "status": booking_tuple[8],
        "cancellationReason": booking_tuple[9],
        "reservationCost": float(booking_tuple[10]),
        "serviceFee": float(booking_tuple[11]),
        "insuranceCost": float(booking_tuple[12])
    }

def user_to_dict(user_tuple):
    # This function assumes the password is at index 3 and will not be returned
    return {
        "id": user_tuple[0],
        "name": user_tuple[1],
        "email": user_tuple[2],
        "avatar": user_tuple[4],
        "isHost": bool(user_tuple[5])
    }

def insurance_plan_to_dict(plan_tuple):
    return {
        "id": plan_tuple[0],
        "name": plan_tuple[1],
        "pricePercent": float(plan_tuple[2]),
        "minTripValue": float(plan_tuple[3]),
        "maxTripValue": float(plan_tuple[4]),
        "benefits": plan_tuple[5].split('|') if plan_tuple[5] else [],
        "termsUrl": plan_tuple[6]
    }

def extract_text_from_pdf_url(pdf_url):
    """Downloads a PDF from a URL and extracts text."""
    logging.info(f"Attempting to extract text from PDF URL: {pdf_url}")
    try:
        response = requests.get(pdf_url, timeout=10)
        response.raise_for_status()
        
        pdf_stream = io.BytesIO(response.content)
        reader = PdfReader(pdf_stream)

        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        logging.info(f"Successfully extracted text from {pdf_url}")
        return text
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching PDF from {pdf_url}: {e}")
        return None
    except Exception as e:
        logging.error(f"Error reading PDF content from {pdf_url}: {e}")
        return None

# --- API Routes ---
@app.route(context+'/')
def index():
    logging.info(f"Received request for {request.method} {request.path}")
    return jsonify({"message": "Welcome to the AirbnbLite API!"})

# --- Config Route ---
@app.route(context+'/config/insurance-method', methods=['GET', 'POST'])
def manage_insurance_method():
    if request.method == 'GET':
        return jsonify({"method": app_config['insurance_context_method']})
    elif request.method == 'POST':
        data = request.json
        new_method = data.get('method')
        if new_method in ['pdf_extract', 'vector_search']:
            app_config['insurance_context_method'] = new_method
            logging.info(f"Insurance context method switched to: {new_method}")
            return jsonify({"message": f"Method switched to {new_method}", "method": new_method}), 200
        else:
            return jsonify({"error": "Invalid method. Must be 'pdf_extract' or 'vector_search'."}), 400

# --- User Routes ---
@app.route(context+'/users', methods=['GET'])
def get_users():
    logging.info(f"Received request for {request.method} {request.path}")
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, NULL, avatar, isHost FROM users")
    users = [user_to_dict(user) for user in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(users)
    
@app.route(context+'/register', methods=['POST'])
def register_user():
    logging.info(f"Received request for {request.method} {request.path}")
    data = request.json
    if not all(k in data for k in ['name', 'email', 'password']):
        logging.warning("Registration failed: Missing required fields.")
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        logging.warning(f"Registration failed: Email '{data['email']}' already exists.")
        return jsonify({"error": "Email already exists"}), 409

    query = "INSERT INTO users (name, email, password, avatar, isHost) VALUES (%s, %s, %s, %s, %s)"
    values = (data['name'], data['email'], data['password'], data.get('avatar', ''), data.get('isHost', False))
    cursor.execute(query, values)
    conn.commit()
    
    new_user_id = cursor.lastrowid
    cursor.execute("SELECT id, name, email, NULL, avatar, isHost FROM users WHERE id = %s", (new_user_id,))
    new_user = user_to_dict(cursor.fetchone())

    cursor.close()
    conn.close()
    logging.info(f"Successfully registered new user with ID: {new_user_id}")
    return jsonify(new_user), 201

@app.route(context+'/login', methods=['POST'])
def login():
    logging.info(f"Received request for {request.method} {request.path}")
    data = request.json
    if not all(k in data for k in ['email', 'password']):
        logging.warning("Login failed: Missing email or password.")
        return jsonify({"error": "Missing email or password"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    
    query = "SELECT id, name, email, NULL, avatar, isHost FROM users WHERE email = %s AND password = %s"
    cursor.execute(query, (data['email'], data['password']))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()

    if user:
        logging.info(f"User '{data['email']}' logged in successfully.")
        return jsonify(user_to_dict(user))
    else:
        logging.warning(f"Login failed: Invalid credentials for user '{data['email']}'.")
        return jsonify({"error": "Invalid credentials"}), 401

@app.route(context+'/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    logging.info(f"Received request for {request.method} {request.path}")
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()

    fields = []
    values = []
    if 'name' in data:
        fields.append("name = %s")
        values.append(data['name'])
    if 'avatar' in data:
        fields.append("avatar = %s")
        values.append(data['avatar'])
    if 'isHost' in data:
        fields.append("isHost = %s")
        values.append(data['isHost'])
    if 'password' in data:
        fields.append("password = %s")
        values.append(data['password'])

    if not fields:
        logging.warning(f"User update for ID {user_id} failed: No fields to update.")
        return jsonify({"error": "No fields to update"}), 400

    query = f"UPDATE users SET {', '.join(fields)} WHERE id = %s"
    values.append(user_id)

    cursor.execute(query, tuple(values))
    conn.commit()

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        logging.warning(f"User update for ID {user_id} failed: User not found or no changes made.")
        return jsonify({"error": "User not found or no changes made"}), 404

    cursor.execute("SELECT id, name, email, NULL, avatar, isHost FROM users WHERE id = %s", (user_id,))
    updated_user = user_to_dict(cursor.fetchone())

    cursor.close()
    conn.close()
    logging.info(f"Successfully updated user ID: {user_id}")
    return jsonify(updated_user)


# --- Property Routes ---
@app.route(context+'/properties', methods=['GET'])
def get_properties():
    logging.info(f"Received request for {request.method} {request.path}")
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM properties")
    properties = [property_to_dict(prop) for prop in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(properties)

@app.route(context+'/properties', methods=['POST'])
def add_property():
    logging.info(f"Received request for {request.method} {request.path}")
    data = request.json
    amenities_str = ",".join(data.get('amenities', []))
    images_str = "|".join(data.get('images', []))

    query = """
    INSERT INTO properties 
    (hostId, title, location, pricePerNight, rating, thumbnail, images, description, amenities, propertyInfo, data_ai_hint) 
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        int(data['hostId']), data['title'], data['location'], data['pricePerNight'],
        data.get('rating', 0), data.get('thumbnail', ''), images_str,
        data['description'], amenities_str, data.get('propertyInfo', ''),
        data.get('data_ai_hint', '')
    )
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute(query, values)
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    
    logging.info(f"Successfully added new property with ID: {new_id}")
    return jsonify({"message": "Property added successfully", "id": new_id}), 201

@app.route(context+'/properties/<int:prop_id>', methods=['PUT'])
def update_property(prop_id):
    logging.info(f"Received request for {request.method} {request.path}")
    data = request.json
    amenities_str = ",".join(data.get('amenities', []))

    query = """
    UPDATE properties SET
    title = %s, description = %s, location = %s, pricePerNight = %s, amenities = %s, propertyInfo = %s
    WHERE id = %s
    """
    values = (
        data['title'], data['description'], data['location'], data['pricePerNight'],
        amenities_str, data.get('propertyInfo', ''), prop_id
    )

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute(query, values)
    conn.commit()
    
    rowcount = cursor.rowcount
    cursor.close()
    conn.close()

    if rowcount > 0:
        logging.info(f"Successfully updated property ID: {prop_id}")
        return jsonify({"message": "Property updated successfully"}), 200
    else:
        logging.warning(f"Property update for ID {prop_id} failed: Property not found.")
        return jsonify({"error": "Property not found"}), 404

@app.route(context+'/properties/<int:prop_id>', methods=['DELETE'])
def delete_property(prop_id):
    logging.info(f"Received request for {request.method} {request.path}")
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
        
    cursor.execute("DELETE FROM properties WHERE id = %s", (prop_id,))
    conn.commit()
    
    rowcount = cursor.rowcount
    cursor.close()
    conn.close()

    if rowcount > 0:
        logging.info(f"Successfully deleted property ID: {prop_id}")
        return jsonify({"message": "Property deleted successfully"}), 200
    else:
        logging.warning(f"Property deletion for ID {prop_id} failed: Property not found.")
        return jsonify({"error": "Property not found"}), 404

# --- Booking Routes ---
@app.route(context+'/bookings', methods=['GET'])
def get_bookings():
    logging.info(f"Received request for {request.method} {request.path}")
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    # Select columns explicitly to guarantee order
    query = """
    SELECT id, userId, propertyId, checkIn, checkOut, totalCost, insurancePlanId, guests, 
           status, cancellationReason, reservationCost, serviceFee, insuranceCost
    FROM bookings
    """
    cursor.execute(query)
    bookings = [booking_to_dict(booking) for booking in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(bookings)

@app.route(context+'/bookings', methods=['POST'])
def create_booking():
    logging.info(f"Received request for {request.method} {request.path}")
    data = request.json
    query = """
    INSERT INTO bookings 
    (userId, propertyId, checkIn, checkOut, totalCost, insurancePlanId, guests, status, reservationCost, serviceFee, insuranceCost) 
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        int(data['userId']), int(data['propertyId']), data['checkIn'], data['checkOut'],
        data['totalCost'], data.get('insurancePlanId'), data['guests'], 'confirmed',
        data['reservationCost'], data['serviceFee'], data['insuranceCost']
    )
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute(query, values)
    conn.commit()
    new_id = cursor.lastrowid
    
    # Select columns explicitly to guarantee order
    fetch_query = """
    SELECT id, userId, propertyId, checkIn, checkOut, totalCost, insurancePlanId, guests, 
           status, cancellationReason, reservationCost, serviceFee, insuranceCost
    FROM bookings WHERE id = %s
    """
    cursor.execute(fetch_query, (new_id,))
    new_booking_tuple = cursor.fetchone()
    new_booking = booking_to_dict(new_booking_tuple)

    cursor.close()
    conn.close()

    logging.info(f"Successfully created new booking with ID: {new_id}")
    return jsonify(new_booking), 201


@app.route(context+'/bookings/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    logging.info(f"Received request for {request.method} {request.path}")
    data = request.json
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()

    fields = []
    values = []

    if 'status' in data:
        fields.append("status = %s")
        values.append(data['status'])
    if 'cancellationReason' in data:
        fields.append("cancellationReason = %s")
        values.append(data.get('cancellationReason'))
    if 'insurancePlanId' in data:
        fields.append("insurancePlanId = %s")
        values.append(data['insurancePlanId'])
    if 'totalCost' in data:
        fields.append("totalCost = %s")
        values.append(data['totalCost'])
    if 'insuranceCost' in data:
        fields.append("insuranceCost = %s")
        values.append(data['insuranceCost'])

    if not fields:
        logging.warning(f"Booking update for ID {booking_id} failed: No fields to update.")
        return jsonify({"error": "No fields to update"}), 400

    query = f"UPDATE bookings SET {', '.join(fields)} WHERE id = %s"
    values.append(booking_id)

    cursor.execute(query, tuple(values))
    conn.commit()

    rowcount = cursor.rowcount
    cursor.close()
    conn.close()

    if rowcount > 0:
        logging.info(f"Successfully updated booking ID: {booking_id}")
        return jsonify({"message": "Booking updated successfully"}), 200
    else:
        logging.warning(f"Booking update for ID {booking_id} failed: Booking not found or no changes made.")
        return jsonify({"error": "Booking not found or no changes made"}), 404

# --- Insurance Plan Routes ---
@app.route(context+'/insurance-plans', methods=['GET'])
def get_insurance_plans():
    logging.info(f"Received request for {request.method} {request.path}")
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM insurance_plans")
    plans = [insurance_plan_to_dict(plan) for plan in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(plans)

# --- AI Chatbot Agent Helpers ---

# Step 1 Helper: Triage - Classify the user's intent
def get_query_category(user_query, chat_history):
    """Classifies the user's query into one of several categories, considering chat history."""
    
    # Create a condensed version of the chat history for context
    history_str = "\n".join([f"{msg['sender'].capitalize()}: {msg['text']}" for msg in chat_history[:-1]]) # all but the last message

    system_prompt = """
    You are a query classification agent. Your job is to classify the LATEST user query based on the provided conversation history.
    Classify the query into one of the following categories:
    - "BOOKING": Questions about the booking itself (check-in/out dates, number of guests, cost).
    - "PROPERTY": Questions about the property itself (amenities, address, directions, rules, host).
    - "INSURANCE": Questions about travel insurance (coverage, benefits, cost, terms, how to purchase).
    - "CANCELLATION": Questions about cancelling the booking or the insurance.
    - "GENERAL": All other questions (greetings, thanks, questions about the app itself).

    Analyze the 'Conversation History' to understand the context, then classify the 'Latest User Query'.
    Respond with ONLY the category name in a JSON object like {"category": "CATEGORY_NAME"}.
    """
    
    user_content = f"""
    --- Conversation History ---
    {history_str}
    --- End of History ---

    --- Latest User Query ---
    {user_query}
    --- End of Query ---
    """
    messages_to_send = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    logging.info("\n--- Prompt sent to OpenAI (get_query_category) ---\n" + json.dumps(messages_to_send, indent=2) + "\n---------------------------\n")

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_to_send,
            response_format={"type": "json_object"}
        )
        response_content = completion.choices[0].message.content
        logging.info(f"\n--- OpenAI Response (get_query_category) ---\n{response_content}\n---------------------------\n")
        response = json.loads(response_content)
        category = response.get("category", "GENERAL")
        logging.info(f"Query classification successful. Category: {category}")
        return category
    except Exception as e:
        logging.error(f"Error in query classification: {e}")
        return "GENERAL"


# Step 2 Helpers: Retrieve - Build targeted context based on intent
def get_booking_context(booking_data):
    """Builds a context string for booking-related questions."""
    lines = [
        "== Booking Details ==",
        f"Check-in Date: {booking_data.get('checkIn')}",
        f"Check-out Date: {booking_data.get('checkOut')}",
        f"Number of Guests: {booking_data.get('guests')}",
        f"Total Cost: ${booking_data.get('totalCost'):.2f}",
        f"Reservation Cost: ${booking_data.get('reservationCost'):.2f}",
        f"Service Fee: ${booking_data.get('serviceFee'):.2f}",
        f"Insurance Cost: ${booking_data.get('insuranceCost'):.2f}",
        "\n== Policy ==",
        "Answer questions based on the provided booking details. Do not make up information.",
    ]
    return "\n".join(lines)

def get_property_context(property_data, host_data):
    """Builds a context string for property-related questions."""
    lines = [
        "== Property Details ==",
        f"Property Name: {property_data.get('title')}",
        f"Location: {property_data.get('location')}",
        f"Description: {property_data.get('description')}",
        f"Amenities: {', '.join(property_data.get('amenities', []))}",
    ]
    if property_data.get('propertyInfo'):
        lines.append(f"\nAdditional Information from Host:\n{property_data.get('propertyInfo')}")
    else:
        lines.append("\nAdditional Information from Host: (No additional information was provided)")
    lines.extend([
        "\n== Host Information ==",
        f"Host Name: {host_data.get('name')}",
        f"Host Email: {host_data.get('email')}",
        "\n== Policy ==",
        "For questions about the property itself, refer to the provided details. If the information isn't available, direct the user to contact the host via their email.",
    ])
    return "\n".join(lines)

def get_insurance_context(user_query, insurance_plan, eligible_insurance_plan, booking):
    """
    Builds context for insurance questions.
    Uses either full PDF extraction or vector search based on app config.
    """
    method = app_config['insurance_context_method']
    logging.info(f"Building insurance context using method: {method}")

    lines = ["== Insurance Details =="]
    policy_text = None
    policy_source_url = None
    current_plan = insurance_plan or eligible_insurance_plan
    
    if insurance_plan:
        lines.append(f"The user has purchased: {insurance_plan.get('name')}")
        policy_source_url = insurance_plan.get('termsUrl')
    elif eligible_insurance_plan:
        lines.append("The user has NOT purchased insurance but is eligible for the following plan. To purchase, the guest can add and pay for it on the Trip Details page.")
        lines.append(f"Eligible Plan Name: {eligible_insurance_plan.get('name')}")
        policy_source_url = eligible_insurance_plan.get('termsUrl')
    else:
        lines.append("No insurance was purchased, and it's no longer possible to add it.")
        policy_source_url = None

    if current_plan and current_plan.get('benefits'):
        lines.append("\n== High-level Benefits ==")
        lines.extend([f"- {benefit}" for benefit in current_plan['benefits']])

    if policy_source_url:
        use_fallback = False
        if method == 'vector_search':
            logging.info(f"Performing vector search for query: '{user_query}'")
            vector_db_service.get_or_create_policy_embeddings(policy_source_url)
            search_results = vector_db_service.search_policy_documents(user_query, policy_source_url)
            
            if search_results:
                policy_text = "\n\n".join([result.payload['text'] for result in search_results])
                lines.extend(["\n--- Relevant Insurance Policy Details ---", policy_text, "--- End of Policy Details ---"])
            else:
                logging.warning(f"Vector search for '{user_query}' returned no results. Falling back to PDF extraction.")
                use_fallback = True
        
        if method == 'pdf_extract' or use_fallback:
            policy_text = extract_text_from_pdf_url(policy_source_url)
            if policy_text:
                lines.extend(["\n--- Full Insurance Policy Details ---", policy_text, "--- End of Policy Details ---"])
            else:
                 lines.append("\n(Could not load the full insurance policy document.)")

    lines.extend([
        "\n== Policy ==",
        "Answer questions based on the provided insurance details. To cancel only the travel insurance while keeping the reservation, the guest must contact support at support@airbnblite.com.",
    ])
    return "\n".join(lines)

def get_cancellation_context(booking):
    """Builds context for cancellation questions."""
    todays_date_str = date.today().strftime('%Y-%m-%d')
    lines = [
        "== Cancellation Policy ==",
        f"Today's Date: {todays_date_str}",
        f"Booking Check-in Date: {booking.get('checkIn')}",
        "\nGuest Cancellation Rule: You must determine if the user can cancel their booking by comparing today's date with the check-in date.",
        "- If today's date is BEFORE the check-in date: The user is allowed to cancel. Your response should state that they can cancel from the Trip Details page. Mention that they will receive a full refund of the Total Cost, and any purchased travel insurance is also cancelled automatically.",
        "- If today's date is THE SAME AS or LATER THAN the check-in date: The user is NOT allowed to cancel. Your response must clearly state that it is too late to cancel because the check-in date has passed or is today. Do NOT mention the Trip Details page as a method for cancellation in this case.",
        "In your response, do not mention today's date, just state the policy outcome.",
        "\nInsurance-Only Cancellation: To cancel only the travel insurance while keeping the reservation, the guest must contact support at support@airbnblite.com.",
    ]
    return "\n".join(lines)


# --- UN-OPTIMIZED CHATBOT ---
@app.route(context+'/chat', methods=['POST'])
def chat_with_bot():
    logging.info(f"Received request for {request.method} {request.path}")
    if not client:
        logging.error("Chat request failed: OpenAI API key not configured")
        return jsonify({"error": "OpenAI API key not configured"}), 500

    data = request.json
    chat_messages = data.get('messages')
    booking = data.get('booking')
    property_data = data.get('property')
    host_data = data.get('hostInfo')
    insurance_plan = data.get('insurancePlan')
    eligible_insurance_plan = data.get('eligibleInsurancePlan')

    if not all([chat_messages, booking, property_data, host_data]):
        logging.warning("Chat request failed: Missing required fields")
        return jsonify({"error": "Missing required fields"}), 400
    
    user_query = chat_messages[-1]['text'] if chat_messages else ""

    # Build a single, large context string by combining all available information
    booking_context = get_booking_context(booking)
    property_context = get_property_context(property_data, host_data)
    insurance_context = get_insurance_context(user_query, insurance_plan, eligible_insurance_plan, booking)
    cancellation_context = get_cancellation_context(booking)
    
    full_context = f"{booking_context}\n\n{property_context}\n\n{insurance_context}\n\n{cancellation_context}"
    
    system_prompt = f"""
    You are a friendly and helpful assistant for the travel app AirbnbLite.
    Your goal is to answer the user's question based ONLY on the information provided in the 'CONTEXT' section.
    Be conversational and clear. Do not use markdown (like bolding or lists).
    If the information to answer a question is not in the context, state that you don't have that information and suggest an alternative (e.g., 'contact the host' or 'contact support@airbnblite.com').

    ---CONTEXT---
    {full_context}
    ---END OF CONTEXT---
    """
    
    openai_messages = [{"role": "assistant" if msg["sender"] == "bot" else "user", "content": msg["text"]} for msg in chat_messages]

    messages_to_send = [
        {"role": "system", "content": system_prompt},
        *openai_messages
    ]

    logging.info("\n--- Prompt sent to OpenAI (Chat) ---\n" + json.dumps(messages_to_send, indent=2) + "\n---------------------------\n")

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_to_send
        )
        response_text = completion.choices[0].message.content
        logging.info(f"\n--- OpenAI Response (Chat) ---\n{response_text}\n---------------------------\n")
        return jsonify({"response": response_text})
    except Exception as e:
        logging.error(f"Error calling OpenAI in /chat: {e}")
        return jsonify({"error": "Failed to get response from AI"}), 500


# --- OPTIMIZED AI Chatbot Agent ---
@app.route(context+'/chatOptimized', methods=['POST'])
def chat_with_bot_optimized():
    logging.info(f"Received request for {request.method} {request.path}")
    if not client:
        logging.error("Optimized chat request failed: OpenAI API key not configured")
        return jsonify({"error": "OpenAI API key not configured"}), 500
        
    data = request.json
    chat_messages = data.get('messages')
    booking = data.get('booking')
    property_data = data.get('property')
    host_data = data.get('hostInfo')
    insurance_plan = data.get('insurancePlan')
    eligible_insurance_plan = data.get('eligibleInsurancePlan')

    if not all([chat_messages, booking, property_data, host_data]):
        logging.warning("Optimized chat request failed: Missing required fields")
        return jsonify({"error": "Missing required fields"}), 400
    
    # Extract the latest user query
    user_query = chat_messages[-1]['text'] if chat_messages else ""
    if not user_query:
        return jsonify({"response": "I'm sorry, I didn't get your message. Could you please repeat?"})

    # Step 1: Triage the user's query
    category = get_query_category(user_query, chat_messages)
    logging.info(f"Optimized chat: Query classified as '{category}'")

    # Step 2: Retrieve context based on the category
    context = ""
    if category == "BOOKING":
        context = get_booking_context(booking)
    elif category == "PROPERTY":
        context = get_property_context(property_data, host_data)
    elif category == "INSURANCE":
        context = get_insurance_context(user_query, insurance_plan, eligible_insurance_plan, booking)
    elif category == "CANCELLATION":
        context = get_cancellation_context(booking)
    # For "GENERAL", we provide a minimal context.
    else: 
        context = f"The user is asking a general question about their trip to {property_data.get('title')}."
    logging.info(f"Optimized chat: Generated context for category '{category}'")
    
    # Step 3: Synthesize the final answer with targeted context
    system_prompt = f"""
    You are a friendly and helpful assistant for the travel app AirbnbLite.
    Your goal is to answer the user's question based ONLY on the information provided in the 'CONTEXT' section.
    Be conversational and clear. Do not use markdown (like bolding or lists).
    If the information to answer a question is not in the context, state that you don't have that information and suggest an alternative (e.g., 'contact the host' or 'contact support@airbnblite.com').

    ---CONTEXT---
    {context}
    ---END OF CONTEXT---
    """
    
    # Convert frontend messages to OpenAI format
    openai_messages = [{"role": "assistant" if msg["sender"] == "bot" else "user", "content": msg["text"]} for msg in chat_messages]

    messages_to_send = [
        {"role": "system", "content": system_prompt},
        *openai_messages
    ]

    logging.info("\n--- Prompt sent to OpenAI (Optimized) ---\n" + json.dumps(messages_to_send, indent=2) + "\n---------------------------\n")

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_to_send
        )
        response_text = completion.choices[0].message.content
        logging.info(f"\n--- OpenAI Response (Optimized) ---\n{response_text}\n---------------------------\n")
        return jsonify({"response": response_text})
    except Exception as e:
        logging.error(f"Error calling OpenAI in /chatOptimized: {e}")
        return jsonify({"error": "Failed to get response from AI"}), 500


# --- AI Chatbot for Checkout Decision Support ---
@app.route(context+'/chatCheckout', methods=['POST'])
def chat_checkout():
    logging.info(f"Received request for {request.method} {request.path}")
    if not client:
        logging.error("Checkout chat request failed: OpenAI API key not configured")
        return jsonify({"error": "OpenAI API key not configured"}), 500

    data = request.json
    chat_messages = data.get('messages')
    eligible_insurance_plan = data.get('eligibleInsurancePlan')

    if not all([chat_messages, eligible_insurance_plan]):
        logging.warning("Checkout chat request failed: Missing required fields")
        return jsonify({"error": "Missing required fields"}), 400
    
    # Extract the latest user query
    user_query = chat_messages[-1]['text'] if chat_messages else ""
    if not user_query:
        return jsonify({"response": "I'm sorry, I didn't get your message. Could you please repeat?"})

    # Context is focused ONLY on the eligible insurance plan
    # Pass `None` for booking as it's not created yet
    context = get_insurance_context(user_query, None, eligible_insurance_plan, None)

    system_prompt = f"""
    You are an expert insurance assistant for the travel app AirbnbLite.
    Your SOLE PURPOSE is to help the user decide if they should purchase the travel insurance plan they are eligible for.
    Use ONLY the provided 'CONTEXT' about the plan's benefits, cost, and terms to answer their questions.
    Be helpful, clear, and informative. Do not discuss any other topics.
    If asked something outside the scope of the provided insurance plan, politely state that you can only assist with questions about the insurance offered.

    ---CONTEXT---
    {context}
    ---END OF CONTEXT---
    """

    # Convert frontend messages to OpenAI format
    openai_messages = [{"role": "assistant" if msg["sender"] == "bot" else "user", "content": msg["text"]} for msg in chat_messages]

    messages_to_send = [
        {"role": "system", "content": system_prompt},
        *openai_messages
    ]

    logging.info("\n--- Prompt sent to OpenAI (Chat Checkout) ---\n" + json.dumps(messages_to_send, indent=2) + "\n---------------------------\n")

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_to_send
        )
        response_text = completion.choices[0].message.content
        logging.info(f"\n--- OpenAI Response (Chat Checkout) ---\n{response_text}\n---------------------------\n")
        return jsonify({"response": response_text})
    except Exception as e:
        logging.error(f"Error calling OpenAI in /chatCheckout: {e}")
        return jsonify({"error": "Failed to get response from AI"}), 500


# --- NEW AI HELPER FOR INSURANCE SUGGESTION ---
def get_insurance_suggestion_context(location, trip_cost, insurance_plan):
    """Builds context for generating an insurance suggestion message."""
    lines = [
        f"The user is booking a trip to {location} with a total cost of ${trip_cost:.2f}.",
        f"They are eligible for the '{insurance_plan.get('name')}' plan.",
        "\nKey benefits of this plan include:",
    ]
    lines.extend([f"- {benefit}" for benefit in insurance_plan.get('benefits', [])])
    return "\n".join(lines)


@app.route(context+'/suggest-insurance-message', methods=['POST'])
def suggest_insurance_message_endpoint():
    logging.info(f"Received request for {request.method} {request.path}")
    if not client:
        logging.error("Insurance suggestion request failed: OpenAI API key not configured")
        return jsonify({"error": "OpenAI API key not configured"}), 500

    data = request.json
    location = data.get('location')
    trip_cost = data.get('tripCost')
    insurance_plan = data.get('insurancePlan')

    if not all([location, trip_cost, insurance_plan]):
        logging.warning("Insurance suggestion request failed: Missing required fields")
        return jsonify({"error": "Missing required fields"}), 400

    context = get_insurance_suggestion_context(location, trip_cost, insurance_plan)

    system_prompt = f"""
    You are a helpful travel assistant. Your goal is to write a short, friendly, and encouraging message (2-3 sentences) suggesting travel insurance.
    Use ONLY the information provided in the 'CONTEXT' section.
    Highlight one or two key benefits from the context to make the suggestion feel specific and valuable.
    Frame it as a helpful suggestion, not a hard sell. For example, mention \"peace of mind.\"
    Do not use markdown.

    ---CONTEXT---
    {context}
    ---END OF CONTEXT---
    """
    
    messages_to_send = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Please write the suggestion message."}
    ]

    logging.info("\n--- Prompt sent to OpenAI (Suggest Insurance) ---\n" + json.dumps(messages_to_send, indent=2) + "\n---------------------------\n")

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_to_send,
            max_tokens=100
        )
        response_text = completion.choices[0].message.content.strip()
        logging.info(f"\n--- OpenAI Response (Suggest Insurance) ---\n{response_text}\n---------------------------\n")
        return jsonify({ "message": response_text })
    except Exception as e:
        logging.error(f"Error calling OpenAI for insurance suggestion: {e}")
        return jsonify({"error": "Failed to get response from AI"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)

    
    

    