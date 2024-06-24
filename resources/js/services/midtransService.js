import axios from 'axios';

const midtransService = {
    processPayment(form) {
        return axios.post('/api/midtrans/payment', form);
    }
};

export default midtransService;