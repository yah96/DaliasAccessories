// firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4eWZQG0KdBi54Znd4SKmfB9y6y9s3J3o",
  authDomain: "daliaaccessories-fa9e8.firebaseapp.com",
  projectId: "daliaaccessories-fa9e8",
  storageBucket: "daliaaccessories-fa9e8.appspot.com",
  messagingSenderId: "3666109493",
  appId: "1:3666109493:web:7f362b6d2d93078d847d7c",
  measurementId: "G-HQBSPJ9PS1"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, auth, firestore, storage, collection, query, where, getDocs };
