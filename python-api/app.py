
import mysql.connector,os
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import date
import openai
from dotenv import load_dotenv
import requests
import io
from pypdf import PdfReader
import json

# --- OpenAI Configuration ---
# Make sure to set your OPENAI_API_KEY in your environment
load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')
if openai.api_key:
    client = openai.OpenAI()
else:
    print("Warning: OPENAI_API_KEY not found. The /chat endpoint will not work.")
    client = None

# --- Database Configuration ---
db_config = {
    # 'host': '34.47.199.230',
    'host': 'localhost',
    'port': '3306',
    'user': 'root',
    'password': 'mypass100',
    'database': 'airbnblite-db'
}

# --- Helper function to get database connection ---
def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return None

# --- Flask App Initialization ---
app = Flask(__name__)
# Allow all origins for any route. The context path is handled by the deployment environment.
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers="*", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

port = os.getenv('port', 7076)

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
        
        return text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching PDF from {pdf_url}: {e}")
        return None
    except Exception as e:
        print(f"Error reading PDF content from {pdf_url}: {e}")
        return None


# --- API Routes ---
@app.route('/')
def index():
    return jsonify({"message": "Welcome to the AirbnbLite API!"})

# --- User Routes ---
@app.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, NULL, avatar, isHost FROM users")
    users = [user_to_dict(user) for user in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(users)

@app.route('/register', methods=['POST'])
def register_user():
    data = request.json
    if not all(k in data for k in ['name', 'email', 'password']):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
    if cursor.fetchone():
        cursor.close()
        conn.close()
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
    return jsonify(new_user), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not all(k in data for k in ['email', 'password']):
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
        return jsonify(user_to_dict(user))
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
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
        return jsonify({"error": "No fields to update"}), 400

    query = f"UPDATE users SET {', '.join(fields)} WHERE id = %s"
    values.append(user_id)

    cursor.execute(query, tuple(values))
    conn.commit()

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        return jsonify({"error": "User not found or no changes made"}), 404

    cursor.execute("SELECT id, name, email, NULL, avatar, isHost FROM users WHERE id = %s", (user_id,))
    updated_user = user_to_dict(cursor.fetchone())

    cursor.close()
    conn.close()
    return jsonify(updated_user)


# --- Property Routes ---
@app.route('/properties', methods=['GET'])
def get_properties():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM properties")
    properties = [property_to_dict(prop) for prop in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(properties)

@app.route('/properties', methods=['POST'])
def add_property():
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
    
    return jsonify({"message": "Property added successfully", "id": new_id}), 201

@app.route('/properties/<int:prop_id>', methods=['PUT'])
def update_property(prop_id):
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
        return jsonify({"message": "Property updated successfully"}), 200
    else:
        return jsonify({"error": "Property not found"}), 404

@app.route('/properties/<int:prop_id>', methods=['DELETE'])
def delete_property(prop_id):
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
        return jsonify({"message": "Property deleted successfully"}), 200
    else:
        return jsonify({"error": "Property not found"}), 404

# --- Booking Routes ---
@app.route('/bookings', methods=['GET'])
def get_bookings():
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

@app.route('/bookings', methods=['POST'])
def create_booking():
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

    return jsonify(new_booking), 201


@app.route('/bookings/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
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
        return jsonify({"error": "No fields to update"}), 400

    query = f"UPDATE bookings SET {', '.join(fields)} WHERE id = %s"
    values.append(booking_id)

    cursor.execute(query, tuple(values))
    conn.commit()

    rowcount = cursor.rowcount
    cursor.close()
    conn.close()

    if rowcount > 0:
        return jsonify({"message": "Booking updated successfully"}), 200
    else:
        return jsonify({"error": "Booking not found or no changes made"}), 404

# --- Insurance Plan Routes ---
@app.route('/insurance-plans', methods=['GET'])
def get_insurance_plans():
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
def get_query_category(user_query):
    """Classifies the user's query into one of several categories."""
    system_prompt = """
    You are a query classification agent. Classify the user's query into one of the following categories:
    - "BOOKING": Questions about the booking itself (check-in/out dates, number of guests, cost).
    - "PROPERTY": Questions about the property itself (amenities, address, directions, rules, host).
    - "INSURANCE": Questions about travel insurance (coverage, benefits, cost, terms, how to purchase).
    - "CANCELLATION": Questions about cancelling the booking or the insurance.
    - "GENERAL": All other questions (greetings, thanks, questions about the app itself).

    Respond with ONLY the category name in a JSON object like {"category": "CATEGORY_NAME"}.
    """
    
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            response_format={"type": "json_object"}
        )
        response = json.loads(completion.choices[0].message.content)
        return response.get("category", "GENERAL")
    except Exception as e:
        print(f"Error in query classification: {e}")
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

def get_insurance_context(insurance_plan, eligible_insurance_plan, booking):
    """
    Builds context for insurance questions.
    In a real-world app, this function would use the user's query to perform a
    semantic search (RAG) over a vector database of insurance documents.
    """
    lines = ["== Insurance Details =="]
    if insurance_plan:
        lines.append(f"The user has purchased: {insurance_plan.get('name')}")
        if 'benefits' in insurance_plan and insurance_plan['benefits']:
            lines.append("\nHigh-level Benefits:")
            lines.extend([f"- {benefit}" for benefit in insurance_plan.get('benefits', [])])
        
        if insurance_plan.get('termsUrl'):
            policy_text = extract_text_from_pdf_url(insurance_plan['termsUrl'])
            if policy_text:
                lines.extend(["\n--- Full Insurance Policy Details ---", policy_text, "--- End of Policy ---"])
            else:
                 lines.append("\n(Could not load the full insurance policy document.)")
    elif eligible_insurance_plan:
        lines.append("The user has NOT purchased insurance but is eligible for the following plan.")
        lines.append(f"Eligible Plan Name: {eligible_insurance_plan.get('name')}")
        if 'benefits' in eligible_insurance_plan and eligible_insurance_plan['benefits']:
            lines.append("\nHigh-level Benefits of Eligible Plan:")
            lines.extend([f"- {benefit}" for benefit in eligible_insurance_plan.get('benefits', [])])
        
        if eligible_insurance_plan.get('termsUrl'):
            policy_text = extract_text_from_pdf_url(eligible_insurance_plan['termsUrl'])
            if policy_text:
                lines.extend(["\n--- Full Policy Details for Eligible Plan ---", policy_text, "--- End of Policy ---"])
            else:
                 lines.append("\n(Could not load the full policy document.)")
    else:
        lines.append("No insurance was purchased, and it's no longer possible to add it.")
    
    lines.extend([
        "\n== Policy ==",
        "Answer questions based on the provided insurance details. For questions about cancelling only the insurance, direct the user to contact support at support@airbnblite.com.",
    ])
    return "\n".join(lines)

def get_cancellation_context(booking):
    """Builds context for cancellation questions."""
    todays_date_str = date.today().strftime('%Y-%m-%d')
    lines = [
        "== Cancellation Policy ==",
        f"Today's Date: {todays_date_str}",
        f"Booking Check-in Date: {booking.get('checkIn')}",
        "\nGuest Cancellation Rule: A guest is allowed to cancel their reservation from the Booking details page. To check if they can cancel, you MUST compare today's date to the check-in date. The rule is simple: if today's date is before the check-in date, the guest is allowed to cancel. If today's date is the same as or later than the check-in date, it is too late to cancel.",
        "Refund Policy: When a guest cancels in time, they receive a full refund of the Total Cost, and the travel insurance is also cancelled automatically.",
        "Insurance-Only Cancellation: To cancel only the travel insurance and keep the reservation, the guest must contact support at support@airbnblite.com.",
    ]
    return "\n".join(lines)


# --- UN-OPTIMIZED CHATBOT ---
@app.route('/chat', methods=['POST'])
def chat_with_bot():
    if not client:
        return jsonify({"error": "OpenAI API key not configured"}), 500

    data = request.json
    chat_messages = data.get('messages')
    booking = data.get('booking')
    property_data = data.get('property')
    host_data = data.get('hostInfo')
    insurance_plan = data.get('insurancePlan')
    eligible_insurance_plan = data.get('eligibleInsurancePlan')

    if not all([chat_messages, booking, property_data, host_data]):
        return jsonify({"error": "Missing required fields"}), 400

    # Build a single, large context string by combining all available information
    property_context = get_property_context(property_data, host_data)
    insurance_context = get_insurance_context(insurance_plan, eligible_insurance_plan, booking)
    cancellation_context = get_cancellation_context(booking)
    
    full_context = f"{property_context}\n\n{insurance_context}\n\n{cancellation_context}"
    
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

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_to_send
        )
        response_text = completion.choices[0].message.content
        return jsonify({"response": response_text})
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return jsonify({"error": "Failed to get response from AI"}), 500


# --- OPTIMIZED AI Chatbot Agent ---
@app.route('/chatOptimized', methods=['POST'])
def chat_with_bot_optimized():
    if not client:
        return jsonify({"error": "OpenAI API key not configured"}), 500
        
    data = request.json
    chat_messages = data.get('messages')
    booking = data.get('booking')
    property_data = data.get('property')
    host_data = data.get('hostInfo')
    insurance_plan = data.get('insurancePlan')
    eligible_insurance_plan = data.get('eligibleInsurancePlan')

    if not all([chat_messages, booking, property_data, host_data]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Extract the latest user query
    user_query = chat_messages[-1]['text'] if chat_messages else ""
    if not user_query:
        return jsonify({"response": "I'm sorry, I didn't get your message. Could you please repeat?"})

    # Step 1: Triage the user's query
    category = get_query_category(user_query)
    print(f"Query classified as: {category}")

    # Step 2: Retrieve context based on the category
    context = ""
    if category == "BOOKING":
        context = get_booking_context(booking)
    elif category == "PROPERTY":
        context = get_property_context(property_data, host_data)
    elif category == "INSURANCE":
        context = get_insurance_context(insurance_plan, eligible_insurance_plan, booking)
    elif category == "CANCELLATION":
        context = get_cancellation_context(booking)
    # For "GENERAL", we provide a minimal context.
    else: 
        context = f"The user is asking a general question about their trip to {property_data.get('title')}."

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

    print("\n--- Prompt sent to OpenAI (Optimized) ---")
    try:
        print(json.dumps(messages_to_send, indent=2))
    except (TypeError):
        print(messages_to_send)
    print("---------------------------\n")

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_to_send
        )
        response_text = completion.choices[0].message.content
        return jsonify({"response": response_text})
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return jsonify({"error": "Failed to get response from AI"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port,debug=True)

    

