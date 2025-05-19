import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { collection, addDoc, getDocs, query, orderBy } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  posts: any[] = [];
  users: any[] = [];
  router = inject(Router);
  firestore = inject(Firestore);
  http = inject(HttpClient);
  showAddPost = false;
  newPost = { title: '', body: '' };
  firebasePosts: any[] = [];
  apiPosts: any[] = [];
  errorMessage: string = '';
  isLoading = true;

  welcomeType: 'default' | 'login' | 'register' = 'default';

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  async ngOnInit() {
    this.isLoading = true;
    this.authService.user$.subscribe(async (user) => {
      if (user && localStorage.getItem('jwt_token')) {
        if (this.authService.lastAuthAction === 'login') {
          this.welcomeType = 'login';
        } else if (this.authService.lastAuthAction === 'register') {
          this.welcomeType = 'register';
        } else {
          this.welcomeType = 'default';
        }
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!,
        });
        // Fetch Firebase posts
        const postsCol = collection(this.firestore, 'posts');
        const q = query(postsCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        this.firebasePosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Fetch API posts
        this.http.get('https://jsonplaceholder.typicode.com/posts')
          .subscribe((json: any) => {
        this.apiPosts = json;
          });
        // Fetch users
        this.http.get('https://jsonplaceholder.typicode.com/users')
          .subscribe((json: any) => {
        this.users = json;
          });
        this.errorMessage = '';
      } else {
        this.welcomeType = 'default';
        this.authService.currentUserSig.set(null);
        this.posts = [];
        this.users = [];
        if (!this.isLoading) {
          this.errorMessage = 'You are not authenticated. Please log in.';
        } else {
          this.errorMessage = '';
        }
      }
      this.isLoading = false;
      // Reset after displaying
      this.authService.lastAuthAction = null;
    });
  }

  getUsername(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  }

  logout() {
    this.authService.logout();
  }

  async addPost() {
    if (!this.newPost.title.trim() || !this.newPost.body.trim()) {
      this.errorMessage = 'Both the title and body are required.';
      return;
    } else if (!this.authService.currentUserSig() || !localStorage.getItem('jwt_token')) {
      this.errorMessage = 'You are not authenticated. Please log in.';
      return;
    }
    this.errorMessage = '';
    const postsCol = collection(this.firestore, 'posts');
    await addDoc(postsCol, {
      title: this.newPost.title,
      body: this.newPost.body,
      userId: this.authService.currentUserSig()?.username || 'Unknown',
      createdAt: new Date()
    });
    // Send post to API as well
    this.http.post('https://jsonplaceholder.typicode.com/posts', {
      title: this.newPost.title,
      body: this.newPost.body,
      userId: this.authService.currentUserSig()?.username || 'Unknown',
    }, {
      headers: { 'Content-type': 'application/json; charset=UTF-8', 'Authorization': localStorage.getItem('jwt_token') || '' }
    })
      .subscribe(json => console.log(json));
    this.newPost = { title: '', body: '' };
    this.showAddPost = false;
    // Refresh Firebase posts
    const q = query(postsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    this.firebasePosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  closeAddPost() {
    this.showAddPost = false;
    this.newPost = { title: '', body: '' };
    if (this.errorMessage == 'Both the title and body are required.') {
      this.errorMessage = '';
    }
  }
}
