import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import both
import { Router } from '@angular/router';
import { Sidebar } from "../../../Layout/sidebar/sidebar";

@Component({
  selector: 'app-product',
  standalone: true, // If standalone
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // Add them here
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})

export class Products implements OnInit {
  // For modal visibility
  showProductModal = false;
  showDeleteModal = false;
  showViewModal = false;
  
  // For forms
  productForm: FormGroup;
  editProductForm: FormGroup;
  
  // Selected product for various operations
  selectedProduct: any = null;
  selectedProductId: string = '';
  
  // Modal mode
  modalMode: 'add' | 'edit' = 'add';
  
  // Search
  searchTerm: string = '';
  
  // Sample product data
  products = [
    {
      id: 'PRD001',
      name: 'Wooden Dining Table',
      category: 'Dining room',
      price: 499.99,
      stock: 45,
      status: 'In Stock',
      image: 'https://via.placeholder.com/80',
      description: 'Solid wood dining table with 6 chairs'
    },
    {
      id: 'PRD002',
      name: 'Leather Sofa',
      category: 'Living room',
      price: 899.99,
      stock: 12,
      status: 'In Stock',
      image: 'https://via.placeholder.com/80',
      description: 'Premium leather sofa with wooden frame'
    },
    {
      id: 'PRD003',
      name: 'Queen Size Bed',
      category: 'Bedroom',
      price: 699.99,
      stock: 8,
      status: 'Low Stock',
      image: 'https://via.placeholder.com/80',
      description: 'Upholstered bed with storage'
    },
    {
      id: 'PRD004',
      name: 'Office Desk',
      category: 'Office',
      price: 299.99,
      stock: 0,
      status: 'Out of Stock',
      image: 'https://via.placeholder.com/80',
      description: 'Modern office desk with cable management'
    },
    {
      id: 'PRD005',
      name: 'Kids Bunk Bed',
      category: 'Kids',
      price: 449.99,
      stock: 5,
      status: 'In Stock',
      image: 'https://via.placeholder.com/80',
      description: 'Safety bunk bed with guard rails'
    },
    {
      id: 'PRD006',
      name: 'Bathroom Cabinet',
      category: 'Bathroom',
      price: 189.99,
      stock: 23,
      status: 'In Stock',
      image: 'https://via.placeholder.com/80',
      description: 'Water-resistant bathroom cabinet'
    },
    {
      id: 'PRD007',
      name: 'Kitchen Island',
      category: 'Kitchen',
      price: 359.99,
      stock: 7,
      status: 'Low Stock',
      image: 'https://via.placeholder.com/80',
      description: 'Stainless steel kitchen island with storage'
    },
    {
      id: 'PRD008',
      name: 'Outdoor Patio Set',
      category: 'Outdoor',
      price: 599.99,
      stock: 4,
      status: 'Low Stock',
      image: 'https://via.placeholder.com/80',
      description: 'Weather-resistant patio furniture set'
    }
  ];

  constructor(private fb: FormBuilder, private route: Router) {
    // Initialize Add Product Form
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      image: ['']
    });

    // Initialize Edit Product Form
    this.editProductForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      image: ['']
    });
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  // Get filtered products based on search
  get filteredProducts() {
    if (!this.searchTerm) return this.products;
    
    return this.products.filter(product => 
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Open Add Product Modal
  openAddModal() {
    this.route.navigate(['layout/CreateProduct']);
  }

  // Open Edit Product Modal
  openEditModal(product: any) {
    this.modalMode = 'edit';
    this.selectedProduct = product;
    this.editProductForm.patchValue({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
      image: product.image
    });
    this.showProductModal = true;
  }

  // Open View Product Modal (Find by ID)
  openViewModal(product: any) {
    this.selectedProduct = product;
    this.showViewModal = true;
  }

  // Find Product by ID (manual search)
  findProductById() {
    if (!this.selectedProductId) {
      alert('Please enter a product ID');
      return;
    }
    
    const product = this.products.find(p => 
      p.id.toLowerCase() === this.selectedProductId.toLowerCase()
    );
    
    if (product) {
      this.selectedProduct = product;
      this.showViewModal = true;
    } else {
      alert(`Product with ID ${this.selectedProductId} not found`);
    }
  }

  // Open Delete Confirmation Modal
  openDeleteModal(product: any) {
    this.selectedProduct = product;
    this.showDeleteModal = true;
  }

  // Add Product
  addProduct() {
    if (this.productForm.valid) {
      const newProduct = {
        id: 'PRD' + String(this.products.length + 1).padStart(3, '0'),
        ...this.productForm.value,
        status: this.productForm.value.stock > 0 ? 
          (this.productForm.value.stock < 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock'
      };
      
      this.products.unshift(newProduct);
      this.showProductModal = false;
      this.productForm.reset();
      
      // Show success message (you can use a toast notification here)
      alert('Product added successfully!');
    } else {
      this.markFormGroupTouched(this.productForm);
    }
  }

  // Update Product
  updateProduct() {
    if (this.editProductForm.valid) {
      const updatedProduct = this.editProductForm.value;
      const index = this.products.findIndex(p => p.id === updatedProduct.id);
      
      if (index !== -1) {
        updatedProduct.status = updatedProduct.stock > 0 ? 
          (updatedProduct.stock < 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock';
        
        this.products[index] = updatedProduct;
        this.showProductModal = false;
        this.editProductForm.reset();
        
        alert('Product updated successfully!');
      }
    } else {
      this.markFormGroupTouched(this.editProductForm);
    }
  }

  // Delete Product
  deleteProduct() {
    if (this.selectedProduct) {
      const index = this.products.findIndex(p => p.id === this.selectedProduct.id);
      if (index !== -1) {
        this.products.splice(index, 1);
        this.showDeleteModal = false;
        this.selectedProduct = null;
        alert('Product deleted successfully!');
      }
    }
  }

  // Helper method to mark all fields as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Get status badge color
  getStatusBadge(status: string): string {
    switch(status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Close all modals
  closeModals() {
    this.showProductModal = false;
    this.showDeleteModal = false;
    this.showViewModal = false;
    this.selectedProduct = null;
    this.productForm.reset();
    this.editProductForm.reset();
  }
}