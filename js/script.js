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

class SearchFeature {
    constructor() {
        this.searchBar = document.getElementById("search-bar");
        this.suggestionsList = document.getElementById("suggestions-list");
        this.products = [];

        if (this.searchBar) {
            this.fetchProducts();
            this.searchBar.addEventListener("input", () => this.showSuggestions());
            this.searchBar.addEventListener("keydown", (event) => this.handleEnter(event));
        }
    }

    // Fetch product data
    fetchProducts() {
        // Check if the current page is "index.html" or the root "/"
        const isIndexPage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";

        // Set the correct JSON file path
        const jsonPath = isIndexPage ? "json/products.json" : "../json/products.json";

        fetch(jsonPath)
            .then(response => response.json())
            .then(data => {
                this.products = data;
            })
            .catch(error => console.error("Error fetching products:", error));
    }


    // Show search suggestions
    showSuggestions() {
        const query = this.searchBar.value.toLowerCase().trim();
        this.suggestionsList.innerHTML = "";

        if (query.length === 0) {
            return;
        }

        const matchedProducts = this.products.filter(product =>
            product.title.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.subcategory.toLowerCase().includes(query)
        );

        matchedProducts.slice(0, 5).forEach(product => {
            const suggestionItem = document.createElement("li");
            suggestionItem.textContent = `${product.title} (${product.category} - ${product.subcategory})`;
            suggestionItem.addEventListener("click", () => this.navigateToResults(product));
            this.suggestionsList.appendChild(suggestionItem);
        });
    }

    // Handle Enter key press
    handleEnter(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const query = this.searchBar.value.toLowerCase().trim();
            if (query) {
                window.location.href = `../html/products.html?search=${encodeURIComponent(query)}`;
            }
        }
    }

    // Navigate to product results when clicking a suggestion
    navigateToResults(product) {
        const url = `../html/product-details.html?id=${product._id}`;
        window.location.href = url;
    }
}

// Initialize search functionality
document.addEventListener("DOMContentLoaded", function () {
    // Menu button toggle for nav-categories
    const menuBtn = document.querySelector(".menu-btn");
    const navCategories = document.querySelector(".nav-categories");

    if (menuBtn && navCategories) {
        menuBtn.addEventListener("click", function () {
            navCategories.classList.toggle("show");
        });
    }
    new SearchFeature();
});

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