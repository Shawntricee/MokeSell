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
        });
    }

    showPopupAfterDelay() {
        setTimeout(() => {
            document.getElementById("registrationPopup").style.display = "block";
        }, 5000); // Show popup after 5 seconds
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

        let loginData = { username, password };

        let settings = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            },
            body: JSON.stringify(loginData)
        };

        fetch("https://mokesell-d5a1.restdb.io/rest/accounts", settings)
            .then(response => response.json())
            .then(() => {
                alert("Login Successful!");
                this.closePopup();
            })
            .catch(error => console.log(error));
    }

    switchForm(form) {
        document.getElementById("signupForm").style.display = form === "signin" ? "none" : "block";
        document.getElementById("signinForm").style.display = form === "signin" ? "block" : "none";
    }

    closePopup() {
        document.getElementById("registrationPopup").style.display = "none";
    }
}

const APIKEY = "679377f88459083ff6097e55";
new Registration(APIKEY);