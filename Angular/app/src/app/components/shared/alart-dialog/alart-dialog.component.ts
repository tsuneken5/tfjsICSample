import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-alart-dialog',
  templateUrl: './alart-dialog.component.html',
  styleUrls: ['./alart-dialog.component.css']
})
export class AlartDialogComponent {
  response = true;

  constructor(
    // private dialogRef: MatDialogRef<AlartDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
}
