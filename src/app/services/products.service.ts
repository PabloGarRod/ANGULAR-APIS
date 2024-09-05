import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { catchError, map, retry } from 'rxjs/operators';
import { throwError, zip } from 'rxjs';
import {
  CreateProductDTO,
  Product,
  UpdateProductDTO,
} from './../models/product.model';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl = `${environment.API_URL}/api/products`;

  constructor(private http: HttpClient) {}

  getProducts(limit?: number, offset?: number) {
    let params = new HttpParams();
    if (limit !== undefined && offset !== undefined) {
      params = params.set('limit', limit);
      params = params.set('offset', offset);
    }
    return this.http
      .get<Product[]>(this.apiUrl, {
        params,
      })
      .pipe(
        retry(3),
        map((products) =>
          products.map((item) => {
            return {
              ...item,
              taxes: item.price * 0.19,
            };
          })
        )
      );
  }

  fetchReadAndUpdate(id: string, dto: UpdateProductDTO) {
    return zip(this.getProduct(id), this.update(id, dto));
  }

  getProduct(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === HttpStatusCode.InternalServerError) {
          return throwError(() => new Error('Algo falla en el servidor'));
        }
        if (error.status === HttpStatusCode.NotFound) {
          return throwError(() => new Error('El producto no existe'));
        }
        if (error.status === HttpStatusCode.Unauthorized) {
          return throwError(() => new Error('No autorizado'));
        }
        return throwError(() => new Error('Algo salió mal'));
      })
    );
  }

  create(dto: CreateProductDTO) {
    return this.http.post<Product>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateProductDTO) {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}
