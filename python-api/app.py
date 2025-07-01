
import mysql.connector,os
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import date

# --- Database Configuration ---
db_config = {
    'host': '34.47.199.230',
    'port': '3306',
    'user': 'root',
    'password': 'password',
    'database': 'airbnb-db'
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
context = os.getenv('context','/')

# --- Helper functions for data transformation ---
def property_to_dict(prop_tuple):
    return {
        "id": str(prop_tuple[0]),
        "hostId": str(prop_tuple[1]),
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
        "id": str(booking_tuple[0]),
        "userId": str(booking_tuple[1]),
        "propertyId": str(booking_tuple[2]),
        "checkIn": booking_tuple[3].strftime('%Y-%m-%d') if isinstance(booking_tuple[3], date) else booking_tuple[3],
        "checkOut": booking_tuple[4].strftime('%Y-%m-%d') if isinstance(booking_tuple[4], date) else booking_tuple[4],
        "totalCost": float(booking_tuple[5]),
        "insurancePlanId": str(booking_tuple[6]) if booking_tuple[6] else None,
        "guests": int(booking_tuple[7]),
        "status": booking_tuple[8],
        "cancellationReason": booking_tuple[9]
    }

def user_to_dict(user_tuple):
    # This function assumes the password is at index 3 and will not be returned
    return {
        "id": str(user_tuple[0]),
        "name": user_tuple[1],
        "email": user_tuple[2],
        "avatar": user_tuple[4],
        "isHost": bool(user_tuple[5])
    }

def insurance_plan_to_dict(plan_tuple):
    return {
        "id": str(plan_tuple[0]),
        "name": plan_tuple[1],
        "pricePercent": float(plan_tuple[2]),
        "minTripValue": float(plan_tuple[3]),
        "maxTripValue": float(plan_tuple[4]),
        "benefits": plan_tuple[5].split('|') if plan_tuple[5] else [],
        "termsUrl": plan_tuple[6]
    }


# --- API Routes ---
@app.route(context+'/')
def index():
    return jsonify({"message": "Welcome to the AirbnbLite API!"})

# --- User Routes ---
@app.route(context+'/users', methods=['GET'])
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

@app.route(context+'/register', methods=['POST'])
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

@app.route(context+'/login', methods=['POST'])
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

@app.route(context+'/users/<int:user_id>', methods=['PUT'])
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
@app.route(context+'/properties', methods=['GET'])
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

@app.route(context+'/properties', methods=['POST'])
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

@app.route(context+'/properties/<int:prop_id>', methods=['PUT'])
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

@app.route(context+'/properties/<int:prop_id>', methods=['DELETE'])
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
@app.route(context+'/bookings', methods=['GET'])
def get_bookings():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings")
    bookings = [booking_to_dict(booking) for booking in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(bookings)

@app.route(context+'/bookings', methods=['POST'])
def create_booking():
    data = request.json
    query = """
    INSERT INTO bookings 
    (userId, propertyId, checkIn, checkOut, totalCost, insurancePlanId, guests, status) 
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        int(data['userId']), int(data['propertyId']), data['checkIn'], data['checkOut'],
        data['totalCost'], data.get('insurancePlanId'), data['guests'], 'confirmed'
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

    return jsonify({"message": "Booking created successfully", "id": new_id}), 201

@app.route(context+'/bookings/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    data = request.json
    if 'status' not in data:
        return jsonify({"error": "Missing 'status' field for update"}), 400
        
    query = "UPDATE bookings SET status = %s, cancellationReason = %s WHERE id = %s"
    values = (data['status'], data.get('cancellationReason'), booking_id)

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
        return jsonify({"message": "Booking updated successfully"}), 200
    else:
        return jsonify({"error": "Booking not found"}), 404

# --- Insurance Plan Routes ---
@app.route(context+'/insurance-plans', methods=['GET'])
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port,debug=True)
