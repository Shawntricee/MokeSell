//constants
const API_ENDPOINT = ''; //API endpoint here

class CheckoutManager {
    constructor() {
        this.initializeEventListeners();
        this.cartItems = [];
        this.loadCartItems();
        this.updateSummary();
    }

    initializeEventListeners() {
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

        //voucher application
        const voucherButton = document.querySelector('.voucher-input button');
        if (voucherButton) {
            voucherButton.addEventListener('click', () => this.applyVoucher());
        }

        //proceed to payment
        const proceedButton = document.querySelector('.proceed-btn');
        if (proceedButton) {
            proceedButton.addEventListener('click', () => this.proceedToPayment());
        }

        //form validation
        const customerForm = document.querySelector('.customer-form');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => this.validateForm(e));
        }
    }

    async loadCartItems() {
        try {
            const response = await fetch(`${API_ENDPOINT}/cart`);
            if (!response.ok) throw new Error('Failed to load cart items');
            this.cartItems = await response.json();
            this.renderCartItems();
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    renderCartItems() {
        const tbody = document.querySelector('.order-items tbody');
        if (!tbody) return;

        tbody.innerHTML = this.cartItems.map(item => `
            <tr data-id="${item.id}">
                <td class="product-info">
                    <div class="product-image">image</div>
                    <span>${item.name}</span>
                </td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-control">
                        <button class="quantity-btn" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-action="increase">+</button>
                    </div>
                </td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                <td><button class="remove-btn" aria-label="Remove item">×</button></td>
            </tr>
        `).join('');
    }

    handleQuantityChange(event) {
        const button = event.target;
        const action = button.dataset.action;
        const row = button.closest('tr');
        const quantitySpan = row.querySelector('.quantity-control span');
        let quantity = parseInt(quantitySpan.textContent);

        if (action === 'increase') {
            quantity++;
        } else if (action === 'decrease' && quantity > 1) {
            quantity--;
        }

        quantitySpan.textContent = quantity;
        this.updateSummary();
    }

    handleRemoveItem(event) {
        const row = event.target.closest('tr');
        row.remove();
        this.updateSummary();
    }

    getSubtotal() {
        let subtotal = 0;
        document.querySelectorAll('.order-items tbody tr').forEach(row => {
            const price = parseFloat(row.querySelector('td:nth-child(2)').textContent.replace('$', ''));
            const quantity = parseInt(row.querySelector('.quantity-control span').textContent);
            subtotal += price * quantity;
        });
        return subtotal;
    }

    getDeliveryFee() {
        const selectedDelivery = document.querySelector('input[name="delivery-time"]:checked');
        const priceElement = selectedDelivery.closest('.delivery-option').querySelector('.price');
        return parseFloat(priceElement.textContent.replace('$', ''));
    }

    updateSummary() {
        const subtotal = this.getSubtotal();
        const deliveryFee = this.getDeliveryFee();
        const discount = 15; //hardcoded for demo
        const total = subtotal - discount + deliveryFee;

        document.querySelector('.summary-row:nth-child(1) span:last-child').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.summary-row:nth-child(2) span:last-child').textContent = `-$${discount.toFixed(2)}`;
        document.querySelector('.summary-row:nth-child(3) span:last-child').textContent = `$${deliveryFee.toFixed(2)}`;
        document.querySelector('.summary-row.total span:last-child').textContent = `$${total.toFixed(2)}`;
    }

    async applyVoucher() {
        const voucherInput = document.querySelector('.voucher-input input');
        const voucherCode = voucherInput.value.trim();

        try {
            const response = await fetch(`${API_ENDPOINT}/voucher/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: voucherCode })
            });

            const data = await response.json();
            if (data.valid) {
                this.updateSummary();
                this.showMessage('Voucher applied successfully!', 'success');
            } else {
                this.showMessage('Invalid voucher code', 'error');
            }
        } catch (error) {
            console.error('Error applying voucher:', error);
            this.showMessage('Failed to apply voucher', 'error');
        }
    }

    validateForm(event) {
        event.preventDefault();
        const form = event.target;
        const isValid = form.checkValidity();

        if (isValid) {
            this.proceedToPayment();
        } else {
            form.reportValidity();
        }
    }

    async proceedToPayment() {
        const customerForm = document.querySelector('.customer-form');
        if (!customerForm.checkValidity()) {
            customerForm.reportValidity();
            return;
        }

        const formData = new FormData(customerForm);
        const customerData = Object.fromEntries(formData);

        try {
            const response = await fetch(`${API_ENDPOINT}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: this.cartItems,
                    customer: customerData,
                    delivery: {
                        operator: document.querySelector('input[name="operator"]:checked').value,
                        type: document.querySelector('input[name="delivery-time"]:checked').value
                    },
                    payment: {
                        method: 'mastercard',
                        last4: '5987'
                    }
                })
            });

            if (response.ok) {
                const orderData = await response.json();
                window.location.href = `/order-confirmation.html?orderId=${orderData.orderId}`;
            } else {
                this.showMessage('Failed to process payment. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            this.showMessage('An error occurred during checkout', 'error');
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        document.querySelector('.checkout-container').prepend(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

//initialize checkout manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutManager();
});