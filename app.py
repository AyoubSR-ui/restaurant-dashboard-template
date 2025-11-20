from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timezone, timedelta
import os

# ---------------------------------
# Initialize Flask and CORS
# ---------------------------------
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Temporary in-memory order storage
orders = []

# ---------------------------------
# UI ROUTES (SERVE HTML PAGES)
# ---------------------------------
@app.route('/')
def customer_page():
    """Serve the customer-facing ordering page (en.html)."""
    return send_from_directory('.', 'en.html')


@app.route('/dashboard')
def barista_dashboard():
    """Serve the barista dashboard page (dashboard.html)."""
    return send_from_directory('.', 'dashboard.html')


# Serve any other static files (images, CSS, JS, etc.)
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)


# ---------------------------------
# API ROUTES
# ---------------------------------

# --- Route: Submit new order ---
@app.route('/submit_order', methods=['POST'])
def submit_order():
    """Receive a new order from the customer page."""
    try:
        data = request.get_json() or {}

        qatar_time = datetime.now(timezone.utc) + timedelta(hours=3)
        time_str = qatar_time.strftime("%H:%M:%S")

        table = data.get('table', 'Unknown')
        global_note = data.get('notes', '')

        # New multi-item payload
        items = data.get('items')
        if items:
            for item in items:
                name = item.get('name', 'Unknown Item')
                qty  = int(item.get('qty', 1) or 1)
                price_str = item.get('price', '0 QAR')  # "25 QAR"

                try:
                    unit_price = float(price_str.split()[0])
                except (ValueError, IndexError):
                    unit_price = 0.0

                line_total = unit_price * qty
                line_price = f"{int(line_total)} QAR"

                note = item.get('note') or global_note

                order = {
                    "table": table,
                    "item": name,
                    "qty": qty,
                    "price": line_price,
                    "notes": note,
                    "status": "Pending",
                    "time": time_str,
                }
                orders.append(order)

        else:
            # Backwards-compatible single-item order
            qty = int(data.get('qty', 1) or 1)
            order = {
                "table": table,
                "item": data.get('item', 'Unknown Item'),
                "qty": qty,
                "price": data.get('price', '0 QAR'),
                "notes": global_note,
                "status": "Pending",
                "time": time_str,
            }
            orders.append(order)

        print("✅ New orders:", orders[-len(items):] if items else orders[-1])
        return jsonify({"status": "success", "message": "Order received!"}), 200

    except Exception as e:
        print("❌ Error receiving order:", e)
        return jsonify({"status": "error", "message": str(e)}), 400

#///////////////////////////////////////////////////////////////////


@app.route('/call_waiter', methods=['POST'])
def call_waiter():
    data = request.get_json() or {}
    table = data.get('table')
    message = data.get('message', '').strip() or 'Customer asked for the waiter'

    if not table:
        return jsonify({"status": "error", "message": "Table is required"}), 400

    now = datetime.now().strftime("%H:%M:%S")

    # You can push it into the same orders list so it appears on the dashboard
    orders.append({
        "table": table,
        "items": "🔔 WAITER CALL",
        "price": "",
        "status": "Pending",
        "time": now,
        "notes": message
    })

    return jsonify({"status": "success", "message": "Waiter notified"})

# --- Route: Get all orders for dashboard ---
@app.route('/get_orders', methods=['GET'])
def get_orders():
    """Return all current orders."""
    return jsonify(orders)


# --- Route: Update order status (Ready / Served) ---
@app.route('/update_status', methods=['POST'])
def update_status():
    """Update the status of an existing order."""
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
    """Reset the order list (for testing)."""
    global orders
    orders = []
    print("🧹 All orders cleared.")
    return jsonify({"status": "success", "message": "All orders cleared"}), 200


# ---------------------------------
# MAIN ENTRY POINT
# ---------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
