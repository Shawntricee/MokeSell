//class for limited offers section countdown timer
class CountdownTimer {
    constructor(days){
        this.targetDate = new Date();
        this.targetDate.setDate(this.targetDate.getDate() + days);
        this.startCountdown();
    }

    startCountdown() {
        this.interval = setInterval(() => this.updateCountdown(), 1000);
        this.updateCountdown();
    }

    updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = this.targetDate.getTime() - now;

        if (timeLeft <= 0) {
            clearInterval(this.interval);
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = days.toString().padStart(2, "0");
        document.getElementById("hours").innerText = hours.toString().padStart(2, "0");
        document.getElementById("minutes").innerText = minutes.toString().padStart(2, "0");
        document.getElementById("seconds").innerText = seconds.toString().padStart(2, "0");
    }
}

const countdown = new CountdownTimer(3);