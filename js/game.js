class GameRewards {
    constructor() {
        // define the API base URL and API key
        this.apiBaseUrl = /*"https://mokesell-7cde.restdb.io/rest"*/"https://mokesell-39a1.restdb.io/rest";
        this.apiKey = "67a5a5b09c979727011b2a7b";
        // define the steps for the game page hero section
        this.steps = [
            {
                title: "STEP 1: EARN POINTS",
                descriptions: [
                    "Play the Game: Have fun and earn points by playing our game!"
                ]
            },
            {
                title: "STEP 2: REDEEM REWARDS",
                descriptions: [
                    "Discount Vouchers: Claim vouchers for discounts."
                ]
            },
            {
                title: "STEP 3: ENJOY THE BENEFITS",
                descriptions: [
                    "Redeem your rewards: Get discounts off your next purchase."
                ]
            }
        ];
        this.currentStepIndex = 0;
        this.init();
        this.loggedInAlertShown = false;
    }
    // function to check if the user is logged in
    checkLoginStatus() {
        let userId = sessionStorage.getItem("userId");
        if (!userId) {
            if (!this.loggedInAlertShown) {
                console.warn("User is not logged in.");
                alert("Please log in to access the rewards.");
                this.loggedInAlertShown = true; // set flag to true after alert is shown
            }
            return false;
        }
        return true;
    }
    // initialize the game page
    init() {
        document.getElementById("next-step").addEventListener("click", () => this.nextStep());
        document.getElementById("start-playing").addEventListener("click", () => this.scrollToGame());
        if (this.checkLoginStatus()) {
            // load user points and fetch vouchers
            this.loadUserPoints();
            this.fetchVouchers();
            this.fetchLeaderboard();
        }
    }
    // function to load user points from session storage
    loadUserPoints() {
        if (!this.checkLoginStatus()) return;
        // load user points from session storage
        let userPoints = sessionStorage.getItem("userPoints") || 0;
        if (!userPoints) {
            console.warn("User points not found in session storage.");
            sessionStorage.setItem("userPoints", 0);
            userPoints = 0;
        }
        // display the user points
        document.getElementById("currentPoints").textContent = userPoints;
        console.log("Loaded user points:", userPoints);
    }
    // function to navigate to the next step in the hero section
    nextStep() {
        this.currentStepIndex = (this.currentStepIndex + 1) % this.steps.length;
        const step = this.steps[this.currentStepIndex];
        // change the text content of the step
        document.getElementById("step-text").textContent = step.title;
        // update step descriptions
        const descriptionsContainer = document.querySelector("#step-description-container");
        descriptionsContainer.innerHTML = ""; // clear the current descriptions
        step.descriptions.forEach(description => {
            const p = document.createElement("p");
            p.textContent = description;
            descriptionsContainer.appendChild(p);
        });
    }
    // function to scroll to the game section
    scrollToGame() {
        document.getElementById("dino-game").scrollIntoView({ behavior: "smooth" });
    }
    // fetch vouchers available for the user
    fetchVouchers() {
        if (!this.checkLoginStatus()) return;
        let userPoints = parseInt(sessionStorage.getItem("userPoints")) || 0;
        console.log("Fectching vouchers for user with points:", userPoints);
        // fetch vouchers from the API
        fetch(`${this.apiBaseUrl}/vouchers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
            .then(vouchers => {
                console.log("Fetched vouchers:", vouchers);
                let vouchersDiv = document.getElementById("vouchers");
                vouchersDiv.innerHTML = "";
                // display the vouchers available for the user
                vouchers.forEach(voucher => {
                    let voucherElem = document.createElement("div");
                    voucherElem.classList.add("voucher");
                    voucherElem.innerHTML = `
                        <div class="voucher-details">
                            <p>${voucher.name}</p>
                            <p>${voucher.points} Points</p>
                        </div>
                        <button onclick="gameRewards.claimVoucher('${voucher._id}')">Claim</button>
                    `;
                    // only show vouchers the user can afford
                    let userPoints = sessionStorage.getItem("userPoints") || 0;
                    if (voucher.points <= userPoints) {
                        vouchersDiv.appendChild(voucherElem);
                    }
                });
                // display a message if no vouchers are available
                if (vouchersDiv.innerHTML === "") {
                    vouchersDiv.innerHTML = "<p>Not enough points to claim vouchers.</p>";
                }
            });
    }
    // claim the voucher and update the user points
    claimVoucher(voucherId) {
        let userPoints = parseInt(sessionStorage.getItem("userPoints")) || 0;
        console.log("Attempting to claim voucher:", voucherId);
        console.log("User points:", userPoints);
        // fetch the vouchers from the API
        fetch(`${this.apiBaseUrl}/vouchers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
            .then(vouchers => {
                // find the voucher with the given ID
                const voucher = vouchers.find(v => v._id === voucherId);
                // check if the voucher exists
                if (!voucher) {
                    console.error("Voucher not found with ID:", voucherId); 
                    return;
                }
                // ensure voucher points are an integer
                const voucherPoints = parseInt(voucher.points) || 0;
                console.log("Voucher points (after parseInt):", voucherPoints);
                // check if the user has enough points to claim the voucher
                if (voucher && voucher.points <= userPoints) {
                    // update the user's points
                    let updatedPoints = userPoints - voucher.points;
                    // store the updated points in session storage
                    sessionStorage.setItem("userPoints", updatedPoints);
                    // display the updated points
                    document.getElementById("currentPoints").textContent = updatedPoints;
                    console.log("Voucher claimed successfully:", updatedPoints);
                    // show success alert
                    alert("Voucher has been claimed successfully!");
                    // update the user points in the API
                    this.updateUserPointsToAPI(updatedPoints);
                    // fetch the vouchers again
                    this.fetchVouchers();
                } else {
                    console.log("Not enough points to claim this voucher.");
                }
            });
    }
    // fetch leaderboard and sort by points
    fetchLeaderboard() {
        fetch(`${this.apiBaseUrl}/accounts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
            .then(users => {
                console.log("Fetched leaderboard data:", users);
                let leaderboardBody = document.getElementById("leaderboard");
                leaderboardBody.innerHTML = "";
                // sort users by points in descending order
                users.sort((a, b) => b.points - a.points).forEach((user, index) => {
                    let row = document.createElement("tr");
                    row.innerHTML = `<td>${index + 1}</td><td>${user.username}</td><td>${user.points}</td>`;
                    leaderboardBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error("Error fetching leaderboard:", error);
            });
    }
    // update user's points after game over
    updateGamePoints(score) {
        // check if the user is logged in
        if (!this.checkLoginStatus()) return;
        // get the user points from session storage
        let userPoints = parseInt(sessionStorage.getItem("userPoints")) || 0;
        let pointsEarned = Math.floor(score / 300);  // convert game score to points (1 point per 300 game points)
        if (pointsEarned > 0) {
            // calculate the new total points
            let newTotal = userPoints + pointsEarned;
            // store the new total points in session storage
            sessionStorage.setItem("userPoints", newTotal);
            // display the new total points
            document.getElementById("currentPoints").textContent = newTotal;
            console.log(`Game Over! Earned ${pointsEarned} points. New total: ${newTotal}`);
            // update the user points in the API
            this.updateUserPointsToAPI(newTotal);
        } else {
            console.log("No points earned. Score:", score);
        }
    }
    // update user points in the API
    updateUserPointsToAPI(newTotal) {
        let userId = sessionStorage.getItem("userId");

        if (!userId) {
            console.warn("User ID not found. Cannot update API.");
            return;
        }

        console.log("Updating API. User ID:", userId, "New Points:", newTotal); 

        if (userId && newTotal) {
            fetch(`${this.apiBaseUrl}/accounts/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": this.apiKey,
                    "Cache-Control": "no-cache"
                },
                body: JSON.stringify({
                    points: newTotal,
                    _id: userId,
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('API update data:', data);
                // after updating the user points, refresh the leaderboard
                this.fetchLeaderboard();
            })
            .catch(error => console.error('Error:', error));
        }
    }
}
const gameRewards = new GameRewards();

/*DINO GAME CODE TAKEN ONLINE WITH OWN MINOR ADJUSTMENTS*/
//board
let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

// Background scrolling
let bgX = 0;
let bgSpeed = 3; // Adjust speed of background movement

//dino
let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
let dinoImg;

let dino = {
    x: dinoX,
    y: dinoY,
    width: dinoWidth,
    height: dinoHeight
}

//cactus
let cactusArray = [];
let cactusWidth = 120;
let cactusHeight = 60;
let cactusX = boardWidth;
let cactusY = boardHeight - cactusHeight;

let cactusImages = [];

//physics
let velocityX = -8;
let velocityY = 0;
let gravity = .4;

let gameOver = false;
let score = 0;
let gameStarted = false; 
let gameLoop;
let cactusInterval;
let backgroundImg; // Store background image

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load images
    dinoImg = new Image();
    dinoImg.src = "../images/game/dino.png";

    backgroundImg = new Image();
    backgroundImg.src = "../images/game/dino-background.png"; // Set background image

    cactusImages.push(new Image());
    cactusImages[0].src = "../images/game/sofa1.png";
    
    cactusImages.push(new Image());
    cactusImages[1].src = "../images/game/sofa2.png";
    
    cactusImages.push(new Image());
    cactusImages[2].src = "../images/game/sofa3.png";

    // prevent spacebar from scrolling
    document.addEventListener("keydown", function (e) {
        if (gameStarted && (e.code == "Space")) {
            e.preventDefault();
        }
        moveDino(e);
    });
    // Add event listeners for the game buttons
    document.getElementById("startGameBtn").addEventListener("click", startGame);
    document.getElementById("restartGameBtn").addEventListener("click", restartGame);
};

function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    gameOver = false;
    score = 0;
    cactusArray = [];

    document.getElementById("startGameBtn").style.display = "none";
    document.getElementById("restartGameBtn").style.display = "none";

    gameLoop = requestAnimationFrame(update);
    cactusInterval = setInterval(placeCactus, 1000);
}

function restartGame() {
    if (!gameOver) return;

    gameStarted = true;
    gameOver = false;
    score = 0;
    cactusArray = [];

    dino.y = dinoY;
    velocityY = 0;
    dinoImg.src = "../images/game/dino.png";
    bgX = 0; // Reset background position

    document.getElementById("restartGameBtn").style.display = "none";

    gameLoop = requestAnimationFrame(update);
    cactusInterval = setInterval(placeCactus, 1010);
}

function update() {
    if (gameOver) {
        // ensure the final frame is drawn
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

        // display "GAME OVER"
        context.fillStyle = "black";
        context.font = "40px courier";
        context.fillText("GAME OVER", boardWidth / 2 - 120, boardHeight / 2 - 20);

        // show final score
        document.getElementById("restartGameBtn").style.display = "block";
        context.fillStyle = "black";
        context.font = "20px courier";
        context.fillText("Final Score: " + score, boardWidth / 2 - 100, 50);

        // display the Lottie animation to indicate points earned
        const endGameAnimation = document.getElementById("endGameAnimation");
        if (score > 800) {
            endGameAnimation.style.display = "block";
            setTimeout(() => {
                endGameAnimation.style.display = "none"; // hide the animation after 3 seconds
            }, 3000);
        }

        // after the game ends, update the user's points
        gameRewards.updateGamePoints(score);
        
        return;
    }

    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // Move background
    bgX -= bgSpeed;
    if (bgX <= -boardWidth) {
        bgX = 0;
    }

    context.drawImage(backgroundImg, bgX, 0, boardWidth, boardHeight);
    context.drawImage(backgroundImg, bgX + boardWidth, 0, boardWidth, boardHeight);

    // Dino physics
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY);

    // Cactus movement
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            dinoImg.src = "../images/game/dino-dead.png";
            clearInterval(cactusInterval);
        }
    }

    // Always draw the dino
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    if(!gameOver) {
        // Score
        context.fillStyle = "black";
        context.font = "20px courier";
        context.fillText("Score: " + score, 5, 20);
        score++;
    }
}


function moveDino(e) {
    if (gameOver) return;

    if ((e.code == "Space" || e.code == "ArrowUp") && dino.y == dinoY) {
        velocityY = -10;
    }
}

function placeCactus() {
    if (gameOver) return;

    let cactus = {
        img: null,
        x: cactusX,
        y: cactusY,
        width: cactusWidth,
        height: cactusHeight
    }

    let randomIndex = Math.floor(Math.random() * cactusImages.length);
    cactus.img = cactusImages[randomIndex];

    cactusArray.push(cactus);

    if (cactusArray.length > 5) {
        cactusArray.shift();
    }
}

function detectCollision(a, b) {
    const buffer = 5;
    return a.x + a.width - buffer > b.x && 
           a.x + buffer < b.x + b.width && 
           a.y + a.height - buffer > b.y &&
           a.y + buffer < b.y + b.height;
}