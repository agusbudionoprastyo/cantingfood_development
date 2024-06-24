const express = require('express');
const bodyParser = require('body-parser');
const midtransRoutes = require('./routes/midtrans');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/midtrans', midtransRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});