import { HttpClient } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    username: ["", Validators.required],
    email: ["", Validators.required],
    password: ["", Validators.required],
  });
  errorMessage: string | null = null;

  onSubmit(): void {
    const rawForm = this.form.getRawValue();
    if (!rawForm.username.trim()) {
      this.errorMessage = 'Username cannot be blank.';
      return;
    }
    this.authService
      .register(rawForm.email.trim(), rawForm.username.trim(), rawForm.password)
      .subscribe({
        next: () => {
          // Send user data to API after successful registration
          fetch('https://jsonplaceholder.typicode.com/users', {
            method: 'POST',
            body: JSON.stringify({
              username: rawForm.username,
              email: rawForm.email,
            }),
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
            },
          })
          .then((response) => response.json())
          .then((json) => console.log(json));
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.errorMessage = err.code;
        }
    });
  }

  signInWithGoogle(): void {
    this.authService.signInWithGoogle().subscribe((user) => {
      // Try to get username and email from the current user
      const currentUser = this.authService.currentUserSig();
      if (currentUser) {
        fetch('https://jsonplaceholder.typicode.com/users', {
          method: 'POST',
          body: JSON.stringify({
            username: currentUser.username,
            email: currentUser.email,
          }),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        }).then((response) => response.json())
          .then((json) => console.log(json));
      }
      this.router.navigateByUrl('/');
    });
  }
}