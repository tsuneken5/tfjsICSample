import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appIntegerOnly]'
})
export class IntegerOnlyDirective {

  constructor(private elemRef: ElementRef<HTMLInputElement>) { }

  @HostListener("input") onInput(): void {
    const initialValue = this.elemRef.nativeElement.value;
    this.elemRef.nativeElement.value = initialValue.replace(/[^0-9]*/g, "");
  }
}
