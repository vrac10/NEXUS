from flask import Flask, request, jsonify,send_file
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
import qrcode
import json
from datetime import datetime
import gridfs
from trie import splitwise_app
from io import BytesIO


app = Flask(__name__)

# MongoDB connection
client = MongoClient("mongodb+srv://rachitv106:Rachit2619@cluster0.qnnzbrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["PayPlan"]
users_collection = db["Users"]

@app.route("/api/signup", methods=["POST"])
def add_user():
    try:
        user_data = request.get_json()
        required_fields = ["name", "email", "dob", "pin", "password", "amount"]
        for field in required_fields:
            if field not in user_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Hash the password and pin
        hashed_password = bcrypt.hashpw(user_data["password"].encode('utf-8'), bcrypt.gensalt())
        hashed_pin = bcrypt.hashpw(user_data["pin"].encode('utf-8'), bcrypt.gensalt())

        # Store hashed values in the database
        user_data["password"] = hashed_password
        user_data["pin"] = hashed_pin

        result = users_collection.insert_one(user_data)

        data = {
            "userId": str(result.inserted_id),
            "name": user_data['name'],
        }
        
        # Convert the dictionary to a JSON string
        json_data = json.dumps(data)

        # Generate the QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(json_data)
        qr.make(fit=True)

        # Create the QR code image
        img = qr.make_image(fill_color="black", back_color="white")

        # Save the QR code image to memory (not to a physical file)
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)

        # Store the image in MongoDB GridFS
        file_id = fs.put(img_io, filename=f"qr_code_{str(result.inserted_id)}.png")

        # Get the file ID and store it in the user document (optional)
        users_collection.update_one({"_id": ObjectId(result.inserted_id)}, {"$set": {"qr_code_file_id": file_id}})

        return jsonify({"message": "User signed up successfully", "_id": str(result.inserted_id)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/login", methods=["POST"])
def login():
    try:
        login_data = request.get_json()
        email = login_data.get("email")
        password = login_data.get("password")

        if not email or not password:
            return jsonify({"error": "Missing email or password"}), 400

        # Find the user by email
        user = users_collection.find_one({"email": email})

        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        # Verify the password
        if not bcrypt.checkpw(password.encode('utf-8'), user["password"]):
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({"message": "Login successful", "userId": str(user["_id"])}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

fs = gridfs.GridFS(db)

@app.route("/api/user/<user_id>", methods=["GET"])
def get_user_by_id(user_id):
    try:
        # Find the user by ID
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        user_tr = users_collection.find_one({"_id": ObjectId(user_id)}, {"transactions": 1})
        transactions = user_tr.get("transactions", [])

        if not user:
            print("User not found")
            return jsonify({"error": "User not found"}), 404
        
        # Prepare the user data
        # Remove sensitive information before returning the user data
        user.pop("password", None)
        user.pop("pin", None)
        user.pop("_id", None)

        a = str(user['qr_code_file_id'])
        user.pop("qr_code_file_id", None)
        # Return user data along with the MongoDB file ID
        return jsonify({"user_details" : user, "file" : a,"transactions" : transactions}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


from google import genai

# Initialize the Gemini client
client_g = genai.Client(api_key="AIzaSyCibTZmEYStz8gwRnyx24VmacyvninGe58")

def classify_transaction(transaction):
    """Classify the transaction using Gemini or return 'Other' if undetectable."""
    try:
        # Query Gemini with the category hierarchy
        response = client_g.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"""
                Classify the transaction '{transaction}' using the following category structure:
                {{
                    'Entertainment': ['Games', 'Movies', 'Music', 'Sports', 'Other'], 
                    'Food and drink': ['Dining Out', 'Groceries', 'Coffee shops', 'Liquor', 'Other'], 
                    'Home': ['Electronics', 'Furniture', 'Household Supplies', 'Mortgage', 'Pets', 'Rent', 'Service', 'Other'],
                    'Transportation': ['Bicycle', 'Bus/train', 'Car', 'Gas/fuel', 'Hotel', 'Parking', 'Plane', 'Taxi', 'Other'],
                    'Utilities': ['Cleaning', 'Electricity', 'Heat/gas', 'TV/Phone/Internet', 'Water', 'Other']
                }}
                Return the category in the format: 'Category > Subcategory' or 'Other'
            """
        )

        category = response.text.strip()
        if category and " > " in category:  # Ensure valid format
            return category
        return "Other"  # Default if no category found
    except Exception as e:
        return "Other"  # Handle API or network errors

@app.route("/api/pay", methods=["POST"])
def pay():
    data = request.json
    from_user_id = data.get("fromUserId")
    to_user_id = data.get("toUserId")
    amount = data.get("amount")
    pin = data.get("pin")
    transaction_description = data.get("transaction", "")  # Additional field for description

    if not from_user_id or not to_user_id or not amount or not pin:
        return jsonify({"message": "Missing required fields"}), 400

    # Classify the transaction
    category = classify_transaction(transaction_description)

    try:
        with client.start_session() as session:
            with session.start_transaction():
                from_user = users_collection.find_one({"name": from_user_id}, session=session)
                to_user = users_collection.find_one({"name": to_user_id}, session=session)

                if not from_user or not to_user:
                    return jsonify({"message": "User not found"}), 404

                # Validate the PIN using bcrypt
                stored_hashed_pin = from_user.get("pin")
                if not stored_hashed_pin or not bcrypt.checkpw(pin.encode('utf-8'), stored_hashed_pin):
                    return jsonify({"message": "Invalid PIN"}), 403

                if from_user["amount"] < amount:
                    return jsonify({"message": "Insufficient balance"}), 400

                # Create the transaction object
                transaction = {
                    "from": from_user_id,
                    "to": to_user_id,
                    "category": category,
                    "amount": amount,
                    "date": datetime.now().strftime("%Y-%m-%d")
                }

                # Perform the transaction
                users_collection.update_one(
                    {"name": from_user_id},
                    {"$inc": {"amount": -amount}, "$push": {"transactions": transaction}},
                    session=session
                )
                users_collection.update_one(
                    {"name": to_user_id},
                    {"$inc": {"amount": amount}, "$push": {"transactions": transaction}},
                    session=session
                )

        return jsonify({"message": "Payment successful", "category": category}), 200
    except Exception as e:
        return jsonify({"message": "Payment failed", "error": str(e)}), 500

# @app.route("/api/pay", methods=["POST"])
# def pay():
#     data = request.json
#     from_user_id = data.get("fromUserId")
#     to_user_id = data.get("toUserId")
#     amount = data.get("amount")
#     pin = data.get("pin")

#     if not from_user_id or not to_user_id or not amount or not pin:
#         return jsonify({"message": "Missing required fields"}), 400

#     try:
#         with client.start_session() as session:
#             with session.start_transaction():
#                 from_user = users_collection.find_one({"name": from_user_id}, session=session)
#                 to_user = users_collection.find_one({"name": to_user_id}, session=session)

#                 if not from_user or not to_user:
#                     return jsonify({"message": "User not found"}), 404

#                 # Validate the PIN using bcrypt
#                 stored_hashed_pin = from_user.get("pin")
#                 if not stored_hashed_pin or not bcrypt.checkpw(pin.encode('utf-8'), stored_hashed_pin):
#                     return jsonify({"message": "Invalid PIN"}), 403

#                 if from_user["amount"] < amount:
#                     return jsonify({"message": "Insufficient balance"}), 400

#                 # Perform the transaction
#                 users_collection.update_one(
#                     {"name": from_user_id},
#                     {"$inc": {"amount": -amount}},
#                     session=session
#                 )
#                 users_collection.update_one(
#                     {"name": to_user_id},
#                     {"$inc": {"amount": amount}},
#                     session=session
#                 )

#         return jsonify({"message": "Payment successful"}), 200
#     except Exception as e:
#         return jsonify({"message": "Payment failed", "error": str(e)}), 500

@app.route("/api/transactions/<user_id>", methods=["GET"])
def get_user_transactions(user_id):
    user_id = request.args.get("userId")

    if not user_id:
        return jsonify({"message": "Missing required userId"}), 400

    try:
        # Find the user and fetch transactions
        user = users_collection.find_one({"name": user_id}, {"transactions": 1})

        if not user:
            return jsonify({"message": "User not found"}), 404

        transactions = user.get("transactions", [])

        return jsonify({"transactions": transactions}), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch transactions", "error": str(e)}), 500

import os

# Ensure a directory exists for static images
STATIC_FOLDER = 'static'
os.makedirs(STATIC_FOLDER, exist_ok=True)
@app.route("/api/qr_image/<file_id>", methods=["GET"])
def get_qr_image_url(file_id):
    try:
        # Fetch the image name from GridFS
        file = fs.get(ObjectId(file_id))
        filename = file.filename

        file_path = os.path.join(STATIC_FOLDER, filename)

        # Save the image to the static directory
        with open(file_path, 'wb') as f:
            f.write(file.read())
        # Construct the URL (assuming your static images are accessible at `/static/images/`)
        image_url = f"https://45f5-223-31-218-223.ngrok-free.app/static/{filename}"

        return jsonify({"imageUrl": filename}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Image not found"}), 404

@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    data = request.json
    payer = data.get('payer')
    amount = data.get('amount')
    participants = data.get('participants', [])
    splitwise_app.add_transaction(payer, amount, participants)
    return jsonify({"message": "Transaction added successfully"}), 200

@app.route('/unequal', methods=['POST'])
def unequal():
    data = request.json
    payer = data.get('payer')
    amount = data.get('amount')
    participants = data.get('participants')
    response = splitwise_app.unequal(payer, amount, participants)
    if isinstance(response, tuple):
        return jsonify({"error": response[0]}), response[1]
    return jsonify({"message": "Unequal transaction added successfully"}), 200

@app.route('/simplify_debts', methods=['POST'])
def simplify_debts():
    splitwise_app.simplify_debts()
    return jsonify({"message": "Debts simplified successfully"}), 200

@app.route('/balances', methods=['GET'])
def get_balances():
    balances = splitwise_app.get_balances()
    return jsonify(balances), 200

@app.route('/debts', methods=['GET'])
def get_debts():
    return splitwise_app.__str__(), 200

@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    try:
        # Assuming transactions are sent as JSON in the POST request
        transactions = request.json.get('transactions', [])

        if not transactions:
            return jsonify({"error": "No transactions provided"}), 400

        # Construct a prompt for the LLM to analyze transaction patterns
        prompt = f"Analyze these transactions and suggest budgeting tips or spending optimizations:\n{transactions} keep it crisp and only 3 points"

        # Query Gemini with the category hierarchy
        response = client_g.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"""
                {prompt}
            """
        )

        # if response.status_code != 200:
        #     return jsonify({"error": "Failed to fetch suggestions from Gemini"}), 500

        suggestions = response.text.strip()
        
        # suggestions = response.text.get('suggestions', 'No suggestions available')

        return jsonify({"suggestions": suggestions})

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=8000, debug=True)
