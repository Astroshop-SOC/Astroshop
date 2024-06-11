import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf} from '@angular/common';
import { SearchPipe } from './search.pipe';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
  imports: [RouterLink, NgClass, NgIf, NgFor, SearchPipe, FormsModule, StarRatingComponent, PaginationComponent]
})
export class ProductsComponent implements OnInit {
  public productData: ProductsDTO[] = [];
  public ourFilteredProducts: ProductsDTO[] = [];
  public categoryFilteredProducts: ProductsDTO[] = [];
  public sortedProducts: ProductsDTO[] = [];

  searchText: any;
  currentPage: number = 1;
  totalItems: number = 0;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {}

  onPageChange(page: number){
    this.currentPage = page;
    this.updateCurrentProducts();
  }
  updateCurrentProducts(){
    const startIndex = (this.currentPage - 1) * 8;
    const endIndex = startIndex + 8;
    if(this.categoryFilteredProducts.length > 0){
      this.ourFilteredProducts = this.categoryFilteredProducts.slice(startIndex, endIndex);
    }
    else if(this.sortedProducts.length > 0){
      this.ourFilteredProducts = this.sortedProducts.slice(startIndex, endIndex);
    }
    else{
      this.ourFilteredProducts = this.productData.slice(startIndex, endIndex);
    }
  }

  filterProducts(category: string) {
    this.categoryFilteredProducts = this.productData.filter(product => product.productCategory === category);
    this.totalItems = this.categoryFilteredProducts.length;
    this.currentPage = 1;
    this.ourFilteredProducts = this.categoryFilteredProducts;
    this.updateCurrentProducts();
  }

  showAllProducts() {
    this.categoryFilteredProducts = [];
    this.sortedProducts = this.productData;
    this.currentPage = 1;
    this.totalItems = this.productData.length;
    this.updateCurrentProducts();
  }

  filtersProducts() {
    if (!this.searchText) {
      this.ourFilteredProducts = this.productData;
    } else {
      this.ourFilteredProducts = this.productData.filter(product =>
        product.productName.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }

  onSortChange(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'mostExpensive') {
      this.sortData('mexp');
    } else if (selectedValue === 'leastExpensive') {
      this.sortData('lexp');
    } else if (selectedValue === 'isAvailable') {
      this.sortData('isa');
    } else if (selectedValue === 'all') {
      this.sortData('asa');
    } else if (selectedValue === 'top') {
      this.sortData('rew');
    }
  }

  private sortData(order: string) {
    let productsToSort = this.categoryFilteredProducts.length > 0 ? this.categoryFilteredProducts : this.productData;

    if (order === 'lexp') {
      this.sortedProducts = productsToSort.sort((a, b) => a.price - b.price);
    } else if (order === 'mexp') {
      this.sortedProducts = productsToSort.sort((a, b) => b.price - a.price);
    } else if (order === 'isa') {
      this.sortedProducts = productsToSort.filter(product => product.quantity > 0);
      this.categoryFilteredProducts = [];
    } else if (order === 'asa') {
      this.showAllProducts();
    } else if(order === 'rew') {
      this.sortedProducts = productsToSort.filter(product => product.averageStarRating >= 4)
      .sort((a, b) => b.averageStarRating - a.averageStarRating);
      this.categoryFilteredProducts = [];
    }
    this.totalItems = this.sortedProducts.length;
    this.currentPage = 1;
    this.updateCurrentProducts();
  }

  getData() {
    this.http.get<ProductsDTO[]>(this.baseUrl + 'products').subscribe(result => {
      this.productData = result;
      this.filtersProducts();
      this.totalItems = this.productData.length;
      this.updateCurrentProducts();
    }, error => console.error(error));
  }

  ngOnInit(): void {
    this.getData();
  }
}
export interface ProductsDTO {
  productId: number;
  productName: string;
  productDescription: string;
  price: number;
  productCategory: string;
  productImage0: string;
  productImage1: string;
  productImage2: string;
  quantity: number;
  averageStarRating: number;
  reviewsCount: number;
}
