import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAvT3NZ7uW7fTSoarVgxPMSmJRb5y0Fa3o",
  authDomain: "spoolstock-36d74.firebaseapp.com",
  projectId: "spoolstock-36d74",
  storageBucket: "spoolstock-36d74.firebasestorage.app",
  messagingSenderId: "801047542028",
  appId: "1:801047542028:web:aae19ff3c0cff63713f129",
  measurementId: "G-5X7TXLE1B8"
};

export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
