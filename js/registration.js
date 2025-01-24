class Registration {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.initEventListeners();
        this.showPopupAfterDelay();
    }

    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById("signupButton").addEventListener("click", (e) => {
                e.preventDefault();
                this.registerUser();
            });

            document.getElementById("signinButton").addEventListener("click", (e) => {
                e.preventDefault();
                this.loginUser();
            });

             // Event listeners for switching between tabs
            document.getElementById("signupTab").addEventListener("click", () => {
                this.switchForm("signup");
            });

            document.getElementById("signinTab").addEventListener("click", () => {
                this.switchForm("signin");
            });

            // Close popup when the close button or overlay is clicked
            document.querySelector('.close-button').addEventListener('click', () => this.closePopup());
            document.getElementById('popupOverlay').addEventListener('click', () => this.closePopup());
        });
    }

        showPopupAfterDelay() {
            // Check if user is logged in
            if (localStorage.getItem("userLoggedIn") === "true") {
                return; // If already logged in, do not show popup
            }

            setTimeout(() => {
                document.getElementById("registrationPopup").classList.add("show");
                document.getElementById("popupOverlay").classList.add("show");
            }, 4000); // Show after 4 seconds
        }

    registerUser() {
        let username = document.getElementById("signupUsername").value;
        let email = document.getElementById("signupEmail").value;
        let password = document.getElementById("signupPassword").value;

        if (!username || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        let userData = { username, email, password };

        // First, check if the email or username already exists
        fetch(`https://mokesell-d5a1.restdb.io/rest/accounts?q={"$or":[{"username":"${username}"},{"email":"${email}"}]}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        })
        .then(response => response.json())
        .then(existingUsers => {
            if (existingUsers.length > 0) {
                alert("Username or Email already exists. Please use a different one.");
            } else {
                // If username/email is unique, proceed with registration
                return fetch("https://mokesell-d5a1.restdb.io/rest/accounts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-apikey": this.apiKey,
                        "Cache-Control": "no-cache"
                    },
                    body: JSON.stringify(userData)
                });
            }
        })
        .then(response => response ? response.json() : null)
        .then(data => {
            if (data) {
                alert("Registration Successful!");
                this.switchForm("signin");
            }
        })
        .catch(error => console.log(error));
    }

    loginUser() {
        let username = document.getElementById("signinUsername").value;
        let password = document.getElementById("signinPassword").value;

        if (!username || !password) {
            alert("Please enter username and password.");
            return;
        }

        let query = `{"username":"${username}", "password":"${password}"}`;

        fetch(`https://mokesell-d5a1.restdb.io/rest/accounts?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Login successful
                alert("Login Successful!");
                this.closePopup();
            } else {
                // If no matching user is found
                alert("Invalid username or password. Please try again.");
            }
        })
        .catch(error => {
            console.log(error);
            alert("An error occurred. Please try again later.");
        });
    }

    switchForm(form) {
        const signupForm = document.getElementById("signupForm");
        const signinForm = document.getElementById("signinForm");
        const signupTab = document.getElementById("signupTab");
        const signinTab = document.getElementById("signinTab");
    
        // Toggle form visibility
        signupForm.classList.toggle("active", form === "signup");
        signinForm.classList.toggle("active", form === "signin");
    
        // Toggle active tab styling
        signupTab.classList.toggle("active", form === "signup");
        signinTab.classList.toggle("active", form === "signin");
    }

    closePopup() {
        document.getElementById("registrationPopup").classList.remove("show");
        document.getElementById("popupOverlay").classList.remove("show");
    
        // Delay hiding the overlay to allow the fade-out effect
        setTimeout(() => {
            document.getElementById("popupOverlay").style.display = "none";
        }, 300); // Matches the transition duration in CSS
    }
}

const APIKEY = "679377f88459083ff6097e55";
new Registration(APIKEY);