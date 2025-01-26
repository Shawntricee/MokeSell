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
//class for chaging of hero image
class HeroSlider {
    constructor(images, interval = 5000) {
        this.images = images;
        this.currentIndex = 0;
        this.heroSection = document.querySelector('.hero');
        this.prevButton = document.querySelector('.prev-button');
        this.nextButton = document.querySelector('.next-button');
        this.intervalTime = interval;
        this.autoSlide;

        this.init();
    }

    init() {
        this.updateBackground();
        this.setupEventListeners();
        this.startAutoSlide();
    }

    updateBackground() {
        this.heroSection.style.backgroundImage = `url('${this.images[this.currentIndex]}')`;
        this.updateButtonVisibility();
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateBackground();
        this.restartAutoSlide();
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateBackground();
            this.restartAutoSlide();
        }
    }

    startAutoSlide() {
        this.autoSlide = setInterval(() => this.nextSlide(), this.intervalTime);
    }

    restartAutoSlide() {
        clearInterval(this.autoSlide);
        this.startAutoSlide();
    }

    updateButtonVisibility() {
        this.prevButton.style.display = this.currentIndex > 0 ? 'block' : 'none';
    }

    setupEventListeners() {
        this.nextButton.addEventListener('click', () => this.nextSlide());
        this.prevButton.addEventListener('click', () => this.prevSlide());

        this.heroSection.addEventListener('mouseenter', () => {
            this.prevButton.style.display = this.currentIndex > 0 ? 'block' : 'none';
            this.nextButton.style.display = 'block';
        });

        this.heroSection.addEventListener('mouseleave', () => {
            this.prevButton.style.display = 'none';
            this.nextButton.style.display = 'none';
        });
    }
}

// List of background images
const heroImages = [
    'images/hero/hero-image1.png',
    'images/hero/hero-image2.png',
    'images/hero/hero-image3.png',
];

const countdown = new CountdownTimer(3);
const heroSlider = new HeroSlider(heroImages);