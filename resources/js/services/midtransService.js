import axios from 'axios';

const midtransService = {
    processPayment(form) {
        return axios.post('/api/midtrans/charge', form);
    }
};

export default midtransService;