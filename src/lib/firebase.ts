// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB1uBpSw5yea14lqDf20fKK-XMm950NBGw",
    authDomain: "cardaloom-8c511.firebaseapp.com",
    databaseURL: "https://cardaloom-8c511-default-rtdb.firebaseio.com",
    projectId: "cardaloom-8c511",
    storageBucket: "cardaloom-8c511.firebasestorage.app",
    messagingSenderId: "1098943699351",
    appId: "1:1098943699351:web:444c71bf866832419d8cd2",
    measurementId: "G-89EXHJ8FRQ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app); 
const auth = getAuth(app);

export { db, auth };
