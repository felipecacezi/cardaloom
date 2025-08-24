import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const realtimeDb = getDatabase(app);

export { app, auth, realtimeDb };
