//constants and configurations
const RESTDB_API_KEY = 'my-restdb-api-key';
const RESTDB_API_URL = 'https://mokesell-d5a1.restdb.io/rest';
const LOTTIE_LOADING_PATH = '../animations/loading.json';

/*checkoutmanager class handles all checkout page functionality*/
class CheckoutManager {
    constructor() {
        //initialize state
        this.cartItems = [];
        this.loadingAnimation = null;
        this.voucherApplied = false;
        
        //initialize the page
        this.init();
    }

    async init() {
        try {
            //initialize loading animation
            this.initializeLoadingAnimation();
            
            //setup event listeners
            this.setupEventListeners();
            
            //load cart items from RestDB
            await this.loadCartItems();
            
            //initialize the summary
            this.updateSummary();
            
            //load saved customer info if available
            this.loadSavedCustomerInfo();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showMessage('Failed to initialize checkout', 'error');
        }
    }

    /*initialize Lottie loading animation*/
    initializeLoadingAnimation() {
        this.loadingAnimation = lottie.loadAnimation({
            container: document.getElementById('loadingAnimation'),
            renderer: 'svg',
            loop: true,
            autoplay: false,
            path: LOTTIE_LOADING_PATH
        });
    }

    /*setup all event listeners for the page*/
    setupEventListeners() {
        //quantity controls
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuantityChange(e));
        });

        //remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleRemoveItem(e));
        });

        //delivery options
        document.querySelectorAll('input[name="delivery-time"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateSummary());
        });

        //apply voucher button
        const voucherButton = document.getElementById('applyVoucher');
        if (voucherButton) {
            voucherButton.addEventListener('click', () => this.applyVoucher());
        }

        //proceed to payment button
        const proceedButton = document.getElementById('proceedToPayment');
        if (proceedButton) {
            proceedButton.addEventListener('click', () => this.handleProceedToPayment());
        }
    }

    /*handle quantity change for cart items*/
    async handleQuantityChange(event) {
        const button = event.target;
        const action = button.dataset.action;
        const row = button.closest('tr');
        const itemId = row.dataset.itemId;
        const quantitySpan = row.querySelector('.quantity-control span');
        let quantity = parseInt(quantitySpan.textContent);

        if (action === 'increase') {
            quantity++;
        } else if (action === 'decrease' && quantity > 1) {
            quantity--;
        }

        try {
            //update quantity in restdb
            await this.updateCartItemQuantity(itemId, quantity);
            
            //update ui
            quantitySpan.textContent = quantity;
            this.updateSummary();
        } catch (error) {
            console.error('Failed to update quantity:', error);
            this.showMessage('Failed to update quantity', 'error');
        }
    }

    /*handle removing items from cart*/
    async handleRemoveItem(event) {
        const row = event.target.closest('tr');
        const itemId = row.dataset.itemId;

        try {
            //remove from restdb
            await this.removeCartItem(itemId);
            
            //remove from ui with animation
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                this.updateSummary();
                this.updateItemCount();
            }, 300);
        } catch (error) {
            console.error('Failed to remove item:', error);
            this.showMessage('Failed to remove item', 'error');
        }
    }

    /*load cart items from restdb*/
    async loadCartItems() {
        try {
            this.showLoading(true);
            const response = await fetch(`${RESTDB_API_URL}/cart`, {
                headers: {
                    'x-apikey': RESTDB_API_KEY
                }
            });

            if (!response.ok) throw new Error('Failed to load cart items');

            this.cartItems = await response.json();
            this.renderCartItems();
        } catch (error) {
            console.error('Error loading cart:', error);
            this.showMessage('Failed to load cart items', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /*apply voucher to the order*/
    async applyVoucher() {
        const voucherInput = document.getElementById('voucherCode');
        const voucherCode = voucherInput.value.trim();

        if (!voucherCode) {
            this.showMessage('Please enter a voucher code', 'error');
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${RESTDB_API_URL}/vouchers?code=${voucherCode}`, {
                headers: {
                    'x-apikey': RESTDB_API_KEY
                }
            });

            if (!response.ok) throw new Error('Invalid voucher');

            const voucher = await response.json();
            if (voucher && voucher.valid) {
                this.voucherApplied = true;
                this.updateSummary();
                this.showMessage('Voucher applied successfully!', 'success');
                voucherInput.disabled = true;
            } else {
                this.showMessage('Invalid or expired voucher', 'error');
            }
        } catch (error) {
            console.error('Error applying voucher:', error);
            this.showMessage('Failed to apply voucher', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /*handle proceed to payment*/
    async handleProceedToPayment() {
        if (!this.validateForm()) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        try {
            this.showLoading(true);

            //get form data
            const formData = new FormData(document.getElementById('customerForm'));
            const customerData = Object.fromEntries(formData);

            //create order in restdb
            const orderData = {
                items: this.cartItems,
                customer: customerData,
                delivery: {
                    operator: document.querySelector('input[name="operator"]:checked').value,
                    type: document.querySelector('input[name="delivery-time"]:checked').value
                },
                voucher: this.voucherApplied ? document.getElementById('voucherCode').value : null,
                total: this.calculateTotal()
            };

            const response = await fetch(`${RESTDB_API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'x-apikey': RESTDB_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Failed to create order');

            const order = await response.json();
            
            //redirect to order confirmation page
            window.location.href = `/html/order-confirmation.html?orderId=${order._id}`;
        } catch (error) {
            console.error('Error processing payment:', error);
            this.showMessage('Failed to process payment', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /*show loading animation*/
    showLoading(show) {
        const loadingContainer = document.getElementById('loadingAnimation');
        if (show) {
            loadingContainer.style.display = 'flex';
            this.loadingAnimation.play();
        } else {
            loadingContainer.style.display = 'none';
            this.loadingAnimation.stop();
        }
    }

    /*show message to user*/
    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    /*update the order summary*/
    updateSummary() {
        const subtotal = this.calculateSubtotal();
        const deliveryFee = this.getDeliveryFee();
        const discount = this.voucherApplied ? 15 : 0;
        const total = subtotal + deliveryFee - discount;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
        document.getElementById('deliveryFee').textContent = `$${deliveryFee.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }

    /*helper functions for calculations*/
    calculateSubtotal() {
        return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getDeliveryFee() {
        const selectedDelivery = document.querySelector('input[name="delivery-time"]:checked');
        return selectedDelivery.closest('.delivery-option').querySelector('.price').textContent.replace('$', '');
    }

    calculateTotal() {
        return this.calculateSubtotal() + this.getDeliveryFee() - (this.voucherApplied ? 15 : 0);
    }

    /*form validation*/
    validateForm() {
        const form = document.getElementById('customerForm');
        return form.checkValidity();
    }
}

//initialize checkout manager when dom is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutManager();
});