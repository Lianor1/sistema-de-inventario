import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDN6er-hpqQcFOCjii_BbIaFnzoniez_cU",
  authDomain: "ocmr-erp.firebaseapp.com",
  projectId: "ocmr-erp",
  storageBucket: "ocmr-erp.firebasestorage.app",
  messagingSenderId: "356189948790",
  appId: "1:356189948790:web:834956b2c55ca1054e4857",
  measurementId: "G-EG7DRZH0BX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar los servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
