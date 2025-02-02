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

    handleImageUpload(event) {
        const files = Array.from(event.target.files);
    
        files.forEach((file) => {
            if (!this.uploadedFiles.includes(file)) {
                let reader = new FileReader();
                reader.onload = (e) => {
                    this.addImage(file);
                };
                reader.readAsDataURL(file);
                console.log(file);
            }
        });
    }    

    addImage(file) {
        const imgBox = document.createElement("div");
        imgBox.classList.add("image-box");

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "X";
        deleteBtn.addEventListener("click", () => this.removeImage(file, imgBox));

        imgBox.appendChild(img);
        imgBox.appendChild(deleteBtn);
        this.imagePreview.appendChild(imgBox);

        const fileName = file.name;
        this.uploadedImages.push(fileName);
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
        // Retrieve user details from localStorage
        const username = localStorage.getItem("currentUsername");
        const email = localStorage.getItem("userEmail"); // Retrieve user email if stored
        const userId = localStorage.getItem("userId"); // Fetch userId from localStorage
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
            "imageFilenames": this.uploadedImages //store base64 images
        };
    }

    // Function to send data to your API
    sendProductData(product) {
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
