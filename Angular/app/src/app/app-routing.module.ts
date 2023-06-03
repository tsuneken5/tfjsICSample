import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CollectionComponent } from './collection/collection.component';
import { TrainingComponent } from './training/training.component';
import { PreviewComponent } from './preview/preview.component';

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
