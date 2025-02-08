// class for limited offers section countdown timer
class CountdownTimer {
    constructor(days) {
        // check if the countdown elements exist on the page
        this.daysElement = document.getElementById("days");
        this.hoursElement = document.getElementById("hours");
        this.minutesElement = document.getElementById("minutes");
        this.secondsElement = document.getElementById("seconds");

        if (this.daysElement && this.hoursElement && this.minutesElement && this.secondsElement) {
            // set the target date to the current date + the number of days
            this.targetDate = new Date();
            this.targetDate.setDate(this.targetDate.getDate() + days);
            // start the countdown
            this.startCountdown();
        }
    }
    // start the countdown and update the elements every second
    startCountdown() {
        // update the countdown every second
        this.interval = setInterval(() => this.updateCountdown(), 1000);
        this.updateCountdown();
    }
    // update the countdown elements
    updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = this.targetDate.getTime() - now;
        // if the countdown is over, clear the interval
        if (timeLeft <= 0) {
            clearInterval(this.interval);
            return;
        }
        // calculate the days, hours, minutes, and seconds
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        // update the countdown elements
        this.daysElement.innerText = days.toString().padStart(2, "0");
        this.hoursElement.innerText = hours.toString().padStart(2, "0");
        this.minutesElement.innerText = minutes.toString().padStart(2, "0");
        this.secondsElement.innerText = seconds.toString().padStart(2, "0");
    }
}

// class for changing hero image
class HeroSlider {
    constructor(images, interval = 5000) {
        // check if the hero section and buttons exist
        this.heroSection = document.querySelector('.hero');
        this.prevButton = document.querySelector('.prev-button');
        this.nextButton = document.querySelector('.next-button');

        if (this.heroSection && this.prevButton && this.nextButton) {
            // set the images, current index, interval time, and auto slide interval
            this.images = images;
            this.currentIndex = 0;
            this.intervalTime = interval;
            this.autoSlide;
            this.init();
        }
    }
    // initialize the hero slider
    init() {
        this.updateBackground();
        this.setupEventListeners();
        this.startAutoSlide();
    }
    // update the background image of the hero section
    updateBackground() {
        this.heroSection.style.backgroundImage = `url('${this.images[this.currentIndex]}')`;
        this.updateButtonVisibility();
    }
    // show the next slide
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateBackground();
        this.restartAutoSlide();
    }
    // show the previous slide
    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateBackground();
            this.restartAutoSlide();
        }
    }
    // start the auto slide
    startAutoSlide() {
        this.autoSlide = setInterval(() => this.nextSlide(), this.intervalTime);
    }
    // restart the auto slide
    restartAutoSlide() {
        clearInterval(this.autoSlide);
        this.startAutoSlide();
    }
    // update the visibility of the prev button
    updateButtonVisibility() {
        this.prevButton.style.display = this.currentIndex > 0 ? 'block' : 'none';
    }
    // setup the event listeners for the buttons
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

// class for breadcrumb navigation
class BreadcrumbNavigation {
    constructor() {
        this.breadcrumbContainer = document.getElementById("breadcrumbNavigation");
        if (this.breadcrumbContainer) {
            this.generateBreadcrumb();
        }
    }
    // get the query parameters from the URL
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            category: params.get("category"),
            title: params.get("title"),
        };
    }
    // generate the breadcrumb based on the query parameters
    generateBreadcrumb() {
        let breadcrumbHTML = `<a href="/">Home</a>`;
        const { category, title } = this.getQueryParams();
        // add the category and title to the breadcrumb
        if (category && title) {
            breadcrumbHTML += ` <span> > </span> <a href="products.html?category=${category}">${decodeURIComponent(category)}</a>`;
            breadcrumbHTML += ` <span> > </span> <span>${decodeURIComponent(title)}</span>`;
        }
        // add the category to the breadcrumb
        this.breadcrumbContainer.innerHTML = breadcrumbHTML;
    }
}

// class for search feature
class SearchFeature {
    constructor() {
        this.searchBar = document.getElementById("search-bar");
        this.suggestionsList = document.getElementById("suggestions-list");
        this.products = [];

        if (this.searchBar) {
            // fetch products data
            this.fetchProducts();
            // setup event listeners
            this.searchBar.addEventListener("input", () => this.showSuggestions());
            this.searchBar.addEventListener("keydown", (event) => this.handleEnter(event));
        }
    }

    // fetch product data from the API
    fetchProducts() {
        fetch("https://mokesell-7cde.restdb.io/rest/products"/*"https://mokesell-39a1.restdb.io/rest/products"*/, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": "67a4f3a7fd5d586e56efe120"/*"67a5a5b09c979727011b2a7b"*/,
                "Cache-Control": "no-cache"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            this.products = data;
        })
        .catch(error => console.error("Error fetching products:", error));
    }

    // show search suggestions
    showSuggestions() {
        const query = this.searchBar.value.toLowerCase().trim();
        this.suggestionsList.innerHTML = "";
        // if the search query is empty, do not display suggestions
        if (query.length === 0) {
            return;
        }
        // filter the products based on the search query
        const matchedProducts = this.products.filter(product =>
            product.title.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.subcategory.toLowerCase().includes(query)
        );
        // display the suggestions
        matchedProducts.slice(0, 5).forEach(product => {
            const suggestionItem = document.createElement("li");
            suggestionItem.textContent = `${product.title} (${product.category} - ${product.subcategory})`;
            // navigate to the product details page when a suggestion is clicked
            suggestionItem.addEventListener("click", () => this.navigateToResults(product));
            // add the suggestion item to the list
            this.suggestionsList.appendChild(suggestionItem);
        });
    }
    // handle enter key press
    handleEnter(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const query = this.searchBar.value.toLowerCase().trim();
            if (query) {
                window.location.href = `../html/products.html?search=${encodeURIComponent(query)}`;
            }
        }
    }
    // navigate to product results when clicking a suggestion
    navigateToResults(product) {
        const url = `../html/product-details.html?id=${product._id}`;
        window.location.href = url;
    }
}

// initialize components when the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
    // check if the menu button and navigation categories exist
    const menuBtn = document.querySelector(".menu-btn");
    const navCategories = document.querySelector(".nav-categories");
    // check if the steps exist
    const steps = document.querySelectorAll(".how-it-works .step");
    // Intersection Observer options
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.2
    };
    // animate steps with staggered delay
    if (steps.length > 0) {
        steps.forEach((step) => {
            step.style.opacity = "0";
            step.style.transform = "translateY(50px)";
        });
        // create an Intersection Observer to animate the steps
        const stepsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                // if the step is intersecting, animate it
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        // animate the step with a delay
                        entry.target.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, 300 * index);
                    // unobserve the step after animating
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        // observe each step
        steps.forEach(step => stepsObserver.observe(step));
    }
    // toggle navigation categories on menu button click
    if (menuBtn && navCategories) {
        menuBtn.addEventListener("click", function () {
            navCategories.classList.toggle("show");
        });
    }
    // initialize the search feature
    new SearchFeature();

    //intialise cart manager
    const cartManager = new CartManager();
    cartManager.updateCartBadge();
});

// initialize Breadcrumb
new BreadcrumbNavigation("breadcrumbNavigation");

// list of background images
const heroImages = [
    'images/hero/hero-image1.png',
    'images/hero/hero-image2.png',
    'images/hero/hero-image3.png',
];

// check if countdown, hero slider, and breadcrumb are needed and initialize them accordingly
if (document.getElementById("days")) new CountdownTimer(3);
if (document.querySelector('.hero')) new HeroSlider(heroImages);
if (document.getElementById("breadcrumbNavigation")) new BreadcrumbNavigation();