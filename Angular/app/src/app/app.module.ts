import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

import { HeaderComponent } from './components/shared/header/header.component';
import { CollectionComponent } from './components/home/collection/collection.component';
import { TrainingComponent } from './components/home/training/training.component';
import { PreviewComponent } from './components/home/preview/preview.component';
import { ThumbnailComponent } from './components/shared/thumbnail/thumbnail.component';
import { OverlayCanvasComponent } from './components/shared/overlay-canvas/overlay-canvas.component';
import { ProjectMenuComponent } from './components/shared/project-menu/project-menu.component';
import { AlartDialogComponent } from './components/shared/alart-dialog/alart-dialog.component';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog.component';

import { IntegerOnlyDirective } from './directive/integer-only.directive';

import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PortalModule } from '@angular/cdk/portal'
import { OverlayModule } from '@angular/cdk/overlay';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'

import { NgChartsModule } from 'ng2-charts';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
import { SummaryComponent } from './components/shared/summary/summary.component';

const dbConfig: DBConfig = {
  name: 'project',
  version: 1,
  objectStoresMeta: [
    {
      store: 'dataset',
      storeConfig: { keyPath: 'project', autoIncrement: false },
      storeSchema: [
        { name: 'project', keypath: 'project', options: { unique: true } },
        { name: 'labeledDatas', keypath: 'labeledDatas', options: { unique: false } },
        { name: 'trainedClassList', keypath: 'trainedClassList', options: { unique: false } },
      ]
    },
    {
      store: 'param',
      storeConfig: { keyPath: 'project', autoIncrement: false },
      storeSchema: [
        { name: 'project', keypath: 'project', options: { unique: true } },
        { name: 'training', keypath: 'training', options: { unique: false } },
        { name: 'augment', keypath: 'augment', options: { unique: false } },
        { name: 'callbacks', keypath: 'callbacks', options: { unique: false } }
      ]
    },
  ]
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CollectionComponent,
    TrainingComponent,
    PreviewComponent,
    ThumbnailComponent,
    OverlayCanvasComponent,
    IntegerOnlyDirective,
    ProjectMenuComponent,
    AlartDialogComponent,
    ConfirmDialogComponent,
    SummaryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    FlexLayoutModule,
    PortalModule,
    OverlayModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    NgChartsModule,
    NgxIndexedDBModule.forRoot(dbConfig)
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [OverlayCanvasComponent]
})
export class AppModule { }
