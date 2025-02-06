class CheckoutManager {
    constructor() {
        this.state = {
            items: [],
            subtotal: 0,
            shipping: 22,
            discount: 0,
            total: 0
        };
        this.init();
    }

    async init() {
        try {
            //load cart data from localStorage
            const cartData = localStorage.getItem('cartState');
            if (cartData) {
                const parsedData = JSON.parse(cartData);
                this.state.items = parsedData.items || [];
            }

            //initialize the page
            this.renderOrderItems();
            this.updateSummary();
            this.setupEventListeners();
            //remove any error messages
            document.querySelector('.failed-message')?.remove();
        } catch (error) {
            console.error('Failed to initialize checkout:', error);
            this.showMessage('Failed to initialize checkout', 'error');
        }
    }

    renderOrderItems() {
        const tbody = document.getElementById('orderItemsBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        this.state.items.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.itemId = item.id;
            row.innerHTML = `
                <td class="product-info">
                    <div class="product-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <span>${item.title}</span>
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
            `;
            tbody.appendChild(row);
        });

        //update item count
        const itemCount = document.getElementById('itemCount');
        if (itemCount) {
            itemCount.textContent = this.state.items.length;
        }
    }

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
            radio.addEventListener('change', (e) => {
                this.state.shipping = e.target.value === 'instant' ? 22 : 12;
                this.updateSummary();
            });
        });
        //voucher application
        document.getElementById('applyVoucher')?.addEventListener('click', () => this.applyVoucher());
        //proceed to payment
        document.getElementById('proceedToPayment')?.addEventListener('click', () => this.handleProceedToPayment());
    }

    handleQuantityChange(event) {
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
        //update quantity in state
        const item = this.state.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = quantity;
            //update localStorage
            localStorage.setItem('cartState', JSON.stringify({ items: this.state.items }));
            //update UI
            quantitySpan.textContent = quantity;
            this.updateSummary();
        }
    }

    handleRemoveItem(event) {
        const row = event.target.closest('tr');
        const itemId = row.dataset.itemId;
        //remove from state
        this.state.items = this.state.items.filter(item => item.id !== itemId);
        //update localStorage
        localStorage.setItem('cartState', JSON.stringify({ items: this.state.items }));
        //remove from UI with animation
        row.style.opacity = '0';
        setTimeout(() => {
            row.remove();
            this.updateSummary();
            //update item count
            const itemCount = document.getElementById('itemCount');
            if (itemCount) {
                itemCount.textContent = this.state.items.length;
            }
        }, 300);
    }

    applyVoucher() {
        const voucherInput = document.getElementById('voucherCode');
        const code = voucherInput?.value.trim();
        
        if (!code) {
            this.showMessage('Please enter a voucher code', 'error');
            return;
        }

        //simple voucher validation
        if (code === '15OFF') {
            this.state.discount = 15;
            this.updateSummary();
            this.showMessage('Voucher applied successfully!', 'success');
            voucherInput.disabled = true;
        } else {
            this.showMessage('Invalid voucher code', 'error');
        }
    }

    updateSummary() {
        //calculate subtotal
        this.state.subtotal = this.state.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);
        //update summary fields
        document.getElementById('subtotal').textContent = `$${this.state.subtotal.toFixed(2)}`;
        document.getElementById('discount').textContent = `-$${this.state.discount.toFixed(2)}`;
        document.getElementById('deliveryFee').textContent = `$${this.state.shipping.toFixed(2)}`;
        document.getElementById('total').textContent = 
            `$${(this.state.subtotal + this.state.shipping - this.state.discount).toFixed(2)}`;
    }

    handleProceedToPayment() {
        if (!this.validateForm()) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }
        //get form data
        const formData = new FormData(document.getElementById('customerForm'));
        const customerData = Object.fromEntries(formData);
        //create order data
        const orderData = {
            items: this.state.items,
            customer: customerData,
            delivery: {
                operator: document.querySelector('input[name="operator"]:checked').value,
                type: document.querySelector('input[name="delivery-time"]:checked').value
            },
            discount: this.state.discount,
            shipping: this.state.shipping,
            subtotal: this.state.subtotal,
            total: this.state.subtotal + this.state.shipping - this.state.discount
        };
        //store order in localStorage
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        //clear cart
        localStorage.setItem('cartState', JSON.stringify({ items: [] }));
        //redirect to confirmation page
        window.location.href = '/html/order-confirmation.html';
    }

    validateForm() {
        const form = document.getElementById('customerForm');
        return form.checkValidity();
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.classList.add('fade-out');
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
}

//initialize checkout manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutManager();
});