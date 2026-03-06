// services/toast.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration: number = 4000) {
    this.snackBar.open(message, '✕', {
      duration: duration,
      panelClass: ['success-toast'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  error(message: string, duration: number = 5000) {
    this.snackBar.open(message, '✕', {
      duration: duration,
      panelClass: ['error-toast'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  warning(message: string, duration: number = 4000) {
    this.snackBar.open(message, '✕', {
      duration: duration,
      panelClass: ['warning-toast'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  info(message: string, duration: number = 3000) {
    this.snackBar.open(message, '✕', {
      duration: duration,
      panelClass: ['info-toast'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}   