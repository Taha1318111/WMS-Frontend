import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  let headers: any = {
    "ngrok-skip-browser-warning": "true"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const clonedReq = req.clone({
    setHeaders: headers
  });

  return next(clonedReq);
};