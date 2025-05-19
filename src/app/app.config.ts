import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiaUtirM5XSmss7tJy9l6YeO2gbcs-i18",
  authDomain: "meg-test-ff55c.firebaseapp.com",
  projectId: "meg-test-ff55c",
  storageBucket: "meg-test-ff55c.firebasestorage.app",
  messagingSenderId: "555336743635",
  appId: "1:555336743635:web:b5b4dc1190551fa2df3226"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
