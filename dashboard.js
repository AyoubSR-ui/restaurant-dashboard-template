async function loadOrders() {
  const res = await axios.get("/get_orders");
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  res.data.forEach((order, index) => {
    const row = document.createElement("tr");

    // 👇 Items cell: show "qty × name"
    let itemsText = "";
    if (Array.isArray(order.items) && order.items.length) {
      itemsText = order.items
        .map((item) => {
          const qty = item.qty || 1;
          const name = item.name || "Unknown Item";
          return `${qty}× ${name}`;
        })
        .join("<br>");
    } else {
      // fallback for very old orders
      const fallbackName = order.item || "Unknown Item";
      const fallbackQty = order.qty || 1;
      itemsText = `${fallbackQty}× ${fallbackName}`;
    }

    // 👇 Price cell: total price computed in app.py
    const priceText = order.price || "0 QAR";

    row.innerHTML = `
      <td>${order.table}</td>
      <td>${itemsText}</td>          <!-- e.g. "7× STRAWBERRY SMOOTHI" -->
      <td>${priceText}</td>          <!-- e.g. "175 QAR" -->
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
