function formatToUTCPlus3(utcString) {
  const dateUtc = new Date(utcString);                  // treat as UTC
  const plus3 = new Date(dateUtc.getTime() + 3 * 60 * 60 * 1000);
  return plus3.toLocaleTimeString("en-GB", { hour12: false }); // 01:10:44
}
async function loadOrders() {
  const res = await axios.get("/orders");
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  res.data.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.table}</td>
      <td>${order.item}</td>
      <td>${order.price}</td>
      <td>${order.status}</td>
      <td>${formatToUTCPlus3(order.time)}</td>
      <td>
        <button class="ready" onclick="updateStatus('${order.time}', 'Ready')">Ready</button>
        <button class="served" onclick="updateStatus('${order.time}', 'Served')">Served</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function updateStatus(time, status) {
  await axios.post("/update_status", { time, status });
  loadOrders();
}

setInterval(loadOrders, 3000);
loadOrders();
