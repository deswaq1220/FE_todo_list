// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCTYAdqbytido2r7pMDk1I5CVANxVHj_Vw',
  authDomain: 'todo-c9658.firebaseapp.com',
  projectId: 'todo-c9658',
  storageBucket: 'todo-c9658.firebasestorage.app',
  messagingSenderId: '697808640115',
  appId: '1:697808640115:web:c575b71d98c818aad73206',
  measurementId: 'G-EJ9HP07YER',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const database = getFirestore(app);

// 인증 지속성 설정
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('인증 상태 지속성 설정 완료');
  })
  .catch((error) => {
    console.error('인증 상태 지속성 설정 오류:', error);
  });

export { storage, database, auth };
