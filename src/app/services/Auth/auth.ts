import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../enviroment/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // 🔐 Login API
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  // 🔓 Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ✅ Get Token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Check Logged In
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ✅ Get User
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}