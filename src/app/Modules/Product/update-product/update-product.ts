import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product/product';
import { ToastService } from '../../../services/toast-service/toast.service';
import { finalize, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './update-product.html',
  styleUrls: ['./update-product.css']
})
export class UpdateProduct implements OnInit, OnDestroy {
  productId: string = '';
  productForm: FormGroup;
  
  loading = true;
  loadingError = false;
  loadingMessage = 'Loading product...';
  
  isSubmitting = false;
  
  currentStep = 1;
  totalSteps = 6;
  
  originalProduct: any = null; // Stores raw API response
  originalFormValues: any = null; // Stores initial form values
  
  uomOptions = ['EA', 'KG', 'LB', 'M', 'CM', 'IN', 'FT', 'L', 'ML'];
  yesNoOptions = ['Y', 'N'];
  
  selectedFile: File | null = null;
  currentImageUrl: string | null = null;
  imagePreviews: string[] = [];
  
  // Number of changed fields
  changedFieldsCount = 0;
  
  private imageBaseUrl = 'https://eca2-2409-40c4-1176-b2f8-242e-5636-b702-382a.ngrok-free.app';
  private loadingTimeout: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.createForm();
    
    // Subscribe to form changes to update the changed fields count
    this.productForm.valueChanges.subscribe(() => {
      this.updateChangedFieldsCount();
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.toastService.error('Product ID not found');
      this.router.navigate(['/layout/products']);
      return;
    }
    
    this.productId = id;
    this.setLoadingTimeout();
    this.loadProductDetails(this.productId);
  }

  ngOnDestroy(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  setLoadingTimeout(): void {
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.loadingError = true;
        this.loadingMessage = "Loading timeout - please try again";
      }
    }, 10000);
  }

  createForm(): FormGroup {
    return this.fb.group({
      productId: [''],
      productTypeId: [''],
      facilityId: [''],
      productName: [''],
      internalName: [''],
      brandName: [''],
      description: [''],
      longDescription: [''],
      comments: [''],
      introductionDate: [''],
      releaseDate: [''],
      supportDiscontinuationDate: [''],
      salesDiscontinuationDate: [''],
      salesDiscWhenNotAvail: [''],
      isVirtual: [''],
      isVariant: [''],
      imageUrl: [''],
      inventoryMessage: [''],
      requireInventory: [''],
      quantityUomId: [''],
      quantityIncluded: [''],
      piecesIncluded: [''],
      weightUomId: [''],
      productWeight: [''],
      shippingWeight: [''],
      heightUomId: [''],
      productHeight: [''],
      shippingHeight: [''],
      widthUomId: [''],
      productWidth: [''],
      shippingWidth: [''],
      depthUomId: [''],
      productDepth: [''],
      shippingDepth: [''],
      priceDetailText: [''],
      fixedAmount: [''],
      taxable: [''],
      returnable: [''],
      chargeShipping: [''],
      createdByUserIdLogin: [''],
      lastModifiedByUserIdLogin: [''],
      lotIdFilledIn: [''],
      categoryId: ['']
    });
  }

  loadProductDetails(id: string): void {
    console.log('Loading product details for ID:', id);
    
    this.productService.getProductById(id)
      .pipe(
        timeout(15000),
        catchError(error => {
          console.error("API Error:", error);
          return of({ error: true, message: error.message || 'Failed to load product' });
        }),
        finalize(() => {
          this.loading = false;
          if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
          }
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);
          
          if (response?.error) {
            this.loadingError = true;
            this.loadingMessage = response.message || 'Error loading product';
            return;
          }

          // Handle different response structures
          const data = response.data || response;
          console.log('Product data:', data);
          
          // Store the original API response
          this.originalProduct = JSON.parse(JSON.stringify(data));
          
          // Patch the form with the data
          this.productForm.patchValue(data);
          
          // Store the initial form values (BEFORE disabling any fields)
          this.originalFormValues = JSON.parse(JSON.stringify(this.productForm.value));
          console.log('Original form values:', this.originalFormValues);
          
          // Now disable productId field
          this.productForm.get('productId')?.disable();
          
          // Handle image URL
          if (data.imageUrl) {
            console.log('Original imageUrl:', data.imageUrl);
            
            // Check if the URL is complete or needs base URL
            let imageUrl = data.imageUrl;
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = this.getFullImageUrl(imageUrl);
            }
            
            this.currentImageUrl = imageUrl;
            this.imagePreviews = [imageUrl];
          }
          
          // Update changed fields count
          this.updateChangedFieldsCount();
          
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error in subscription:', err);
          this.loadingError = true;
          this.loadingMessage = err.message || 'Error loading product';
          this.cdr.detectChanges();
        }
      });
  }

  // Update the count of changed fields
updateChangedFieldsCount(): void {

  if (!this.originalFormValues) {
    this.changedFieldsCount = 0;
    return;
  }

  const currentValues = this.productForm.getRawValue();
  let count = 0;

  Object.keys(currentValues).forEach(key => {

    const currentVal = currentValues[key];
    const originalVal = this.originalFormValues[key];

    if (String(currentVal) !== String(originalVal)) {
      count++;
    }

  });

  if (this.selectedFile) {
    count++;
  }

  this.changedFieldsCount = count;
}

 getChangedData(): any {

  if (!this.originalFormValues) {
    return {};
  }

  const currentValues = this.productForm.getRawValue();
  const changedData: any = {};

  Object.keys(currentValues).forEach(key => {

    const currentVal = currentValues[key];
    const originalVal = this.originalFormValues[key];

    if (String(currentVal) !== String(originalVal)) {
      changedData[key] = currentVal;
    }

  });

  return changedData;
}

  getFullImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Clean the path
    const cleanPath = path.replace(/^\/+/, '');
    return `${this.imageBaseUrl}/${cleanPath}`;
  }

  getStepName(): string {
    const steps = [
      'Primary Identifiers',
      'Names & Descriptions',
      'Dates & Status',
      'Images',
      'Inventory & Shipping',
      'Pricing & Metadata'
    ];
    return steps[this.currentStep - 1] || '';
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      this.toastService.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > maxSize) {
      this.toastService.error('Image size should be less than 5MB');
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviews = [e.target.result];
      this.updateChangedFieldsCount(); // Update count when file is selected
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreviews = [];
    this.currentImageUrl = null;
    this.productForm.patchValue({ imageUrl: '' });
    this.updateChangedFieldsCount(); // Update count when image is removed
  }

hasChanges(): boolean {

  if (this.selectedFile) return true;

  if (!this.originalFormValues) return false;

  const currentValues = this.productForm.getRawValue();

  for (const key in currentValues) {

    if (String(currentValues[key]) !== String(this.originalFormValues[key])) {
      return true;
    }

  }

  return false;
}

 onSubmit(): void {

  const changedData = this.getChangedData();

  if (Object.keys(changedData).length === 0 && !this.selectedFile) {
    this.toastService.info('No changes detected');
    return;
  }

  this.isSubmitting = true;

  // ⭐ JSON payload send karo (FormData nahi)
  const payload = {
    ...changedData
  };

  this.productService.updateProduct(this.productId, payload)
  .pipe(
    finalize(() => {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    })
  )
  .subscribe({
    next: (response: any) => {

      console.log("Updated Response:", response);

      this.toastService.success('Product updated successfully');

      setTimeout(() => {
        this.router.navigate(['/layout/products']);
      }, 1200);

    },
    error: (error) => {
      console.error('Update failed:', error);
      this.toastService.error('Update failed');
    }
  });

}
  onCancel(): void {
    this.router.navigate(['/layout/products']);
  }

  resetForm(): void {
    if (this.originalFormValues) {
      // Reset form to original values
      this.productForm.patchValue(this.originalFormValues);
      this.selectedFile = null;
      
      if (this.originalProduct?.imageUrl) {
        const imageUrl = this.getFullImageUrl(this.originalProduct.imageUrl);
        this.imagePreviews = [imageUrl];
        this.currentImageUrl = imageUrl;
      } else {
        this.imagePreviews = [];
        this.currentImageUrl = null;
      }
      
      this.updateChangedFieldsCount();
      this.toastService.info('Form reset to original values');
    }
  }
}