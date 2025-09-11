// ----------------------------
// DOM Elements
// ----------------------------
const foodForm = document.getElementById('foodForm');
const foodNameInput = document.getElementById('foodName');
const expiryDateInput = document.getElementById('expiryDate');
const quantityInput = document.getElementById('quantity');
const foodList = document.getElementById('foodItems');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// User info stored after login
const userEmail = localStorage.getItem("userEmail");
const Username = localStorage.getItem("name");

// Auth token
const token = localStorage.getItem('token');
if (!token) {
    console.error("Please login first!");
    setTimeout(() => window.location.href = 'login.html', 1500);
}

// API base
const API_BASE = 'https://food-expiry-tracker-backend-h11q.onrender.com/api/food';

// Global state
let foodData = [];
let editingId = null;

// ----------------------------
// Fetch food items from backend
// ----------------------------
async function fetchFoodItems() {
    try {
        const response = await fetch(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const foods = await response.json();
        foodData = foods;
        renderFoodItems(foodData);

        // ❌ Removed auto-email sending logic
        // checkForExpiryNotifications();
    } catch (err) {
        console.error('Error fetching foods:', err);
    }
}

// ----------------------------
// Render food items
// ----------------------------
function renderFoodItems(items) {
    foodList.innerHTML = '';

    const now = new Date();

    items.forEach((item) => {
        const expiryDate = new Date(item.expiryDate);
        const isExpired = expiryDate < now;

        // Skip items expired more than 7 days ago
        if (isExpired && (now - expiryDate) / (1000 * 60 * 60 * 24) > 7) {
            return;
        }

        const li = document.createElement('li');
        li.className = isExpired ? 'expired' : '';
        li.innerHTML = `
            <strong>${item.name}</strong> (Qty: ${item.quantity}) - Expires on ${expiryDate.toLocaleDateString()}
            <button class="edit-btn" ${isExpired ? 'disabled style="cursor:not-allowed"' : ''} onclick="${!isExpired ? `startEdit('${item._id}')` : ''}">Edit</button>
            <button class="delete-btn" ${isExpired ? 'disabled style="cursor:not-allowed"' : ''} onclick="${!isExpired ? `deleteFood('${item._id}')` : ''}">Delete</button>
        `;
        foodList.appendChild(li);
    });
}

// ----------------------------
// Add or update food item (toast logic stays as is!)
// ----------------------------
foodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = foodNameInput.value.trim();
    const expiryDate = expiryDateInput.value;
    const quantity = parseInt(quantityInput.value);

    if (!name || !expiryDate || isNaN(quantity) || quantity < 1) {
        console.error('Please enter valid food name, quantity, and expiry date');
        return;
    }

    const payload = { name, expiryDate, quantity };

    try {
        let res;
        if (editingId) {
            res = await fetch(`${API_BASE}/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to update");
            console.log('Food updated successfully');
            editingId = null;
        } else {
            res = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.errors?.[0]?.msg || "Failed to add food");
            }
            console.log('Food added successfully');
        }

        foodForm.reset();
        await fetchFoodItems();

    } catch (err) {
        console.error(err.message);
    }
}); 


// ----------------------------
// Start editing
// ----------------------------
window.startEdit = function(id) {
    const item = foodData.find(f => f._id === id);
    if (!item) return;
    foodNameInput.value = item.name;
    expiryDateInput.value = item.expiryDate.split('T')[0];
    quantityInput.value = item.quantity;
    editingId = id;
};

// ----------------------------
// Delete
// ----------------------------
async function deleteFood(id) {
    const confirmDelete = confirm("Delete this item?");
    if (!confirmDelete) return;

    try {
        await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Deleted successfully");
        await fetchFoodItems();
    } catch (err) {
        console.error("Error deleting food", err);
    }
}

// ----------------------------
// Logout
// ----------------------------
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('name');
    localStorage.removeItem('emailedToday'); // cleanup

    console.log("Logged out");
    window.location.href = 'login.html';
});

// ----------------------------
// Search & Sort
// ----------------------------
searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    renderFoodItems(foodData.filter(f => f.name.toLowerCase().includes(q)));
});

sortSelect.addEventListener('change', () => {
    let sorted = [...foodData];
    if (sortSelect.value === 'expiry') sorted.sort((a,b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    if (sortSelect.value === 'quantity') sorted.sort((a,b) => b.quantity - a.quantity);
    renderFoodItems(sorted);
});

// ----------------------------
// Init
// ----------------------------
fetchFoodItems();
