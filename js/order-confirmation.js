//constants and configurations
const API_ENDPOINT = ''; //API endpoint

//order data management
class OrderManager {
    constructor() {
        this.orderData = null;
        this.init();
    }

    async init() {
        try {
            //get order ID from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('orderId');
            
            if (orderId) {
                await this.fetchOrderDetails(orderId);
            }
        } catch (error) {
            console.error('Initialization error:', error);
            this.handleError(error);
        }
    }

    async fetchOrderDetails(orderId) {
        try {
            const response = await fetch(`${API_ENDPOINT}/orders/${orderId}`);
            if (!response.ok) throw new Error('Order fetch failed');
            
            this.orderData = await response.json();
            this.populateOrderDetails();
        } catch (error) {
            console.error('Fetch error:', error);
            this.handleError(error);
        }
    }

    populateOrderDetails() {
        if (!this.orderData) return;

        //populate order information
        document.querySelector('.detail-value:nth-child(1)').textContent = this.formatDate(this.orderData.date);
        document.querySelector('.detail-value:nth-child(2)').textContent = this.orderData.customerName;
        document.querySelector('.detail-value:nth-child(4)').textContent = this.orderData.orderNumber;
        document.querySelector('.detail-value:nth-child(5)').textContent = this.formatPrice(this.orderData.total);

        //populate order items
        this.populateOrderItems();
    }

    populateOrderItems() {
        const orderLineContainer = document.querySelector('.order-line');
        orderLineContainer.innerHTML = ''; //clear existing items

        this.orderData.items.forEach(item => {
            const itemElement = this.createOrderItemElement(item);
            orderLineContainer.appendChild(itemElement);
        });
    }

    createOrderItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'product-card';
        itemDiv.innerHTML = `
            <div class="product-image">image</div>
            <div class="product-details">
                <div class="product-title">${item.name}</div>
                <span class="product-size">${item.size}</span>
            </div>
            <div class="product-price">${this.formatPrice(item.price)}</div>
        `;
        return itemDiv;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-GB');
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    handleError(error) {
        //add error handling UI logic here
        console.error('Error:', error);
    }
}

//lottie animation setup
class ConfirmationAnimation {
    constructor() {
        this.init();
    }

    init() {
        //initialize lottie animation
        const animationContainer = document.querySelector('.confirmation-image');
        lottie.loadAnimation({
            container: animationContainer,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            path: '' //lottie animation path
        });
    }
}

//initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const orderManager = new OrderManager();
    const animation = new ConfirmationAnimation();
});

//add confetti effect on load
const launchConfetti = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
};

window.onload = launchConfetti;