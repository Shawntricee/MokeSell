class Listing {
    constructor() {
        // initialize the uploaded images array
        this.uploadedImages = [];
        this.uploadedFiles = [];
        this.init();
    }
    //initialize the listing form
    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.cacheDOM();
            this.bindEvents();
        });
    }
    // cache the DOM elements
    cacheDOM() {
        this.form = document.getElementById("listingForm");
        this.imageUpload = document.getElementById("imageUpload");
        this.imagePreview = document.getElementById("imagePreview");
        this.conditionSelect = document.getElementById("conditionOptions");
        this.steps = document.querySelectorAll(".step");
        this.categorySelect = document.getElementById("category");
        this.inputFields = document.querySelectorAll("#title, #height, #width, #depth, #colour, #material, #description");
        this.priceInput = document.getElementById("price");
        this.currencySelect = document.getElementById("currency");
        this.listingOverlay = document.getElementById("listingOverlay");
        this.listingAnimation = document.getElementById("listingAnimation");
    }
    // bind event listeners to the form elements
    bindEvents() {
        // add event listeners for the form elements
        this.imageUpload.addEventListener("change", (event) => this.handleImageUpload(event));
        this.categorySelect.addEventListener("change", () => this.updateStepCompletion(1));
        this.conditionSelect.addEventListener("change", () => this.updateStepCompletion(2));
        this.inputFields.forEach(input =>
            input.addEventListener("input", () => this.updateStepCompletion(3))
        );
        this.priceInput.addEventListener("input", () => this.updateStepCompletion(4));
        this.currencySelect.addEventListener("change", () => this.updateStepCompletion(4));

        this.form.addEventListener("submit", (event) => this.handleSubmit(event));
    }

    // function to handle image upload
    handleImageUpload(event) {
        // reset the image preview and uploaded images array
        const files = Array.from(event.target.files);
        files.forEach((file) => {
            // check if the file is already uploaded
            if (!this.uploadedFiles.includes(file)) {
                // display the image preview
                let reader = new FileReader();
                reader.onload = (e) => {
                    this.uploadImageToCloudinary(file);
                };
                // read the image file as a data URL
                reader.readAsDataURL(file);
            }
        });
    }

    // function to upload an image to Cloudinary
    async uploadImageToCloudinary(file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "listing");
        const response = await fetch(`https://api.cloudinary.com/v1_1/dygllvmdk/image/upload`, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Cloudinary upload failed with error:", errorResponse.error.message);
            return;
        }
        // retrieve the image URL from the response
        const data = await response.json();
        const imageUrl = data.secure_url;
        
        // apply Cloudinary transformation to crop the image into 1:1 aspect ratio
        const transformedImageUrl = imageUrl.replace("/upload/", "/upload/c_crop,g_auto,w_500,h_500/");

        console.log("Image uploaded and transformed successfully:", transformedImageUrl);

        // add the image to the preview
        this.addImage(file, transformedImageUrl);
    }

    // function to add image to the preview and store the URL
    addImage(file, imageUrl) {
        const imgBox = document.createElement("div");
        imgBox.classList.add("image-box");
        // create an image element
        const img = document.createElement("img");
        img.src = imageUrl;
        // create a delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "X";
        // add event listener to remove the image
        deleteBtn.addEventListener("click", () => this.removeImage(file, imgBox));
        // append the image and delete button to the image box
        imgBox.appendChild(img);
        imgBox.appendChild(deleteBtn);
        // append the image box to the image preview
        this.imagePreview.appendChild(imgBox);
        // store Cloudinary URL instead of file name
        this.uploadedImages.push(imageUrl);
        this.uploadedFiles.push(file);
        console.log(this.uploadedImages);
    }

    // function to remove an image from the preview
    removeImage(file, imgBox) {
        // remove the image from the uploaded images array
        this.uploadedImages = this.uploadedImages.filter(image => image !== file.name);
        this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
        imgBox.remove();
    }
    // function to reset the file input field
    resetFileInput() {
        this.imageUpload.value = "";
    }
    // function to update the file input field
    updateFileInput() {
        // create a new DataTransfer object
        const dataTransfer = new DataTransfer();
        this.uploadedFiles.forEach(file => dataTransfer.items.add(file));
        this.imageUpload.files = dataTransfer.files;
    }
    // function to handle form submission
    handleSubmit(event) {
        event.preventDefault();
        // check if form is valid and image upload is complete
        if (!this.isFormValid() || this.uploadedImages.length === 0) {
            alert("Please fill in all required fields and upload an image.");
            return;
        }

        // create the product object
        const product = this.createProductObject();
        if (!product) return;

        // send product data to API
        this.sendProductData(product);
    }
    // check if all required fields are filled
    isFormValid() {
        const requiredFields = [
            this.categorySelect,
            this.conditionSelect,
            ...this.inputFields,
            this.priceInput
        ];
        // Debugging: log each field's value
        requiredFields.forEach(field => {
            console.log(`${field.id}: `, field.value);
        });
        return requiredFields.every(field => {
            if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
                return field.value.trim() !== "";
            } else if (field.tagName === "SELECT") {
                return field.value.trim() !== "";
            } else if (field.type === "file") {
                return this.uploadedImages.length > 0;
            }
            return true;
        });
    }
    //create the product object from form data
    createProductObject() {
        // retrieve user details from sessionStorage
        const username = sessionStorage.getItem("currentUsername");
        const email = sessionStorage.getItem("userEmail");
        const userId = sessionStorage.getItem("userId");
        const dateJoined = sessionStorage.getItem("userDateJoined");
        // retrieve the value from the input field and parse it as a float
        const price = parseFloat(document.getElementById("price").value);
        // check if user details are available
        if (!userId || !username || !email) {
            alert("User details are missing. Please login again.");
            return null;
        }
        // create the product object
        return {
            "description": document.getElementById("description").value,
            "price": price,
            "category": this.categorySelect.value,
            "condition": this.conditionSelect.value,
            "dimensions": `${document.getElementById("height").value}H x ${document.getElementById("width").value}W x ${document.getElementById("depth").value}D`,
            "listed": new Date().toISOString(),
            "colour": document.getElementById("colour").value,
            "material": document.getElementById("material").value,
            "seller_id": [{
                "_id": userId,
                "username": username,
                "email": email,
                "dateJoined": dateJoined
            }],
            "title": document.getElementById("title").value,
            "subcategory": this.categorySelect.options[this.categorySelect.selectedIndex].text,
            "points": parseFloat(this.priceInput.value) * 0.1,
            "id": Math.floor(Math.random() * 10000),
            "image_url": this.uploadedImages
        };
    }

    // function to send data to your API
    sendProductData(product) {
        const apiUrl = "https://mokesell-7cde.restdb.io/rest/products"/*"https://mokesell-39a1.restdb.io/rest/products"*/;
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': "67a4f3a7fd5d586e56efe120"/*"67a5a5b09c979727011b2a7b"*/,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(product)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Product successfully added:', data);
            alert("Product listed successfully!");

            // show the listing animation
            this.showListingAnimation();

            // reset the form fields
            this.form.reset();

            // clear uploaded images array
            this.uploadedImages = [];
            this.uploadedFiles = [];

            // remove image previews
            this.imagePreview.innerHTML = "";

            // reset file input
            this.imageUpload.value = "";

            // reset progress bar steps
            this.steps.forEach(step => step.classList.remove("active"));
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    // show the listing animation
    showListingAnimation() {
        // Show the overlay and animation
        this.listingOverlay.style.display = "flex";
        this.listingAnimation.style.display = "block";

        // After animation finishes, hide the overlay and reset the form
        setTimeout(() => {
            this.listingOverlay.style.display = "none";
            this.listingAnimation.style.display = "none";
        }, 12000);
    }
    // updates the progress bar step based on the user's input
    updateStepCompletion(step) {
        const stepElement = this.steps[step];
        // check if the step is completed based on the input field
        let isStepCompleted = false;
        switch (step) {
            case 0: // image Upload
                isStepCompleted = this.uploadedImages.length > 0;
                break;
            case 1: // choose Category
                isStepCompleted = this.categorySelect.value.trim() !== "";
                break;
            case 2: // welect Condition
                isStepCompleted = this.conditionSelect.value.trim() !== "";
                break;
            case 3: // item details (check all fields)
                isStepCompleted = [...this.inputFields].every(input => input.value.trim() !== "");
                break;
            case 4: // set price (check price & currency)
                isStepCompleted = this.priceInput.value.trim() !== "" && this.currencySelect.value.trim() !== "";
                break;
        }
        // mark step as active only if it meets completion criteria
        if (isStepCompleted) {
            stepElement.classList.add("active");
        } else {
            stepElement.classList.remove("active");
        }
    }
}    
// instantiate the Listing class
new Listing();
