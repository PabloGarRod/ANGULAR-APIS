import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { zip } from 'rxjs';

import {
  CreateProductDTO,
  Product,
  UpdateProductDTO,
} from '../../models/product.model';

import { StoreService } from '../../services/store.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  myShoppingCart: Product[] = [];
  total = 0;
  products: Product[] = [];
  showProductDetail = false;
  productChosen!: Product;

  limit = 10;
  offset = 0;

  statusDetail: 'loading' | 'success' | 'error' | 'init' = 'init';

  constructor(
    private storeService: StoreService,
    private productsService: ProductsService
  ) {
    this.myShoppingCart = this.storeService.getShoppingCart();
  }

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage() {
    this.productsService.getProducts(10, 0).subscribe((data) => {
      this.products = this.products.concat(data);
      this.offset += this.limit;
    });
  }

  onAddToShoppingCart(product: Product) {
    this.storeService.addProduct(product);
    this.total = this.storeService.getTotal();
  }

  toggleProductDetail() {
    this.showProductDetail = !this.showProductDetail;
  }

  onShowDetail(id: string) {
    this.statusDetail = 'loading';
    this.toggleProductDetail();
    this.productsService.getProduct(id).subscribe(
      (data) => {
        this.productChosen = data;
        this.statusDetail = 'success';
      },
      (response) => {
        window.alert(response.message);
        this.statusDetail = 'error';
      }
    );
  }

  readAndUpdate(id: string) {
    this.productsService
      .getProduct(id)
      .pipe(
        switchMap((product) =>
          this.productsService.update(product.id, { title: 'change' })
        )
      )
      .subscribe((data) => {
        console.log(data);
      });
    this.productsService
      .fetchReadAndUpdate(id, { title: 'change' })
      .subscribe((rta) => {
        const read = rta[0];
        const uodate = rta[1];
      });
  }

  createNewProduct() {
    const product: CreateProductDTO = {
      title: 'Zapatillas Guernica classic oldskool',
      price: 69,
      description: `Las Old Skool GUERNICA, ante, lona y caucho de calidad máxima.
        Incluyen puntera reforzada, cuello acolchado para mayor sujeción y
        la distintiva suela waffle de caucho.
        Rinden homenaje a nuestra memoria y el legado de paz que deseamos.
        Porque "El arte es una mentira que nos acerca a la verdad" Pablo Picasso.`,
      images: [
        'https://unonueveocho.es/3743-thickbox_default/zapatillas-guernica-classic-old-skool.jpg',
      ],
      categoryId: 1,
    };
    this.productsService.create(product).subscribe((data) => {
      this.products.unshift(data);
    });
  }

  updateProduct() {
    const changes: UpdateProductDTO = {
      title: 'Producto cambiado',
      description: 'Hemos cambiado este producto',
    };
    const id = this.productChosen.id;
    this.productsService.update(id, changes).subscribe((data) => {
      const productIndex = this.products.findIndex(
        (item) => item.id === this.productChosen.id
      );
      this.products[productIndex] = data;
      this.productChosen = data;
    });
  }

  deleteProduct() {
    const id = this.productChosen.id;
    this.productsService.delete(id).subscribe(() => {
      const productIndex = this.products.findIndex(
        (item) => item.id === this.productChosen.id
      );
      this.products.splice(productIndex, 1);
      this.showProductDetail = false;
    });
  }
}
