import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataAugmentService {
  private canvas: any = null;
  private ctx: any = null;
  private tmpCanvas: any = null;
  private tmpCtx: any = null;

  constructor() { }

  public initCanvas(): void {
    this.canvas = document.createElement('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    this.tmpCanvas = document.createElement('canvas') as HTMLCanvasElement;
    this.tmpCtx = this.tmpCanvas.getContext('2d') as CanvasRenderingContext2D;
  }

  public destroyCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.tmpCtx.clearRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height)
    this.tmpCanvas.width = 0;
    this.tmpCanvas.height = 0;

    this.canvas.remove();
    this.tmpCanvas.remove();

    this.canvas = null;
    this.ctx = null;
    this.tmpCanvas = null;
    this.tmpCtx = null;
  }


  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.tmpCtx.clearRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height)
    this.tmpCanvas.width = 0;
    this.tmpCanvas.height = 0;
  }

  private setupTmpCanvas(imageData: ImageData): void {
    this.tmpCanvas.width = imageData.width;
    this.tmpCanvas.height = imageData.height;
    this.tmpCtx.putImageData(imageData, 0, 0);
  }

  private hsvToRgb(h: number, s: number, v: number): { r: number, g: number, b: number } {
    if (s === 0) {
      const rgbValue = Math.round(v * 255);
      return {
        r: rgbValue,
        g: rgbValue,
        b: rgbValue
      };
    }

    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;

    let r, g, b;

    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  private rgbToHsv(r: number, g: number, b: number): { h: number, s: number, v: number } {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;

    if (max === 0) {
      s = 0;
    } else {
      s = d / max;
    }

    if (max === min) {
      h = 0; // undefined
    } else {
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }

      h /= 6;
    }

    return {
      h: h * 360,
      s: s,
      v: v
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  public changeHue(imageData: ImageData, hueOffset: number): ImageData {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const hsv = this.rgbToHsv(data[i], data[i + 1], data[i + 2]);
      const newHue = (hsv.h + hueOffset) % 360;

      const { r, g, b } = this.hsvToRgb(newHue, hsv.s, hsv.v);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    return imageData;
  }

  public changeSaturation(imageData: ImageData, saturationOffset: number): ImageData {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const hsv = this.rgbToHsv(data[i], data[i + 1], data[i + 2]);
      const newSaturation = (hsv.s + saturationOffset) % 360;

      const { r, g, b } = this.hsvToRgb(hsv.h, newSaturation, hsv.v);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    return imageData;
  }

  public changeBrightness(imageData: ImageData, brightnessOffset: number): ImageData {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const hsv = this.rgbToHsv(data[i], data[i + 1], data[i + 2]);
      const newBrightness = (hsv.v + brightnessOffset) % 360;

      const { r, g, b } = this.hsvToRgb(hsv.h, hsv.s, newBrightness);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    return imageData;
  }

  public changeContrast(imageData: ImageData, contrastFactor: number): ImageData {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let red = data[i];
      let green = data[i + 1];
      let blue = data[i + 2];

      data[i] = this.clamp((red - 128) * contrastFactor + 128, 0, 255);
      data[i + 1] = this.clamp((green - 128) * contrastFactor + 128, 0, 255);
      data[i + 2] = this.clamp((blue - 128) * contrastFactor + 128, 0, 255);
    }

    return imageData;
  }

  public grayscale(imageData: ImageData): ImageData {
    let data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }

    return imageData;
  }

  private getRandomGaussianNoise(mean: number, stddev: number): number {
    let u1 = 1 - Math.random();
    let u2 = 1 - Math.random();

    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    return mean + stddev * z0;
  }

  public noiseInjection(imageData: ImageData, sigma: number): ImageData {
    let data = imageData.data;

    let mean = 0;
    let stddev = sigma * 100;
    for (let i = 0; i < data.length; i += 4) {
      let noise = this.getRandomGaussianNoise(mean, stddev);

      data[i] = this.clamp(data[i] + noise, 0, 255);
      data[i + 1] = this.clamp(data[i + 1] + noise, 0, 255);
      data[i + 2] = this.clamp(data[i + 2] + noise, 0, 255);
    }

    return imageData;
  }

  private createGaussianKernel(size: number, sigma: number): number[][] {
    let kernel = [];
    let sum = 0;

    for (let y = -size; y <= size; y++) {
      let row = [];
      for (let x = -size; x <= size; x++) {
        let exponent = -((x * x + y * y) / (2 * sigma * sigma));
        let value = Math.exp(exponent) / (2 * Math.PI * sigma * sigma);
        row.push(value);
        sum += value;
      }
      kernel.push(row);
    }
    for (let y = 0; y < kernel.length; y++) {
      for (let x = 0; x < kernel[y].length; x++) {
        kernel[y][x] /= sum;
      }
    }

    return kernel;
  }

  public blurFilter(imageData: ImageData, radius: number = 5): ImageData {
    let data = imageData.data;

    let sigma = radius / 3;
    let kernelSize = radius * 2 + 1;
    let kernel = this.createGaussianKernel(kernelSize, sigma);

    let tempData = new Uint8ClampedArray(data.length);

    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        let rTotal = 0;
        let gTotal = 0;
        let bTotal = 0;
        let weightTotal = 0;

        for (let j = -radius; j <= radius; j++) {
          for (let i = -radius; i <= radius; i++) {
            let offsetX = x + i;
            let offsetY = y + j;

            if (offsetX >= 0 && offsetX < imageData.width && offsetY >= 0 && offsetY < imageData.height) {
              let kernelValue = kernel[j + radius][i + radius];

              let pixelIndex = (offsetY * imageData.width + offsetX) * 4;
              let r = data[pixelIndex];
              let g = data[pixelIndex + 1];
              let b = data[pixelIndex + 2];

              rTotal += r * kernelValue;
              gTotal += g * kernelValue;
              bTotal += b * kernelValue;
              weightTotal += kernelValue;
            }
          }
        }

        let resultIndex = (y * imageData.width + x) * 4;
        tempData[resultIndex] = Math.round(rTotal / weightTotal);
        tempData[resultIndex + 1] = Math.round(gTotal / weightTotal);
        tempData[resultIndex + 2] = Math.round(bTotal / weightTotal);
        tempData[resultIndex + 3] = data[resultIndex + 3];
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i] = tempData[i];
    }

    return imageData;
  }

  public cutOut(imageData: ImageData, cutWidth: number, cutHeight: number, x: number, y: number): ImageData {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;

    this.ctx.putImageData(imageData, 0, 0);

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(x, y, cutWidth, cutHeight);

    const result = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.clearCanvas();
    return result;
  }

  public crop(imageData: ImageData, imageWidth: number, imageHeight: number, x: number, y: number): ImageData {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;

    this.setupTmpCanvas(imageData);

    this.ctx.drawImage(this.tmpCanvas, x, y, imageWidth, imageHeight, 0, 0, this.canvas.width, this.canvas.height);

    const result = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.clearCanvas();
    return result;
  }

  public shear(imageData: ImageData, shearRange: number): ImageData {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.setupTmpCanvas(imageData);
    this.ctx.setTransform(1, 0, shearRange, 1, 0, 0);

    this.ctx.drawImage(this.tmpCanvas, 0, 0, this.canvas.width, this.canvas.height);

    const result = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.clearCanvas();
    return result;
  }

  public rotation(imageData: ImageData, angle: number): ImageData {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.setupTmpCanvas(imageData);

    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate(angle * (Math.PI / 180));
    this.ctx.drawImage(this.tmpCanvas, -this.canvas.width / 2, -this.canvas.height / 2);

    const result = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.clearCanvas();
    return result;
  }

  public shift(imageData: ImageData, widthSift: number, heightSift: number): ImageData {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.setupTmpCanvas(imageData);

    let sx = 0;
    let sy = 0;
    let sw = imageData.width;
    let sh = imageData.height;
    let dx = 0;
    let dy = 0;
    let dw = this.canvas.width;
    let dh = this.canvas.height;

    if (widthSift > 0) {
      sw = sw - widthSift;
      dx = widthSift;
      dw = sw;
    } else {
      sx = -widthSift;
      sw = sw + widthSift;
      dw = sw;
    }

    if (heightSift > 0) {
      sh = sh - heightSift;
      dy = heightSift;
      dh = sh;
    } else {
      sy = -heightSift;
      sh = sh + heightSift;
      dh = sh;
    }

    this.ctx.drawImage(this.tmpCanvas, sx, sy, sw, sh, dx, dy, dw, dh);

    const result = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.clearCanvas();
    return result;
  }

  public flip(imageData: ImageData, horizontal: number, vertical: number): ImageData {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.setupTmpCanvas(imageData);

    this.ctx.scale(horizontal, vertical);
    if (horizontal == -1 && vertical == -1) {
      this.ctx.translate(-this.canvas.width, -this.canvas.height);
    } else if (horizontal == -1) {
      this.ctx.translate(-this.canvas.width, 0);
    } else if (vertical == -1) {
      this.ctx.translate(0, -this.canvas.height);
    }
    this.ctx.drawImage(this.tmpCanvas, 0, 0, this.canvas.width, this.canvas.height);

    const result = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.clearCanvas();
    return result;
  }
}
