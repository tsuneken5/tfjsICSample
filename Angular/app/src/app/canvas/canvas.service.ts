import { Injectable } from '@angular/core';
import * as constant from '../constant';

import { ImageInfo } from '../models/image-info';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  private imageSize: number = constant.IMAGE_SIZE;
  private thumbnailSize: number = constant.THUMBNAIL_SIZE;

  private dummyId: number = -1

  constructor() { }

  private drawLabel(canvas: HTMLCanvasElement, txt: string, font: string, x: number, y: number): void {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.save();

    ctx.font = font;
    ctx.strokeStyle = 'blue';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white';
    const width = ctx.measureText(txt).width;
    const height = parseInt(ctx.font, 10);
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'blue';
    ctx.fillText(txt, x, y);
    ctx.restore();
    ctx.font = font;

    ctx.restore();
  }

  public drawCenteredLabels(canvas: HTMLCanvasElement, labels: string[], font: string, centerX: number, centerY: number) {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'black';

    let height = parseInt(ctx.font, 10);
    let top = centerY - ((height / 2) * labels.length);
    for (let i = 0; i < labels.length; i++) {
      let width = ctx.measureText(labels[i]).width;
      let x = centerX - (width / 2);
      let y = top + (height * i);

      ctx.fillText(labels[i], x, y);
    }
    ctx.restore();
  }

  public async drawImage(canvas: HTMLCanvasElement, imgStr: string, canvasWidth: number, canvasHeight: number): Promise<void> {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const img = new Image();

    img.src = imgStr;
    return new Promise((resolve, reject) => {
      img.onload = function () {
        let imageWidth = canvasWidth;
        let scale = canvasWidth / img.naturalWidth;
        let imageHeight = img.naturalHeight * scale;
        if (imageHeight > canvasHeight) {
          imageHeight = canvasHeight;
          scale = canvasHeight / img.naturalHeight;
          imageWidth = img.naturalWidth * scale;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const left = (canvasWidth - imageWidth) / 2
        const top = (canvasHeight - imageHeight) / 2

        resolve(ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, left, top, imageWidth, imageHeight));
      };
      img.onerror = (error) => {
        console.log(error);
        reject;
      };
    });
  }

  public async drawThumbnail(canvas: HTMLCanvasElement, imgStr: string, id: number): Promise<void> {
    await this.drawImage(canvas, imgStr, this.thumbnailSize, this.thumbnailSize);

    const txt = id.toString();
    const font = '15px Meiryo';
    this.drawLabel(canvas, txt, font, 0, 0);
  }

  public changeGrayScale(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height) as ImageData;
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);

    canvas.style.border = 'thin solid blue';
  }

  public getImageFromVideoElement(video: HTMLVideoElement, isCutSquare: boolean): ImageInfo {
    const canvas: any = document.createElement('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    let naturalWidth = video.videoWidth;
    let naturalHeight = video.videoHeight;
    let imageWidth = naturalWidth;
    let imageHeight = naturalHeight;

    if (isCutSquare) {
      let cutWidth = 0;
      let cutHeight = 0;
      if (naturalWidth > naturalHeight) {
        cutWidth = (naturalWidth - naturalHeight) / 2;
        naturalWidth = naturalHeight;
      } else {
        cutHeight = (naturalHeight - naturalWidth) / 2;
        naturalHeight = naturalWidth;
      }
      imageWidth = this.imageSize;
      imageHeight = this.imageSize;

      canvas.width = imageWidth;
      canvas.height = imageHeight;

      ctx.drawImage(video, cutWidth, cutHeight, naturalWidth, naturalHeight, 0, 0, imageWidth, imageHeight);
    } else {
      imageWidth = this.imageSize;
      let scale = this.imageSize / video.videoWidth;
      imageHeight = video.videoHeight * scale;
      if (imageHeight > this.imageSize) {
        imageHeight = this.imageSize;
        scale = this.imageSize / video.videoHeight;
        imageWidth = video.videoWidth * scale;
      }
      canvas.width = imageWidth;
      canvas.height = imageHeight;

      ctx.drawImage(video, 0, 0, imageWidth, imageHeight);
    }
    const base64 = canvas.toDataURL('image/png') as string;
    const imageInfo = new ImageInfo(this.dummyId, base64, imageWidth, imageHeight, naturalWidth, naturalHeight);
    return imageInfo
  }

  public async getImageFromBase64(imgStr: string, isCutSquare: boolean): Promise<ImageInfo> {
    const that = this;

    return new Promise((resolve, reject) => {
      const canvas: any = document.createElement('canvas') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.src = imgStr;
      img.onload = function () {
        let naturalWidth = img.naturalWidth;
        let naturalHeight = img.naturalHeight;
        let imageWidth = naturalWidth;
        let imageHeight = naturalHeight;

        if (isCutSquare) {
          let cutWidth = 0;
          let cutHeight = 0;
          if (naturalWidth > naturalHeight) {
            cutWidth = (naturalWidth - naturalHeight) / 2;
            naturalWidth = naturalHeight;
          } else {
            cutHeight = (naturalHeight - naturalWidth) / 2;
            naturalHeight = naturalWidth;
          }
          imageWidth = that.imageSize;
          imageHeight = that.imageSize;

          canvas.width = imageWidth;
          canvas.height = imageHeight;
          ctx.drawImage(img, cutWidth, cutHeight, naturalWidth, naturalHeight, 0, 0, imageWidth, imageHeight);
        } else {
          imageWidth = that.imageSize;
          let scale = that.imageSize / img.naturalWidth;
          imageHeight = img.naturalHeight * scale;
          if (imageHeight > that.imageSize) {
            imageHeight = that.imageSize;
            scale = that.imageSize / img.naturalHeight;
            imageWidth = img.naturalWidth * scale;
          }
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
        }

        const base64 = canvas.toDataURL('image/png') as string;
        const imageInfo = new ImageInfo(that.dummyId, base64, imageWidth, imageHeight, naturalWidth, naturalHeight);

        resolve(imageInfo);
      };
      img.onerror = (error) => {
        console.log(error);
        reject;
      }
    });
  }

  public async getTrainingImage(imgStr: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imgStr;
      img.onload = () => {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
      };
      img.onerror = (error) => {
        console.log(error);
        reject;
      }
    });
  }
}
