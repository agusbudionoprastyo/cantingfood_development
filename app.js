const express = require('express');
const bodyParser = require('body-parser');
const midtransRoutes = require('./routes/midtrans'); // Import rute Midtrans

const app = express();

app.use(bodyParser.json()); // Middleware untuk parsing JSON
app.use('/api/midtrans', midtransRoutes); // Gunakan rute Midtrans

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});