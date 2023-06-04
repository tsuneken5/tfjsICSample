import { Component, Input, EventEmitter, Output } from '@angular/core';

import * as constant from '../constant';
import { CanvasService } from '../canvas/canvas.service'

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.css']
})
export class ThumbnailComponent {
  @Input() index!: number;
  @Input() prefix!: string;

  @Output() clickThumbnail = new EventEmitter<number>();

  public thumbnailsLayoutMenus: string[] = constant.THUMBNAIL_LAYOUT_MENUS;
  public thumbnailsLayout: string = constant.DEFAUL_THUMBNAIL_LAYOUT;

  constructor(
    private canvasService: CanvasService
  ) { }

  private drawThumbnails(): void {
    const thumbnailsElem = document.getElementById(this.prefix + '-thumbnails' + this.index) as HTMLDivElement;

    if (this.thumbnailsLayout == this.thumbnailsLayoutMenus[0]) {
      thumbnailsElem.style.overflowX = 'auto';
      thumbnailsElem.style.overflowY = '';
      thumbnailsElem.style.flexDirection = '';
      thumbnailsElem.style.flexWrap = '';
    } else if (this.thumbnailsLayout == this.thumbnailsLayoutMenus[1]) {
      thumbnailsElem.style.overflowX = '';
      thumbnailsElem.style.overflowY = 'auto';
      thumbnailsElem.style.flexDirection = 'row';
      thumbnailsElem.style.flexWrap = 'wrap';
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
  }

  public drawThumbnail(imgStr: string, id: number): void {
    const canvas = document.getElementById(this.prefix + '-thumbnail' + id) as HTMLCanvasElement;
    this.canvasService.drawThumbnail(canvas, imgStr, id);
  }

  public async addThumbnail(imgStr: string, id: number): Promise<void> {
    const canvas: any = document.createElement('canvas') as HTMLCanvasElement;
    const that = this;
    canvas.addEventListener('click', function () {
      that.clickThumbnail.emit(id);
    });

    canvas.id = this.prefix + '-thumbnail' + id;
    canvas.classList.add('thumbnail');
    canvas.style.margin = '5px';

    canvas.style.border = 'thin solid red';

    this.canvasService.drawThumbnail(canvas, imgStr, id);

    const thumbnailsElem = document.getElementById(this.prefix + '-thumbnails' + this.index) as HTMLDivElement;
    thumbnailsElem.prepend(canvas);
  }

  public deleteThumbnail(id: number): void {
    const canvas = document.getElementById(this.prefix + '-thumbnail' + id) as HTMLElement;
    canvas.remove();
  }

  ngAfterViewInit(): void {
    this.drawThumbnails();
  }
}
