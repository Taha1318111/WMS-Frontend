import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {}

  getAllProducts(page: number = 1, limit: number = 5): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetAllProducts?page=${page}&limit=${limit}`);
  }

  createProduct(data: any): Observable<any> {
     return this.http.post(`${this.baseUrl}/CreateProduct`, data);
  }

  updateProduct(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateProduct/${id}`, data);
  }
 
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetProduct/${id}`);
  }
}