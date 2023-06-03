export class ImageInfo {
  public id: number = 0;
  public base64: string = ''
  public isTrain: boolean = true;
  public resizeWidth: number = 0;
  public resizeHeight: number = 0;
  public naturalWidth: number = 0;
  public naturalHeight: number = 0;

  constructor(
    id: number,
    base64: string,
    resizeWidth: number = 0,
    resizeHeight: number = 0,
    naturalWidth: number = 0,
    naturalHeight: number = 0
  ) {
    this.id = id;
    this.base64 = base64;
    this.resizeWidth = resizeWidth
    this.resizeHeight = resizeHeight;
    this.naturalWidth = naturalWidth;
    this.naturalHeight = naturalHeight;
  }
}
