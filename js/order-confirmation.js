//constants and configurations
const RESTDB_API_KEY = 'my_api_key';
const RESTDB_API_URL = 'https://mokesell-d5a1.restdb.io/rest';

class OrderManager {
    constructor() {
        this.orderData = null;
        this.init();
    }

    async init() {
        try {
            //initialize lottie animation
            this.initLottieAnimation();
            
            //launch confetti effect
            this.launchConfetti();
            
            //get order id from url parameters
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
            const response = await fetch(`${RESTDB_API_URL}/orders/${orderId}`, {
                headers: {
                    'x-apikey': RESTDB_API_KEY
                }
            });
            
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

        //update order information using data attributes
        document.querySelector('[data-field="date"]').textContent = this.formatDate(this.orderData.date);
        document.querySelector('[data-field="customer"]').textContent = this.orderData.customerName;
        document.querySelector('[data-field="orderNumber"]').textContent = this.orderData.orderNumber;
        document.querySelector('[data-field="total"]').textContent = this.formatPrice(this.orderData.total);

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

    initLottieAnimation() {
        //initialize success checkmark animation
        const animation = lottie.loadAnimation({
            container: document.getElementById('successAnimation'),
            renderer: 'svg',
            loop: false,
            autoplay: true,
            path: 'animations/success-checkmark.json' //animation file
        });

        //animation complete callback
        animation.addEventListener('complete', () => {
            console.log('Animation completed');
        });
    }

    launchConfetti() {
        //launch celebration confetti effect
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#7A6145', '#F7F5EF', '#65503A'] //match colour scheme
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); //format: DD/MM/YYYY
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    handleError(error) {
        console.error('Error:', error);
        //add error handling UI logic here if needed
    }
}

//initialize when dom is ready
document.addEventListener('DOMContentLoaded', () => {
    const orderManager = new OrderManager();
});