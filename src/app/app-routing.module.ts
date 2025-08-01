import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'clients',
    loadChildren: () => import('./modules/client/client.module').then(m => m.ClientModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'products',
    loadChildren: () => import('./modules/product/product.module').then(m => m.ProductModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'dues',
    loadChildren: () => import('./modules/due/due.module').then(m => m.DueModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }