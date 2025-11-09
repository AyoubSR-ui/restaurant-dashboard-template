from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Temporary in-memory order storage
orders = []

# --- Route: Submit new order ---
@app.route('/submit_order', methods=['POST'])
def submit_order():
    try:
        data = request.get_json()

        order = {
            "table": data.get('table', 'Unknown'),
            "item": data.get('item', 'Unknown Item'),
            "price": data.get('price', '0 QAR'),
            "notes": data.get('notes', ''),
            "status": "Pending",
            "time": datetime.now().strftime("%H:%M:%S")
        }

        orders.append(order)
        print(f"✅ New Order: {order}")
        return jsonify({"status": "success", "message": "Order received!"}), 200

    except Exception as e:
        print("❌ Error receiving order:", e)
        return jsonify({"status": "error", "message": str(e)}), 400


# --- Route: Get all orders for dashboard ---
@app.route('/get_orders', methods=['GET'])
def get_orders():
    """Return all current orders."""
    return jsonify(orders)


# --- Route: Update order status (Ready / Served) ---
@app.route('/update_status', methods=['POST'])
def update_status():
    """Update an order's status."""
    try:
        data = request.get_json()
        index = data.get('index')
        new_status = data.get('status')

        if index is None or new_status is None:
            return jsonify({"status": "error", "message": "Missing index or status"}), 400

        if 0 <= index < len(orders):
            orders[index]['status'] = new_status
            print(f"✅ Order {index} updated to {new_status}")
            return jsonify({"status": "success", "message": "Order updated"}), 200
        else:
            return jsonify({"status": "error", "message": "Invalid order index"}), 404

    except Exception as e:
        print("❌ Error updating order:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Route: Clear all orders (optional helper) ---
@app.route('/clear_orders', methods=['POST'])
def clear_orders():
    """Reset order list (for testing)."""
    global orders
    orders = []
    print("🧹 All orders cleared.")
    return jsonify({"status": "success", "message": "All orders cleared"}), 200


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)





