import { ImageInfo } from './image-info';

export class LabeledData {
  public id: number = 0;
  public label: string = '';
  public isTrain: boolean = true;
  public imageInfos: ImageInfo[] = [];

  constructor(
    id: number
  ) {
    this.id = id;
    this.label = 'Class ' + id;
  }

  public isTrainNum(): number {
    let count = 0;
    if (this.isTrain) {
      for (let imageInfo of this.imageInfos) {
        if (imageInfo.isTrain) {
          count += 1;
        }
      }
    }
    return count;
  }

  public getMaxImageId(): number {
    let max = 0;
    for (let imageInfo of this.imageInfos) {
      if (imageInfo.id > max) {
        max = imageInfo.id;
      }
    }
    return max;
  }
}
