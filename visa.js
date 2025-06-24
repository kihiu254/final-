class VisaPayment {
    constructor() {
        this.config = {
            apiBaseUrl: process.env.VISA_API_URL,
            merchantId: process.env.VISA_MERCHANT_ID,
            publicKey: process.env.VISA_PUBLIC_KEY,
            environment: process.env.NODE_ENV || 'development'
        };
        this.initializeStripe();
    }

    async initializeStripe() {
        try {
            this.stripe = await loadStripe(this.config.publicKey);
            this.elements = this.stripe.elements();
            this.setupCardElement();
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
        }
    }

    setupCardElement() {
        // Create and mount card element
        const cardElement = this.elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });

        cardElement.mount('#card-element');
        this.addCardEventListeners(cardElement);
    }

    addCardEventListeners(cardElement) {
        cardElement.addEventListener('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }

    validateCardDetails(cardData) {
        const errors = [];

        if (!cardData.number || !this.isValidCardNumber(cardData.number)) {
            errors.push('Invalid card number');
        }

        if (!cardData.expiry || !this.isValidExpiry(cardData.expiry)) {
            errors.push('Invalid expiry date');
        }

        if (!cardData.cvc || !this.isValidCVC(cardData.cvc)) {
            errors.push('Invalid CVC');
        }

        return errors;
    }

    isValidCardNumber(number) {
        // Implement Luhn algorithm for card number validation
        return this.luhnCheck(number.replace(/\s+/g, ''));
    }

    luhnCheck(cardNumber) {
        let sum = 0;
        let isEven = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return (sum % 10) === 0;
    }

    isValidExpiry(expiry) {
        const [month, year] = expiry.split('/').map(val => parseInt(val, 10));
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        return (
            month >= 1 && 
            month <= 12 && 
            year >= currentYear && 
            (year > currentYear || month >= currentMonth)
        );
    }

    isValidCVC(cvc) {
        return /^\d{3,4}$/.test(cvc);
    }

    async processPayment(amount, currency, orderRef) {
        try {
            window.loadingManager.showLoading('payment-form', {
                text: 'Processing payment...'
            });

            // Create payment intent
            const paymentIntent = await this.createPaymentIntent(amount, currency, orderRef);

            // Confirm card payment
            const result = await this.stripe.confirmCardPayment(paymentIntent.client_secret, {
                payment_method: {
                    card: this.cardElement,
                    billing_details: {
                        name: document.getElementById('cardholder-name').value
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (result.paymentIntent.status === 'succeeded') {
                await this.handleSuccessfulPayment(result.paymentIntent, orderRef);
                return result.paymentIntent;
            } else {
                throw new Error('Payment failed');
            }

        } catch (error) {
            this.handlePaymentError(error, orderRef);
            throw error;
        } finally {
            window.loadingManager.hideLoading('payment-form');
        }
    }

    async createPaymentIntent(amount, currency, orderRef) {
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount,
                    currency,
                    orderRef,
                    paymentMethod: 'card'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            return await response.json();

        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    async handleSuccessfulPayment(paymentIntent, orderRef) {
        try {
            // Save payment details
            await this.savePaymentDetails(paymentIntent, orderRef);
            
            // Show success message
            window.loadingManager.showNotification('Payment successful!', 'success');
            
            // Redirect to success page
            setTimeout(() => {
                window.location.href = `/checkout/success?order=${orderRef}&method=visa`;
            }, 1500);

        } catch (error) {
            console.error('Error handling successful payment:', error);
        }
    }

    async savePaymentDetails(paymentIntent, orderRef) {
        try {
            const response = await fetch('/api/save-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentIntent,
                    orderRef,
                    method: 'visa'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save payment details');
            }

            return await response.json();

        } catch (error) {
            console.error('Error saving payment details:', error);
            throw error;
        }
    }

    handlePaymentError(error, orderRef) {
        console.error(`Payment failed for order ${orderRef}:`, error);
        window.loadingManager.showNotification(
            'Payment failed: ' + error.message,
            'error'
        );

        // Log failed payment
        this.logFailedPayment(error, orderRef);
    }

    async logFailedPayment(error, orderRef) {
        try {
            await fetch('/api/log-failed-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderRef,
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    method: 'visa'
                })
            });
        } catch (logError) {
            console.error('Error logging failed payment:', logError);
        }
    }

    // Utility method to format amount for display
    formatAmount(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount / 100);
    }

    // Method to handle 3D Secure authentication if required
    async handle3DSecure(paymentIntent) {
        try {
            const result = await this.stripe.handleCardAction(paymentIntent.client_secret);
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            return result;
        } catch (error) {
            console.error('3D Secure authentication failed:', error);
            throw error;
        }
    }
}

// Initialize Visa payment handler
const visa = new VisaPayment();
export default visa;