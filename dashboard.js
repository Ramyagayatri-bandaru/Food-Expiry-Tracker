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
let foodData = [];        // Store fetched food items
let editingId = null;      // Track editing item

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

        // Only trigger email for items expiring today
        checkForExpiryNotifications();
    } catch (err) {
        console.error('Error fetching foods:', err);
    }
}

// ----------------------------
// Render food items in the UI (only expired <= 1 week or not expired)
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
// Add or update food item
// ----------------------------
foodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = foodNameInput.value.trim();
    const expiryDate = expiryDateInput.value;
    const quantity = parseInt(quantityInput.value);

    // Validate input
    if (!name || !expiryDate || isNaN(quantity) || quantity < 1) {
        console.error('Please enter valid food name, quantity, and expiry date');
        return;
    }

    const payload = { name, expiryDate, quantity };

    try {
        let res;
        if (editingId) {
            // Update existing food item
            res = await fetch(`${API_BASE}/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to update");
            console.log('Food updated successfully');
            editingId = null;
        } else {
            // Add new food item
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

        // Reset form and refresh list
        foodForm.reset();
        await fetchFoodItems();

    } catch (err) {
        console.error(err.message);
    }
});

// ----------------------------
// Check for expiry notifications (once per day using LocalStorage)
// ----------------------------
function checkForExpiryNotifications() {
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Load emailedToday from LocalStorage
    let emailedToday = JSON.parse(localStorage.getItem('emailedToday') || '{}');

    foodData.forEach(item => {
        const expiryStr = new Date(item.expiryDate).toISOString().split('T')[0];

        if (expiryStr === todayStr) {
            // Skip if email already sent today
            if (emailedToday[item._id] === todayStr) {
                return;
            }

            // Send email
            console.log("Triggering email for today's item:", item.name, item.expiryDate);
            sendExpiryEmail(item);

            // Mark as emailed
            emailedToday[item._id] = todayStr;
        }
    });

    // Save back to LocalStorage
    localStorage.setItem('emailedToday', JSON.stringify(emailedToday));
}

// ----------------------------
// Send expiry email for a single item
// ----------------------------
function sendExpiryEmail(item) {
    fetch('https://food-expiry-tracker-backend-h11q.onrender.com/api/sendEmail', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            email: userEmail,
            name: Username,
            items: [{ name: item.name, expiryDate: item.expiryDate }]
        })
    })
    .then(async res => {
        if (!res.ok) {
            const text = await res.text();
            console.error(`Email send failed for ${item.name}:`, res.status, text);
        } else {
            const data = await res.json();
            console.log("Email response:", data);
        }
    })
    .catch(err => console.error(`Email send error for ${item.name}:`, err));
}

// ----------------------------
// Start editing a food item
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
// Delete food item
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
// Logout user
// ----------------------------
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    console.log("Logged out");
    setTimeout(() => window.location.href = 'login.html', 1000);
});

// ----------------------------
// Search & sort functionality
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
// Reset emailedToday at midnight (using LocalStorage)
// ----------------------------
function scheduleMidnightReset() {
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
    setTimeout(() => {
        localStorage.removeItem('emailedToday');
        console.log("Reset emailedToday for new day");
        scheduleMidnightReset(); // schedule again for next midnight
    }, msToMidnight);
}
scheduleMidnightReset();

// ----------------------------
// Initialize dashboard
// ----------------------------
fetchFoodItems(); // Fetch items and trigger emails only for today's items
