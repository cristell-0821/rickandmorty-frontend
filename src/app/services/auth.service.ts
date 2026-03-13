import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

const app = initializeApp(environment.firebase);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Escucha cambios de sesión automáticamente
    onAuthStateChanged(auth, user => {
      this.currentUserSubject.next(user);
    });
  }

  async loginWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}