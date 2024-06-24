const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');

// Inisialisasi Snap client
let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: 'SB-Mid-server-tXFXDeXhTKaEXOQmyQsFN4q8',
    clientKey: 'SB-Mid-client-abeEzTnZKSmBXjn1'
});

router.post('/charge', (req, res) => {
    const { form } = req.body;

    const parameter = {
        transaction_details: {
            order_id: `order-${new Date().getTime()}`,
            gross_amount: form.total
        },
        credit_card: {
            secure: true
        },
        customer_details: {
            first_name: 'Budi',
            last_name: 'Utomo',
            email: 'budi.utomo@example.com',
            phone: '081234567890'
        }
    };

    snap.createTransaction(parameter)
        .then((transaction) => {
            res.status(200).json({ token: transaction.token });
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});

module.exports = router;