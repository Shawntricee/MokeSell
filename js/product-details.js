class Product {
    constructor(productId, apiKey) {
        this.productId = productId;
        this.apiKey = apiKey;
        this.apiUrl = `https://mokesell-d5a1.restdb.io/rest/products/${productId}`; // Replace with actual API URL
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.fetchProductData();
        });
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
                this.updateProductDetails(product);
                if (product.seller_id && product.seller_id.length > 0) {
                    this.updateSellerDetails(product.seller_id[0]);
                }
                this.updateProductImages(product.imageFilenames);
            }
        })
        .catch(error => {
            console.error("Error fetching product data:", error);
        });
    }

    updateProductDetails(product) {
        document.getElementById("producTitle").textContent = product.description || "No description available";
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
                images.slice(1).forEach(imgFilename => {  // Skip the first image for secondary images
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

// Usage
const product = new Product("679796bbbb50491a00009ee6", APIKEY); // Replace with dynamic product ID if needed



