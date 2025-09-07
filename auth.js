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
const BASE_URL = 'https://food-expiry-tracker-backend-h11q.onrender.com'

// ==================== REGISTER ====================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const res = await fetch(`${BASE_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            if (res.ok) {
                showToast("Registration successful! Please login.", "success");
                setTimeout(() => (window.location.href = "login.html"), 2000);
            } else {
                const err = await res.json();
                showToast("Registration failed: " + err.message, "error");
            }
        } catch (error) {
            showToast("Error: " + error.message, "error");
        }
    });
}

// ==================== LOGIN ====================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("userEmail", email);
                localStorage.setItem("name", data.user.name)
                showToast("Login successful!", "success");
                setTimeout(() => (window.location.href = "dashboard.html"), 1000);
            } else {
                showToast("Invalid email or password", "error");
            }
        } catch (error) {
            showToast("Error: " + error.message, "error");
        }
    });
}
