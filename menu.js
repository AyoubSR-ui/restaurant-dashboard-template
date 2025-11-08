// === MENU.JS FINAL PRODUCTION VERSION ===
// Original carousel + navigation + modal form injection logic
// ✅ Cleaned of duplicates and debugging redundancies
// ✅ Keeps both smooth UX + modal injection using Bootstrap event

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

// --- Modal Form Injection (Metronic / Bootstrap Event Safe) ---
document.addEventListener("shown.bs.modal", function (e) {
  const modal = e.target;
  if (!modal.id || !modal.id.includes("menu_modal")) return;

  console.log("🟢 Menu modal opened via Bootstrap event");

  const modalBody = modal.querySelector(".modal-body");
  if (!modalBody || modalBody.querySelector("#order_controls")) return;

  const formHTML = `
  <div id="order_controls" style="margin-top:20px; text-align:left;">
    <hr style="margin:10px 0;">
    <label><b> Select Table:</b></label><br>
    <select id="tableSelect" style="width:100%; padding:6px; margin-top:4px;">
      <option value="" selected disabled>-- Select Table --</option>
      ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">Table ${i + 1}</option>`).join("")}
    </select>
    <br><br>
    <label><b> Notes:</b></label><br>
    <textarea id="extraNotes" placeholder="e.g. Less sugar, extra ice..." style="width:100%; padding:6px;"></textarea>
    <br><br>
    <button id="confirmOrder" style="width:100%; background:#6a4b29; color:#fff; border:none; padding:10px; border-radius:6px;">
     Place Order
    </button>
  </div>
`;

  modalBody.insertAdjacentHTML("beforeend", formHTML);
  console.log(" Form injected successfully via Bootstrap event!");
});


document.addEventListener("click", async function (e) {
  if (e.target && e.target.id === "confirmOrder") {
    console.log("🟢 Confirm button clicked!");

    const modal = e.target.closest(".modal");
    const itemName =
  modal.querySelector(".modal-title")?.innerText.trim() ||
  modal.querySelector("#modal_title")?.innerText.trim() ||
  modal.querySelector(".item-title")?.innerText.trim() ||
  modal.querySelector("h5, h4, h3")?.innerText.trim() ||
  "Unknown Item";

    const itemPrice = modal.querySelector(".modal-price, #modal_price")?.textContent.trim() || "0 QAR";
    const table = document.querySelector("#tableSelect")?.value || "N/A";
    const notes = document.querySelector("#extraNotes")?.value || "";

    if (!table || table === "N/A") {
      alert("⚠️ Please select a table before placing your order.");
      return;
    }

    const orderData = { item: itemName, price: itemPrice, table: table, notes: notes };
    console.log("📦 Sending order data:", orderData);

    try {
      const response = await fetch("http://127.0.0.1:5000/submit_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log("✅ Flask response:", result);

      if (result.status === "success") {
        alert(" your order received it going to be ready soon!");
      } else {
        alert("⚠️ Error submitting order: " + result.message);
      }
    } catch (err) {
      console.error("❌ Network Error:", err);
      alert("Server not reachable. Make sure Flask is running on port 5000.");
    }
  }
});

