import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

import { HeaderComponent } from './header/header.component';
import { CollectionComponent } from './collection/collection.component';
import { TrainingComponent } from './training/training.component';
import { PreviewComponent } from './preview/preview.component';
import { ThumbnailComponent } from './thumbnail/thumbnail.component';
import { OverlayCanvasComponent } from './overlay-canvas/overlay-canvas.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';

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
import { IntegerOnlyDirective } from './directive/integer-only.directive';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CollectionComponent,
    TrainingComponent,
    PreviewComponent,
    ThumbnailComponent,
    OverlayCanvasComponent,
    MessageDialogComponent,
    IntegerOnlyDirective,
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
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [OverlayCanvasComponent]
})
export class AppModule { }
