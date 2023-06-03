import { Injectable } from '@angular/core';

import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  private divmod(x: number, y: number): number[] {
    if (y === 0) return [];

    let q = Math.floor(x / y);
    let mod = x % y;

    return [q, mod];
  }

  public convertMsToTime(milliseconds: number): string {
    let seconds = Math.floor(milliseconds / 1000);
    let [h, mod] = this.divmod(seconds, 3600);
    let [m, s] = this.divmod(mod, 60);

    if (h == 0) {
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  private orgRound(value: number, base: number): number {
    return Math.round(value / base) * base;
  }

  private getReadableBytes(bytes: number): string {
    if (bytes > 1024) {
      let kbytes = bytes / 1024;
      if (kbytes > 1024) {
        let mbytes = kbytes / 1024;
        if (mbytes > 1024) {
          let gbytes = mbytes / 1024;
          return (this.orgRound(gbytes, 0.01) + 'GB');
        } else {
          return (this.orgRound(mbytes, 0.01) + 'MB');
        }

      } else {
        return (this.orgRound(kbytes, 0.01) + 'KB');
      }
    } else {
      return (this.orgRound(bytes, 0.01) + 'B');
    }
  }

  public getReadableMemory(memory: any): any {
    let readableMemory: any = {};
    for (let key in memory) {
      if (key.indexOf('Bytes') > -1) {
        readableMemory[key] = this.getReadableBytes(memory[key]);
      } else {
        readableMemory[key] = memory[key];
      }
    }

    return readableMemory;
  }

  public printMemory(): void {
    let readableMemory: any = this.getReadableMemory(tf.memory());

    console.log(readableMemory);
  }

  public async sleep(msec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, msec));
  }
}
