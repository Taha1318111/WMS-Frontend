import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product/product';
import { ToastService } from '../../../services/toast-service/toast.service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-product.html',
  styleUrls: ['./create-product.css']
})
export class CreateProduct {
  currentStep = 1;
  totalSteps = 6;
  productForm: FormGroup;
  uomOptions = ['EA', 'KG', 'LB', 'M', 'CM', 'IN', 'FT', 'L', 'ML'];
  yesNoOptions = ['Y', 'N'];
  currentDate: Date = new Date();
  
  //Add these properties
isSubmitting: boolean = false;
  selectedFile!: File;
  imagePreviews: string[] = [];
  isUploading = false;
  isImageLoading: boolean[] = [];
  uploadProgress = 0;
  uploadError = '';
  maxImages = 5;

  constructor(
    private fb: FormBuilder, 
    private apiService: ProductService, 
    private toastService: ToastService,
    private router: Router //  Optional Router
  ) {
    this.productForm = this.fb.group({
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
      inventoryItemTypeId: [''],
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

  // ... (keep all your existing methods exactly as they are: getStepName, nextStep, prevStep, 
  // onFileSelected, onDrop, handleImageUpload, convertToBase64, removeImage, setAsPrimary, 
  // onImageLoad, onImageError, getImageSize, delay, isFieldFilled, getFilledData, getFilledFieldsCount)
getStepName(): string {
    switch(this.currentStep) {
      case 1: return 'Primary Identifiers';
      case 2: return 'Names & Descriptions';
      case 3: return 'Dates & Status';
      case 4: return 'Images';
      case 5: return 'Inventory & Shipping';
      case 6: return 'Pricing & Metadata';
      default: return '';
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }
 
 

 onFileSelected(event: any) {
  const files: FileList = event.target.files;

  if (files && files.length > 0) {
    this.selectedFile = files[0];   // ⭐ FILE STORE KAR RAHE HAI
    this.handleImageUpload(files);
  }
}
onDrop(event: DragEvent) {
  event.preventDefault();

  const files = event.dataTransfer?.files;

  if (files && files.length > 0) {
    this.selectedFile = files[0];   // ⭐ DRAG & DROP FILE STORE
    this.handleImageUpload(files);
  }
}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    // Optional: Add visual feedback for drag over
  }

  async handleImageUpload(files: FileList) {
    // Check max images limit
    if (this.imagePreviews.length + files.length > this.maxImages) {
      this.uploadError = `You can only upload up to ${this.maxImages} images`;
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = '';

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    // Validate files
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} (not an image)`);
      } else if (file.size > 10 * 1024 * 1024) { // 10MB limit
        invalidFiles.push(`${file.name} (exceeds 10MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      this.uploadError = `Invalid files: ${invalidFiles.join(', ')}`;
    }

    // Process valid files
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      // Update progress
      this.uploadProgress = Math.round(((i + 1) / validFiles.length) * 100);
      
      try {
        // Add loading state for this image
        this.isImageLoading.push(true);
        
        // Convert to base64
        const base64 = await this.convertToBase64(file);
        
        // Add to previews
        this.imagePreviews.push(base64);
        
        // Small delay to show loading state (remove in production)
        await this.delay(500);
        
        // Remove loading state for this image
        this.isImageLoading[this.imagePreviews.length - 1] = false;
        
      } catch (error) {
        console.error('Error converting image:', error);
        this.uploadError = `Failed to upload ${file.name}`;
      }
    }

    this.isUploading = false;
    this.uploadProgress = 0;
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  removeImage(index: number) {
    this.imagePreviews.splice(index, 1);
    this.isImageLoading.splice(index, 1);
  }

  setAsPrimary(index: number) {
    if (index === 0) return; // Already primary
    
    // Reorder arrays
    const [movedImage] = this.imagePreviews.splice(index, 1);
    this.imagePreviews.unshift(movedImage);
    
    const [movedLoading] = this.isImageLoading.splice(index, 1);
    this.isImageLoading.unshift(movedLoading);
  }

  onImageLoad(index: number) {
    this.isImageLoading[index] = false;
  }

  onImageError(index: number) {
    this.isImageLoading[index] = false;
    this.uploadError = `Failed to load image ${index + 1}`;
  }

  getImageSize(base64: string): string {
    // Calculate approximate size from base64 string
    const sizeInBytes = (base64.length * 3) / 4;
    if (sizeInBytes < 1024) {
      return Math.round(sizeInBytes) + 'B';
    } else if (sizeInBytes < 1024 * 1024) {
      return (sizeInBytes / 1024).toFixed(1) + 'KB';
    } else {
      return (sizeInBytes / (1024 * 1024)).toFixed(1) + 'MB';
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Helper to check if field is filled
  isFieldFilled(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (typeof value === 'number' && isNaN(value)) return false;
    return true;
  }

  // Get only filled data from form
  getFilledData(): any {
    const formValue = this.productForm.value;
    const filledData: any = {};

    Object.keys(formValue).forEach(key => {
      if (this.isFieldFilled(formValue[key])) {
        filledData[key] = formValue[key];
      }
    });

    return filledData;
  }

  // Get filled fields count
  getFilledFieldsCount(): number {
    return Object.keys(this.getFilledData()).length;
  }
  // ⭐ ONLY THIS METHOD CHANGES - Beautiful Success Message
  onSubmit() {
    // Prevent double submission
    if (this.isSubmitting) {
      this.toastService.info('Product is already being created...');
      return;
    }

    // Validate required fields (optional)
    if (!this.productForm.get('productId')?.value) {
      this.toastService.warning('Please enter Product ID');
      return;
    }

    this.isSubmitting = true;

    const filledData = this.getFilledData();
    const formData = new FormData();

    // Add form fields
    Object.keys(filledData).forEach(key => {
      if (filledData[key] !== null && filledData[key] !== undefined) {
        formData.append(key, filledData[key]);
      }
    });

    // Add image with validation
    if (this.selectedFile) {
      // Validate file size (max 5MB)
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        this.toastService.error('Image size should be less than 5MB');
        this.isSubmitting = false;
        return;
      }
      formData.append("image", this.selectedFile);
    }

    console.log("Submitting product data...");

    this.apiService.createProduct(formData).subscribe({
      next: (response) => {
        console.log("Product created successfully:", response);
        
        // 🎉 OPTION 1: Simple Success Message (Recommended)
        this.toastService.success(
          `✅ Product "${filledData['productName'] || filledData['productId']}" created successfully!`
        );
        
        // Reset form
        this.resetForm();
        
        // Optional: Redirect to products list after 2 seconds
        if (this.router) {
          setTimeout(() => {
            this.router.navigate(['/layout/products']);
          }, 2000);
        }
        
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error("Error creating product:", error);
        
        // ❌ Error Message
        let errorMessage = 'Failed to create product. ';
        if (error.status === 400) {
          errorMessage += 'Please check your input.';
        } else if (error.status === 409) {
          errorMessage += 'Product ID already exists.';
        } else if (error.status === 500) {
          errorMessage += 'Server error. Please try again.';
        } else {
          errorMessage += 'Please try again.';
        }
        
        this.toastService.error(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  resetForm() {
    this.productForm.reset();
    this.currentStep = 1;
    this.selectedFile = null as any;
    this.imagePreviews = [];
  }
}