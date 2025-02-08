class ProductPage {
    constructor() {
        this.apiKey = /*"67a4f3a7fd5d586e56efe120"*/"67a5a5b09c979727011b2a7b";
        // select the elements
        this.productGrid = document.getElementById("productGrid") || null;
        this.loadMoreBtn = document.getElementById("loadMoreBtn") || null;
        this.filters = document.querySelectorAll(".filter-input") || [];
        this.pageTitle = document.getElementById("pageTitle") || null; 
        // initialize the products array
        this.products = [];
        this.displayedProducts = 0;
        this.productsPerPage = 9;
        // bind the methods
        this.applyFilters = this.applyFilters.bind(this);
        this.createProductCard = this.createProductCard.bind(this);
        this.updateHeader = this.updateHeader.bind(this);
        // fetch products on page load
        if (this.productGrid) {
            this.fetchProducts();
        }
    }
    // fetch products from the API
    fetchProducts() {
        fetch(/*"https://mokesell-7cde.restdb.io/rest/products"*/"https://mokesell-39a1.restdb.io/rest/products", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        })
        .then(response => response.json())
        .then(data => {
            this.products = data;
            this.updateHeader();
            this.applyFilters();
        })
        .catch(error => console.error("Error fetching products:", error));
    }        

    // apply filters based on the selected criteria
    applyFilters() {
        // check if the product grid exists
        if(!this.productGrid) return;   
        // get the selected filters
        const priceFilter = document.getElementById("filterPrice")?.value || "";
        const conditionFilter = document.getElementById("filterCondition")?.value || "all";
        // get the selected category and subcategory
        const params = new URLSearchParams(window.location.search);
        const selectedCategory = params.get("category");
        const selectedSubcategory = params.get("subcategory");
        // filter the products based on the selected criteria
        let filteredProducts = this.products.filter(product => {
            return (
                (!selectedCategory || product.category === selectedCategory) &&
                (!selectedSubcategory || product.subcategory === selectedSubcategory) &&
                (conditionFilter === "all" || product.condition === conditionFilter)
            );
        });
        console.log("Filtered Products:", filteredProducts); // Debugging output
        // sort the products based on the selected price filter
        if (priceFilter === "low-to-high") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (priceFilter === "high-to-low") {
            filteredProducts.sort((a, b) => b.price - a.price);
        }
        // display the filtered products
        this.displayProducts(filteredProducts);
    }
    // sisplay products on the page
    displayProducts(productList) {
        if (!this.productGrid) return;

        this.productGrid.innerHTML = "";
        this.displayedProducts = 0;
        // display the first set of products
        productList.slice(0, this.productsPerPage).forEach(product => {
            this.createProductCard(product);
            this.displayedProducts++;
        });
        // display the load more button if there are more products
        this.loadMoreBtn.style.display = this.displayedProducts < productList.length ? "block" : "none";
    }

    // create a product card and append it to the grid
    createProductCard(product) {
        if(!this.productGrid) return;
        // create the product card
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        // get the product images (stored as an array)
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
        // add event listener to navigate to the product details page
        productCard.addEventListener("click", () => {
            // encode the category, subcategory, and title for the URL
            const category = encodeURIComponent(product.category || "Uncategorized");
            const subcategory = encodeURIComponent(product.subcategory || "All");
            const title = encodeURIComponent(product.title || "Product");
            const url = `product-details.html?id=${product._id}&category=${category}&subcategory=${subcategory}&title=${title}`;
            console.log("Navigating to:", url);
            window.location.href = url;
        });
        // append the product card to the grid
        this.productGrid.appendChild(productCard);
    }
    // update the header based on selected category
    updateHeader() {
        if (!this.pageTitle) return;
        // get the selected category and subcategory
        const params = new URLSearchParams(window.location.search);
        const selectedCategory = params.get("category");
        const selectedSubcategory = params.get("subcategory");

        console.log("Category from Navbar:", selectedCategory);
        console.log("Subcategory from Navbar:", selectedSubcategory);
        // update the page title based on the selected category
        if (selectedSubcategory) {
            this.pageTitle.innerText = decodeURIComponent(selectedSubcategory); 
        } else if (selectedCategory) {
            this.pageTitle.innerText = decodeURIComponent(selectedCategory);
        }
        // update the category filter based on the selected category
        const filterCategory = document.getElementById("filterCategory");
        if (filterCategory) {
            filterCategory.value = selectedCategory || "";
        }
        // update the subcategory filter based on the selected subcategory
        this.applyFilters();
    }

    // initialize event listeners
    init() {
        // initialize the event listeners for the filters
        this.filters.forEach(filter => {
            filter.addEventListener("change", this.applyFilters);
        });
        document.querySelectorAll("#filterPrice, #filterCategory, #filterCondition").forEach(filter => {
            filter.addEventListener("change", this.applyFilters);
        });
        // initialize the event listener for the load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener("click", () => {
                let currentProducts = this.productGrid.childNodes.length;
                let additionalProducts = this.products.slice(currentProducts, currentProducts + this.productsPerPage);
                // display the additional products
                additionalProducts.forEach(product => {
                    this.createProductCard(product);
                    this.displayedProducts++;
                });
                // hide the load more button if all products have been displayed
                this.loadMoreBtn.style.display = this.displayedProducts < this.products.length ? "block" : "none";
            });
        } 
    }
}

// initialize the product page
document.addEventListener("DOMContentLoaded", () => {
    // create a new instance of the ProductPage class
    const productPage = new ProductPage();
    productPage.init();
    // ensure navbar links reload the page with correct parameters
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = event.target.href;
        });
    });
});
