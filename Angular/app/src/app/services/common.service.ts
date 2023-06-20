import { Injectable } from '@angular/core';

import * as constant from '../properties/constant';

import { LabeledData } from '../models/labeled-data';
import { ReportLog } from '../models/report-log';
import { TrainingParam } from '../models/training-param';
import { AugmentParam } from '../models/augment-param';
import { CallbacksParam } from '../models/callbacks-param';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private project: string = '';
  private labeledDatas: LabeledData[] = [];

  private trainingParam: TrainingParam = new TrainingParam();
  private augmentParam: AugmentParam = new AugmentParam();
  private callbacksParam: CallbacksParam = new CallbacksParam();

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

  public getProject(): string {
    return this.project;
  }

  public setProject(project: string): void {
    this.project = project;
  }

  public getLabeledDatas(): LabeledData[] {
    return this.labeledDatas.slice();
  }

  public setLabeledDatas(labeledDatas: LabeledData[]): void {
    this.labeledDatas = labeledDatas.slice();
  }

  public getTrainingParam(): TrainingParam {
    return this.trainingParam;
  }

  public setTrainingParam(trainingParam: TrainingParam): void {
    this.trainingParam = trainingParam;
  }

  public getAugmentParam(): AugmentParam {
    return this.augmentParam;
  }

  public setAugmentParam(augmentParam: AugmentParam): void {
    this.augmentParam = augmentParam;
  }

  public getCallbacksParam(): CallbacksParam {
    return this.callbacksParam;
  }

  public setCallbacksParam(callbacksParam: CallbacksParam): void {
    this.callbacksParam = callbacksParam;
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
