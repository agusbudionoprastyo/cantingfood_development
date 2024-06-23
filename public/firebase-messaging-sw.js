importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
let config = {
        apiKey: "AIzaSyDM1THQzR4dX-tenZsTk4ufbOpRILlEF9o",
        authDomain: "cantingpartner.firebaseapp.com",
        projectId: "cantingpartner",
        storageBucket: "cantingpartner.appspot.com",
        messagingSenderId: "814275916049",
        appId: "1:814275916049:web:1c92a0f7fb660a93ed5cb0",
        measurementId: "G-S1WEM55KN5",
 };
firebase.initializeApp(config);
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/images/default/firebase-logo.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
