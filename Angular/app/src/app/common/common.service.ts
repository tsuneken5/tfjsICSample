import { Injectable } from '@angular/core';

import * as constant from '../constant';

import { LabeledData } from '../models/labeled-data';
import { ReportLog } from '../models/report-log';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private labeledDatas: LabeledData[] = [];

  private baseModel: string = constant.DEFAULT_BASE_MODEL;
  private epochs: number = constant.DEFAULT_EPOCHS;
  private batchSize: number = constant.DEFAULT_BACTH_SIZE;
  private learningRate: number = constant.DEFAULT_LEARNING_RATE;
  private validationSplit: number = constant.DEFAULT_VALIDATION_SPLIT;

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

  public setBaseModel(baseModel: string) {
    this.baseModel = baseModel;
  }

  public getEpochs(): number {
    return this.epochs;
  }

  public setEpochs(epochs: number) {
    this.epochs = epochs;
  }

  public getBatchSize(): number {
    return this.batchSize;
  }

  public setBatchSize(batchSize: number) {
    this.batchSize = batchSize;
  }

  public getLearningRate(): number {
    return this.learningRate;
  }

  public setLearningRate(learningRate: number) {
    this.learningRate = learningRate;
  }

  public getValidationSplit(): number {
    return this.validationSplit;
  }

  public setValidationSplit(validationSplit: number) {
    this.validationSplit = validationSplit;
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
