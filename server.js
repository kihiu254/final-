// Example Node.js/Express backend for payment API integration
// Install dependencies: express, axios, dotenv, stripe
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
app.use(express.json());

// M-Pesa Daraja API integration (sandbox)
app.post('/api/payments/mpesa', async (req, res) => {
  const { phone, amount } = req.body;
  // TODO: Implement OAuth, password, and STK Push logic securely
  // This is a placeholder for demo only
  try {
    // Example: send STK Push request to Safaricom
    // const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', ...)
    // For demo, always succeed
    res.json({ success: true, message: 'M-Pesa payment simulated (replace with real API call).' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'M-Pesa payment failed.' });
  }
});

// Visa (Stripe) integration
app.post('/api/payments/visa', async (req, res) => {
  const { cardNumber, expiryDate, cvv, cardName, amount } = req.body;
  try {
    // For real use, tokenize card and create paymentIntent with Stripe
    // This is a placeholder for demo only
    // const paymentIntent = await stripe.paymentIntents.create({ ... })
    res.json({ success: true, message: 'Visa payment simulated (replace with real API call).' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Visa payment failed.' });
  }
});

app.listen(3000, () => console.log('Payment API server running on port 3000'));
