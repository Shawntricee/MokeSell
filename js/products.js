
class ProductPage {
    constructor() {
        this.productGrid = document.getElementById("productGrid") || null;
        this.loadMoreBtn = document.getElementById("loadMoreBtn") || null;
        this.filters = document.querySelectorAll(".filter-input") || [];
        this.pageTitle = document.getElementById("pageTitle") || null; 
        this.products = [];
        this.displayedProducts = 0;
        this.productsPerPage = 9;

        // Bind methods
        this.applyFilters = this.applyFilters.bind(this);
        this.createProductCard = this.createProductCard.bind(this);
        this.updateHeader = this.updateHeader.bind(this);

        // Fetch products on page load
        if (this.productGrid) {
            this.fetchProducts();
        }
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
        if(!this.productGrid) return;   

        const priceFilter = document.getElementById("filterPrice")?.value || "";
        const conditionFilter = document.getElementById("filterCondition")?.value || "all";

        const params = new URLSearchParams(window.location.search);
        const selectedCategory = params.get("category");
        const selectedSubcategory = params.get("subcategory");

        let filteredProducts = this.products.filter(product => {
            return (
                (!selectedCategory || product.category === selectedCategory) &&
                (!selectedSubcategory || product.subcategory === selectedSubcategory) &&
                (conditionFilter === "all" || product.condition === conditionFilter)
            );
        });

        console.log("Filtered Products:", filteredProducts); // Debugging output

        if (priceFilter === "low-to-high") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (priceFilter === "high-to-low") {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        this.displayProducts(filteredProducts);
    }

    // Display products on the page
    displayProducts(productList) {
        if (!this.productGrid) return;

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
        if(!this.productGrid) return;

        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        const images = product.image_url;
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${images[0]}" class="main-image" alt="${product.title}">
                <img src="${images[1]}" class="secondary-image" alt="${product.title}">
            </div>
            <div class="product-card-details">
                <h3>${product.title}</h3>
                <p>$${product.price.toFixed(2)}</p>
            </div>
        `;

        productCard.addEventListener("click", () => {
            const category = encodeURIComponent(product.category || "Uncategorized");
            const subcategory = encodeURIComponent(product.subcategory || "All");
            const title = encodeURIComponent(product.title || "Product");
            const url = `product-details.html?id=${product._id}&category=${category}&subcategory=${subcategory}&title=${title}`;
            console.log("Navigating to:", url);
            window.location.href = url;
        });

        this.productGrid.appendChild(productCard);
    }

    // Update the header based on selected category
    updateHeader() {
        if (!this.pageTitle) return;

        const params = new URLSearchParams(window.location.search);
        const selectedCategory = params.get("category");
        const selectedSubcategory = params.get("subcategory");

        console.log("Category from Navbar:", selectedCategory); // Debugging output
        console.log("Subcategory from Navbar:", selectedSubcategory); // Debugging output

        if (selectedSubcategory) {
            this.pageTitle.innerText = decodeURIComponent(selectedSubcategory); 
        } else if (selectedCategory) {
            this.pageTitle.innerText = decodeURIComponent(selectedCategory);
        }
    
        const filterCategory = document.getElementById("filterCategory");
        if (filterCategory) {
            filterCategory.value = selectedCategory || "";
        }
    
        this.applyFilters();
    }

    // Initialize event listeners
    init() {
        this.filters.forEach(filter => {
            filter.addEventListener("change", this.applyFilters);
        });

        document.querySelectorAll("#filterPrice, #filterCategory, #filterCondition").forEach(filter => {
            filter.addEventListener("change", this.applyFilters);
        });

        if (this.loadMoreBtn) {
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
}

// Initialize the product page
document.addEventListener("DOMContentLoaded", () => {
    const productPage = new ProductPage();
    productPage.init();

    // Ensure navbar links reload the page with correct parameters
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = event.target.href;
        });
    });
});
