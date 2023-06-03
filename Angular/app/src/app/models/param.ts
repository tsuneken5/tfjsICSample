export class Param {
  public label: string = '';
  public value: string = '';
  constructor(
    label: string,
    value: string = ''
  ) {
    this.label = label;
    if (value == '') {
      this.value = label;
    } else {
      this.value = value;
    }
  }
}
