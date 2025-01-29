//cart manager class
class CartManager {
    constructor() {
        //initialize state
        this.state = {
            items: [],
            subtotal: 0,
            shipping: 0,
            discount: 0,
            total: 0
        };

        this.API_ENDPOINT = ''; //API endpoint

        //DOM elements
        this.cartSidebar = document.getElementById('cartSidebar');
        this.cartOverlay = document.getElementById('cartOverlay');
        this.cartItems = document.getElementById('cartItems');
        this.emptyCart = document.getElementById('emptyCart');
        this.itemTemplate = document.getElementById('cartItemTemplate');

        //initialize cart
        this.initialize();
    }

    async initialize() {
        //load cart data from localStorage
        this.loadCartState();
        
        //set up event listeners
        this.setupEventListeners();
        
        //initialize lottie animation for empty cart
        this.initializeEmptyCartAnimation();
        
        //initial render
        this.render();
    }

    setupEventListeners() {
        //cart open/close
        document.querySelector('.close-cart').addEventListener('click', () => this.closeCart());
        this.cartOverlay.addEventListener('click', () => this.closeCart());

        //add to cart buttons
        document.querySelectorAll('[data-add-to-cart]').forEach(button => {
            button.addEventListener('click', (e) => this.handleAddToCart(e));
        });

        //voucher application
        document.getElementById('applyVoucher').addEventListener('click', () => this.applyVoucher());

        //checkout button
        document.getElementById('checkoutButton').addEventListener('click', () => this.proceedToCheckout());

        //handle quantity changes and item removal using event delegation
        this.cartItems.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('quantity-btn')) {
                const itemId = target.closest('.cart-item').dataset.productId;
                if (target.classList.contains('plus')) {
                    this.updateQuantity(itemId, 1);
                } else if (target.classList.contains('minus')) {
                    this.updateQuantity(itemId, -1);
                }
            } else if (target.classList.contains('remove-item')) {
                const itemId = target.closest('.cart-item').dataset.productId;
                this.removeItem(itemId);
            }
        });

        //add keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeCart();
        });
    }

    initializeEmptyCartAnimation() {
        //initialize lottie animation
        lottie.loadAnimation({
            container: document.getElementById('emptyCartLottie'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'animations/empty-cart.json' //lottie animation path
        });
    }

    async handleAddToCart(event) {
        const button = event.target;
        const productId = button.dataset.productId;

        try {
            //show loading state
            button.disabled = true;
            button.innerHTML = 'Adding...';

            //fetch product details from API
            const product = await this.fetchProductDetails(productId);
            
            //add to cart
            this.addItem(product);

            //show success message
            this.showNotification('Product added to cart!', 'success');
            
            //open cart sidebar
            this.openCart();
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Failed to add product to cart', 'error');
        } finally {
            //reset button state
            button.disabled = false;
            button.innerHTML = 'Add to Cart';
        }
    }

    async fetchProductDetails(productId) {
        const response = await fetch(`${this.API_ENDPOINT}/products/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product details');
        return response.json();
    }

    addItem(product) {
        const existingItem = this.state.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.state.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        //update cart
        this.updateCart();
        
        //add item with animation
        this.animateItemAddition(product.id);
    }

    updateQuantity(itemId, change) {
        const item = this.state.items.find(item => item.id === itemId);
        if (!item) return;

        item.quantity = Math.max(0, item.quantity + change);
        
        if (item.quantity === 0) {
            this.removeItem(itemId);
        } else {
            this.updateCart();
        }
    }

    removeItem(itemId) {
        //animate item removal
        const itemElement = this.cartItems.querySelector(`[data-product-id="${itemId}"]`);
        if (itemElement) {
            itemElement.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                this.state.items = this.state.items.filter(item => item.id !== itemId);
                this.updateCart();
            }, 300);
        }
    }

    updateCart() {
        //calculate totals
        this.calculateTotals();
        
        //save state
        this.saveCartState();
        
        //update UI
        this.render();
        
        //update cart badge
        this.updateCartBadge();
    }

    calculateTotals() {
        this.state.subtotal = this.state.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);
        
        //calculate shipping (free over $500)
        this.state.shipping = this.state.subtotal > 500 ? 0 : 35;
        
        //apply discount if any
        this.state.total = this.state.subtotal + this.state.shipping - this.state.discount;
    }

    render() {
        //clear current items
        this.cartItems.innerHTML = '';
        
        if (this.state.items.length === 0) {
            this.emptyCart.style.display = 'flex';
            this.cartItems.style.display = 'none';
        } else {
            this.emptyCart.style.display = 'none';
            this.cartItems.style.display = 'block';
            
            //render items
            this.state.items.forEach(item => this.renderItem(item));
        }

        //update summary
        this.updateSummary();
    }

    renderItem(item) {
        const template = this.itemTemplate.content.cloneNode(true);
        const itemElement = template.querySelector('.cart-item');
        
        itemElement.dataset.productId = item.id;
        itemElement.querySelector('img').src = item.image;
        itemElement.querySelector('.item-title').textContent = item.name;
        itemElement.querySelector('.quantity').textContent = item.quantity;
        itemElement.querySelector('.item-price').textContent = 
            this.formatPrice(item.price * item.quantity);

        this.cartItems.appendChild(itemElement);
    }

    updateSummary() {
        //update summary amounts
        document.getElementById('cartSubtotal').textContent = this.formatPrice(this.state.subtotal);
        document.getElementById('shippingCost').textContent = this.formatPrice(this.state.shipping);
        document.getElementById('discountAmount').textContent = 
            this.state.discount > 0 ? `-${this.formatPrice(this.state.discount)}` : '$0';
        document.getElementById('cartTotal').textContent = this.formatPrice(this.state.total);
    }

    async applyVoucher() {
        const voucherInput = document.getElementById('voucherCode');
        const code = voucherInput.value.trim();

        if (!code) {
            this.showNotification('Please enter a voucher code', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.API_ENDPOINT}/vouchers/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const data = await response.json();
            
            if (data.valid) {
                this.state.discount = data.amount;
                this.updateCart();
                this.showNotification('Voucher applied successfully!', 'success');
                voucherInput.value = '';
            } else {
                this.showNotification('Invalid voucher code', 'error');
            }
        } catch (error) {
            console.error('Error applying voucher:', error);
            this.showNotification('Failed to apply voucher', 'error');
        }
    }

    async proceedToCheckout() {
        if (this.state.items.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }

        try {
            //create checkout session
            const response = await fetch(`${this.API_ENDPOINT}/checkout/create-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.state)
            });

            const { sessionId } = await response.json();
            
            //redirect to checkout page
            window.location.href = `/checkout.html?session=${sessionId}`;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            this.showNotification('Failed to proceed to checkout', 'error');
        }
    }

    //UI helpers
    openCart() {
        this.cartSidebar.classList.add('active');
        this.cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        this.cartSidebar.classList.remove('active');
        this.cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        const itemCount = this.state.items.reduce((sum, item) => sum + item.quantity, 0);
        
        badge.textContent = itemCount;
        badge.style.display = itemCount > 0 ? 'flex' : 'none';
    }

    formatPrice(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    //state management
    loadCartState() {
        const savedState = localStorage.getItem('cartState');
        if (savedState) {
            this.state = JSON.parse(savedState);
        }
    }

    saveCartState() {
        localStorage.setItem('cartState', JSON.stringify(this.state));
    }

    //animation helpers
    animateItemAddition(itemId) {
        const item = this.cartItems.querySelector(`[data-product-id="${itemId}"]`);
        if (item) {
            item.style.animation = 'none';
            item.offsetHeight; //trigger reflow
            item.style.animation = 'slideIn 0.3s ease forwards';
        }
    }
}

//initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});