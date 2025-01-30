class Registration {
    constructor(/*apiKey*/) {
        /*this.apiKey = apiKey;*/
        this.usersFile = "../json/accounts.json"
        this.initEventListeners();
        this.showPopupAfterDelay();
        this.checkLoginStatus();
    }

    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            //nav bar sign in and sign up buttons
            const navSignUp = document.getElementById("navSignUp");
            const navSignIn = document.getElementById("navSignIn");
    
            if (navSignUp) {
                navSignUp.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.openPopup("signup");
                });
            }
    
            if (navSignIn) {
                navSignIn.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.openPopup("signin");
                });
            }
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

        let userData = { username, email, password, date_joined: new Date().toISOString()};

        // First, check if the email or username already exists
        fetch(/*`https://mokesell-d5a1.restdb.io/rest/accounts?q={"$or":[{"username":"${username}"},{"email":"${email}"}]}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        }*/this.usersFile)
        .then(response => response.json())
        .then(existingUsers => {
            if (existingUsers.length > 0) {
                alert("Username or Email already exists. Please use a different one.");
            } else {
                // If username/email is unique, proceed with registration
                return fetch(/*"https://mokesell-d5a1.restdb.io/rest/accounts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-apikey": this.apiKey,
                        "Cache-Control": "no-cache"
                    },
                    body: JSON.stringify(userData)
                }*/"../json/accounts.json");
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
    
        fetch(/*`https://mokesell-d5a1.restdb.io/rest/accounts?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        }*/this.usersFile)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Login successful
                alert("Login Successful!");
                // Assuming data[0] contains the user data, extract userId and email
                const userId = data[0].user_id; // Adjust based on API response structure
                const email = data[0].email; // Adjust based on API response structure
                console.log(userId, email)
                // Set the login status and current username in localStorage
                localStorage.setItem("userLoggedIn", "true");
                localStorage.setItem("userId", userId)
                localStorage.setItem("currentUsername", username);
                localStorage.setItem("userEmail", email)
    
                // Update the navbar and close the login popup
                this.updateNavBar();
                this.closePopup();
    
                // Reinitialize Product and ReviewManager with the currentUsername
                const currentUsername = localStorage.getItem("currentUsername");
                product = new Product("679796bbbb50491a00009ee6", /*APIKEY,*/ currentUsername); // Pass currentUsername to the Product class
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

    checkLoginStatus() {
        if (localStorage.getItem("userLoggedIn") === "true") {
            this.updateNavBar();
        }
    }

    updateNavBar() {
        document.getElementById("userNav").style.display = "flex";
        document.getElementById("guestNav").style.display = "none";
        //add event listener to toggle the dropdown on profile click
        const profileContainer = document.querySelector(".profile-container");
        const userDropdown = document.getElementById("userDropdown");
        profileContainer.addEventListener("click", () => {
            //toggle visibility of the dropdown using style.display
            if (userDropdown.style.display === "block") {
                userDropdown.style.display = "none"; // Hide the dropdown
            } else {
                userDropdown.style.display = "block"; // Show the dropdown
            }
        });
        //add event listener for logout
        document.getElementById("logoutButton").addEventListener("click", () => this.logoutUser());
    }

    logoutUser() {
        localStorage.removeItem("userLoggedIn");
        localStorage.removeItem("currentUsername");
        location.reload();
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

    openPopup(formType) {
        const popup = document.getElementById("registrationPopup");
        const overlay = document.getElementById("popupOverlay");

        popup.classList.add("show");
        overlay.classList.add("show");
        overlay.style.display = "block";

    this.switchForm(formType);
    }
}

/*const APIKEY = "679377f88459083ff6097e55";*/
new Registration(/*APIKEY*/);