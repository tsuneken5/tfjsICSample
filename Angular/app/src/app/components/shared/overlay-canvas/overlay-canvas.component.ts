import { Component } from '@angular/core';

import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-overlay-canvas',
  templateUrl: './overlay-canvas.component.html',
  styleUrls: ['./overlay-canvas.component.css']
})
export class OverlayCanvasComponent {

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    const canvas = this.commonService.getOverlayCanvas();
    const overlayElem = document.getElementById('overlay-area') as HTMLDivElement;

    const width = document.documentElement.clientWidth * 0.8;
    const height = document.documentElement.clientHeight * 0.8;

    canvas.style.maxWidth = width + 'px';
    canvas.style.maxHeight = height + 'px';

    overlayElem.prepend(canvas);
  }
}
