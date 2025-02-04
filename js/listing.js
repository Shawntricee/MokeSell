class Listing {
    constructor() {
        this.uploadedImages = [];
        this.uploadedFiles = [];
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.cacheDOM();
            this.bindEvents();
        });
    }

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
    }

    bindEvents() {
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

    // Function to handle image upload
    handleImageUpload(event) {
        const files = Array.from(event.target.files);

        files.forEach((file) => {
            if (!this.uploadedFiles.includes(file)) {
                let reader = new FileReader();
                reader.onload = (e) => {
                    this.uploadImageToCloudinary(file);
                };
                reader.readAsDataURL(file);  // Still needed for preview, no base64 saving anymore
            }
        });
    }

    // Function to upload an image to Cloudinary
    async uploadImageToCloudinary(file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "listing");  // Replace with your actual upload preset

        const response = await fetch(`https://api.cloudinary.com/v1_1/dygllvmdk/image/upload`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Cloudinary upload failed with error:", errorResponse.error.message);
            return;  // Stop further execution in case of error
        }

        const data = await response.json();
        const imageUrl = data.secure_url;
        console.log("Image uploaded successfully:", imageUrl);

        this.addImage(file, imageUrl);
    }

    // Function to add image to the preview and store the URL
    addImage(file, imageUrl) {
        const imgBox = document.createElement("div");
        imgBox.classList.add("image-box");

        const img = document.createElement("img");
        img.src = imageUrl;  // Display the Cloudinary URL

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "X";
        deleteBtn.addEventListener("click", () => this.removeImage(file, imgBox));

        imgBox.appendChild(img);
        imgBox.appendChild(deleteBtn);
        this.imagePreview.appendChild(imgBox);

        // Store Cloudinary URL instead of file name
        this.uploadedImages.push(imageUrl);
        this.uploadedFiles.push(file);
        console.log(this.uploadedImages);
    }

    removeImage(file, imgBox) {
        this.uploadedImages = this.uploadedImages.filter(image => image !== file.name);
        this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
        imgBox.remove();
    }

    resetFileInput() {
        this.imageUpload.value = "";
    }

    updateFileInput() {
        const dataTransfer = new DataTransfer();
        this.uploadedFiles.forEach(file => dataTransfer.items.add(file));
        this.imageUpload.files = dataTransfer.files;
    }

    handleSubmit(event) {
        event.preventDefault();
        //prevent submission if field is empty
        if (this.isFormValid()) {
            const product = this.createProductObject();
            this.sendProductData(product);
        } else {
            alert("Please fill in all required fields.");
        }
    }

    // check if all required fields are filled
    isFormValid() {
        const requiredFields = [
            this.categorySelect,
            this.conditionSelect,
            ...this.inputFields,
            this.priceInput,
            this.currencySelect
        ];

        return requiredFields.every(field => field.value.trim() !== "" || field.files && field.files.length > 0);
    }
    
    //create the product object from form data
    createProductObject() {
        // Retrieve user details from sessionStorage
        const username = sessionStorage.getItem("currentUsername");
        const email = sessionStorage.getItem("userEmail"); // Retrieve user email if stored
        const userId = sessionStorage.getItem("userId"); // Fetch userId from sessionStorage
        // Retrieve the value from the input field and parse it as a float
        const price = parseFloat(document.getElementById("price").value);

        if (!userId || !username || !email) {
            alert("User details are missing. Please login again.");
            return;
        }
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
                "username": username,  // replace with actual data
                "email": email,
            }],
            "title": document.getElementById("title").value,
            "subcategory": this.categorySelect.options[this.categorySelect.selectedIndex].text,
            "points": parseFloat(this.priceInput.value) * 0.1, // Sample point calculation
            "id": Math.floor(Math.random() * 10000),
            "image_url": this.uploadedImages
        };
    }

    // Function to send data to your API
    async sendProductData(product) {
        const apiUrl = /*"https://mokesell-d5a1.restdb.io/rest/products";*/ // Replace with actual API URL
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': '679377f88459083ff6097e55'  // If your API requires authorization
            },
            body: JSON.stringify(product)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Product successfully added:', data);
            alert("Product listed successfully!");
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

     /* Updates the progress bar step based on the user's input.*/
    updateStepCompletion(step) {
        const stepElement = this.steps[step];
    
        let isStepCompleted = false;
    
        switch (step) {
            case 0: // Image Upload
                isStepCompleted = this.uploadedImages.length > 0;
                break;
            case 1: // Choose Category
                isStepCompleted = this.categorySelect.value.trim() !== "";
                break;
            case 2: // Select Condition
                isStepCompleted = this.conditionSelect.value.trim() !== "";
                break;
            case 3: // Item Details (Check all fields)
                isStepCompleted = [...this.inputFields].every(input => input.value.trim() !== "");
                break;
            case 4: // Set Price (Check price & currency)
                isStepCompleted = this.priceInput.value.trim() !== "" && this.currencySelect.value.trim() !== "";
                break;
        }
    
        // Mark step as active only if it meets completion criteria
        if (isStepCompleted) {
            stepElement.classList.add("active");
        } else {
            stepElement.classList.remove("active");
        }
    }
}    
new Listing();
