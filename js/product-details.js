//breadcrumb navigation class
class BreadcrumbNavigation {
    constructor(containerSelector) {
        this.breadcrumbContainer = document.querySelector(containerSelector);
    }

    generateBreadcrumb(category, subcategory, productTitle) {
        if (!this.breadcrumbContainer) return;
        this.breadcrumbContainer.innerHTML = `
            <a href="/">Home</a> |
            <a href="/category/${this.formatCategory(category)}">${category || "Category"}</a> |
            <a href="/category/${this.formatCategory(category)}/${this.formatCategory(subcategory)}">${subcategory || "Subcategory"}</a> |
            <span>${productTitle || "Product"}</span>
        `;
    }

    formatCategory(category) {
        return category ? category.toLowerCase().replace(/\s+/g, '-') : 'unknown';
    }
}

//manage reviews
class ReviewManager {
    constructor(apiKey, productId, currentUsername) {
        this.apiKey = apiKey;
        this.productId = productId;
        this.apiUrl = `https://mokesell-d5a1.restdb.io/rest/reviews`; // Replace with the actual reviews API URL
        this.sellerUsername = ""; // Seller's username
        this.currentUsername = currentUsername; // Logged-in user's username
    }

    init() {
        console.log("reviewmanager initialised");
        //initialise review form
        this.setupReviewForm();
        this.fetchReviews();
    }

    setupReviewForm() {
        const reviewForm = document.getElementById("reviewForm");
        const postReviewButton = document.getElementById("postReviewButton");
    
        // Check if form and button exist
        if (reviewForm && postReviewButton) {
            console.log("Review form and button found!");
            
            reviewForm.addEventListener("submit", (event) => {
                event.preventDefault();  // Prevent default form submit behavior
    
                console.log("Form submitted");  // Log the submit action
                
                const reviewInput = document.getElementById("reviewInput");
                
                if (reviewInput && reviewInput.value.trim() !== "") {
                    console.log("Review text:", reviewInput.value.trim());
                    this.postReview(reviewInput.value.trim());  // Post review if there's valid input
                } else {
                    alert("Please enter a review!");
                }
            });
            //mark the form lister as added
            this.formListenerAdded = true;
        } else {
            console.warn("Review form or button not found!");
        }
    }
    
    postReview(reviewText) {
        const currentUsername = localStorage.getItem("currentUsername");
        if (!currentUsername) {
            alert("You must be logged in to post a review!");
            return;
        }
    
        // Log current username for debugging
        console.log("Current Username:", currentUsername);
    
        const newReview = {
            productId: this.productId, // Associate review with product
            sellerUsername: this.sellerUsername,
            username: currentUsername,
            review: reviewText,
            datePosted: new Date().toISOString(),
        };
    
        console.log("Posting Review:", newReview);  // Log review being posted
    
        fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": this.apiKey,
            },
            body: JSON.stringify(newReview),
        })
            .then((response) => {
                if (!response.ok) {
                    // Log the error status for debugging
                    console.error("Failed to post review. Status:", response.status);
                    throw new Error("Failed to post review");
                }
                return response.json();
            })
            .then((createdReview) => {
                console.log("Review posted successfully:", createdReview); // Log the created review
                this.addReviewToUI(createdReview);
                const reviewInput = document.getElementById("reviewInput");
                if (reviewInput) {
                    reviewInput.value = ""; // Clear input field
                }
            })
            .catch((error) => {
                console.error("Error posting review:", error);
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
        reviewDiv.setAttribute("data-review-id", review.id); // Add unique ID for checking
        reviewDiv.innerHTML = `
            <div class="review-header">
                <div class="profile-picture">
                    <img src="../images/icons/review-profile-icon.png" alt="seller profile icon">
                </div>
                <span class="review-username">@${review.username}</span>
                <span class="review-date">Posted on ${new Date(review.datePosted).toLocaleDateString()}</span>
            </div>
            <p class="review-content">${review.review}</p>
        `;
        return reviewDiv;
    }

    setSellerUsername(sellerUsername) {
        this.sellerUsername = sellerUsername;
        this.updateReviewHeader();
    }

    updateReviewHeader() {
        const reviewSeller = document.getElementById("sellerUsername");
        if (reviewSeller) {
            reviewSeller.textContent = `${this.sellerUsername}`;
        }
    }

    fetchReviews() {
        console.log("fetching reviews...")
        fetch(this.apiUrl, {
            headers: {
                "x-apikey": this.apiKey
            }
        })
        .then(response => response.json())
        .then(reviews => {
            console.log("Fetched reviews:", reviews)
            reviews.forEach(review => {
                if (!document.querySelector(`.review-item[data-review-id="${review.id}"]`)) {
                    this.addReviewToUI(review); // Only add if it's not already in the UI
                }
            });
        })
        .catch(error => {
            console.error("Error fetching reviews:", error);
        });
    }
}

class Product {
    constructor(productId, apiKey, currentUsername = null) {
        this.productId = productId;
        this.apiKey = apiKey;
        this.apiUrl = `https://mokesell-d5a1.restdb.io/rest/products/${productId}`; // Replace with actual API URL
        this.sellerUsername= "";
        this.currentUsername = currentUsername;
        this.reviewManager = new ReviewManager(apiKey, productId, this.currentUsername);
        this.init();
    }

    init() {
            this.fetchProductData();
            this.reviewManager.init();
    }

    fetchProductData() {
        fetch(this.apiUrl, {
            headers: {
                "x-apikey": this.apiKey
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch product data");
            }
            return response.json();
        })
        .then(product => {
            if (product) {
                console.log("Fetched product data:", product)
                this.updateProductDetails(product);
                // Ensure seller_id exists and is an array with at least one element
                if (Array.isArray(product.seller_id) && product.seller_id.length > 0) {
                    const seller = product.seller_id[0]; // Get first seller object
                    this.updateSellerDetails(seller);
                    this.sellerUsername = product.seller_id[0].username;
                    console.log("Extracted Seller Username:", this.sellerUsername);
                    this.setSellerUsername();
                    this.reviewManager.setSellerUsername(this.sellerUsername);
                } else {
                    console.warn("Warning: No seller data found for this product.");
                }
                this.updateProductImages(product.imageFilenames);
                //generate breadcrumb after updating product details
                const breadcrumb = new BreadcrumbNavigation("#breadcrumbNavigation");
                breadcrumb.generateBreadcrumb(product.category, product.subcategory, product.title);
            }
        })
        .catch(error => {
            console.error("Error fetching product data:", error);
        });
    }

    setSellerUsername() {
        const sellerElement = document.getElementById("sellerReviewUsername");
        if (sellerElement) {
            sellerElement.textContent = this.sellerUsername;
            console.log("Updated sellerReviewUsername:", sellerElement.textContent); // Debugging log
        } else {
            console.warn("Warning: Element #sellerReviewUsername not found in the DOM.");
        }
    }

    updateProductDetails(product) {
        document.getElementById("producTitle").textContent = product.title || "No title available";
        document.getElementById("productPrice").textContent = product.price ? `S$${product.price.toFixed(2)}` : "S$0.00";
        document.getElementById("productCategory").textContent = product.category || "Category not available";
        document.getElementById("productCondition").textContent = product.condition || "Condition not available";

        // Handling invalid or missing dates
        const listedDate = product.listed ? new Date(product.listed) : null;
        document.getElementById("productListed").textContent = listedDate && !isNaN(listedDate) ? listedDate.toDateString() : "Listed: Date not available";

        document.getElementById("productDimensions").textContent = product.dimensions || "Dimensions not available";
        document.getElementById("productColour").textContent = product.colour || "Colour not available";
        document.getElementById("productMaterial").textContent = product.material || "Material not available";
        document.getElementById("productDescription").textContent = product.description || "No description available";
        document.getElementById("productPoints").textContent = product.points || "No points available";
    }

    updateSellerDetails(seller) {
        document.getElementById("sellerUsername").textContent = `@${seller.username || "Unknown"}`;
        document.getElementById("sellerJoined").textContent = seller.date_joined ? new Date(seller.date_joined).toDateString() : "Joined: N/A";
    }

    updateProductImages(imageFilenames) {
        const mainImageElem = document.getElementById("mainImage");
        const secondaryImagesContainer = document.getElementById("secondaryImages");
        // Split the comma-separated image filenames into an array
        const images = imageFilenames.split(","); // This will create an array like ["fabric-sofa-1-main.jpg", "fabric-sofa-1-secondary-1.jpg", ...]
    
        const baseImageUrl = "../images/products/";  // Folder path relative to where your HTML is served
    
        if (mainImageElem && images && images.length > 0) {
            // Set the main image
            mainImageElem.src = `${baseImageUrl}${images[0]}`;
    
            if (secondaryImagesContainer) {
                secondaryImagesContainer.innerHTML = "";  // Clear existing images
                images.slice(0).forEach(imgFilename => {  // Skip the first image for secondary images
                    const imgElement = document.createElement("img");
                    imgElement.src = `${baseImageUrl}${imgFilename}`;
                    imgElement.alt = "product image";
                    imgElement.classList.add("secondary-image");
    
                    // Change the main image when a secondary image is clicked
                    imgElement.addEventListener("click", () => {
                        mainImageElem.src = imgElement.src;
                    });
    
                    secondaryImagesContainer.appendChild(imgElement);
                });
            }
        }
    }
}
// Initialize the product class with the current username
document.addEventListener("DOMContentLoaded", () => {
    const currentUsername = localStorage.getItem("currentUsername");
    if (currentUsername) {
        console.log(`Logged in as ${currentUsername}`);
        product = new Product("679796bbbb50491a00009ee6", APIKEY); // Pass currentUsername to the product class
    } else {
        console.log(`User not logged in.`);
        product = new Product("679796bbbb50491a00009ee6", APIKEY); // Pass currentUsername to the product class
    }
    //breadcrumb navigation
    const breadcrumb = new BreadcrumbNavigation(".product-container-left h3");

    // Extract category and product title from DOM
    const category = document.getElementById("productCategory")?.textContent.trim() || "Category";
    const productTitle = document.getElementById("productTitle")?.textContent.trim() || "Product";

    breadcrumb.generateBreadcrumb(category, productTitle);
});