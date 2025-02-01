document.addEventListener("DOMContentLoaded", function () {
    const productGrid = document.getElementById("productGrid");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const filters = document.querySelectorAll(".filter-input");
    const pageTitle = document.getElementById("pageTitle");
    let products = [];
    let displayedProducts = 0;
    const productsPerPage = 9;

    function fetchProducts() {
        fetch(/*"https://api.example.com/products"*/"../json/products.json") // Replace with actual API endpoint
            .then(response => response.json())
            .then(data => {
                products = data;
                updateHeader();
                applyFilters();
            })
            .catch(error => console.error("Error fetching products:", error));
    }

    function applyFilters() {
        const priceFilter = document.getElementById("filterPrice")?.value || "";
        const conditionFilter = document.getElementById("filterCondition")?.value || "all";
    
        const params = new URLSearchParams(window.location.search);
        const selectedCategory = params.get("category"); // Get category from URL if available
        
        let filteredProducts = products.filter(product => {
            return (
                (selectedCategory === null || product.category === selectedCategory) &&
                (conditionFilter === "all" || product.condition === conditionFilter)
            );
        });
        // Sort products based on price filter
        if (priceFilter === "low-to-high") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (priceFilter === "high-to-low") {
            filteredProducts.sort((a, b) => b.price - a.price);
        }
    
        displayProducts(filteredProducts);
    }
    

    function displayProducts(productList) {
        productGrid.innerHTML = "";
        displayedProducts = 0;

        productList.slice(0, productsPerPage).forEach(product => {
            createProductCard(product);
            displayedProducts++;
        });

        loadMoreBtn.style.display = displayedProducts < productList.length ? "block" : "none";
    }

    function createProductCard(product) {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        const images = product.imageFilenames.split(",");
        productCard.innerHTML = `
            <div class="product-image">
                <img src="../images/products/${images[0]}" class="main-image" alt="${product.title}">
                <img src="../images/products/${images[1]}" class="secondary-image" alt="${product.title}">
            </div>
            <h3>${product.title}</h3>
            <p>$${product.price.toFixed(2)}</p>
        `;

        productCard.addEventListener("click", () => {
            const category = encodeURIComponent(product.category || "Uncategorised");
            const title = encodeURIComponent(product.title || "Product");
            const url = `product-details.html?id=${product._id}&category=${category}&title=${title}`;
            console.log("Navigating to:", url);  // Debugging output
            window.location.href = url;

        });

        productGrid.appendChild(productCard);
    }

    filters.forEach(filter => {
        filter.addEventListener("change", applyFilters);
    });

    document.querySelectorAll("#filterPrice, #filterCategory, #filterCondition").forEach(filter => {
        filter.addEventListener("change", applyFilters);
    });

    loadMoreBtn.addEventListener("click", function () {
        let currentProducts = productGrid.childNodes.length;
        let additionalProducts = products.slice(currentProducts, currentProducts + productsPerPage);

        additionalProducts.forEach(product => {
            createProductCard(product);
            displayedProducts++;
        });

        loadMoreBtn.style.display = displayedProducts < products.length ? "block" : "none";
    });

    function updateHeader() {
        const params = new URLSearchParams(window.location.search);
        const selectedCategory = params.get("category");
    
        if (selectedCategory && pageTitle) {
            pageTitle.innerText = decodeURIComponent(selectedCategory);
    
            const filterCategory = document.getElementById("filterCategory");
            if (filterCategory) {
                filterCategory.value = selectedCategory;
                applyFilters();  // Apply filters after setting the category
            }
        }
    }
      
    fetchProducts();
});

