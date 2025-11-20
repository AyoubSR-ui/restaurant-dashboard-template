async function fetchOrders() {
  try {
    const res = await fetch("https://restaurant-dashboard-template.onrender.com/get_orders");
    const data = await res.json();
    const tbody = document.getElementById("orders-body");
    tbody.innerHTML = "";

    data.forEach((order, i) => {
      const qty = order.qty || 1;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.table}</td>
        <td>${qty}× ${order.item}</td>
        <td>${order.price}</td>
        <td>${order.status}</td>
        <td>${order.time}</td>
        <td>${order.notes || '-'}</td>
        <td>
          <button class="ready" onclick="updateStatus(${i}, 'Ready')">Ready</button>
          <button class="served" onclick="updateStatus(${i}, 'Served')">Served</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
  }
}


// Auto-refresh every 3s
setInterval(loadOrders, 3000);
loadOrders();
