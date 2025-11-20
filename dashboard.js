// dashboard.js  — show qty × item and correct price/status

async function loadOrders() {
  try {
    const res = await axios.get("/get_orders");
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    console.log("Dashboard orders:", res.data); // debug

    res.data.forEach((order, index) => {
      const row = document.createElement("tr");

      // If Flask sent qty, use it; otherwise default to 1
      const qtyPrefix = (typeof order.qty !== "undefined" && order.qty !== null)
        ? `${order.qty}× `
        : "";

      row.innerHTML = `
        <td>${order.table}</td>
        <td>${qtyPrefix}${order.item}</td>
        <td>${order.price}</td>
        <td>${order.status}</td>
        <td>${order.time}</td>
        <td>${order.notes || "-"}</td>
        <td>
          <button class="ready" onclick="updateStatus(${index}, 'Ready')">Ready</button>
          <button class="served" onclick="updateStatus(${index}, 'Served')">Served</button>
        </td>
      `;

      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Error loading orders:", err);
  }
}

async function updateStatus(index, status) {
  try {
    await axios.post("/update_status", { index, status });
    loadOrders();
  } catch (err) {
    console.error("❌ Error updating status:", err);
  }
}

// Auto-refresh every 3s
setInterval(loadOrders, 3000);
loadOrders();
