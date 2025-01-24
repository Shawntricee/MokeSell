//method to manage registration popup  
class RegistrationPopup{
    constructor() {
        this.popup = document.getElementById("registrationPopup");
        this.closeButton= document.querySelector(".close-button");

        //tabs
        this.signupTab = document.getElementById("signupTab");
        this.signinTab = document.getElementById("signinTab");

        //forms
        this.signupForm = document.getElementById("signupForm");
        this.signinForm = document.getElementById("signinForm");

        //buttons
        this.signupButton = document.getElementById("signupButton");
        this.signinButton = document.getElementById("signinButton");

        //initialise event listeners
        this.initEvents();

        //show popup after 10s
        this.showPopupAfterDelay(1000);
    }

    initEvents() {
        this.signupTab.addEventListener("click", () => this.switchForm("signup"));
        this.signinTab.addEventListener("click", () => this.switchForm("signin"));
        this.closeButton.addEventListener("click", () => this.closePopup());
        this.signupButton.addEventListener("click", (event) => this.registerUser(event));
        this.signinButton.addEventListener("click", (event) => this.loginUser(event));
    }

    switchForm(target) {
        if (target === "signin") {
            this.signinForm.classList.add("active");
            this.signupForm.classList.remove("active");
            this.signinTab.classList.add("active");
            this.signupTab.classList.remove("active");
        } else {
            this.signupForm.classList.add("active");
            this.signinForm.classList.remove("active");
            this.signupTab.classList.add("active");
            this.signinTab.classList.remove("active");
        }
    }

    closePopup() {
        this.popup.style.display = "none";
    }

    showPopupAfterDelay(delay) {
        setTimeout(() => {
            this.popup.style.display = "block"; // Show the popup
        }, delay);
    }   
}

// Initialize the popup when the page loads
document.addEventListener("DOMContentLoaded", () => new RegistrationPopup());