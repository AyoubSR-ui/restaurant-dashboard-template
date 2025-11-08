document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#menuModal");
  const orderControls = document.querySelector("#order_controls");
  const confirmBtn = document.querySelector("#confirmOrder");

  document.querySelectorAll(".menu_item").forEach(item => {
    item.addEventListener("click", () => {
      orderControls.style.display = "block";
    });
  });

  confirmBtn.addEventListener("click", async () => {
    const table = document.getElementById("tableSelect").value;
    const notes = document.getElementById("extraNotes").value;
    const title = document.querySelector(".modal-title, #modal_title")?.innerText || "Unknown Item";
    const price = document.querySelector(".modal-price, #modal_price")?.innerText.replace(" QAR", "") || "0";

    const orderData = { table, item: title, price, notes };
    console.log("📦 Sending Order:", orderData);

    try {
      const res = await fetch("http://127.0.0.1:5000/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        alert("✅ Order Sent Successfully!");
        orderControls.style.display = "none";
        document.getElementById("extraNotes").value = "";
      } else alert("⚠️ Failed to send order.");
    } catch (err) {
      console.error("❌ Error:", err);
      alert("❌ Could not connect to server.");
    }
  });
});

