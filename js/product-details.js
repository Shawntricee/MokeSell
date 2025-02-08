class ReviewManager {
    // initialize the ReviewManager with the product ID and the current user's username
    constructor(productId, currentUsername) {
        this.productId = productId;
        this.currentUsername = currentUsername;
        this.sellerUsername = "";
        this.apiUrl = /*"https://mokesell-7cde.restdb.io/rest/reviews"*/"https://mokesell-39a1.restdb.io/rest/reviews";
        this.apiKey = /*"67a4f3a7fd5d586e56efe120"*/"67a5a5b09c979727011b2a7b";
        this.reviewsFetched = false;
    }
    // initialize the ReviewManager
    init() {
        // fetch the reviews for the product
        if (this.reviewsFetched) {
            console.log("Reviews already fetched");
            return; // prevent fetching if reviews are already fetched
        }
        console.log("ReviewManager initialized");
        // set up the review form
        this.setupReviewForm();
        this.fetchReviews();
    }
    // set the seller's username
    setSellerUsername(sellerUsername) {
        this.sellerUsername = sellerUsername || "Unknown";
        console.log("Setting seller username:", this.sellerUsername);
        // update the review header with the seller's username
        this.updateReviewHeader();
    }
    // function to update the review header with the seller's username
    updateReviewHeader() {
        const reviewSeller = document.getElementById("sellerReviewUsername");
        if (reviewSeller) {
            // set the seller's username in the review header
            reviewSeller.textContent = this.sellerUsername;
        }
    }
    // function to set up the review form
    setupReviewForm() {
        const reviewForm = document.getElementById("reviewForm");
        const postReviewButton = document.getElementById("postReviewButton");
        // add event listener to the review form
        if (reviewForm && postReviewButton) {
            console.log("Review form and button found!");
            reviewForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const reviewInput = document.getElementById("reviewInput");
                if (reviewInput && reviewInput.value.trim() !== "") {
                    this.postReview(reviewInput.value.trim());
                } else {
                    alert("Please enter a review!");
                }
            });
        } else {
            console.warn("Review form or button not found!");
        }
    }
    // function to post a review
    postReview(reviewText) {
        // get the current username from session storage
        const currentUsername = sessionStorage.getItem("currentUsername");
        // check if the user is logged in
        if (!currentUsername) {
            alert("You must be logged in to post a review!");
            return;
        }
        // create a new review object
        const newReview = {
            productId: this.productId,
            username: currentUsername,
            review: reviewText,
            datePosted: new Date().toISOString(),
        };
        console.log("Posting Review:", newReview);
    
        fetch(this.apiUrl, { 
            method: "POST", 
            headers: { 
                "Content-Type": "application/json", 
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }, 
            body: JSON.stringify(newReview) 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to post review. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(createdReview => {
            console.log("Review posted successfully:", createdReview);
            this.addReviewToUI(createdReview);
            document.getElementById("reviewInput").value = "";
        })
        .catch(error => {
            console.error("Error posting review:", error);
            alert("Failed to post review. Please try again.");
        });
    }
    // function to add a review to the UI
    addReviewToUI(review) {
        const reviewsList = document.getElementById("reviewsList");
        if (reviewsList) {
            // create a new review element
            reviewsList.appendChild(this.renderReview(review));
        }
    }
    // function to render a review element
    renderReview(review) {
        const reviewDiv = document.createElement("div");
        reviewDiv.classList.add("review-item");
        reviewDiv.innerHTML = `
            <div class="review">
                <div class="profile-picture">
                    <img src="../images/icons/review-profile-icon.png" alt="user profile icon">
                </div>
                <div class="review-details">
                    <p><span class="review-username">@${review.username}</span></p>
                    <p><span class="review-date">Posted on ${new Date(review.datePosted).toLocaleDateString()}</span></p>
                    <p class="review-content">${review.review}</p>
                </div>
            </div>
        `;
        return reviewDiv;
    }
    // function to fetch reviews for the product
    fetchReviews() {
        if (this.reviewsFetched) {
            console.log("Reviews already fetched.");
            return;
        }
        console.log("Fetching reviews...");

        // fetch reviews from the API
        fetch(`${this.apiUrl}?productId=${this.productId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        })
            .then(response => response.json())
            .then(reviews => {
                reviews.forEach(review => {
                    this.addReviewToUI(review);
                });
                this.reviewsFetched = true;
            })
            .catch((error) => console.error("Error fetching reviews:", error));
    }
}

class Product {
    // initialize the Product with the product ID and the current user's username
    constructor(productId, currentUsername = null) {
        this.productId = productId;
        this.currentUsername = currentUsername;
        this.apiUrl = "https://mokesell-7cde.restdb.io/rest/products"/*"https://mokesell-39a1.restdb.io/rest/products"*/;
        this.apiKey = "67a4f3a7fd5d586e56efe120"/*"67a5a5b09c979727011b2a7b"*/;
        // initialize the review manager
        this.reviewManager = new ReviewManager(productId, this.currentUsername);
        this.init();
    }
    // initialize the product details page
    init() {
        this.fetchProductData();
        this.reviewManager.init();
        this.fetchSimilarProducts();
    }
    // function to fetch product data
    fetchProductData() {
        console.log("Fetching product data...");
        fetch(`${this.apiUrl}?productId=${this.productId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        })
            .then(response => {
                console.log("Response Status:", response.status); // Check the status
                return response.json();
            })
            .then(productsArray => {
                const product = productsArray.find(p => p._id === this.productId);
                if (!product) {
                    console.error(`Product with ID ${this.productId} not found.`);
                    return;
                }
                console.log("Fetched product data:", product);
                // update the product details
                this.updateProductDetails(product);
                this.updateProductImages(product.image_url);
                // update the breadcrumb navigation
                const breadcrumb = new BreadcrumbNavigation("#breadcrumbNavigation");
                breadcrumb.generateBreadcrumb(product.category, product.subcategory, product.title);

                // set seller details and handle the reviews
                const seller = product.seller_id[0] || {};
                this.updateSellerDetails(seller);
                this.reviewManager.setSellerUsername(seller.username || "Unknown");
                this.fetchSimilarProducts(product.category);
            })
            .catch((error) => console.error("Error fetching product data:", error));
    }
    
    // function to update the product details on the page
    updateProductDetails(product) {
        document.getElementById("productTitle").textContent = product.title || "No title available";
        document.getElementById("productPrice").textContent = product.price ? `S$${product.price.toFixed(2)}` : "S$0.00";
        document.getElementById("productCategory").textContent = product.category || "Category not available";
        document.getElementById("productCondition").textContent = product.condition || "Condition not available";

        const listedDate = new Date(product.listed);
        document.getElementById("productListed").textContent = !isNaN(listedDate) ? listedDate.toDateString() : "Listed: Date not available";
        document.getElementById("productDimensions").textContent = product.dimensions || "Dimensions not available";
        document.getElementById("productColour").textContent = product.colour || "Colour not available";
        document.getElementById("productMaterial").textContent = product.material || "Material not available";
        document.getElementById("productDescription").textContent = product.description || "No description available";
        document.getElementById("productPoints").textContent = product.points || "No points available";
    }
    // function to update the seller details on the page
    updateSellerDetails(seller) {
        document.getElementById("sellerUsername").textContent = `@${seller.username || "Unknown"}`;
        document.getElementById("sellerJoined").textContent = seller.dateJoined ? new Date(seller.dateJoined).toLocaleDateString() : "Joined: N/A";
    }
    // function to update the product images on the page
    updateProductImages(image_url) {
        const mainImageElem = document.getElementById("mainImage");
        const secondaryImagesContainer = document.getElementById("secondaryImages");
        const images = image_url;
        // update the main image and secondary images
        if (mainImageElem && images.length > 0) {
            mainImageElem.src = `${images[0]}`;
            // update the secondary images
            if (secondaryImagesContainer) {
                secondaryImagesContainer.innerHTML = "";
                images.slice(0).forEach(image_url => {
                    const imgElement = document.createElement("img");
                    imgElement.src = `${image_url}`;
                    imgElement.alt = "product image";
                    imgElement.classList.add("secondary-image");

                    imgElement.addEventListener("click", () => {
                        mainImageElem.src = imgElement.src;
                    });
                    // append the image to the secondary images container
                    secondaryImagesContainer.appendChild(imgElement);
                });
            }
        }
    }
    // function to fetch similar products
    fetchSimilarProducts(category) {
        fetch(`${this.apiUrl}?category=${category}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
                "Cache-Control": "no-cache"
            }
        })
            .then(response => response.json())
            .then(products => {
                const filteredProducts = products.filter(p => p._id !== this.productId);
                const similarListingsContainer = document.getElementById("similarListings");

                if (filteredProducts.length > 0 && similarListingsContainer) {
                    similarListingsContainer.innerHTML = "";
                    filteredProducts.slice(0, 5).forEach(product => {
                        const productCard = document.createElement("div");
                        productCard.classList.add("listing-card");

                        const images = product.image_url ? product.image_url : [];
                        const firstImage = images[0] ? `${images[0]}` : "../images/default-placeholder.png";
                        const secondImage = images[1] ? `${images[1]}` : firstImage;

                        productCard.innerHTML = `
                            <div class="image-wrapper">
                                <img src="${firstImage}" alt="${product.title}" class="product-image" data-hover="${secondImage}">
                            </div>
                            <p class="title">${product.title}</p>
                            <p class="price">S$${product.price ? product.price.toFixed(2) : "0.00"}</p>
                        `;

                        const imgElement = productCard.querySelector(".product-image");
                        imgElement.addEventListener("mouseover", () => imgElement.src = secondImage);
                        imgElement.addEventListener("mouseout", () => imgElement.src = firstImage);

                        productCard.addEventListener("click", () => {
                            const productUrl = `product-details.html?id=${product._id}&category=${encodeURIComponent(category)}&title=${encodeURIComponent(product.title)}`;
                            window.location.href = productUrl;
                        });

                        similarListingsContainer.appendChild(productCard);
                    });
                }
            })
            .catch((error) => console.error("Error fetching similar products:", error));
    }
}

// initialize the product details page with product ID from URL
document.addEventListener("DOMContentLoaded", () => {
    // get the product ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const addToCart = document.getElementById("addToCart");
    console.log("Product ID:", productId);  // check if productId is retrieved correctly
    if (addToCart) {
        addToCart.setAttribute("data-product-id", productId);
    }
    // initialize the Product class with the product ID
    if (productId) {
        // initialize the Product class
        const product = new Product(productId);
    } else {
        console.error("Product ID not found in URL.");
    }
});
