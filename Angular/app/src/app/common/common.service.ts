import { Injectable } from '@angular/core';

import * as constant from '../constant';

import { LabeledData } from '../models/labeled-data';
import { ReportLog } from '../models/report-log';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private labeledDatas: LabeledData[] = [];

  // training parameter
  private baseModel: string = constant.DEFAULT_BASE_MODEL;
  private epochs: number = constant.DEFAULT_EPOCHS;
  private batchSize: number = constant.DEFAULT_BACTH_SIZE;
  private learningRate: number = constant.DEFAULT_LEARNING_RATE;
  private validationSplit: number = constant.DEFAULT_VALIDATION_SPLIT;

  // data augment parameter
  private augmentRateFlag: boolean = constant.DEFAULT_AUGMENT_RATE_FLAG;
  private augmentRate: number = constant.DEFAULT_AUGMENT_RATE;
  private randomHueFlag: boolean = constant.DEFAULT_RANDOM_HUE_FLAG;
  private randomHue: number = constant.DEFAULT_RANDOM_HUE;
  private randomSaturationFlag: boolean = constant.DEFAULT_RANDOM_SATURATION_FLAG;
  private randomSaturation: number = constant.DEFAULT_RANDOM_SATURATION;
  private randomBrightnessFlag: boolean = constant.DEFAULT_RANDOM_BRIGHTNESS_FLAG;
  private randomBrightness: number = constant.DEFAULT_RANDOM_BRIGHTNESS;
  private randomContrastFlag: boolean = constant.DEFAULT_RANDOM_CONTRAST_FLAG;
  private randomContrast: number = constant.DEFAULT_RANDOM_CONTRAST;
  private grayscaleFlag: boolean = constant.DEFAULT_GRAYSCALE_FLAG;
  private noiseInjectionFlag: boolean = constant.DEFAULT_NOISE_INJECTION_FLAG;
  private noiseInjection: number = constant.DEFAULT_NOISE_INJECTION;
  private blurFilterFlag: boolean = constant.DEFAULT_BLUR_FILTER_FLAG;
  private blurFilter: number = constant.DEFAULT_BLUR_FILTER;
  private cutOutFlag: boolean = constant.DEFAULT_CUT_OUT_FLAG;
  private cutOutRange: number = constant.DEFAULT_CUT_OUT_RANGE;
  private cropFlag: boolean = constant.DEFAULT_CROP_FLAG;
  private cropRange: number = constant.DEFAULT_CROP_RANGE;
  private shearFlag: boolean = constant.DEFAULT_SHEAR_FLAG;
  private shearRange: number = constant.DEFAULT_SHEAR_RANGE;
  private rotationFlag: boolean = constant.DEFAULT_ROTATION_FLAG;
  private rotationRange: number = constant.DEFAULT_ROTATION_RANGE;
  private widthShiftFlag: boolean = constant.DEFAULT_WIDTH_SHIFT_FLAG;
  private widthShiftRange: number = constant.DEFAULT_WIDTH_SHIFT_RANGE;
  private heightShiftFlag: boolean = constant.DEFAULT_HEIGHT_SHIFT_FLAG;
  private heightShiftRange: number = constant.DEFAULT_HEIGHT_SHIFT_RANGE;
  private horizontalFlipFlag: boolean = constant.DEFAULT_HORIZONTAL_FLIP_FLAG;
  private verticalFlipFlag: boolean = constant.DEFAULT_VERTICAL_FLIP_FLAG;


  private trainedClassIndex: number[] = [];
  private reportLogs: ReportLog[] = [];
  private history: any = null;

  private overlayCanvas: any = null;

  constructor() {
    this.labeledDatas = [];
    for (let i = 0; i < constant.DEFAULT_LABELED_DATAS_SIZE; i++) {
      this.labeledDatas.push(new LabeledData(i + 1));
    }
  }

  public getLabeledDatas(): LabeledData[] {
    return this.labeledDatas.slice();
  }

  public setLabeledDatas(labeledDatas: LabeledData[]): void {
    this.labeledDatas = labeledDatas.slice();
  }

  public getBaseModel(): string {
    return this.baseModel;
  }

  public setBaseModel(baseModel: string): void {
    this.baseModel = baseModel;
  }

  public getEpochs(): number {
    return this.epochs;
  }

  public setEpochs(epochs: number): void {
    this.epochs = epochs;
  }

  public getBatchSize(): number {
    return this.batchSize;
  }

  public setBatchSize(batchSize: number): void {
    this.batchSize = batchSize;
  }

  public getLearningRate(): number {
    return this.learningRate;
  }

  public setLearningRate(learningRate: number): void {
    this.learningRate = learningRate;
  }

  public getValidationSplit(): number {
    return this.validationSplit;
  }

  public setValidationSplit(validationSplit: number): void {
    this.validationSplit = validationSplit;
  }

  public getAugmentRateFlag(): boolean {
    return this.augmentRateFlag;
  }

  public setAugmentRateFlag(augmentRateFlag: boolean): void {
    this.augmentRateFlag = augmentRateFlag;
  }

  public getAugmentRate(): number {
    return this.augmentRate;
  }

  public setAugmentRate(augmentRate: number): void {
    this.augmentRate = augmentRate;
  }

  public getRandomHueFlag(): boolean {
    return this.randomHueFlag;
  }

  public setRandomHueFlag(randomHueFlag: boolean): void {
    this.randomHueFlag = randomHueFlag;
  }

  public getRandomHue(): number {
    return this.randomHue;
  }

  public setRandomHue(randomHue: number): void {
    this.randomHue = randomHue;
  }

  public getRandomSaturationFlag(): boolean {
    return this.randomSaturationFlag;
  }

  public setRandomSaturationFlag(randomSaturationFlag: boolean): void {
    this.randomSaturationFlag = randomSaturationFlag;
  }

  public getRandomSaturation(): number {
    return this.randomSaturation;
  }

  public setRandomSaturation(randomSaturation: number): void {
    this.randomSaturation = randomSaturation;
  }

  public getRandomBrightnessFlag(): boolean {
    return this.randomBrightnessFlag;
  }

  public setRandomBrightnessFlag(randomBrightnessFlag: boolean): void {
    this.randomBrightnessFlag = randomBrightnessFlag;
  }

  public getRandomBrightness(): number {
    return this.randomBrightness;
  }

  public setRandomBrightness(randomBrightness: number): void {
    this.randomBrightness = randomBrightness;
  }

  public getRandomContrastFlag(): boolean {
    return this.randomContrastFlag;
  }

  public setRandomContrastFlag(randomContrastFlag: boolean): void {
    this.randomContrastFlag = randomContrastFlag;
  }

  public getRandomContrast(): number {
    return this.randomContrast;
  }

  public setRandomContrast(randomContrast: number): void {
    this.randomContrast = randomContrast;
  }

  public getGrayscaleFlag(): boolean {
    return this.grayscaleFlag;
  }

  public setGrayscaleFlag(grayscaleFlag: boolean): void {
    this.grayscaleFlag = grayscaleFlag;
  }

  public getNoiseInjectionFlag(): boolean {
    return this.noiseInjectionFlag;
  }

  public setNoiseInjectionFlag(noiseInjectionFlag: boolean): void {
    this.noiseInjectionFlag = noiseInjectionFlag;
  }

  public getNoiseInjection(): number {
    return this.noiseInjection;
  }

  public setNoiseInjection(noiseInjection: number): void {
    this.noiseInjection = noiseInjection;
  }

  public getBlurFilterFlag(): boolean {
    return this.blurFilterFlag;
  }

  public setBlurFilterFlag(blurFilterFlag: boolean): void {
    this.blurFilterFlag = blurFilterFlag;
  }

  public getBlurFilter(): number {
    return this.blurFilter;
  }

  public setBlurFilter(blurFilter: number): void {
    this.blurFilter = blurFilter;
  }

  public getCutOutFlag(): boolean {
    return this.cutOutFlag;
  }

  public setCutOutFlag(cutOutFlag: boolean): void {
    this.cutOutFlag = cutOutFlag;
  }

  public getCutOutRange(): number {
    return this.cutOutRange;
  }

  public setCutOutRange(cutOutRange: number): void {
    this.cutOutRange = cutOutRange;
  }

  public getCropFlag(): boolean {
    return this.cropFlag;
  }

  public setCropFlag(cropFlag: boolean): void {
    this.cropFlag = cropFlag;
  }

  public getCropRange(): number {
    return this.cropRange;
  }

  public setCropRange(cropRange: number): void {
    this.cropRange = cropRange;
  }

  public getShearFlag(): boolean {
    return this.shearFlag;
  }

  public setShearFlag(shearFlag: boolean): void {
    this.shearFlag = shearFlag;
  }

  public getShearRange(): number {
    return this.shearRange;
  }

  public setShearRange(shearRange: number): void {
    this.shearRange = shearRange;
  }

  public getRotationFlag(): boolean {
    return this.rotationFlag;
  }

  public setRotationFlag(rotationFlag: boolean): void {
    this.rotationFlag = rotationFlag;
  }

  public getRotationRange(): number {
    return this.rotationRange;
  }

  public setRotationRange(rotationRange: number): void {
    this.rotationRange = rotationRange;
  }

  public getWidthShiftFlag(): boolean {
    return this.widthShiftFlag;
  }

  public setWidthShiftFlag(widthShiftFlag: boolean): void {
    this.widthShiftFlag = widthShiftFlag;
  }

  public getWidthShiftRange(): number {
    return this.widthShiftRange;
  }

  public setWidthShiftRange(widthShiftRange: number): void {
    this.widthShiftRange = widthShiftRange;
  }

  public getHeightShiftFlag(): boolean {
    return this.heightShiftFlag;
  }

  public setHeightShiftFlag(heightShiftFlag: boolean): void {
    this.heightShiftFlag = heightShiftFlag;
  }

  public getHeightShiftRange(): number {
    return this.heightShiftRange;
  }

  public setHeightShiftRange(heightShiftRange: number): void {
    this.heightShiftRange = heightShiftRange;
  }

  public getHorizontalFlipFlag(): boolean {
    return this.horizontalFlipFlag;
  }

  public setHorizontalFlipFlag(horizontalFlipFlag: boolean): void {
    this.horizontalFlipFlag = horizontalFlipFlag;
  }

  public getVerticalFlipFlag(): boolean {
    return this.verticalFlipFlag;
  }

  public setVerticalFlipFlag(verticalFlipFlag: boolean): void {
    this.verticalFlipFlag = verticalFlipFlag;
  }

  public getTrainedIndexClass(): number[] {
    return this.trainedClassIndex.slice()
  }

  public setTrainedIndexClass(trainedClassIndex: number[]): void {
    this.trainedClassIndex = trainedClassIndex.slice();
  }

  public getReportLogs(): ReportLog[] {
    return this.reportLogs.slice()
  }

  public setReportLogs(reportLogs: ReportLog[]): void {
    this.reportLogs = reportLogs;
  }

  public getHistory(): any {
    return this.history;
  }

  public setHistory(history: any): void {
    this.history = history;
  }

  public getOverlayCanvas(): any {
    return this.overlayCanvas;
  }

  public setOverlayCanvas(overlayCanvas: any): void {
    this.overlayCanvas = overlayCanvas;
  }
}
