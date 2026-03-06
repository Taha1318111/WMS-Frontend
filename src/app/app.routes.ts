import { Routes } from '@angular/router';
import { Login } from './Auth/login/login';
import { Layout } from './Layout/layout/layout';

export const routes: Routes = [
  { 
    path: '', 
    component: Login 
  },
  { 
    path: 'layout', 
    component: Layout,
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      { 
        path: 'dashboard', 
        loadComponent: () => 
          import('./Modules/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'products',
        loadComponent: () => 
          import('./Modules/Product/products/products').then(m => m.Products)
      },
      {
        path: 'Createproduct',
        loadComponent: () => 
          import('./Modules/Product/create-product/create-product').then(m => m.CreateProduct)
      }
    ]
  },
  { 
    path: '**',
    redirectTo: '' 
  }
];