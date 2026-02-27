import { Routes } from '@angular/router';
import { Login } from './Auth/login/login';
import { Layout} from './Layout/layout/layout';
import { Dashboard } from './Modules/dashboard/dashboard';

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
                path: '', // Empty path means this is the default route
                redirectTo: 'Dashboard', 
                pathMatch: 'full' 
            },
            { 
                path: 'Dashboard', 
                loadComponent: () => import('./Modules/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'Products',
                loadComponent: () => import('./Modules/Product/products/products').then(m => m.Products)
            },
            {path :"CreateProduct",
            loadComponent: () => import('./Modules/Product/create-product/create-product').then(m => m.CreateProduct)
            }
        ]
    },
    { 
        path: '**',
        redirectTo: '' 
    }
];