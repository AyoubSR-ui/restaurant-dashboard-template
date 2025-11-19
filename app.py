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
    """Receive a new order from the customer page (supports multi-items cart)."""
    try:
        data = request.get_json(silent=True) or {}
        print("📥 RAW ORDER DATA:", data)   # <-- Watch this in the terminal

        # 1) Read items[] from payload (cart from menu.js)
        raw_items = data.get("items") or []

        normalized_items = []
        for it in raw_items:
            if not isinstance(it, dict):
                continue

            # Be flexible with key names from JS
            name = it.get("name") or it.get("item") or "Unknown Item"
            price = it.get("price") or it.get("price_qr") or "0 QAR"
            qty = it.get("qty") or it.get("quantity") or 1

            try:
                qty = int(qty)
            except (TypeError, ValueError):
                qty = 1

            normalized_items.append({
                "name": str(name),
                "price": str(price),
                "qty": qty
            })

        # 2) Fallback for old single-item requests (no items[])
        if not normalized_items:
            fallback_name = data.get("item", "Unknown Item")
            fallback_price = data.get("price", "0 QAR")
            fallback_qty = int(data.get("qty", 1) or 1)
            normalized_items = [{
                "name": str(fallback_name),
                "price": str(fallback_price),
                "qty": fallback_qty
            }]

        # 3) Compute total price, e.g. 2×(25 QAR) = 50 QAR
        import re

        def parse_price(p):
            m = re.search(r'(\d+(\.\d+)?)', str(p))
            return float(m.group(1)) if m else 0.0

        total_value = sum(parse_price(i["price"]) * i["qty"] for i in normalized_items)
        display_price = f"{total_value:.0f} QAR"

        # 4) Build final order object used by dashboard
        order = {
            "table": data.get('table', 'Unknown'),
            "items": normalized_items,                 # full list of {name,price,qty}

            # keep these for compatibility with existing dashboard columns
            "item": normalized_items[0]["name"],
            "price": display_price,                    # total price

            "notes": data.get('notes', ''),
            "status": "Pending",
            "time": (datetime.now(timezone.utc) + timedelta(hours=3)).strftime("%H:%M:%S")
        }

        orders.append(order)
        print("✅ New Order Stored:", order)           # <-- Should show correct name/price
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
