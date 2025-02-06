class GameRewards {
    constructor() {
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
    }

    init() {
        document.getElementById("next-step").addEventListener("click", () => this.nextStep());
        document.getElementById("start-playing").addEventListener("click", () => this.scrollToGame());

        this.loadUserPoints();
        this.fetchVouchers();
        this.fetchLeaderboard();
        window.addEventListener("beforeunload", () => this.updatedUserPointsToAPI());
    }

    checkLoginStatus() {
        let userId = sessionStorage.getItem("userId");
        if (!userId) {
            console.warn("User is not logged in.");
            alert("Please log in to access the rewards.");
            return false;
        }
        return true;
    }

    loadUserPoints() {
        if (!this.checkLoginStatus()) return;

        let userPoints = sessionStorage.getItem("userPoints") || 0;
        if (!userPoints) {
            console.warn("User points not found in session storage.");
            sessionStorage.setItem("userPoints", 0);
            userPoints = 0;
        }
        document.getElementById("currentPoints").textContent = userPoints;
        console.log("Loaded user points:", userPoints);
    }

    nextStep() {
        this.currentStepIndex = (this.currentStepIndex + 1) % this.steps.length;
        const step = this.steps[this.currentStepIndex];

        // Change the title
        document.getElementById("step-text").textContent = step.title;
        
        // Update descriptions
        const descriptionsContainer = document.querySelector("#step-description-container");
        descriptionsContainer.innerHTML = ""; // Clear the current descriptions
        step.descriptions.forEach(description => {
            const p = document.createElement("p");
            p.textContent = description;
            descriptionsContainer.appendChild(p);
        });
    }

    scrollToGame() {
        document.getElementById("dino-game").scrollIntoView({ behavior: "smooth" });
    }

    // Fetch vouchers available for the user
    fetchVouchers() {

        let userPoints = parseInt(sessionStorage.getItem("userPoints")) || 0;
        console.log("Fectching vouchers for user with points:", userPoints);
        fetch(/*`/api/vouchers?user=${userId}`*/ '../json/vouchers.json')
            .then(response => response.json())
            .then(vouchers => {
                console.log(vouchers);
                let vouchersDiv = document.getElementById("vouchers");
                vouchersDiv.innerHTML = "";

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
                    // Only show vouchers the user can afford
                    let userPoints = sessionStorage.getItem("userPoints") || 0;
                    if (voucher.points <= userPoints) {
                        vouchersDiv.appendChild(voucherElem);
                    }
                });

                if (vouchersDiv.innerHTML === "") {
                    vouchersDiv.innerHTML = "<p>Not enough points to claim vouchers.</p>";
                }
            });
    }

    // Claim the voucher and update the user points
    claimVoucher(voucherId) {

        let userPoints = parseInt(sessionStorage.getItem("userPoints")) || 0;
        console.log("Attempting to claim voucher:", voucherId);
        console.log("User points:", userPoints);
        // Temporarily fetch the vouchers from the local JSON file (simulating a fetch)
        fetch(/*'/path/to/vouchers.json'*/ "../json/vouchers.json")
            .then(response => response.json())
            .then(vouchers => {
                // Find the claimed voucher
                console.log("Fetched vouchers:", vouchers);
                const voucher = vouchers.find(v => v._id === voucherId);

                if (!voucher) {
                    console.error("Voucher not found with ID:", voucherId);  // Log error if voucher not found
                    return;  // Exit early if the voucher is not found
                }

                // Ensure voucher points are an integer and do the comparison
                const voucherPoints = parseInt(voucher.points) || 0;  // Ensure it's an integer
                console.log("Voucher points (after parseInt):", voucherPoints); // Debugging the parsed points


                if (voucher && voucher.points <= userPoints) {
                    // Update the user's points
                    let updatedPoints = userPoints - voucher.points;
                    sessionStorage.setItem("userPoints", updatedPoints);
                    document.getElementById("currentPoints").textContent = updatedPoints;
                    console.log("Voucher claimed successfully:", updatedPoints);

                    this.updateUserPointsToAPI(updatedPoints);
                    this.fetchVouchers();
                } else {
                    console.log("Not enough points to claim this voucher.");
                }
            });
    }

    // Fetch leaderboard and sort by points
    fetchLeaderboard() {
        fetch(/*"/api/accounts"*/ "../json/accounts.json")  // Fetch accounts data from the API
            .then(response => response.json())
            .then(users => {
                console.log("Fetched leaderboard data:", users);
                let leaderboardBody = document.getElementById("leaderboard");
                leaderboardBody.innerHTML = "";  // Clear the current leaderboard

                // Sort users by points in descending order
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

    // Update user's points after game over
    updateGamePoints(score) {
        if (!this.checkLoginStatus()) return;

        let userPoints = parseInt(sessionStorage.getItem("userPoints")) || 0;
        let pointsEarned = Math.floor(score / 800);  // Convert game score to points (1 point per 800 game points)
        let newTotal = userPoints + pointsEarned;
        sessionStorage.setItem("userPoints", newTotal);
        document.getElementById("currentPoints").textContent = newTotal;
        console.log(`Game Over! Earned ${pointsEarned} points. New total: ${newTotal}`);

        this.updateUserPointsToAPI();
    }

    updateUserPointsToAPI(newTotal) {
        let userId = sessionStorage.getItem("userId");

        if (!userId) {
            console.warn("User ID not found. Cannot update API.");
            return;
        }

        console.log("Updating API. User ID:", userId, "New Points:", newTotal); 

        if (userId && newTotal) {
            fetch(`/api/accounts/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ points: newTotal })
            })
            .then(response => response.json())
            .then(data => console.log("Successfully updated user points in API:", data))
            .catch(error => console.error("Failed to update API:", error));
        }
    }
}

const gameRewards = new GameRewards();

/*DINO GAME CODE*/
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

    // Prevent spacebar from scrolling
    document.addEventListener("keydown", function (e) {
        if (gameStarted && (e.code == "Space" || e.keyCode === 32)) {
            e.preventDefault();
        }
        moveDino(e);
    });

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
        // Ensure the final frame is drawn
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

        // Display "GAME OVER"
        context.fillStyle = "black";
        context.font = "40px courier";
        context.fillText("GAME OVER", boardWidth / 2 - 120, boardHeight / 2 - 20);

        //show final score
        document.getElementById("restartGameBtn").style.display = "block";
        context.fillStyle = "black";
        context.font = "20px courier";
        context.fillText("Final Score: " + score, boardWidth / 2 - 100, 50);

        // Display the Lottie animation to indicate points earned
        const endGameAnimation = document.getElementById("endGameAnimation");
        if (score > 800) {
            endGameAnimation.style.display = "block"; // Show the animation
             // Hide the Lottie animation after 3 seconds
            setTimeout(() => {
                endGameAnimation.style.display = "none"; // Hide the animation after 3 seconds
            }, 3000); // 3000ms = 3 seconds
        }

        // After the game ends, update the user's points
        gameRewards.updateGamePoints(score);
        
        return; // Stop the game loop
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