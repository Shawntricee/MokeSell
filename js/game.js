class GameRewards {
    constructor() {
        this.steps = ["STEP 1: EARN POINTS", "STEP 2: REDEEM REWARDS", "STEP 3: ENJOY!"];
        this.currentStepIndex = 0;
        this.init();
    }

    init() {
        document.getElementById("next-step").addEventListener("click", () => this.nextStep());
        document.getElementById("start-playing").addEventListener("click", () => this.scrollToGame());
        /*this.fetchVouchers();
        this.fetchLeaderboard();*/
    }

    nextStep() {
        this.currentStepIndex = (this.currentStepIndex + 1) % this.steps.length;
        document.getElementById("step-text").textContent = this.steps[this.currentStepIndex];
    }

    scrollToGame() {
        document.getElementById("game-section").scrollIntoView({ behavior: "smooth" });
    }

    /*fetchVouchers() {
        let userId = localStorage.getItem("userId");
        fetch(`/api/vouchers?user=${userId}`)
            .then(response => response.json())
            .then(vouchers => {
                let vouchersDiv = document.getElementById("vouchers");
                vouchersDiv.innerHTML = "";
                vouchers.forEach(voucher => {
                    let voucherElem = document.createElement("div");
                    voucherElem.innerHTML = `
                        <p>${voucher.description}</p>
                        <p>${voucher.points} Points</p>
                        <button onclick="gameRewards.claimVoucher('${voucher.id}')">Claim</button>
                    `;
                    vouchersDiv.appendChild(voucherElem);
                });
            });
    }

    claimVoucher(voucherId) {
        let userId = localStorage.getItem("userId");
        fetch("/api/claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userId, voucherId: voucherId })
        })
        .then(response => response.json())
        .then(() => this.fetchVouchers());
    }

    fetchLeaderboard() {
        fetch("/api/leaderboard")
            .then(response => response.json())
            .then(leaderboard => {
                let leaderboardBody = document.getElementById("leaderboard");
                leaderboardBody.innerHTML = "";
                leaderboard.sort((a, b) => b.points - a.points).forEach((user, index) => {
                    let row = document.createElement("tr");
                    row.innerHTML = `<td>${index + 1}</td><td>${user.username}</td><td>${user.points}</td>`;
                    leaderboardBody.appendChild(row);
                });
            });
    }*/
}

const gameRewards = new GameRewards();


//board
let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

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
let gameStarted = false; // Game starts only when the button is clicked
let gameLoop;
let cactusInterval;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load images
    dinoImg = new Image();
    dinoImg.src = "../images/game/dino.png";

    cactusImages.push(new Image());
    cactusImages[0].src = "../images/game/sofa1.png";
    
    cactusImages.push(new Image());
    cactusImages[1].src = "../images/game/sofa2.png";
    
    cactusImages.push(new Image());
    cactusImages[2].src = "../images/game/table1.png";

    // Prevent the spacebar from scrolling the page
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

    document.getElementById("restartGameBtn").style.display = "none";

    gameLoop = requestAnimationFrame(update);
    cactusInterval = setInterval(placeCactus, 1000);
}

function update() {
    if (gameOver) {
        document.getElementById("restartGameBtn").style.display = "block";
        context.fillStyle = "black";
        context.font = "20px courier";
        context.fillText("Final Score: " + score, boardWidth / 2 - 50, 50);
        return;
    }

    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // Dino physics
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY);
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    // Cactus movement
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            dinoImg.src = "../images/game/dino-dead.png";
            clearInterval(cactusInterval);
            return;
        }
    }

    // Score
    context.fillStyle = "black";
    context.font = "20px courier";
    context.fillText("Score: " + score, 5, 20);
    score++;
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
