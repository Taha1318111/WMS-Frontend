import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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

  // Unit of Measure options
  uomOptions = ['EA', 'KG', 'LB', 'M', 'CM', 'IN', 'FT', 'L', 'ML'];
  
  // Yes/No options
  yesNoOptions = ['Y', 'N'];

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      // Step 1: Primary Identifiers
      productId: [''],
      productTypeId: [''],
      facilityId: [''],
      
      // Step 2: Names & Descriptions
      productName: [''],
      internalName: [''],
      brandName: [''],
      description: [''],
      longDescription: [''],
      comments: [''],
      
      // Step 3: Dates & Status
      introductionDate: [''],
      releaseDate: [''],
      supportDiscontinuationDate: [''],
      salesDiscontinuationDate: [''],
      salesDiscWhenNotAvail: [''],
      isVirtual: [''],
      isVariant: [''],
      
      // Step 4: Images
      smallImageUrl: [''],
      mediumImageUrl: [''],
      largeImageUrl: [''],
      detailImageUrl: [''],
      originalImageUrl: [''],
      
      // Step 5: Inventory & Shipping
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
      
      // Step 6: Pricing & Metadata
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

  onSubmit() {
    const filledData = this.getFilledData();
    console.log('Product Data (Only Filled Fields):', filledData);
    alert('Form submitted! Check console for only filled data.');
  }

  resetForm() {
    this.productForm.reset();
    this.currentStep = 1;
  }
}