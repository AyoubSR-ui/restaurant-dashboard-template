async function loadOrders() {
  const res = await axios.get("/get_orders");
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  res.data.forEach((order, index) => {
    const row = document.createElement("tr");

    const qty = order.qty || 1;
    const itemText = `${qty}× ${order.item || "Unknown Item"}`;
    const priceText = order.price || "0 QAR";

    row.innerHTML = `
      <td>${order.table}</td>
      <td>${itemText}</td>      <!-- e.g. '3× KINDER MILK SHAKE' -->
      <td>${priceText}</td>     <!-- e.g. '75 QAR' -->
      <td>${order.status}</td>  <!-- goes under "Action" column -->
      <td>${order.time}</td>
      <td>${order.notes || "-"}</td>
      <td>
        <button class="ready" onclick="updateStatus(${index}, 'Ready')">Ready</button>
        <button class="served" onclick="updateStatus(${index}, 'Served')">Served</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

async function updateStatus(index, status) {
  await axios.post("/update_status", { index, status });
  loadOrders();
}

setInterval(loadOrders, 3000);
loadOrders();
