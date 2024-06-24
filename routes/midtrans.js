const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');

// Inisialisasi Midtrans client
const snap = new midtransClient.Snap({
    isProduction: false, // Set to true for production
    serverKey: 'SB-Mid-server-tXFXDeXhTKaEXOQmyQsFN4q8',
    clientKey: 'SB-Mid-client-abeEzTnZKSmBXjn1'
});

router.post('/charge', async (req, res) => {
    try {
        const orderDetails = req.body;

        // Create transaction parameters
        const transactionParams = {
            transaction_details: {
                order_id: `order-${Math.floor(Math.random() * 1000000)}`,
                gross_amount: orderDetails.total
            },
            credit_card: {
                secure: true
            },
            customer_details: {
                first_name: 'Customer',
                last_name: 'Name',
                email: 'customer@example.com',
                phone: '081234567890'
            }
        };

        // Create transaction
        const transaction = await snap.createTransaction(transactionParams);

        // Send transaction token to frontend
        res.status(200).json({ token: transaction.token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
