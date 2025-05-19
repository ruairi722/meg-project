import { inject, Injectable, signal } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user, GoogleAuthProvider, signInWithPopup } from "@angular/fire/auth";
import { from, Observable, switchMap } from "rxjs";
import { UserInterface } from "./user.interface";

@Injectable({
  providedIn: "root"
})

export class AuthService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  lastAuthAction: 'login' | 'register' | null = null;

  register(email: string, username: string, password: string): Observable<void> {
    this.lastAuthAction = 'register';
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(async (credential) => {
      await updateProfile(credential.user, { displayName: username });
      await credential.user.reload();
      const token = await credential.user.getIdToken();
      if (!token) {
        throw new Error("No valid JWT token received at registration.");
      } else {
        localStorage.setItem('jwt_token', token);
      }
    });
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    this.lastAuthAction = 'login';
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(async (credential) => {
      const token = await credential.user.getIdToken();
      if (!token) {
        throw new Error("No valid JWT token received at login.");
      } else {
        localStorage.setItem('jwt_token', token);
      }
    });

    return from(promise);
  }

  signInWithGoogle(): Observable<void> {
    this.lastAuthAction = 'login';
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.firebaseAuth, provider).then(async (credential) => {
      const token = await credential.user.getIdToken();
      if (!token) {
        throw new Error("No valid JWT token received at Google sign-in.");
      } else {
        localStorage.setItem('jwt_token', token);
      }
    });
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth).then(() => {
      localStorage.removeItem('jwt_token');
    });
    return from(promise);
  }
}