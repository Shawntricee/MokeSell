//class for limited offers section countdown timer
class CountdownTimer {
    constructor(days) {
        // Check if the countdown elements exist on the page
        this.daysElement = document.getElementById("days");
        this.hoursElement = document.getElementById("hours");
        this.minutesElement = document.getElementById("minutes");
        this.secondsElement = document.getElementById("seconds");

        if (this.daysElement && this.hoursElement && this.minutesElement && this.secondsElement) {
            this.targetDate = new Date();
            this.targetDate.setDate(this.targetDate.getDate() + days);
            this.startCountdown();
        }
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

        this.daysElement.innerText = days.toString().padStart(2, "0");
        this.hoursElement.innerText = hours.toString().padStart(2, "0");
        this.minutesElement.innerText = minutes.toString().padStart(2, "0");
        this.secondsElement.innerText = seconds.toString().padStart(2, "0");
    }
}

//class for changing hero image
class HeroSlider {
    constructor(images, interval = 5000) {
        // Check if the hero section and buttons exist
        this.heroSection = document.querySelector('.hero');
        this.prevButton = document.querySelector('.prev-button');
        this.nextButton = document.querySelector('.next-button');

        if (this.heroSection && this.prevButton && this.nextButton) {
            this.images = images;
            this.currentIndex = 0;
            this.intervalTime = interval;
            this.autoSlide;
            this.init();
        }
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

class BreadcrumbNavigation {
    constructor() {
        this.breadcrumbContainer = document.getElementById("breadcrumbNavigation");
        if (this.breadcrumbContainer) {
            this.generateBreadcrumb();
        }
    }

    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            category: params.get("category"),
            title: params.get("title"),
        };
    }

    generateBreadcrumb() {
        let breadcrumbHTML = `<a href="/">Home</a>`;
        const { category, title } = this.getQueryParams();

        if (category && title) {
            breadcrumbHTML += ` <span> > </span> <a href="products.html?category=${category}">${decodeURIComponent(category)}</a>`;
            breadcrumbHTML += ` <span> > </span> <span>${decodeURIComponent(title)}</span>`;
        }

        this.breadcrumbContainer.innerHTML = breadcrumbHTML;
    }
}

// Initialize Breadcrumb
new BreadcrumbNavigation("breadcrumbNavigation");



// List of background images
const heroImages = [
    'images/hero/hero-image1.png',
    'images/hero/hero-image2.png',
    'images/hero/hero-image3.png',
];

// Check if countdown, hero slider, and breadcrumb are needed and initialize them accordingly
// Initialize components if elements exist
if (document.getElementById("days")) new CountdownTimer(3);
if (document.querySelector('.hero')) new HeroSlider(heroImages);
if (document.getElementById("breadcrumbNavigation")) new BreadcrumbNavigation();