
class ProductPage {
    constructor() {
        this.productGrid = document.getElementById("productGrid");
        this.loadMoreBtn = document.getElementById("loadMoreBtn");
        this.filters = document.querySelectorAll(".filter-input");
        this.pageTitle = document.getElementById("pageTitle");
        this.products = [];
        this.displayedProducts = 0;
        this.productsPerPage = 9;

        // Bind methods
        this.applyFilters = this.applyFilters.bind(this);
        this.createProductCard = this.createProductCard.bind(this);
        this.updateHeader = this.updateHeader.bind(this);

        // Fetch products on page load
        this.fetchProducts();
    }

    // Fetch products from the JSON file
    fetchProducts() {
        fetch("../json/products.json") // Replace with actual API endpoint
            .then(response => response.json())
            .then(data => {
                this.products = data;
                this.updateHeader();
                this.applyFilters();
            })
            .catch(error => console.error("Error fetching products:", error));
    }

    // Apply filters based on the selected criteria
    applyFilters() {
        const priceFilter = document.getElementById("filterPrice")?.value || "";
        const conditionFilter = document.getElementById("filterCondition")?.value || "all";

        const params = new URLSearchParams(window.location.search);
        const selectedCategory = params.get("category");

        let filteredProducts = this.products.filter(product => {
            return (
                (selectedCategory === null || product.category === selectedCategory) &&
                (conditionFilter === "all" || product.condition === conditionFilter)
            );
        });

        if (priceFilter === "low-to-high") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (priceFilter === "high-to-low") {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        this.displayProducts(filteredProducts);
    }

    // Display products on the page
    displayProducts(productList) {
        this.productGrid.innerHTML = "";
        this.displayedProducts = 0;

        productList.slice(0, this.productsPerPage).forEach(product => {
            this.createProductCard(product);
            this.displayedProducts++;
        });

        this.loadMoreBtn.style.display = this.displayedProducts < productList.length ? "block" : "none";
    }

    // Create a product card and append it to the grid
    createProductCard(product) {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        const images = product.image_url;
        productCard.innerHTML = `
            <div class="product-image">
                <img src="../images/products/${images[0]}" class="main-image" alt="${product.title}">
                <img src="../images/products/${images[1]}" class="secondary-image" alt="${product.title}">
            </div>
            <div class="product-card-details">
                <h3>${product.title}</h3>
                <p>$${product.price.toFixed(2)}</p>
            </div>
        `;

        productCard.addEventListener("click", () => {
            const category = encodeURIComponent(product.category || "Uncategorised");
            const title = encodeURIComponent(product.title || "Product");
            const url = `product-details.html?id=${product._id}&category=${category}&title=${title}`;
            console.log("Navigating to:", url);
            window.location.href = url;
        });

        this.productGrid.appendChild(productCard);
    }

    // Update the header based on selected category
    updateHeader() {
        const params = new URLSearchParams(window.location.search);
        const selectedCategory = params.get("category");

        if (selectedCategory && this.pageTitle) {
            this.pageTitle.innerText = decodeURIComponent(selectedCategory);

            const filterCategory = document.getElementById("filterCategory");
            if (filterCategory) {
                filterCategory.value = selectedCategory;
                this.applyFilters();  // Apply filters after setting the category
            }
        }
    }

    // Initialize event listeners
    init() {
        this.filters.forEach(filter => {
            filter.addEventListener("change", this.applyFilters);
        });

        document.querySelectorAll("#filterPrice, #filterCategory, #filterCondition").forEach(filter => {
            filter.addEventListener("change", this.applyFilters);
        });

        this.loadMoreBtn.addEventListener("click", () => {
            let currentProducts = this.productGrid.childNodes.length;
            let additionalProducts = this.products.slice(currentProducts, currentProducts + this.productsPerPage);

            additionalProducts.forEach(product => {
                this.createProductCard(product);
                this.displayedProducts++;
            });

            this.loadMoreBtn.style.display = this.displayedProducts < this.products.length ? "block" : "none";
        });
    }
}

// Initialize the product page
document.addEventListener("DOMContentLoaded", () => {
    const productPage = new ProductPage();
    productPage.init();
});
