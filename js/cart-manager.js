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

        //get DOM elements
        this.cartSidebar = document.getElementById('cartSidebar');
        this.cartOverlay = document.getElementById('cartOverlay');
        this.cartItems = document.getElementById('cartItems');
        this.emptyCart = document.getElementById('emptyCart');
        this.itemTemplate = document.getElementById('cartItemTemplate');

        //initialize cart
        this.init();
    }

    async init() {
        try {
            //load cart data from localStorage
            this.loadCartState();
            
            //set up event listeners
            this.setupEventListeners();
            
            //initialize empty cart animation
            this.initEmptyCartAnimation();
            
            //initial render
            this.render();

            console.log('Cart initialized successfully');
        } catch (error) {
            console.error('Error initializing cart:', error);
        }
    }

    setupEventListeners() {
        //close cart button
        const closeBtn = document.querySelector('.close-cart');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCart());
        }

        //cart overlay click
        if (this.cartOverlay) {
            this.cartOverlay.addEventListener('click', () => this.closeCart());
        }

        //voucher application
        const applyVoucherBtn = document.getElementById('applyVoucher');
        if (applyVoucherBtn) {
            applyVoucherBtn.addEventListener('click', () => this.applyVoucher());
        }

        //checkout button
        const checkoutBtn = document.getElementById('checkoutButton');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }

        //event delegation for quantity controls and remove buttons
        if (this.cartItems) {
            this.cartItems.addEventListener('click', (e) => {
                const target = e.target;
                
                if (target.classList.contains('quantity-btn')) {
                    const itemId = target.closest('.cart-item').dataset.productId;
                    const change = target.classList.contains('plus') ? 1 : -1;
                    this.updateQuantity(itemId, change);
                }
                
                if (target.classList.contains('remove-item')) {
                    const itemId = target.closest('.cart-item').dataset.productId;
                    this.removeItem(itemId);
                }
            });
        }

        //add event listener to all "Add to Cart" buttons
        document.getElementById('addToCart')?.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = e.target.getAttribute('data-product-id');
            if (productId) {
                this.addToCart(productId);
            }
        });
    }

    initEmptyCartAnimation() {
        const container = document.getElementById('emptyCartLottie');
        if (container) {
            lottie.loadAnimation({
                container: container,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: '../animations/empty-cart.json'
            });
        }
    }

    async addToCart(productId) {
        console.log('Adding to cart:', productId); //debug log
        
        if (!productId) {
            console.error('No product ID provided');
            return;
        }

        try {
            //get product data from your existing product details
            const productElement = document.querySelector('.product-details');
            if (!productElement) {
                console.error('Product details not found');
                return;
            }

            const product = {
                id: productId,
                title: document.getElementById('productTitle').textContent,
                price: parseFloat(document.getElementById('productPrice').textContent.replace('S$', '')),
                image: document.getElementById('mainImage').src
            };

            //add to cart state
            const existingItem = this.state.items.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.state.items.push({
                    ...product,
                    quantity: 1
                });
            }

            //update cart
            this.updateCart();
            
            //open cart sidebar
            this.openCart();
            
            //show success message
            this.showNotification('Product added to cart!', 'success');

        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Failed to add product to cart', 'error');
        }
    }

    updateQuantity(itemId, change) {
        const item = this.state.items.find(item => item.id === itemId);
        if (!item) return;

        const newQuantity = Math.max(0, item.quantity + change);
        
        if (newQuantity === 0) {
            this.removeItem(itemId);
        } else {
            item.quantity = newQuantity;
            this.updateCart();
        }
    }

    removeItem(itemId) {
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
        
        //calculate final total
        this.state.total = this.state.subtotal + this.state.shipping - this.state.discount;
    }

    render() {
        if (!this.cartItems) return;

        //clear current items
        this.cartItems.innerHTML = '';
        
        if (this.state.items.length === 0) {
            this.emptyCart.style.display = 'flex';
            this.cartItems.style.display = 'none';
        } else {
            this.emptyCart.style.display = 'none';
            this.cartItems.style.display = 'block';
            
            //render each item
            this.state.items.forEach(item => this.renderItem(item));
        }

        //update summary
        this.updateSummary();
    }

    renderItem(item) {
        if (!this.itemTemplate) return;

        const template = this.itemTemplate.content.cloneNode(true);
        const itemElement = template.querySelector('.cart-item');
        
        itemElement.dataset.productId = item.id;
        itemElement.querySelector('img').src = item.image;
        itemElement.querySelector('.item-title').textContent = item.title;
        itemElement.querySelector('.quantity').textContent = item.quantity;
        itemElement.querySelector('.item-price').textContent = this.formatPrice(item.price * item.quantity);

        this.cartItems.appendChild(itemElement);
    }

    updateSummary() {
        document.getElementById('cartSubtotal').textContent = this.formatPrice(this.state.subtotal);
        document.getElementById('shippingCost').textContent = this.formatPrice(this.state.shipping);
        document.getElementById('discountAmount').textContent = 
            this.state.discount > 0 ? `-${this.formatPrice(this.state.discount)}` : '$0';
        document.getElementById('cartTotal').textContent = this.formatPrice(this.state.total);
    }

    openCart() {
        if (this.cartSidebar && this.cartOverlay) {
            this.cartSidebar.classList.add('active');
            this.cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        if (this.cartSidebar && this.cartOverlay) {
            this.cartSidebar.classList.remove('active');
            this.cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
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
        const badges = document.querySelectorAll('.cart-badge');
        const itemCount = this.state.items.reduce((sum, item) => sum + item.quantity, 0);
        
        badges.forEach(badge => {
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'flex' : 'none';
        });
    }

    formatPrice(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    loadCartState() {
        const savedState = localStorage.getItem('cartState');
        if (savedState) {
            this.state = JSON.parse(savedState);
        }
    }

    saveCartState() {
        localStorage.setItem('cartState', JSON.stringify(this.state));
    }
}

//initialize cart manager when dom is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});