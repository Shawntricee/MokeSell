class Registration {
    constructor() {
        this.apiUrl = "https://mokesell-7cde.restdb.io/rest/accounts"/*"https://mokesell-39a1.restdb.io/rest/accounts"*/;
        this.apiKey = "67a4f3a7fd5d586e56efe120"/*"67a5a5b09c979727011b2a7b"*/;
        this.initEventListeners();
        this.showPopupAfterDelay();
        this.checkLoginStatus();
    }
    // initialize event listeners for the registration form
    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // select the elements
            const navSignUp = document.getElementById("navSignUp");
            const navSignIn = document.getElementById("navSignIn");
            const signupButton = document.getElementById("signupButton");
            const signinButton = document.getElementById("signinButton");
            const signupTab = document.getElementById("signupTab");
            const signinTab = document.getElementById("signinTab");
            const closeButton = document.querySelector('.close-button');
            const popupOverlay = document.getElementById('popupOverlay');
            // add event listener
            if (navSignUp) navSignUp.addEventListener("click", (e) => this.openPopup(e, "signup"));
            if (navSignIn) navSignIn.addEventListener("click", (e) => this.openPopup(e, "signin"));
            if (signupButton) signupButton.addEventListener("click", (e) => {
                this.registerUser(e);
            });
            if (signinButton) signinButton.addEventListener("click", (e) => {
                this.loginUser(e);
            });
            // handle tab switching for registration popup
            if (signupTab) signupTab.addEventListener("click", () => this.switchForm("signup"));
            if (signinTab) signinTab.addEventListener("click", () => this.switchForm("signin"));
            // close the popup and remove overlay
            if (closeButton) closeButton.addEventListener("click", () => this.closePopup());
            if (popupOverlay) popupOverlay.addEventListener("click", () => this.closePopup());
        });
    }
    // function to display the loading Lottie animation
    showAnimation() {
        const lottiePlayer = document.getElementById('signInAnimation'); 
        // show the animation and overlay
        lottiePlayer.style.display = 'block';
        popupOverlay.style.display = 'block';
        // hide the animation after some time
        setTimeout(() => {
            lottiePlayer.style.display = 'none';
        }, 6000);
    }
    // function to show the registration popup after a delay
    showPopupAfterDelay() {
        if (
            sessionStorage.getItem("userLoggedIn") !== "true" &&
            sessionStorage.getItem("popupClosed") !== "true"
        ) {
            setTimeout(() => {
                // show the popup after 4 seconds
                document.getElementById("registrationPopup").classList.add("show");
                document.getElementById("popupOverlay").classList.add("show");
            }, 4000);
        }
    }
    // function to register a new user
    registerUser(e) {
        e.preventDefault();
        // get the values from the form
        const username = document.getElementById("signupUsername").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        const points = 0;
        const dateJoined = new Date().toISOString();
        if (!username || !email || !password) return alert("Please fill in all fields.");
        let userData = {username, email, password, points, dateJoined };
        console.log("User data:", userData);
        // make a POST request to the API to register the user
        fetch(`${this.apiUrl}?q={"$or":[{"username":"${username}"},{"email":"${email}"}]}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error checking for existing user');
            }
            return response.json();
        })
        .then(existingUsers => {
            if (existingUsers.length > 0) {
                alert("Username or Email already exists. Please use a different one.");
                return Promise.reject("User already exists"); // stops further execution
            }
            // if username/email is unique, proceed with registration
            return fetch(`${this.apiUrl}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": this.apiKey,
                    "Cache-Control": "no-cache"
                },
                body: JSON.stringify(userData)
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error registering the user');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                alert("Registration Successful!");
                this.switchForm("signin");
            }
        })
        .catch(error => {
            if (error === "User already exists") {
                return;
            }
            console.error('Error registering the user:', error);
            alert("An error occurred. Please try again later.");
        });
    }

    loginUser() {
        let username = document.getElementById("signinUsername").value;
        let password = document.getElementById("signinPassword").value;

        if (!username || !password) {
            alert("Please enter username and password.");
            return;
        }
        let query = `{"username":"${username}", "password":"${password}"}`;

        fetch(`${this.apiUrl}?q=${encodeURIComponent(query)}`, {
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
                const user = data[0];  // Get the first user object
                alert("Login Successful!");
                sessionStorage.setItem("userLoggedIn", "true");
                sessionStorage.setItem("currentUsername", username);
                sessionStorage.setItem("userEmail", user.email);
                sessionStorage.setItem("userId", user._id);
                sessionStorage.setItem("userPoints", user.points);
                sessionStorage.setItem("userDateJoined", user.dateJoined);
                
                this.updateNavBar();
                this.closePopup();
                this.showAnimation();

                 // reload the page after a short delay (when animation ends)
                setTimeout(() => {
                    location.reload();
                }, 6000);
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
    // function to check if the user is logged in
    checkLoginStatus() {
        if (sessionStorage.getItem("userLoggedIn") === "true") {
            this.updateNavBar();
        }
    }
    // function to update the navbar when the user logs in
    updateNavBar() {
        document.getElementById("userNav").style.display = "flex";
        document.getElementById("guestNav").style.display = "none";
        // update the user profile dropdown
        const profileContainer = document.querySelector(".profile-icon");
        const userDropdown = document.getElementById("userDropdown");
        if (profileContainer && userDropdown) {
            profileContainer.addEventListener("click", () => {
                userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
            });
        }
        // logout the user when the logout button is clicked
        document.getElementById("logoutButton").addEventListener("click", () => this.logoutUser());
    }
    // function to log out the user
    logoutUser() {
        this.showAnimation(); // show animation first
        sessionStorage.clear(); // clear sessionStorage
        setTimeout(() => {
            location.reload(); // reload the page after the animation
        }, 6000);
    }
    // function to switch between the signup and signin forms
    switchForm(form) {
        document.getElementById("signupForm").classList.toggle("active", form === "signup");
        document.getElementById("signinForm").classList.toggle("active", form === "signin");
        document.getElementById("signupTab").classList.toggle("active", form === "signup");
        document.getElementById("signinTab").classList.toggle("active", form === "signin");
    }
    // function to close the registration popup
    closePopup() {
        const popup = document.getElementById("registrationPopup");
        const overlay = document.getElementById("popupOverlay");
        popup.classList.remove("show");
        overlay.classList.remove("show");
        sessionStorage.setItem("popupClosed", "true");
        overlay.style.display = "none";
    }
    // function to open the registration popup
    openPopup(e, formType) {
        e.preventDefault();
        document.getElementById("registrationPopup").classList.add("show");
        document.getElementById("popupOverlay").classList.add("show");
        document.getElementById("popupOverlay").style.display = "block";
        this.switchForm(formType);
    }
}
// initialize the Registration class
new Registration();
