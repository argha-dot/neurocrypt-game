import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7B3d_sjaT-DjHaEY-6yqZbuGU72Yu-jk",
  authDomain: "neurocrypt-876bc.firebaseapp.com",
  projectId: "neurocrypt-876bc",
  storageBucket: "neurocrypt-876bc.appspot.com",
  messagingSenderId: "574808979839",
  appId: "1:574808979839:web:128e40a2f5b696e7bb824a",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.database();
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

export default firebase;
