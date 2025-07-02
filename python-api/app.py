
import mysql.connector,os
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import date
import openai
from dotenv import load_dotenv
import requests
import io
from pypdf import PdfReader

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


# --- AI Chatbot Route ---
@app.route('/chat', methods=['POST'])
def chat_with_bot():
    if not client:
        return jsonify({"error": "OpenAI API key not configured on the server"}), 500
        
    data = request.json
    chat_messages = data.get('messages')
    booking = data.get('booking')
    property_data = data.get('property')
    host_data = data.get('hostInfo')
    insurance_plan = data.get('insurancePlan')
    eligible_insurance_plan = data.get('eligibleInsurancePlan')

    if not all([chat_messages, booking, property_data, host_data]):
        return jsonify({"error": "Missing required fields for chat"}), 400

    system_content_lines = [
        "You are a helpful assistant for a travel app. A user is asking a question about their booked trip.",
        "Answer the question based ONLY on the information provided below. Be friendly and conversational.",
        "Format your response as plain text only. Do not use markdown, such as bolding (`**text**`), italics, or lists.",
        "If the question is about insurance, refer to both the high-level benefits and the full policy details if available.",
        "Do not make up or invent information.",
        "\n--- Provided Context ---",
        
        "\n== Booking Details ==",
        f"Property: {property_data.get('title')}",
        f"Location: {property_data.get('location')}",
        f"Check-in Date: {booking.get('checkIn')}",
        f"Check-out Date: {booking.get('checkOut')}",
        f"Number of Guests: {booking.get('guests')}",
        
        "\n-- Cost Breakdown --",
        f"Reservation Cost: ${booking.get('reservationCost', 0):.2f}",
        f"Service Fee: ${booking.get('serviceFee', 0):.2f}",
    ]
    if booking.get('insuranceCost', 0) > 0:
        system_content_lines.append(f"Insurance Cost: ${booking.get('insuranceCost', 0):.2f}")
    system_content_lines.extend([
        "--------------------",
        f"Total Cost: ${booking.get('totalCost', 0):.2f}",
        "\n== Host Information ==",
        f"Host Name: {host_data.get('name')}",
        f"Host Email: {host_data.get('email')}",
        
        "\n== Property Details ==",
        f"Description: {property_data.get('description')}",
        f"Amenities: {', '.join(property_data.get('amenities', []))}",
    ])
    
    if property_data.get('propertyInfo'):
        system_content_lines.append(f"\nAdditional Information from Host:\n{property_data.get('propertyInfo')}")
    else:
        system_content_lines.append("\nAdditional Information from Host:\n(No additional information was provided by the host for this property)")

    system_content_lines.append("\n== Insurance Details ==")
    if insurance_plan:
        system_content_lines.append(f"Travel Insurance Purchased: {insurance_plan.get('name')}")
        if 'benefits' in insurance_plan and insurance_plan['benefits']:
            system_content_lines.append("\nHigh-level Insurance Benefits:")
            for benefit in insurance_plan.get('benefits', []):
                system_content_lines.append(f"- {benefit}")
        
        if insurance_plan.get('termsUrl'):
            policy_text = extract_text_from_pdf_url(insurance_plan['termsUrl'])
            if policy_text:
                system_content_lines.append("\n--- Full Insurance Policy Details ---")
                system_content_lines.append(policy_text)
                system_content_lines.append("--- End of Insurance Policy Details ---")
            else:
                 system_content_lines.append("\n(Could not load the full insurance policy document.)")
    elif eligible_insurance_plan:
        system_content_lines.append("Travel Insurance Purchased: No")
        system_content_lines.append("\nThe user is eligible to purchase the following travel insurance plan. Answer any questions they have about it to help them decide.")
        system_content_lines.append(f"Eligible Plan Name: {eligible_insurance_plan.get('name')}")
        if 'benefits' in eligible_insurance_plan and eligible_insurance_plan['benefits']:
            system_content_lines.append("\nHigh-level Benefits of Eligible Plan:")
            for benefit in eligible_insurance_plan.get('benefits', []):
                system_content_lines.append(f"- {benefit}")
        
        if eligible_insurance_plan.get('termsUrl'):
            policy_text = extract_text_from_pdf_url(eligible_insurance_plan['termsUrl'])
            if policy_text:
                system_content_lines.append("\n--- Full Policy Details for Eligible Plan ---")
                system_content_lines.append(policy_text)
                system_content_lines.append("--- End of Policy Details for Eligible Plan ---")
            else:
                 system_content_lines.append("\n(Could not load the full policy document for the eligible plan.)")
    else:
        system_content_lines.append("Travel Insurance Purchased: No")
        system_content_lines.append("It is no longer possible to add travel insurance to this booking.")

    system_content_lines.append("\n--- End of Context ---")
    
    system_content = "\n".join(system_content_lines)

    # Convert frontend messages to OpenAI format
    openai_messages = []
    for msg in chat_messages:
        role = "assistant" if msg["sender"] == "bot" else "user"
        openai_messages.append({"role": role, "content": msg["text"]})

    messages_to_send = [
        {"role": "system", "content": system_content},
        *openai_messages
    ]

    # Log the prompt for debugging
    print("\n--- Prompt sent to OpenAI ---")
    try:
        # Use json for pretty printing if available
        import json
        print(json.dumps(messages_to_send, indent=2))
    except (ImportError, TypeError):
        # Fallback to regular print if json is not available or data is not serializable
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


    

    






    