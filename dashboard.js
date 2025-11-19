async function loadOrders() {
  const res = await axios.get("/get_orders");
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  res.data.forEach((order, index) => {
    const row = document.createElement("tr");

    // Build "qty × name" text
    let itemsText = "";
    if (order.items && order.items.length) {
      itemsText = order.items
        .map(i => `${i.qty || 1}× ${i.name}`)
        .join("<br>");
    } else {
      itemsText = order.item || "Unknown Item";
    }

    // Separate price column (we store total as order.price)
    const priceText = order.price || "0 QAR";

    row.innerHTML = `
      <td>${order.table}</td>
      <td>${itemsText}</td>      <!-- item name × qty -->
      <td>${priceText}</td>      <!-- total price or first price -->
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
}

async function updateStatus(index, status) {
  await axios.post("/update_status", { index, status });
  loadOrders();
}

setInterval(loadOrders, 3000);
loadOrders();
