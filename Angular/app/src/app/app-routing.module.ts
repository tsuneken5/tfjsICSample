import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CollectionComponent } from './components/home/collection/collection.component';
import { TrainingComponent } from './components/home/training/training.component';
import { PreviewComponent } from './components/home/preview/preview.component';

const routes: Routes = [
  { path: '', redirectTo: 'collection', pathMatch: 'full' },
  { path: 'collection', component: CollectionComponent },
  { path: 'training', component: TrainingComponent },
  { path: 'preview', component: PreviewComponent },
  { path: '**', redirectTo: 'collection' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
