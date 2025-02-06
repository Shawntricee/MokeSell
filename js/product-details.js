class ReviewManager {
    constructor(productId, currentUsername) {
        this.productId = productId;
        this.reviewsFile = "../json/reviews.json";
        this.currentUsername = currentUsername;
        this.sellerUsername = "";
    }

    init() {
        if (this.reviewsFetched) {
            console.log("Reviews already fetched");
            return; // Prevent fetching if reviews are already fetched
        }

        console.log("ReviewManager initialized");
        this.setupReviewForm();
        this.fetchReviews();
    }

    setSellerUsername(sellerUsername) {
        this.sellerUsername = sellerUsername || "Unknown";
        console.log("Setting seller username:", this.sellerUsername);  // Debug log
        this.updateReviewHeader();
    }

    updateReviewHeader() {
        const reviewSeller = document.getElementById("sellerReviewUsername");
        if (reviewSeller) {
            reviewSeller.textContent = this.sellerUsername;
        }
    }

    setupReviewForm() {
        const reviewForm = document.getElementById("reviewForm");
        const postReviewButton = document.getElementById("postReviewButton");

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

    postReview(reviewText) {
        const currentUsername = sessionStorage.getItem("currentUsername");
        if (!currentUsername) {
            alert("You must be logged in to post a review!");
            return;
        }
    
        const newReview = {
            productId: this.productId,
            username: currentUsername,
            review: reviewText,
            datePosted: new Date().toISOString(),
        };
    
        console.log("Posting Review:", newReview);
    
        fetch(this.reviewsFile, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
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
            // Now `addReviewToUI` will work because `this` context is preserved
            this.addReviewToUI(createdReview);
            document.getElementById("reviewInput").value = "";
        })
        .catch(error => {
            console.error("Error posting review:", error);
            alert("Failed to post review. Please try again.");
        });
    }
    
    addReviewToUI(review) {
        const reviewsList = document.getElementById("reviewsList");
        if (reviewsList) {
            reviewsList.appendChild(this.renderReview(review));
        }
    }
    

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

    fetchReviews() {
        if (this.reviewsFetched) {
            console.log("Reviews already fetched.");
            return;
        }
        console.log("Fetching reviews...");
        fetch(this.reviewsFile)
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
    constructor(productId, currentUsername = null) {
        this.productId = productId;
        this.productFile = "../json/products.json";
        this.currentUsername = currentUsername;
        this.reviewManager = new ReviewManager(productId, this.currentUsername);
        this.init();
    }

    init() {
        this.fetchProductData();
        this.reviewManager.init();
        this.fetchSimilarProducts();
    }

    fetchProductData() {
        fetch(this.productFile)
            .then(response => response.json())
            .then(productsArray => {
                const product = productsArray.find(p => p._id === this.productId);
                if (!product) {
                    console.error(`Product with ID ${this.productId} not found.`);
                    return;
                }

                console.log("Fetched product data:", product);
                this.updateProductDetails(product);
                this.updateProductImages(product.image_url);
                const breadcrumb = new BreadcrumbNavigation("#breadcrumbNavigation");
                breadcrumb.generateBreadcrumb(product.category, product.subcategory, product.title);

                // Set seller details and handle the reviews
                const seller = product.seller_id[0] || {};
                this.updateSellerDetails(seller);
                this.reviewManager.setSellerUsername(seller.username || "Unknown");
            })
            .catch((error) => console.error("Error fetching product data:", error));
    }

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

    updateSellerDetails(seller) {
        document.getElementById("sellerUsername").textContent = `@${seller.username || "Unknown"}`;
        document.getElementById("sellerJoined").textContent = seller.date_joined ? new Date(seller.date_joined).toLocaleDateString() : "Joined: N/A";
    }

    updateProductImages(image_url) {
        const mainImageElem = document.getElementById("mainImage");
        const secondaryImagesContainer = document.getElementById("secondaryImages");

        const images = image_url;

        if (mainImageElem && images.length > 0) {
            mainImageElem.src = `${images[0]}`;

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

                    secondaryImagesContainer.appendChild(imgElement);
                });
            }
        }
    }

    fetchSimilarProducts() {
        fetch(this.productFile)
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
                            window.location.href = `product-details.html?id=${product._id}`;
                        });

                        similarListingsContainer.appendChild(productCard);
                    });
                }
            })
            .catch((error) => console.error("Error fetching similar products:", error));
    }
}

//initialize the product page with the product ID from the URL
// Initialize the product page and set up "Add to Cart" button
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const currentUsername = sessionStorage.getItem("currentUsername");

    if (productId) {
        const product = new Product(productId, currentUsername);

        // Handle "Add to Cart" button
        const addToCartBtn = document.getElementById("addToCart");
        if (addToCartBtn) {
            addToCartBtn.setAttribute("data-product-id", productId);

            addToCartBtn.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("Add to cart clicked");

                if (window.cartManager) {
                    window.cartManager.addToCart(productId);
                } else {
                    console.error("Cart manager not initialized");
                }
            });
        }
    } else {
        console.error("Product ID not found in URL.");
    }
});
