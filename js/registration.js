class Registration {
    constructor() {
        this.usersFile = "../json/accounts.json";
        this.initEventListeners();
        this.showPopupAfterDelay();
        this.checkLoginStatus();
    }

    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const navSignUp = document.getElementById("navSignUp");
            const navSignIn = document.getElementById("navSignIn");
            const signupButton = document.getElementById("signupButton");
            const signinButton = document.getElementById("signinButton");
            const signupTab = document.getElementById("signupTab");
            const signinTab = document.getElementById("signinTab");
            const closeButton = document.querySelector('.close-button');
            const popupOverlay = document.getElementById('popupOverlay');
            
            // Select the Lottie animation player
            const animationPlayer = document.getElementById('animationPlayer');

            if (navSignUp) navSignUp.addEventListener("click", (e) => this.openPopup(e, "signup"));
            if (navSignIn) navSignIn.addEventListener("click", (e) => this.openPopup(e, "signin"));

            if (signupButton) signupButton.addEventListener("click", (e) => {
                this.registerUser(e);
            });
            if (signinButton) signinButton.addEventListener("click", (e) => {
                this.loginUser(e);
            });

            if (signupTab) signupTab.addEventListener("click", () => this.switchForm("signup"));
            if (signinTab) signinTab.addEventListener("click", () => this.switchForm("signin"));

            if (closeButton) closeButton.addEventListener("click", () => this.closePopup());
            if (popupOverlay) popupOverlay.addEventListener("click", () => this.closePopup());
        });
    }

    // Function to display the Lottie animation
    showAnimation() {
        const lottiePlayer = document.getElementById('signInAnimation'); 
        lottiePlayer.style.display = 'block'; // Show the Lottie animation
        popupOverlay.style.display = 'block'; // Show the overlay
        // Optionally, hide it after a certain amount of time or when the sign-in/sign-up process finishes
        setTimeout(() => {
            lottiePlayer.style.display = 'none'; // Hide animation after some time (adjust as needed)
        }, 4000); // 7 seconds, adjust as per your animation duration or process
    }

    showPopupAfterDelay() {
        if (
            sessionStorage.getItem("userLoggedIn") !== "true" &&
            sessionStorage.getItem("popupClosed") !== "true"
        ) {
            setTimeout(() => {
                document.getElementById("registrationPopup").classList.add("show");
                document.getElementById("popupOverlay").classList.add("show");
            }, 4000);
        }
    }

    registerUser(e) {
        e.preventDefault();
        const username = document.getElementById("signupUsername").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        if (!username || !email || !password) return alert("Please fill in all fields.");
        
        fetch(this.usersFile)
            .then(response => response.json())
            .then(users => {
                if (users.some(user => user.username === username || user.email === email)) {
                    alert("Username or Email already exists.");
                } else {
                    alert("Registration Successful!");
                    this.switchForm("signin");
                }
            })
            .catch(error => console.error(error));
    }

    loginUser(e) {
        e.preventDefault();
        const username = document.getElementById("signinUsername").value;
        const password = document.getElementById("signinPassword").value;
        if (!username || !password) return alert("Please enter username and password.");
        
        fetch(this.usersFile)
            .then(response => response.json())
            .then(users => {
                const user = users.find(u => u.username === username && u.password === password);
                if (user) {
                    sessionStorage.setItem("userLoggedIn", "true");
                    sessionStorage.setItem("currentUsername", username);
                    sessionStorage.setItem("userEmail", user.email);
                    sessionStorage.setItem("userId", user._id);
                    sessionStorage.setItem("userPoints", user.points);
                    
                    this.updateNavBar();
                    this.closePopup();

                    this.showAnimation();
                } else {
                    alert("Invalid username or password.");
                }
            })
            .catch(error => console.error(error));
    }

    checkLoginStatus() {
        if (sessionStorage.getItem("userLoggedIn") === "true") {
            this.updateNavBar();
        }
    }

    updateNavBar() {
        document.getElementById("userNav").style.display = "flex";
        document.getElementById("guestNav").style.display = "none";
        
        const profileContainer = document.querySelector(".profile-container");
        const userDropdown = document.getElementById("userDropdown");
        if (profileContainer && userDropdown) {
            profileContainer.addEventListener("click", () => {
                userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
            });
        }
        
        document.getElementById("logoutButton").addEventListener("click", () => this.logoutUser());
    }

    logoutUser() {
        this.showAnimation(); // Show animation first
        sessionStorage.clear(); // Clear sessionStorage
        setTimeout(() => {
            location.reload(); // Reload the page after the animation
        }, 4000); // Delay the page reload for 5 seconds (adjust to match your animation duration)
    }

    switchForm(form) {
        document.getElementById("signupForm").classList.toggle("active", form === "signup");
        document.getElementById("signinForm").classList.toggle("active", form === "signin");
        document.getElementById("signupTab").classList.toggle("active", form === "signup");
        document.getElementById("signinTab").classList.toggle("active", form === "signin");
    }

    closePopup() {
        const popup = document.getElementById("registrationPopup");
        const overlay = document.getElementById("popupOverlay");
        popup.classList.remove("show");
        overlay.classList.remove("show");
        sessionStorage.setItem("popupClosed", "true");
        setTimeout(() => { overlay.style.display = "none"; }, 4000);
    }

    openPopup(e, formType) {
        e.preventDefault();
        document.getElementById("registrationPopup").classList.add("show");
        document.getElementById("popupOverlay").classList.add("show");
        document.getElementById("popupOverlay").style.display = "block";
        this.switchForm(formType);
    }
}

new Registration();
