import { Component, OnInit, inject } from '@angular/core';
import { AuthenticationService, UserDTO } from '../api-authorization/authentication.service';
import { CommonModule, NgFor, NgForOf } from '@angular/common';
import { ProductsDTO } from '../shopping-cart/cart.service';
import { RouterLink } from '@angular/router';
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

  constructor(public FavProductsService: FavoriteProductsService){}
  
  onPageChange(page: number){
    this.currentPage = page;
    this.updateCurrentProducts();
    this.scrollToTop();
  }
  updateCurrentProducts(){
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.sortedFavoriteProducts = this.favoriteProducts.slice(startIndex, endIndex);
  }
  scrollToTop(){
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  removeFavoriteProduct(userId: string, productId: number){
    const index = this.sortedFavoriteProducts.findIndex(product => product.productId === productId);
    if(index !== -1){
      this.sortedFavoriteProducts.splice(index, 1); // ak je index kladny zaciname mazat od zaciatku a ak je zaporny tak od konca
      this.favoriteProducts = this.favoriteProducts.filter(product => product.productId !== productId);

      this.totalItems = this.favoriteProducts.length;
      if(this.sortedFavoriteProducts.length === 0 && this.currentPage > 0){
        this.currentPage--;
      }
      this.updateCurrentProducts();

      this.FavProductsService.removeFavoriteProduct(userId, productId).subscribe(() => {
      },(error) => {
        console.error(error);
      });
    }
  }
  getCategoryName(category: string): string {
    const categoryMap: { [key: string]: string } = {
        'TELE': 'Teleskopy',
        'MONT': 'Montáže',
        'BINO': 'Binokuláre',
        'OTHR': 'Ostatné'
    };
    return categoryMap[category] || category;
  }
  
  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.FavProductsService.getFavoriteProducts(this.user.id).subscribe(result => {
            this.favoriteProducts = this.sortedFavoriteProducts = result != null ? result : [];
            this.totalItems = this.sortedFavoriteProducts.length;
            this.updateCurrentProducts();
            this.isLoading = false;
          }, (error) => {
            this.isLoading = false;
            console.error(error);
          });
      })
    }
  }
}
export interface FavoriteProductDTO{
  userId: string;
  productId: number;
}