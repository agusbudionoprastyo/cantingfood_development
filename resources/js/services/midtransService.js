import axios from 'axios';

const midtransService = {
    processPayment(form) {
        return axios.post('/midtrans/charge', form);
    }
};

export default midtransService;