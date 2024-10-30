import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnInit, inject } from '@angular/core';
import { AuthenticationService, UserDTO } from '../api-authorization/authentication.service';
import { CommonModule, NgFor, NgForOf } from '@angular/common';
import { ProductsDTO } from '../shopping-cart/cart.service';
import { Router, RouterLink } from '@angular/router';
import { FavoriteProductsService } from './favorite-products.service';
import { PaginationComponent } from '../pagination/pagination.component';
import { ProductsComponent } from '../products/products.component';

@Component({
  selector: 'app-favorite-products',
  standalone: true,
  imports: [NgFor, NgForOf, RouterLink, PaginationComponent, CommonModule],
  providers: [ProductsComponent],
  templateUrl: './favorite-products.component.html',
  styleUrl: './favorite-products.component.css'
})
export class FavoriteProductsComponent implements OnInit {
  sortedFavoriteProducts: ProductsDTO[] = [];
  favoriteProducts: ProductsDTO[] = [];

  authService = inject(AuthenticationService);
  user: UserDTO;

  currentPage: number = 1;
  totalItems: number = 0;
  limit: number = 3;

  isLoading: boolean = true;

  constructor(public FavProductsService: FavoriteProductsService, private router: Router, private cdr: ChangeDetectorRef){}
  
  onPageChange(page: number){
    this.currentPage = page;
    this.updateCurrentProducts();
  }
  updateCurrentProducts(){
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.sortedFavoriteProducts = this.favoriteProducts;
    this.sortedFavoriteProducts = this.sortedFavoriteProducts.slice(startIndex, endIndex);
  }
  removeFavoriteProduct(userId: string, productId: number){
    const index = this.sortedFavoriteProducts.findIndex(product => product.productId === productId);
    if(index !== -1){
      this.sortedFavoriteProducts.splice(index, 1); // ak je index kladny zaciname mazat od zaciatku a ak je zaporny tak od konca
      this.FavProductsService.removeFavoriteProduct(userId, productId).subscribe(() => {
        console.log("HI")
        this.totalItems = this.favoriteProducts.length;
        this.updateCurrentProducts();
        console.log("HI2")
      });
    }
  }
  
  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.FavProductsService.getFavoriteProducts(this.user.id).subscribe(result => {
            this.sortedFavoriteProducts = result;
            this.favoriteProducts = result;
            this.totalItems = this.sortedFavoriteProducts.length;
            this.updateCurrentProducts();
            this.isLoading = false;
          });
      })
    }else{
      this.router.navigate(['/login']);
    }
  }
}
export interface FavoriteProductDTO{
  userId: string;
  productId: number;
}