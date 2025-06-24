class MpesaPayment {
    constructor() {
        this.config = {
            apiBaseUrl: 'https://sandbox.safaricom.co.ke',
            consumerKey: process.env.MPESA_CONSUMER_KEY,
            consumerSecret: process.env.MPESA_CONSUMER_SECRET,
            shortCode: process.env.MPESA_SHORTCODE,
            passKey: process.env.MPESA_PASSKEY
        };
    }

    async initializePayment(amount, phoneNumber, orderRef) {
        try {
            window.loadingManager.showLoading('checkout-form', {
                text: 'Processing M-Pesa payment...'
            });

            // Validate phone number format
            phoneNumber = this.formatPhoneNumber(phoneNumber);
            if (!this.validatePhoneNumber(phoneNumber)) {
                throw new Error('Invalid phone number format');
            }

            // Validate amount
            if (!this.validateAmount(amount)) {
                throw new Error('Invalid amount');
            }

            const timestamp = this.generateTimestamp();
            const password = this.generatePassword(timestamp);

            const paymentData = {
                BusinessShortCode: this.config.shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: this.config.shortCode,
                PhoneNumber: phoneNumber,
                CallBackURL: `${window.location.origin}/api/mpesa/callback`,
                AccountReference: orderRef,
                TransactionDesc: `Payment for order ${orderRef}`
            };

            const accessToken = await this.getAccessToken();
            const response = await this.makePaymentRequest(paymentData, accessToken);

            if (response.ResponseCode === "0") {
                this.startCheckingTransactionStatus(response.CheckoutRequestID, orderRef);
                window.loadingManager.showNotification('Please check your phone to complete the payment', 'info');
            } else {
                throw new Error(response.ResponseDescription || 'Payment initialization failed');
            }

            return response;

        } catch (error) {
            console.error('M-Pesa payment error:', error);
            window.loadingManager.showNotification(error.message, 'error');
            throw error;
        } finally {
            window.loadingManager.hideLoading('checkout-form');
        }
    }

    validatePhoneNumber(phoneNumber) {
        // Kenyan phone number validation
        const regex = /^(?:254|\+254|0)?([17](0|1|2|4|5|6|7|8|9)[0-9]{6})$/;
        return regex.test(phoneNumber);
    }

    validateAmount(amount) {
        return !isNaN(amount) && amount > 0 && amount <= 150000; // M-Pesa limit
    }

    formatPhoneNumber(phoneNumber) {
        // Remove any non-digit characters
        phoneNumber = phoneNumber.replace(/\D/g, '');
        
        // Convert to international format if needed
        if (phoneNumber.length === 9) {
            phoneNumber = '254' + phoneNumber;
        } else if (phoneNumber.length === 10 && phoneNumber.startsWith('0')) {
            phoneNumber = '254' + phoneNumber.slice(1);
        }
        
        return phoneNumber;
    }

    generateTimestamp() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}${hour}${minute}${second}`;
    }

    generatePassword(timestamp) {
        const data = this.config.shortCode + this.config.passKey + timestamp;
        return Buffer.from(data).toString('base64');
    }

    async getAccessToken() {
        try {
            const credentials = Buffer.from(
                `${this.config.consumerKey}:${this.config.consumerSecret}`
            ).toString('base64');

            const response = await fetch(`${this.config.apiBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get access token');
            }

            const data = await response.json();
            return data.access_token;

        } catch (error) {
            console.error('Error getting access token:', error);
            throw error;
        }
    }

    async makePaymentRequest(paymentData, accessToken) {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/mpesa/stkpush/v1/processrequest`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error('Payment request failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Error making payment request:', error);
            throw error;
        }
    }

    startCheckingTransactionStatus(checkoutRequestId, orderRef) {
        let attempts = 0;
        const maxAttempts = 10;
        const interval = 5000; // 5 seconds

        const checkStatus = async () => {
            try {
                const status = await this.queryTransactionStatus(checkoutRequestId);
                
                if (status.ResultCode === "0") {
                    window.loadingManager.showNotification('Payment successful!', 'success');
                    this.handleSuccessfulPayment(orderRef);
                    return;
                }
                
                attempts++;
                
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, interval);
                } else {
                    window.loadingManager.showNotification('Payment verification timeout. Please contact support.', 'warning');
                }
            } catch (error) {
                console.error('Error checking transaction status:', error);
            }
        };

        setTimeout(checkStatus, interval);
    }

    async queryTransactionStatus(checkoutRequestId) {
        try {
            const accessToken = await this.getAccessToken();
            const response = await fetch(`${this.config.apiBaseUrl}/mpesa/stkpushquery/v1/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    BusinessShortCode: this.config.shortCode,
                    Password: this.generatePassword(this.generateTimestamp()),
                    Timestamp: this.generateTimestamp(),
                    CheckoutRequestID: checkoutRequestId
                })
            });

            if (!response.ok) {
                throw new Error('Status query failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Error querying transaction status:', error);
            throw error;
        }
    }

    handleSuccessfulPayment(orderRef) {
        // Update order status and redirect to success page
        const successUrl = `/checkout/success?order=${orderRef}&method=mpesa`;
        window.location.href = successUrl;
    }

    // Utility method for handling failed transactions
    handleFailedTransaction(error, orderRef) {
        console.error(`Payment failed for order ${orderRef}:`, error);
        window.loadingManager.showNotification('Payment failed. Please try again.', 'error');
        
        // Store failed transaction for retry
        const failedTransactions = JSON.parse(localStorage.getItem('failedTransactions') || '[]');
        failedTransactions.push({
            orderRef,
            timestamp: new Date().toISOString(),
            error: error.message
        });
        localStorage.setItem('failedTransactions', JSON.stringify(failedTransactions));
    }
}

// Initialize M-Pesa payment handler
const mpesa = new MpesaPayment();
export default mpesa;