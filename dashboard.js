// ----------------------------
// DOM Elements
// ----------------------------
const foodForm = document.getElementById('foodForm');
const foodNameInput = document.getElementById('foodName');
const expiryDateInput = document.getElementById('expiryDate');
const quantityInput = document.getElementById('quantity');
const foodList = document.getElementById('foodItems');
const searchInput = document.getElementById('searchInput');

// ----------------------------
// Load Items from Local Storage
// ----------------------------
document.addEventListener('DOMContentLoaded', loadItems);

function loadItems() {
  const items = JSON.parse(localStorage.getItem('foodItems')) || [];
  renderItems(items);
}

// ----------------------------
// Render Food Items
// ----------------------------
function renderItems(items) {
  foodList.innerHTML = '';

  items.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.className =
      'flex justify-between items-center bg-white shadow-md p-3 mb-2 rounded-lg';

    // Format date as DD Month YYYY
    const formattedDate = new Date(item.expiryDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    listItem.innerHTML = `
      <span class="text-gray-700">${item.name} 
        <small class="text-gray-500">(Qty: ${item.quantity}, Expires: ${formattedDate})</small>
      </span>
      <div>
        <button onclick="editItem(${index})" class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
        <button onclick="deleteItem(${index})" class="text-red-500 hover:text-red-700">Delete</button>
      </div>
    `;

    foodList.appendChild(listItem);
  });
}

// ----------------------------
// Add / Edit Food Item
// ----------------------------
foodForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = foodNameInput.value.trim();
  const expiryDate = expiryDateInput.value;
  const quantity = quantityInput.value;

  if (!name || !expiryDate || !quantity) return;

  const items = JSON.parse(localStorage.getItem('foodItems')) || [];

  if (foodForm.dataset.editIndex) {
    // Editing existing item
    items[foodForm.dataset.editIndex] = { name, expiryDate, quantity };
    delete foodForm.dataset.editIndex;
  } else {
    // Adding new item
    items.push({ name, expiryDate, quantity });
  }

  localStorage.setItem('foodItems', JSON.stringify(items));
  foodForm.reset();
  renderItems(items);
});

// ----------------------------
// Edit Item
// ----------------------------
function editItem(index) {
  const items = JSON.parse(localStorage.getItem('foodItems')) || [];
  const item = items[index];

  foodNameInput.value = item.name;
  expiryDateInput.value = item.expiryDate;
  quantityInput.value = item.quantity;

  foodForm.dataset.editIndex = index;
}

// ----------------------------
// Delete Item
// ----------------------------
function deleteItem(index) {
  const items = JSON.parse(localStorage.getItem('foodItems')) || [];
  items.splice(index, 1);
  localStorage.setItem('foodItems', JSON.stringify(items));
  renderItems(items);
}

// ----------------------------
// Search / Filter Items
// ----------------------------
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const items = JSON.parse(localStorage.getItem('foodItems')) || [];
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query)
  );
  renderItems(filtered);
});
