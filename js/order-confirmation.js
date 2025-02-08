class OrderConfirmation {
    constructor() {
        this.orderData = null;
        this.init();
    }
    async init() {
        try {
            //initialize animation and effects
            this.initSuccessAnimation();
            this.launchConfetti();
            
            //get order data from localStorage
            const lastOrder = localStorage.getItem('lastOrder');
            if (lastOrder) {
                this.orderData = JSON.parse(lastOrder);
                this.populateOrderDetails();
            }
        } catch (error) {
            console.error('initialization error:', error);
        }
    }

    initSuccessAnimation() {
        const container = document.getElementById('successAnimation');
        if (!container) return;

        lottie.loadAnimation({
            container,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            path: '../animations/success-checkmark.json'
        }).addEventListener('complete', () => {
            //second wave of confetti after checkmark
            setTimeout(() => this.launchConfetti(), 500);
        });
    }
    launchConfetti() {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#7A6145', '#F7F5EF', '#65503A', '#342519'],
            ticks: 300,
            gravity: 0.8,
            scalar: 1.2,
            shapes: ['circle', 'square']
        });
    }

    populateOrderDetails() {
        if (!this.orderData) return;
        //update order information using data attributes
        document.querySelector('[data-field="date"]').textContent = 
            new Date().toLocaleDateString();
        document.querySelector('[data-field="customer"]').textContent = 
            this.orderData.customer?.fullname || 'Guest';
        document.querySelector('[data-field="orderNumber"]').textContent = 
            Math.floor(Math.random() * 900000000) + 100000000;
        document.querySelector('[data-field="total"]').textContent = 
            this.formatPrice(this.orderData.total);
        //populate order items
        this.populateOrderItems();
    }
    populateOrderItems() {
        const orderLineContainer = document.querySelector('.order-line');
        orderLineContainer.innerHTML = ''; // clear existing items

        this.orderData.items.forEach(item => {
            const itemElement = this.createOrderItemElement(item);
            orderLineContainer.appendChild(itemElement);
        });
    }

    createOrderItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'product-card';
        itemDiv.innerHTML = `
            <div class="product-image">
                <img src="${item.image || '../images/products/placeholder.jpg'}" 
                     alt="${item.title}">
            </div>
            <div class="product-details">
                <div class="product-title">${item.title}</div>
                <div class="product-meta">
                    <span class="product-size">Quantity: ${item.quantity}</span>
                </div>
            </div>
            <div class="product-price">${this.formatPrice(item.price * item.quantity)}</div>
        `;
        
        return itemDiv;
    }
    formatPrice(price) {
        return new Intl.NumberFormat('en-SG', {
            style: 'currency',
            currency: 'SGD',
            minimumFractionDigits: 2
        }).format(price);
    }
}

//initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new OrderConfirmation();
    
    //clear cart and order data after 1 hour
    setTimeout(() => {
        localStorage.removeItem('cartState');
        localStorage.removeItem('lastOrder');
    }, 3600000);
});