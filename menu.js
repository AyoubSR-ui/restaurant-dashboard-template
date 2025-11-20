// === MENU.JS FINAL PRODUCTION VERSION (WITH CART, FROZEN ADD & PER-ITEM NOTES) ===

// --- Toggle Category Content Visibility ---
function toggleContentVisibility(str) {
  var icon = $('#icon' + str);
  var contentDiv = $('#contentDiv' + str);
  if (contentDiv.is(':visible')) {
    contentDiv.slideUp();
    icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
  } else {
    contentDiv.slideDown();
    icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
  }
}

// --- Carousel & Language Setup ---
var lang = document.documentElement.lang;
console.log("✅ menu.js loaded successfully");

var owl = $('.owl-carousel');
owl.owlCarousel({
  loop: false,
  nav: false,
  dots: false,
  margin: 10,
  mouseDrag: true,
  navSpeed: 1000,
  rtl: (lang === "en" ? false : true),
  responsive: {
    0: { items: 3 },
    600: { items: 3 },
    960: { items: 5 },
    1200: { items: 6 }
  }
});

// --- Smooth Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - document.querySelector('.sticky-navigation').offsetHeight - 20,
        behavior: 'smooth'
      });
    }
  });
});

// --- Tab Highlighting ---
document.querySelectorAll('.w-tab-link').forEach(tabLink => {
  tabLink.addEventListener('click', function () {
    document.querySelectorAll('.w-tab-link').forEach(link => link.classList.remove('w--current'));
    this.classList.add('w--current');
  });
});

// --- Sticky Navigation ---
window.addEventListener('scroll', function () {
  const nav = document.querySelector('.sticky-navigation');
  const content = document.querySelector('.content');
  const navHeight = nav.offsetHeight;
  const categoryElements = document.querySelectorAll('.category-list');

  if (window.scrollY >= navHeight) {
    content.style.marginTop = navHeight + 'px';
    nav.classList.add('sticky');
  } else {
    content.style.marginTop = '0';
    nav.classList.remove('sticky');
  }

  categoryElements.forEach(categoryElement => {
    const categoryPosition = categoryElement.getBoundingClientRect().top;
    if (categoryPosition < window.innerHeight && categoryPosition > 0) {
      const categoryId = categoryElement.dataset.catId;
      $('.w-tab-link').removeClass('w--current');
      $('#category-' + categoryId).addClass('w--current');
      const slideIndex = $('#category-' + categoryId).parent().index();
      $('.owl-carousel').trigger('to.owl.carousel', [slideIndex, 300]);
    }
  });
});

// ======================
//   CART / MODAL LOGIC
// ======================

// Global cart for current order
// Each item: { name, price, qty, note }
let cart = [];

// Helper: get current item name & price from modal
function getItemFromModal(modal) {
  const itemName =
    modal.querySelector(".modal-title")?.innerText.trim() ||
    modal.querySelector("#modal_title")?.innerText.trim() ||
    modal.querySelector(".item-title")?.innerText.trim() ||
    modal.querySelector("h5, h4, h3")?.innerText.trim() ||
    "Unknown Item";

  const itemPrice =
    modal.querySelector(".modal-price, #modal_price")?.textContent.trim() ||
    "0 QAR";

  return { itemName, itemPrice };
}

// Render selected items inside current modal
function renderSelectedItems(modal) {
  const list = modal.querySelector("#selected-items-list");
  if (!list) return;

  if (!cart.length) {
    list.innerHTML = '<p style="margin:0; opacity:0.8;">No items selected yet.</p>';
    return;
  }

  list.innerHTML = cart
    .map((item, index) => `
      <div class="selected-item-row" style="
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            margin-bottom:6px;
            padding:4px 6px;
            background:transparent;       /* no white strip */
            border-radius:4px;
          ">
        <div>
          <span style="font-weight:600; color:#3e2723;">
            ${item.qty}× ${item.name} (${item.price})
          </span>
          ${
            item.note
              ? `<div style="font-size:12px; color:#5d4037; margin-top:2px;">
                   Note: ${item.note}
                 </div>`
              : ""
          }
        </div>
        <button type="button"
                data-remove-index="${index}"
                style="background:#e53935; color:#fff; border:none; border-radius:4px; padding:2px 6px; cursor:pointer; font-size:12px;">
          Remove
        </button>
      </div>
    `)
    .join("");
}

// --- Modal Form Injection (Bootstrap shown event) ---
document.addEventListener("shown.bs.modal", function (e) {
  const modal = e.target;
  if (!modal.id || !modal.id.includes("menu_modal")) return;

  console.log("🟢 Menu modal opened via Bootstrap event");

  const modalBody = modal.querySelector(".modal-body");
  if (!modalBody) return;

  // Inject controls once
  if (!modalBody.querySelector("#order_controls")) {
    const formHTML = `
      <div id="order_controls" style="margin-top:20px; text-align:left;">
        <hr style="margin:10px 0;">

        <label style="font-weight:bold;">Select Table:</label><br>
        <select id="tableSelect" style="
            width:100%;
            padding:8px;
            margin-top:4px;
            margin-bottom:12px;
            border-radius:10px;
            border:1px solid #d0b08a;
            background:#f3dec0;
          ">
          <option value="" selected disabled>-- Select Table --</option>
          ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">Table ${i + 1}</option>`).join("")}
        </select>

        <label style="font-weight:bold;">Quantity:</label><br>
        <input id="qtyInput" type="number" min="1" value="1" style="
            width:100%;
            padding:8px;
            margin-top:4px;
            margin-bottom:15px;
            border-radius:10px;
            border:1px solid #d0b08a;
            background:#f3dec0;
          ">

        <label style="font-weight:bold;">Notes (for this item):</label><br>
        <textarea id="extraNotes" placeholder="e.g. Less sugar, extra ice..." style="
            width:100%;
            padding:8px;
            margin-top:4px;
            margin-bottom:15px;
            border-radius:10px;
            border:1px solid #d0b08a;
            background:#f3dec0;
            resize:vertical;
          "></textarea>

        <label style="display:block; font-weight:bold; margin-bottom:6px;">Selected items:</label>

        <div id="selected-items-box" style="
            text-align:left;
            padding:10px;
            background:#f3dec0;
            border-radius:10px;
            border:1px solid #d0b08a;
            color:#3e2723;
            margin-bottom:15px;
          ">
          <div id="selected-items-list">
            <p style="margin:0; opacity:0.8;">No items selected yet.</p>
          </div>
        </div>

        <button id="add-to-order-btn"
        type="button"
        style="width:100%; background:#ff9800; color:#fff; border:none; padding:10px; border-radius:8px; margin-top:4px;">
              Add to selected items
               </button>

            <button id="call-waiter-btn"
           type="button"
        style="width:100%; background:#c62828; color:#fff; border:none; padding:10px; border-radius:8px; margin-top:8px;">
        Call Waiter
        </button>

            <button id="place-order-btn"
        type="button"
          style="width:100%; background:#6a4b29; color:#fff; border:none; padding:10px; border-radius:8px; margin-top:8px;">
             Place Order
            </button>

      </div>
    `;
    modalBody.insertAdjacentHTML("beforeend", formHTML);
  }

  const { itemName, itemPrice } = getItemFromModal(modal);
  const qtyInput   = modal.querySelector("#qtyInput");
  const notesArea  = modal.querySelector("#extraNotes");
  const addBtn     = modal.querySelector("#add-to-order-btn");

  const existing = cart.find(i => i.name === itemName && i.price === itemPrice);

  if (existing) {
    // Restore qty & note for this item
    if (qtyInput)  qtyInput.value  = existing.qty;
    if (notesArea) notesArea.value = existing.note || "";

    // Freeze add button (already added)
    if (addBtn) {
      addBtn.disabled     = true;
      addBtn.textContent  = "Already added";
      addBtn.style.opacity = "0.6";
      addBtn.style.cursor  = "not-allowed";
    }
  } else {
    if (qtyInput)  qtyInput.value  = "1";
    if (notesArea) notesArea.value = "";
    if (addBtn) {
      addBtn.disabled     = false;
      addBtn.textContent  = "Add to selected items";
      addBtn.style.opacity = "1";
      addBtn.style.cursor  = "pointer";
    }
  }

  // Attach qty listener once per element
  if (qtyInput && !qtyInput.dataset.listenerAttached) {
    qtyInput.addEventListener("input", function () {
      let value = parseInt(this.value || "1", 10);
      if (isNaN(value) || value < 1) value = 1;
      this.value = value;

      const { itemName, itemPrice } = getItemFromModal(modal);
      const current = cart.find(i => i.name === itemName && i.price === itemPrice);
      if (current) {
        current.qty = value;
        renderSelectedItems(modal);
      }
    });
    qtyInput.dataset.listenerAttached = "1";
  }

  // Attach notes listener once per element
  if (notesArea && !notesArea.dataset.listenerAttached) {
    notesArea.addEventListener("input", function () {
      const { itemName, itemPrice } = getItemFromModal(modal);
      const current = cart.find(i => i.name === itemName && i.price === itemPrice);
      if (current) {
        current.note = this.value;
        renderSelectedItems(modal);
      }
    });
    notesArea.dataset.listenerAttached = "1";
  }

  // Render list with current cart for this modal
  renderSelectedItems(modal);
});

// --- Click Handling for Cart Buttons + Remove + Place Order ---
document.addEventListener("click", async function (e) {
  const target = e.target;

  // Remove item from cart
  if (target && target.hasAttribute("data-remove-index")) {
    const modal = target.closest(".modal");
    const index = parseInt(target.getAttribute("data-remove-index"), 10);
    if (!isNaN(index)) {
      const removed = cart[index];
      cart.splice(index, 1);
      if (modal) {
        renderSelectedItems(modal);

        // If removed item is current modal product -> re-enable Add button
        const { itemName, itemPrice } = getItemFromModal(modal);
        if (removed && removed.name === itemName && removed.price === itemPrice) {
          const addBtn = modal.querySelector("#add-to-order-btn");
          const qtyInput = modal.querySelector("#qtyInput");
          const notesArea = modal.querySelector("#extraNotes");
          if (addBtn) {
            addBtn.disabled = false;
            addBtn.textContent = "Add to selected items";
            addBtn.style.opacity = "1";
            addBtn.style.cursor = "pointer";
          }
          if (qtyInput)  qtyInput.value  = "1";
          if (notesArea) notesArea.value = "";
        }
      }
    }
    return;
  }

  // Add current item to selected items (freeze button after first add)
  if (target && target.id === "add-to-order-btn") {
    console.log("🟢 Add to selected items clicked!");

    const modal = target.closest(".modal");
    if (!modal) return;

    const { itemName, itemPrice } = getItemFromModal(modal);

    const qtyInput  = modal.querySelector("#qtyInput");
    const notesArea = modal.querySelector("#extraNotes");

    let qty = parseInt(qtyInput?.value || "1", 10);
    if (isNaN(qty) || qty < 1) qty = 1;

    const note = notesArea ? notesArea.value : "";

    let existing = cart.find(i => i.name === itemName && i.price === itemPrice);
    if (existing) {
      existing.qty  = qty;
      existing.note = note;
    } else {
      cart.push({
        name: itemName,
        price: itemPrice,
        qty: qty,
        note: note
      });
      existing = cart[cart.length - 1];
    }

    renderSelectedItems(modal);

    // Freeze button
    target.disabled = true;
    target.textContent = "Already added";
    target.style.opacity = "0.6";
    target.style.cursor = "not-allowed";

    return;
  }


    // Call waiter for this table
  if (target && target.id === "call-waiter-btn") {
    const modal = target.closest(".modal");
    const table = modal.querySelector("#tableSelect")?.value || "";
    const notes = modal.querySelector("#extraNotes")?.value || "";

    if (!table) {
      alert("⚠️ Please select your table before calling the waiter.");
      return;
    }

    const payload = {
      table: table,
      message: notes
    };

    console.log("🔔 Calling waiter:", payload);

    try {
      const response = await fetch("https://restaurant-dashboard-template.onrender.com/call_waiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log("✅ Waiter call response:", result);

      if (result.status === "success") {
        alert("✅ The waiter has been notified. Someone is coming to your table.");
      } else {
        alert("⚠️ Could not notify the waiter: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Network error calling waiter:", err);
      alert("Server not reachable. Please try again or call the waiter manually.");
    }

    return;
  }

  // Place order with all items in cart
  if (target && target.id === "place-order-btn") {
    console.log("🟢 Place Order (multi-items) clicked!");

    const modal = target.closest(".modal");
    if (!modal) return;

    const table = modal.querySelector("#tableSelect")?.value || "";

    if (!table) {
      alert("⚠️ Please select a table before placing your order.");
      return;
    }

    if (!cart.length) {
      alert("⚠️ Please add at least one item to the order.");
      return;
    }

    const orderData = {
      table: table,
      notes: "",      // order-level note (we're using per-item notes instead)
      items: cart     // each item has its own note & qty
    };

    console.log("📦 Sending order data:", orderData);

    try {
      const response = await fetch("https://restaurant-dashboard-template.onrender.com/submit_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log("✅ Flask response:", result);

      if (result.status === "success") {
        alert("✅ Your order has been received! It will be ready soon.");
        // Clear cart after successful order
        cart = [];
        renderSelectedItems(modal);
        // Optionally close modal:
        // $(modal).modal('hide');
      } else {
        alert("⚠️ Error submitting order: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Network Error:", err);
      alert("Server not reachable. Make sure Flask / Render is online.");
    }
  }
});
