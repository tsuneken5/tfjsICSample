import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import * as constant from '../../../properties/constant';
import { CanvasService } from '../../../services/canvas.service';
import { CommonService } from '../../../services/common.service'
import { ImageInfo } from '../../../models/image-info';

import { OverlayCanvasComponent } from '../overlay-canvas/overlay-canvas.component'

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.css']
})
export class ThumbnailComponent {
  @Input() index!: number;
  @Input() prefix!: string;

  @Output() selectThumbnail = new EventEmitter<{ id: number, index: number }>();
  @Output() clickThumbnail = new EventEmitter<{ id: number, index: number }>();

  public thumbnailsLayoutMenus: string[] = constant.THUMBNAIL_LAYOUT_MENUS;
  public thumbnailsLayout: string = constant.DEFAUL_THUMBNAIL_LAYOUT;

  private trainPrefix: string = constant.PREFIX_TRAINING;
  private collPrefix: string = constant.PREFIX_COLLECTION;

  public overlayRef = this.overlay.create({
    hasBackdrop: true,
    positionStrategy: this.overlay
      .position().global().centerHorizontally().centerVertically()
  });

  constructor(
    private commonService: CommonService,
    private canvasService: CanvasService,
    private overlay: Overlay
  ) { }

  private drawThumbnails(): void {
    const thumbnailsElem = document.getElementById(this.prefix + '-thumbnails' + this.index) as HTMLDivElement;

    switch (this.thumbnailsLayout) {
      case this.thumbnailsLayoutMenus[0]:
        thumbnailsElem.style.overflowX = 'auto';
        thumbnailsElem.style.overflowY = '';
        thumbnailsElem.style.flexDirection = '';
        thumbnailsElem.style.flexWrap = '';
        break;
      case this.thumbnailsLayoutMenus[1]:
        thumbnailsElem.style.overflowX = '';
        thumbnailsElem.style.overflowY = 'auto';
        thumbnailsElem.style.flexDirection = 'row';
        thumbnailsElem.style.flexWrap = 'wrap';
        break;
    }
  }

  public changeLayoutValue(): void {
    const index = this.thumbnailsLayoutMenus.indexOf(this.thumbnailsLayout);
    this.thumbnailsLayout = this.thumbnailsLayoutMenus[(index + 1) % this.thumbnailsLayoutMenus.length];
    this.drawThumbnails();
  }

  public changeGrayScale(id: number) {
    const canvas = document.getElementById(this.prefix + '-thumbnail' + id) as HTMLCanvasElement;
    this.canvasService.changeGrayScale(canvas);
    canvas.style.border = 'thin solid blue';

    const selectBox = document.getElementById(this.prefix + '-thumbnail-select' + id) as HTMLInputElement;
    switch (this.prefix) {
      case this.collPrefix:
        selectBox.checked = true;
        break;
      case this.trainPrefix:
        selectBox.checked = false;
        break;
    }
  }

  public drawThumbnail(imgStr: string, id: number): void {
    const canvas = document.getElementById(this.prefix + '-thumbnail' + id) as HTMLCanvasElement;
    this.canvasService.drawThumbnail(canvas, imgStr, id);
    canvas.style.border = 'thin solid red';

    const selectBox = document.getElementById(this.prefix + '-thumbnail-select' + id) as HTMLInputElement;
    switch (this.prefix) {
      case this.collPrefix:
        selectBox.checked = false;
        break;
      case this.trainPrefix:
        selectBox.checked = true;
        break;
    }
  }

  public detachCanvas(): void {
    this.overlayRef.detach();
  }

  public async attachCanvas(imageInfo: ImageInfo): Promise<void> {
    const canvas: any = document.createElement('canvas') as HTMLCanvasElement;
    canvas.id = this.prefix + '-overlay-canvas';
    this.canvasService.drawImage(canvas, imageInfo.base64, imageInfo.naturalWidth, imageInfo.naturalHeight);

    const that = this;
    canvas.addEventListener('click', function () {
      that.detachCanvas();
    });
    this.commonService.setOverlayCanvas(canvas);

    this.overlayRef.attach(new ComponentPortal(OverlayCanvasComponent));
  }

  public changeChecked(id: number) {
    const selectBox = document.getElementById(this.prefix + '-thumbnail-select' + id) as HTMLInputElement;
    selectBox.checked = !selectBox.checked;

  }

  public async addThumbnail(imgStr: string, id: number): Promise<void> {
    const canvas: any = document.createElement('canvas') as HTMLCanvasElement;
    const that = this;
    canvas.addEventListener('click', function () {
      that.clickThumbnail.emit({ id: id, index: that.index });
    });

    canvas.id = this.prefix + '-thumbnail' + id;
    canvas.classList.add('thumbnail');
    canvas.style.margin = '5px';

    canvas.style.border = 'thin solid red';
    this.canvasService.drawThumbnail(canvas, imgStr, id);

    const selectBox = document.createElement('input') as HTMLInputElement;
    selectBox.type = 'checkbox';
    selectBox.id = this.prefix + '-thumbnail-select' + id;
    switch (this.prefix) {
      case this.collPrefix:
        selectBox.checked = false;
        break;
      case this.trainPrefix:
        selectBox.checked = true;
        break;
    }
    selectBox.style.position = 'absolute';
    selectBox.style.top = '1%';
    selectBox.style.right = '1%';
    selectBox.style.width = '10%';
    selectBox.style.height = selectBox.style.width;

    selectBox.addEventListener('change', function () {
      that.selectThumbnail.emit({ id: id, index: that.index });
    });

    const thumbnailFrame = document.createElement('div') as HTMLDivElement;
    thumbnailFrame.style.position = 'relative';

    thumbnailFrame.prepend(canvas);
    thumbnailFrame.prepend(selectBox);


    const thumbnailsElem = document.getElementById(this.prefix + '-thumbnails' + this.index) as HTMLDivElement;
    thumbnailsElem.prepend(thumbnailFrame);
  }

  public deleteThumbnail(id: number): void {
    const canvas = document.getElementById(this.prefix + '-thumbnail' + id) as HTMLElement;
    canvas.remove();
  }

  ngAfterViewInit(): void {
    this.drawThumbnails();
  }
}
