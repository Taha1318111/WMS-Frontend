
import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product/product';
import { Router, RouterLink } from "@angular/router";
import { environment } from '../../../../enviroment/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class Products implements OnInit, OnDestroy {
  currentPage = 1;
  limit = 5;
  totalProducts = 0;
  totalPages = 1;
  
  products: any[] = [];
  loading = false;
  selectedProducts: Set<string> = new Set();
  
  imageBaseUrl = environment.imagepath;
  defaultImage = 'assets/default-product.png';
  
  // Image states
  imageLoadingStates: { [key: string]: boolean } = {};
  imageErrorStates: { [key: string]: boolean } = {};
  
  // Track loaded images to prevent duplicate events
   loadedImages = new Set<string>();
  private destroy$ = new Subject<void>();
  
  // Cache for image URLs
  private imageUrlCache = new Map<string, SafeUrl>();

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadProducts(1);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // Clear caches
    this.loadedImages.clear();
    this.imageUrlCache.clear();
  }

  hasValidImage(product: any): boolean {
    return !!(product && 
              product.imageUrl && 
              typeof product.imageUrl === 'string' && 
              product.imageUrl.trim() !== '' &&
              product.imageUrl !== 'null' &&
              product.imageUrl !== 'undefined');
  }

  getSafeImageUrl(product: any): SafeUrl | null {
    if (!this.hasValidImage(product)) {
      return null;
    }

    // Check cache first
    const cacheKey = `${product.productId}_${product.imageUrl}`;
    if (this.imageUrlCache.has(cacheKey)) {
      return this.imageUrlCache.get(cacheKey)!;
    }

    try {
      let fullUrl: string;
      
      if (product.imageUrl.startsWith('http://') || product.imageUrl.startsWith('https://')) {
        fullUrl = product.imageUrl;
      } else {
        const cleanPath = product.imageUrl.replace(/^\/+/, '');
        const baseUrl = this.imageBaseUrl.endsWith('/') ? this.imageBaseUrl : this.imageBaseUrl + '/';
        fullUrl = baseUrl + cleanPath;
      }

      // Validate URL
      new URL(fullUrl);
      
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(fullUrl);
      // Cache the result
      this.imageUrlCache.set(cacheKey, safeUrl);
      
      return safeUrl;
      
    } catch (e) {
      console.warn(`Invalid image URL for ${product.productId}:`, product.imageUrl);
      return null;
    }
  }

  // ✅ FIXED: Image load handler with duplicate prevention
  onImageLoad(productId: string) {
    // Skip if already loaded
    if (this.loadedImages.has(productId)) {
      console.log(`⏭️ Image already loaded for ${productId}, skipping...`);
      return;
    }
    
    console.log(`✅ First time image loaded for product: ${productId}`);
    this.loadedImages.add(productId);
    
    this.ngZone.run(() => {
      this.imageLoadingStates[productId] = false;
      this.imageErrorStates[productId] = false;
      this.cdr.detectChanges();
    });
  }

  // ✅ FIXED: Image error handler with duplicate prevention
  onImageError(productId: string, product: any) {
    // Skip if already handled
    if (this.loadedImages.has(productId) || this.imageErrorStates[productId]) {
      return;
    }
    
    console.error(`❌ Image error for product: ${productId}`);
    this.loadedImages.add(productId); // Mark as handled
    
    this.ngZone.run(() => {
      this.imageLoadingStates[productId] = false;
      this.imageErrorStates[productId] = true;
      this.cdr.detectChanges();
    });
  }
getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  loadProducts(page: number = 1) {
    this.loading = true;
    this.currentPage = page;

    // Clear loaded images for new page
    this.loadedImages.clear();

    this.productService.getAllProducts(page, this.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.ngZone.run(() => {
            if (response?.success && response.data) {
              this.products = response.data;
              this.totalProducts = response.total || 0;
              this.totalPages = response.totalPages || 1;
              
              // Reset states
              this.imageLoadingStates = {};
              this.imageErrorStates = {};
              
              // Initialize only for products with images
              this.products.forEach(product => {
                if (product.productId && this.hasValidImage(product)) {
                  this.imageLoadingStates[product.productId] = true;
                  // Set timeout
                  this.setImageTimeout(product.productId);
                }
              });
              
            } else {
              this.products = [];
              this.totalProducts = 0;
              this.totalPages = 1;
            }

            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          console.error("Error loading products:", error);
          this.ngZone.run(() => {
            this.products = [];
            this.totalProducts = 0;
            this.totalPages = 1;
            this.loading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  setImageTimeout(productId: string) {
    setTimeout(() => {
      // Check if still loading and not already handled
      if (this.imageLoadingStates[productId] && !this.loadedImages.has(productId)) {
        console.log(`⚠️ Image timeout for product: ${productId}`);
        this.loadedImages.add(productId);
        this.imageLoadingStates[productId] = false;
        this.imageErrorStates[productId] = true;
        this.cdr.detectChanges();
      }
    }, 3000); // 3 second timeout
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadProducts(page);
  }

  getStartIndex(): number {
    if (this.totalProducts === 0) return 0;
    return (this.currentPage - 1) * this.limit + 1;
  }

  getEndIndex(): number {
    if (this.totalProducts === 0) return 0;
    return Math.min(this.currentPage * this.limit, this.totalProducts);
  }

  // Selection methods
  toggleAll(event: any) {
    if (event.target.checked) {
      this.products.forEach(p => this.selectedProducts.add(p.productId));
    } else {
      this.selectedProducts.clear();
    }
  }

  toggleSelection(productId: string) {
    if (this.selectedProducts.has(productId)) {
      this.selectedProducts.delete(productId);
    } else {
      this.selectedProducts.add(productId);
    }
  }

  isSelected(productId: string): boolean {
    return this.selectedProducts.has(productId);
  }

  isAllSelected(): boolean {
    return this.products.length > 0 && this.selectedProducts.size === this.products.length;
  }

  // Action methods
  editProduct(productId: string) {
    this.router.navigate(['/layout/edit-product', productId]);
  }

  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => this.loadProducts(this.currentPage),
        error: (error) => console.error('Delete failed:', error)
      });
    }
  }

  viewProductDetails(productId: string) {
    this.router.navigate(['/layout/product', productId]);
  }
}