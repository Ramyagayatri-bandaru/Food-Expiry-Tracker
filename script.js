// let foodItems = [];
// const foodList = document.getElementById("food-list");
// const foodForm = document.getElementById("food-form");
// const toastContainer = document.getElementById("toast-container");
// const searchInput = document.getElementById("search-bar");
// const sortSelect = document.getElementById("sort-select");

// document.addEventListener("DOMContentLoaded", () => {
//   fetchItems();
//   checkExpiringItems(); // Show reminder popups on page load
// });

// // Fetch data from backend
// function fetchItems() {
//   fetch("/api/food")
//     .then(res => res.json())
//     .then(data => {
//       foodItems = data;
//       renderItems();
//     });
// }

// // Render food items
// function renderItems() {
//   const searchTerm = searchInput.value.toLowerCase();
//   let filteredItems = foodItems.filter(item =>
//     item.name.toLowerCase().includes(searchTerm)
//   );

//   if (sortSelect.value === "asc") {
//     filteredItems.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
//   } else if (sortSelect.value === "desc") {
//     filteredItems.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
//   }

//   foodList.innerHTML = "";
//   filteredItems.forEach(item => {
//     const div = document.createElement("div");
//     div.className = "food-item";
//     div.innerHTML = `
//       <h3>${item.name}</h3>
//       <p>Expiry: ${item.expiryDate}</p>
//       <div class="actions">
//         <button onclick="deleteItem('${item._id}')">Delete</button>
//       </div>
//     `;
//     foodList.appendChild(div);
//   });
// }

// // Add new item
// foodForm.addEventListener("submit", (e) => {
//   e.preventDefault();
//   const name = foodForm.name.value.trim();
//   const expiryDate = foodForm.expiryDate.value;

//   if (!name || !expiryDate) {
//     showToast("Please fill all fields!", "error");
//     return;
//   }

//   const newItem = { name, expiryDate };

//   fetch("/api/food", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(newItem),
//   })
//     .then(res => res.json())
//     .then(data => {
//       showToast("Item added successfully!", "success");
//       foodForm.reset();
//       fetchItems();
//     });
// });

// // Delete with confirmation modal
// function deleteItem(id) {
//   const modal = document.createElement("div");
//   modal.className = "delete-modal";
//   modal.innerHTML = `
//     <div class="modal-content">
//       <p>Are you sure you want to delete this item?</p>
//       <button class="confirm-btn">Yes</button>
//       <button class="cancel-btn">Cancel</button>
//     </div>
//   `;
//   document.body.appendChild(modal);

//   modal.querySelector(".confirm-btn").onclick = () => {
//     fetch(`/api/food/${id}`, { method: "DELETE" })
//       .then(res => res.json())
//       .then(() => {
//         showToast("Item deleted", "success");
//         fetchItems();
//         modal.remove();
//       });
//   };

//   modal.querySelector(".cancel-btn").onclick = () => {
//     modal.remove();
//   };
// }

// // Toast message
// function showToast(message, type) {
//   const toast = document.createElement("div");
//   toast.className = `toast ${type}`;
//   toast.textContent = message;
//   toastContainer.appendChild(toast);
//   setTimeout(() => {
//     toast.remove();
//   }, 3000);
// }

// // Search and sort
// searchInput.addEventListener("input", renderItems);
// sortSelect.addEventListener("change", renderItems);

// // Reminder popup
// function checkExpiringItems() {
//   const today = new Date();
//   const tomorrow = new Date(today);
//   tomorrow.setDate(today.getDate() + 1);
//   const dayAfter = new Date(today);
//   dayAfter.setDate(today.getDate() + 2);

//   foodItems.forEach(item => {
//     const expiryDate = new Date(item.expiryDate);
//     if (
//       expiryDate.toDateString() === tomorrow.toDateString() ||
//       expiryDate.toDateString() === dayAfter.toDateString()
//     ) {
//       showReminderPopup(item);
//     }
//   });
// }

// function showReminderPopup(item) {
//   const dismissed = JSON.parse(sessionStorage.getItem("dismissedReminders")) || [];

//   if (dismissed.includes(item._id)) return;

//   const popup = document.createElement("div");
//   popup.classList.add("reminder-popup");
//   popup.innerHTML = `
//     <p><strong>Reminder:</strong> ${item.name} expires on ${item.expiryDate}</p>
//     <button class="close-btn">Dismiss</button>
//   `;

//   popup.querySelector(".close-btn").addEventListener("click", () => {
//     popup.remove();
//     const updated = [...dismissed, item._id];
//     sessionStorage.setItem("dismissedReminders", JSON.stringify(updated));
//   });

//   document.body.appendChild(popup);

//   setTimeout(() => popup.remove(), 10000);
// }



// // Set dynamic copyright year
// document.getElementById('year').textContent = new Date().getFullYear();

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then(reg => console.log("✅ Service Worker registered"))
//       .catch(err => console.error("❌ SW registration failed:", err));
//   });
// }
