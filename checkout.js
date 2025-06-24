// Checkout functionality for LunaLuxe
class CheckoutManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentStep = 1;
        this.steps = ['shipping', 'payment', 'review'];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSteps();
        this.updateOrderSummary();
    }

    setupEventListeners() {
        // Shipping form submission
        document.getElementById('customerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleShippingSubmit(new FormData(e.target));
        });

        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const method = e.currentTarget.dataset.method;
                this.handlePaymentMethodChange(method);
            });
        });

        // Payment form submissions
        document.getElementById('mpesaForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment('mpesa', new FormData(e.target));
        });

        document.getElementById('visaForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment('visa', new FormData(e.target));
        });

        // Step navigation
        document.querySelectorAll('.step-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const step = parseInt(btn.dataset.step);
                if (this.validateStepTransition(step)) {
                    this.navigateToStep(step);
                }
            });
        });
    }

    async handleShippingSubmit(formData) {
        try {
            window.loadingManager.showLoading('shippingForm');

            const shippingData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode')
            };

            const isValid = await this.validateAddress(shippingData);
            if (!isValid) {
                throw new Error('Invalid address. Please check and try again.');
            }

            if (formData.get('saveInfo')) {
                localStorage.setItem('shippingInfo', JSON.stringify(shippingData));
            }

            this.navigateToStep(2);
        } catch (error) {
            window.loadingManager.showNotification(error.message, 'error');
        } finally {
            window.loadingManager.hideLoading('shippingForm');
        }
    }

    async validateAddress(address) {
        try {
            const response = await fetch('/api/validate-address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(address)
            });
            return response.ok;
        } catch (error) {
            console.error('Address validation error:', error);
            return false;
        }
    }

    handlePaymentMethodChange(method) {
        // Highlight selected payment method
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.method === method);
        });

        // Show corresponding form
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = form.id === `${method}Form` ? 'block' : 'none';
        });
        
        this.updateOrderSummary();
    }

    async applyCoupon(code) {
        try {
            window.loadingManager.showLoading('couponForm');
            const response = await fetch('/api/apply-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, total: this.calculateTotal() })
            });

            if (!response.ok) throw new Error('Invalid coupon code');

            const { discount } = await response.json();
            this.appliedDiscount = discount;
            this.updateOrderSummary();
            window.loadingManager.showNotification('Coupon applied successfully!', 'success');
        } catch (error) {
            window.loadingManager.showNotification(error.message, 'error');
        } finally {
            window.loadingManager.hideLoading('couponForm');
        }
    }

    calculateTotal() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = this.calculateShipping();
        const discount = this.appliedDiscount || 0;
        const tax = (subtotal - discount) * 0.16; // 16% VAT
        return { subtotal, shipping, discount, tax, total: subtotal + shipping - discount + tax };
    }

    calculateShipping() {
        // Implement shipping calculation based on location and weight
        return 0; // Free shipping for now
    }

    updateOrderSummary() {
        const summary = document.getElementById('orderSummary');
        if (!summary) return;

        const totals = this.calculateTotal();
        summary.innerHTML = `
            <div class="summary-item">
                <span>Subtotal</span>
                <span>$${totals.subtotal.toFixed(2)}</span>
            </div>
            ${totals.shipping ? `
                <div class="summary-item">
                    <span>Shipping</span>
                    <span>$${totals.shipping.toFixed(2)}</span>
                </div>
            ` : ''}
            ${totals.discount ? `
                <div class="summary-item discount">
                    <span>Discount</span>
                    <span>-$${totals.discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="summary-item">
                <span>Tax (16%)</span>
                <span>$${totals.tax.toFixed(2)}</span>
            </div>
            <div class="summary-item total">
                <span>Total</span>
                <span>$${totals.total.toFixed(2)}</span>
            </div>
        `;
    }

    // Render cart items in checkout sidebar
    renderCheckoutCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsContainer = document.getElementById('checkoutCartItems');
        const subtotalElem = document.getElementById('subtotal');
        const shippingElem = document.getElementById('shipping');
        const taxElem = document.getElementById('tax');
        const totalElem = document.getElementById('total');
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty. <a href="shop.html">Shop now</a>.</p>';
            subtotalElem.textContent = 'KSh 0.00';
            shippingElem.textContent = 'KSh 0.00';
            taxElem.textContent = 'KSh 0.00';
            totalElem.textContent = 'KSh 0.00';
            return;
        }
        let subtotal = 0;
        cartItemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return `<div class="checkout-cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-options">
                        ${item.color ? `<span class='item-color' style='display:inline-block;vertical-align:middle;min-width:18px;min-height:18px;border-radius:50%;background:${item.color};border:1px solid #ccc;margin-right:6px;' title='${item.color}'></span> <span>${item.color}</span>` : ''}
                        ${item.size ? `<span class='item-size'>Size: ${item.size}</span>` : ''}
                    </span>
                    <span class="item-qty">Qty: ${item.quantity}</span>
                </div>
                <span class="item-total">KSh ${(itemTotal).toFixed(2)}</span>
            </div>`;
        }).join('');
        const shipping = subtotal > 5000 ? 0 : 300;
        const tax = subtotal * 0.16;
        const total = subtotal + shipping + tax;
        subtotalElem.textContent = `KSh ${subtotal.toFixed(2)}`;
        shippingElem.textContent = `KSh ${shipping.toFixed(2)}`;
        taxElem.textContent = `KSh ${tax.toFixed(2)}`;
        totalElem.textContent = `KSh ${total.toFixed(2)}`;
    }

    validateStepTransition(step) {
        const currentStep = document.getElementById(`${this.steps[this.currentStep - 1]}Step`);
        if (!currentStep) return true;

        const requiredFields = currentStep.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            window.loadingManager.showNotification('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    navigateToStep(step) {
        this.steps.forEach((stepName, index) => {
            const stepElement = document.getElementById(`${stepName}Step`);
            if (stepElement) {
                stepElement.style.display = index === step - 1 ? 'block' : 'none';
            }
        });

        this.updateProgressIndicator(step);
        this.currentStep = step;
    }

    updateProgressIndicator(step) {
        document.querySelectorAll('.progress-step').forEach((indicator, index) => {
            indicator.classList.toggle('completed', index + 1 < step);
            indicator.classList.toggle('active', index + 1 === step);
        });
    }

    async processPayment(method, formData) {
        try {
            window.loadingManager.showLoading('payment-form', { 
                text: `Processing ${method} payment...` 
            });

            const totals = this.calculateTotal();
            const orderRef = `ORD-${Date.now()}`;
            
            let paymentResult;
            if (method === 'mpesa') {
                paymentResult = await window.mpesa.initializePayment(
                    totals.total,
                    formData.get('mpesaPhone'),
                    orderRef
                );
            } else if (method === 'visa') {
                paymentResult = await window.visa.processPayment(
                    totals.total,
                    'KES',
                    orderRef
                );
            }

            // Save order data
            const orderData = {
                id: orderRef,
                items: this.cart,
                shipping: JSON.parse(localStorage.getItem('shippingInfo')),
                payment: {
                    method,
                    details: paymentResult
                },
                totals,
                status: 'paid',
                date: new Date().toISOString()
            };

            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            localStorage.removeItem('cart');
            
            this.navigateToStep(3); // Go to confirmation
            this.updateConfirmationDetails(orderData);

        } catch (error) {
            window.loadingManager.showNotification(
                `Payment failed: ${error.message}`,
                'error'
            );
            console.error('Payment error:', error);
        } finally {
            window.loadingManager.hideLoading('payment-form');
        }
    }

    updateConfirmationDetails(orderData) {
        document.getElementById('orderNumber').textContent = orderData.id;
        document.getElementById('paymentStatus').textContent = 'Paid';
        document.getElementById('deliveryAddress').textContent = 
            `${orderData.shipping.address}, ${orderData.shipping.city}`;
    }
}

// Initialize checkout manager
document.addEventListener('DOMContentLoaded', () => {
    window.checkout = new CheckoutManager();
    window.checkout.renderCheckoutCart();
    document.addEventListener('DOMContentLoaded', function() {
        // Enhanced form validation and user feedback
        function showNotification(message, type) {
            let notif = document.createElement('div');
            notif.className = `checkout-notification ${type || 'info'}`;
            notif.textContent = message;
            document.body.appendChild(notif);
            setTimeout(() => notif.remove(), 3000);
        }
        // Customer form validation
        var customerForm = document.getElementById('customerForm');
        if (customerForm) {
            customerForm.addEventListener('submit', function(e) {
                let valid = true;
                this.querySelectorAll('[required]').forEach(function(input) {
                    if (!input.value.trim()) {
                        input.classList.add('error');
                        valid = false;
                    } else {
                        input.classList.remove('error');
                    }
                });
                if (!valid) {
                    e.preventDefault();
                    showNotification('Please fill in all required fields.', 'error');
                }
            });
        }
        // Payment form validation
        var mpesaForm = document.getElementById('mpesaForm');
        if (mpesaForm) {
            mpesaForm.addEventListener('submit', function(e) {
                var phone = this.querySelector('#mpesaPhone');
                if (!/^254\d{9}$/.test(phone.value.trim())) {
                    e.preventDefault();
                    phone.classList.add('error');
                    showNotification('Enter a valid M-Pesa phone number (e.g., 2547XXXXXXXX).', 'error');
                } else {
                    phone.classList.remove('error');
                }
            });
        }
        var visaForm = document.getElementById('visaForm');
        if (visaForm) {
            visaForm.addEventListener('submit', function(e) {
                let valid = true;
                var cardNumber = this.querySelector('#cardNumber');
                var expiry = this.querySelector('#expiryDate');
                var cvv = this.querySelector('#cvv');
                if (!/^\d{16}$/.test(cardNumber.value.replace(/\s/g, ''))) {
                    cardNumber.classList.add('error');
                    valid = false;
                } else {
                    cardNumber.classList.remove('error');
                }
                if (!/^\d{2}\/\d{2}$/.test(expiry.value.trim())) {
                    expiry.classList.add('error');
                    valid = false;
                } else {
                    expiry.classList.remove('error');
                }
                if (!/^\d{3}$/.test(cvv.value.trim())) {
                    cvv.classList.add('error');
                    valid = false;
                } else {
                    cvv.classList.remove('error');
                }
                if (!valid) {
                    e.preventDefault();
                    showNotification('Please enter valid card details.', 'error');
                }
            });
        }
        // Show order confirmation details and clear cart
        var orderNumber = document.getElementById('orderNumber');
        var paymentStatus = document.getElementById('paymentStatus');
        var deliveryAddress = document.getElementById('deliveryAddress');
        if (orderNumber && paymentStatus && deliveryAddress) {
            var order = JSON.parse(localStorage.getItem('currentOrder'));
            if (order) {
                orderNumber.textContent = order.id;
                paymentStatus.textContent = order.status === 'paid' ? 'Paid' : 'Pending';
                deliveryAddress.textContent = order.shipping.address + ', ' + order.shipping.city;
                localStorage.removeItem('cart');
            }
        }
    });
});
