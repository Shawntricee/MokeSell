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
        this.conditionBtns = document.querySelectorAll(".condition-btn");
        this.conditionInput = document.getElementById("condition");
        this.steps = document.querySelectorAll(".step");
        this.categorySelect = document.getElementById("category");
        this.inputFields = document.querySelectorAll("#height, #width, #depth, #colour, #material, #description");
        this.priceInput = document.getElementById("price");
        this.currencySelect = document.getElementById("currency");
    }

    bindEvents() {
        this.imageUpload.addEventListener("change", (event) => this.handleImageUpload(event));
        this.categorySelect.addEventListener("change", () => this.updateStepCompletion(1));
        this.conditionBtns.forEach(button =>
            button.addEventListener("click", (event) => this.selectCondition(event))
        );
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
                    this.addImage(e.target.result, file);
                };
                reader.readAsDataURL(file);
            }
        });
    }    

    addImage(src, file) {
        const imgBox = document.createElement("div");
        imgBox.classList.add("image-box");

        const img = document.createElement("img");
        img.src = src;

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "X";
        deleteBtn.addEventListener("click", () => this.removeImage(src, file, imgBox));

        imgBox.appendChild(img);
        imgBox.appendChild(deleteBtn);
        this.imagePreview.appendChild(imgBox);

        this.uploadedImages.push(src);
        this.uploadedFiles.push(file);
        this.updateStepCompletion(0);
    }

    removeImage(src, file, imgBox) {
        this.uploadedImages = this.uploadedImages.filter(image => image !== src);
        this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
        imgBox.remove();

        if (this.uploadedImages.length === 0) {
            this.resetFileInput();
            this.updateStepCompletion(0, false); // ✅ Remove progress if no images left
        } else {
            this.updateFileInput();
            this.updateStepCompletion(0);
        }
    }

    resetFileInput() {
        this.imageUpload.value = "";
    }

    updateFileInput() {
        const dataTransfer = new DataTransfer();
        this.uploadedFiles.forEach(file => dataTransfer.items.add(file));
        this.imageUpload.files = dataTransfer.files;
    }

    selectCondition(event) {
        this.conditionBtns.forEach(btn => btn.classList.remove("selected"));
        event.target.classList.add("selected");
        this.conditionInput.value = event.target.dataset.value;
        this.updateStepCompletion(2);
    }

    handleSubmit(event) {
        event.preventDefault();

        const product = {
            images: this.uploadedImages,
            category: this.categorySelect.value,
            condition: this.conditionInput.value,
            dimensions: {
                height: document.getElementById("height").value,
                width: document.getElementById("width").value,
                depth: document.getElementById("depth").value
            },
            colour: document.getElementById("colour").value,
            material: document.getElementById("material").value,
            description: document.getElementById("description").value,
            price: this.priceInput.value,
            currency: this.currencySelect.value
        };

        console.log("Product added:", product);
        alert("Product listed successfully!");
    }

    /**
     * Updates the progress bar step based on the user's input.*/
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
                isStepCompleted = this.conditionInput.value.trim() !== "";
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
