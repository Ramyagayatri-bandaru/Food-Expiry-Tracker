// ==================== TOAST HELPER ====================
function showToast(message, type = "success") {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: type === "success" ? "#4CAF50" : "#f44336",
        close: true
    }).showToast();
}

// ==================== CUSTOM CONFIRM POPUP ====================
function showConfirm(message, onConfirm) {
    const confirmOverlay = document.createElement("div");
    confirmOverlay.style.position = "fixed";
    confirmOverlay.style.top = 0;
    confirmOverlay.style.left = 0;
    confirmOverlay.style.width = "100%";
    confirmOverlay.style.height = "100%";
    confirmOverlay.style.background = "rgba(0,0,0,0.5)";
    confirmOverlay.style.display = "flex";
    confirmOverlay.style.alignItems = "center";
    confirmOverlay.style.justifyContent = "center";
    confirmOverlay.style.zIndex = 1000;

    const confirmBox = document.createElement("div");
    confirmBox.style.background = "#fff";
    confirmBox.style.padding = "20px";
    confirmBox.style.borderRadius = "8px";
    confirmBox.style.textAlign = "center";
    confirmBox.style.maxWidth = "300px";
    confirmBox.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.2)";
    confirmBox.innerHTML = `
        <p style="margin-bottom: 20px; font-size: 16px;">${message}</p>
        <button id="confirmYes" style="margin-right: 10px; padding: 5px 12px; background: #4CAF50; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Yes</button>
        <button id="confirmNo" style="padding: 5px 12px; background: #f44336; color: #fff; border: none; border-radius: 4px; cursor: pointer;">No</button>
    `;

    confirmOverlay.appendChild(confirmBox);
    document.body.appendChild(confirmOverlay);

    document.getElementById("confirmYes").addEventListener("click", () => {
        document.body.removeChild(confirmOverlay);
        if (typeof onConfirm === "function") onConfirm();
    });

    document.getElementById("confirmNo").addEventListener("click", () => {
        document.body.removeChild(confirmOverlay);
    });
}

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

const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName') || 'User';

const API_BASE = 'https://food-expiry-tracker-backend-6rui.onrender.com/api/food';
const token = localStorage.getItem('token');

let foodData = [];
let editingId = null;

if (!token) {
    showToast("Please login first!", "error");
    setTimeout(() => window.location.href = 'login.html', 1500);
}

// ----------------------------
// Fetch and render food items
// ----------------------------
async function fetchFoodItems() {
    try {
        const response = await fetch(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const foods = await response.json();
        foodData = foods;
        renderFoodItems(foodData);
    } catch (err) {
        console.error('Error fetching foods:', err);
        showToast("Error fetching food list", "error");
    }
}

// ----------------------------
// Render food items
// ----------------------------
function renderFoodItems(items) {
    foodList.innerHTML = '';

    items.forEach((item) => {
        const isExpired = new Date(item.expiryDate) < new Date();

        const li = document.createElement('li');
        li.className = isExpired ? 'expired' : '';

        li.innerHTML = `
            <strong>${item.name}</strong> 
            (Qty: ${item.quantity}) - 
            Expires on ${new Date(item.expiryDate).toLocaleDateString()}
            <button class="edit-btn" ${isExpired ? 'disabled style="cursor:not-allowed"' : ''} onclick="${!isExpired ? `startEdit('${item._id}')` : ''}">Edit</button>
            <button class="delete-btn" ${isExpired ? 'disabled style="cursor:not-allowed"' : ''} onclick="${!isExpired ? `deleteFood('${item._id}')` : ''}">Delete</button>
        `;

        foodList.appendChild(li);
    });
}


// ----------------------------
// Add or Update food item
// ----------------------------
foodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = foodNameInput.value.trim();
    const expiryDate = expiryDateInput.value;
    const quantity = parseInt(quantityInput.value);

    if (!name || !expiryDate || isNaN(quantity) || quantity < 1) {
        showToast('Please enter valid food name, quantity, and expiry date', "error");
        return;
    }

    const foodPayload = { name, expiryDate, quantity };

    try {
        if (editingId) {
            // UPDATE
            const res = await fetch(`${API_BASE}/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(foodPayload),
            });

            if (!res.ok) {
                showToast('Failed to update food item', "error");
                return;
            }

            editingId = null;
            foodForm.querySelector('button[type="submit"]').textContent = 'Add Item';
            showToast('Food item updated successfully!', "success");
        } else {
            // ADD
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(foodPayload),
            });

            if (!res.ok) {
                const { errors } = await res.json();
                showToast(errors?.[0]?.msg || 'Failed to add food', "error");
                return;
            }
            showToast('Food item added successfully!', "success");
        }

        foodForm.reset();
        fetchFoodItems();
    } catch (err) {
        console.error('Error saving food:', err);
        showToast("Error saving food item", "error");
    }
});

// ----------------------------
// Start Edit
// ----------------------------
window.startEdit = function (id) {
    const item = foodData.find(food => food._id === id);
    if (!item) return;

    foodNameInput.value = item.name;
    expiryDateInput.value = item.expiryDate.split('T')[0];
    quantityInput.value = item.quantity;
    editingId = id;

    foodForm.querySelector('button[type="submit"]').textContent = 'Update Item';
    foodNameInput.focus();
};

// ----------------------------
// Delete food item (custom confirm)
// ----------------------------
async function deleteFood(id) {
    showConfirm("Are you sure you want to delete this item?", async () => {
        try {
            await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchFoodItems();
            showToast('Food item deleted successfully!', "success");
        } catch (err) {
            console.error('Error deleting food:', err);
            showToast("Error deleting food item", "error");
        }
    });
}

// ----------------------------
// Logout
// ----------------------------
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast("Logged out successfully", "success");
    setTimeout(() => window.location.href = 'login.html', 1000);
});

// ----------------------------
// Search
// ----------------------------
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = foodData.filter(item =>
        item.name.toLowerCase().includes(query)
    );
    renderFoodItems(filtered);
});

// ----------------------------
// Sort
// ----------------------------
sortSelect.addEventListener('change', () => {
    let sorted = [...foodData];

    if (sortSelect.value === 'expiry') {
        sorted.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    } else if (sortSelect.value === 'quantity') {
        sorted.sort((a, b) => b.quantity - a.quantity);
    }

    renderFoodItems(sorted);
});

// ----------------------------
// Initialize
// ----------------------------
fetchFoodItems();

// Prevent duplicate emails with a local store
const notifiedMap = new Map();

function checkForExpiryNotifications() {
    const today = new Date();
    const oneDayAhead = new Date();
    oneDayAhead.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = oneDayAhead.toISOString().split('T')[0];

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.email) return;

    foodData.forEach(item => {
        const expiryDateStr = new Date(item.expiryDate).toISOString().split('T')[0];

        const uniqueKeyToday = `${item._id}-today`;
        const uniqueKeyTomorrow = `${item._id}-tomorrow`;

        if (expiryDateStr === todayStr && !notifiedMap.has(uniqueKeyToday)) {
            sendExpiryEmailToBackend(item, 'today', user.email);
            notifiedMap.set(uniqueKeyToday, true);
        }

        if (expiryDateStr === tomorrowStr && !notifiedMap.has(uniqueKeyTomorrow)) {
            sendExpiryEmailToBackend(item, 'tomorrow', user.email);
            notifiedMap.set(uniqueKeyTomorrow, true);
        }
    });
}

// Daily scheduled check at 8:00 AM
function scheduleDailyExpiryCheck() {
    const now = new Date();
    const next8AM = new Date();
    next8AM.setHours(8, 0, 0, 0);
    if (now > next8AM) next8AM.setDate(next8AM.getDate() + 1);

    const delay = next8AM - now;
    setTimeout(() => {
        checkForExpiryNotifications();
        setInterval(checkForExpiryNotifications, 24 * 60 * 60 * 1000);
    }, delay);
}

// Send email via backend
function sendExpiryEmailToBackend(item, type, userEmail) {
    const payload = {
        to: userEmail,
        foodName: item.name,
        expiryDate: new Date(item.expiryDate).toLocaleDateString(),
        reminderType: type === 'today' ? 'expiring today' : 'expiring tomorrow'
    };

    fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            console.log(`Reminder email sent for ${item.name} (${type})`);
        } else {
            console.error('Email failed to send');
        }
    })
    .catch(error => {
        console.error('Error sending email:', error);
    });
}

// Trigger on load after food items are fetched
fetchFoodItems().then(() => {
    checkForExpiryNotifications();
    scheduleDailyExpiryCheck();
});
