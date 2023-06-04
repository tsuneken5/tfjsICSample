import { Component } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

import { ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import * as constant from '../constant';
import { UtilService } from '../util/util.service';
import { CommonService } from '../common/common.service';
import { CanvasService } from '../canvas/canvas.service';

import { LabeledData } from '../models/labeled-data';
import { ReportLog, ReportRogLabels } from '../models/report-log';
import { Param } from '../models/param';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})

export class TrainingComponent {
  public labeledDatas: LabeledData[] = [];
  private minCanTrainImageNum = constant.MIN_CAN_TRAIN_IMAGE_NUM;
  private minCanTrainClassNum = constant.MIN_CAN_TRAIN_CLASS_NUM;
  private trainClassList: number[] = [];
  public trainedClassList: number[] = [];

  public baseModel: string = constant.DEFAULT_BASE_MODEL;
  public epochs: string = constant.DEFAULT_EPOCHS;
  public batchSize: string = constant.DEFAULT_BACTH_SIZE;
  public learningRate: string = constant.DEFAULT_LEARNING_RATE;
  public validationSplit: string = constant.DEFAULT_VALIDATION_SPLIT;
  public baseModelParams: Param[] = constant.BASE_MODEL_PARAMS;
  public epochsParams: Param[] = constant.EPOCHS_PARAMS;
  public batchSizeParams: Param[] = constant.BACTH_SIZE_PARAMS;
  public learningRateParams: Param[] = constant.LEARNING_RATE_PARAMS;
  public validationSplitParams: Param[] = constant.VALIDATION_SPLIT_PARAMS;

  private model: any = null;
  private history: any = null;
  private inputShape = constant.INPUT_SHAPE;

  public isTraining: boolean = false;
  public displayReport: boolean = true;
  public displaySummary: boolean = false;
  private summaryBarWidth: number = constant.SUMMARY_BAR_WIDTH;
  public isCancelTraining: boolean = false;

  public reportLogLabals: string[] = ReportRogLabels;
  public reportLogs: ReportLog[] = [];

  public trainingStatus: string = '';
  public trainingRate: number = -1;
  public cancelStatus: string = '';
  public accLineChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [
      { data: [] },
      { data: [] }
    ]
  }

  public lossLineChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [
      { data: [] },
      { data: [] }
    ]
  }

  public accLineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: false,
    animation: false,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0
      }
    },
    scales: {
      y: {
        min: 0,
        max: 1
      },
    }
  }

  public lossLineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: false,
    animation: false,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0
      }
    },
  }

  public viewSummarys: string[] = ['doughnut', 'bar']
  public viewSummary: string = this.viewSummarys[0]

  private summaryBarChartColors: string[] = constant.CHART_COLORS;
  public summaryBarChartLegend = false;
  public summaryBarChartPlugins = [
    ChartDataLabels,
  ];

  public summaryChartData: any = {
    labels: [],
    datasets: [
      { data: [] }
    ]
  };

  public summaryChartDoughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: false,
    animation: false,
    maintainAspectRatio: false,
    cutout: 60,
    plugins: {
      tooltip: {
        xAlign: 'center',
        yAlign: 'center'
      }
    }
  };

  public summaryChartBarOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
  };

  constructor(
    private utilService: UtilService,
    private commonService: CommonService,
    private canvasService: CanvasService,
  ) { }

  public changeSummary(): void {
    const index = this.viewSummarys.indexOf(this.viewSummary);
    this.viewSummary = this.viewSummarys[(index + 1) % this.viewSummarys.length];
  }

  private changeSummaryBarWidth(): void {
    this.canTrain();
    const area = document.getElementById('training-summary-bar') as HTMLElement;
    const size = this.summaryBarWidth * this.trainClassList.length;
    area.style.width = size + 'px';
  }

  public changeDisplaySummary(): void {
    this.displaySummary = !this.displaySummary;
  }
  public summaryClick(event: any): void {
    if (event.active.length > 0) {
      const index = event.active[0].index;
      let num = 0;
      let sum = 0;
      let label = ''
      for (let i = 0; i < this.trainClassList.length; i++) {
        sum += this.labeledDatas[this.trainClassList[i]].isTrainNum();
        if (i == index) {
          num = this.labeledDatas[this.trainClassList[i]].isTrainNum();
          label = this.labeledDatas[this.trainClassList[i]].label;
        }
      }

      const centerX = event.active[0].element.x;
      const centerY = event.active[0].element.y;

      const canvas = document.getElementById('training-summary') as HTMLCanvasElement;
      const labels: string[] = [label, Math.round((num / sum) * 100) + ' %'];
      const font = '15px Meiryo bold';
      this.canvasService.drawCenteredLabels(canvas, labels, font, centerX, centerY);
    }
  }

  private drawSummary(): void {
    const labels: string[] = [];
    const data: number[] = [];

    if (!this.canTrain()) {
      return;
    }

    for (let i = 0; i < this.trainClassList.length; i++) {
      labels.push(this.labeledDatas[this.trainClassList[i]].label)
      data.push(this.labeledDatas[this.trainClassList[i]].isTrainNum())
    }

    this.summaryChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: this.summaryBarChartColors,
        }
      ]
    };
  }

  private async addThumbnail(index: number, imgStr: string, id: number): Promise<void> {
    const that = this;
    const thumbnailsElem = document.getElementById('train-thumbnails' + index) as HTMLDivElement;

    const canvas: any = document.createElement('canvas') as HTMLCanvasElement;
    canvas.id = 'train-thumbnail' + id;
    canvas.classList.add('thumbnail');
    canvas.style.margin = '5px';

    canvas.style.border = 'thin solid red';
    canvas.addEventListener('click', function () {
      that.changeIsTrainImage(id);
    });

    this.canvasService.drawThumbnail(canvas, imgStr, id);
    thumbnailsElem.prepend(canvas);

    let idList = this.labeledDatas[index].imageInfos.map(function (o: any) { return o.id; });
    let imageIndex = idList.indexOf(id);
    if (!(this.labeledDatas[index].isTrain && this.labeledDatas[index].imageInfos[imageIndex].isTrain)) {
      await this.utilService.sleep(100);
      this.canvasService.changeGrayScale(canvas);
    }
  }

  private changeIsTrainImage(id: number): void {
    if (this.isTraining) {
      return;
    }
    const canvas = document.getElementById('train-thumbnail' + id) as HTMLCanvasElement;

    for (let labeledData of this.labeledDatas) {
      let idList = labeledData.imageInfos.map(function (o: any) { return o.id; });
      let index = idList.indexOf(id);
      if (index > -1) {
        labeledData.imageInfos[index].isTrain = !labeledData.imageInfos[index].isTrain;
        if (labeledData.imageInfos[index].isTrain) {
          if (labeledData.isTrain) {
            this.canvasService.drawThumbnail(canvas, labeledData.imageInfos[index].base64, id);
          }
        }
        else {
          this.canvasService.changeGrayScale(canvas);
        }
        break;
      }
    }
    this.changeSummaryBarWidth();
    this.drawSummary();
  }

  public changeIsTrainClass(index: number): void {
    this.labeledDatas[index].isTrain = !this.labeledDatas[index].isTrain
    for (let imageInfo of this.labeledDatas[index].imageInfos) {
      const canvas = document.getElementById('train-thumbnail' + imageInfo.id) as HTMLCanvasElement;

      if (this.labeledDatas[index].isTrain && imageInfo.isTrain) {
        this.canvasService.drawThumbnail(canvas, imageInfo.base64, imageInfo.id);
      }
      else {
        this.canvasService.changeGrayScale(canvas);
      }
    }
    this.changeSummaryBarWidth();
    this.drawSummary();
  }

  public clearIsTrainFlag(index: number): void {
    this.labeledDatas[index].isTrain = true;
    for (let imageInfo of this.labeledDatas[index].imageInfos) {
      const canvas = document.getElementById('train-thumbnail' + imageInfo.id) as HTMLCanvasElement;

      imageInfo.isTrain = true;
      this.canvasService.drawThumbnail(canvas, imageInfo.base64, imageInfo.id);
    }
    this.changeSummaryBarWidth();
    this.drawSummary();
  }

  public canTrainClass(index: number): boolean {
    return (this.labeledDatas[index].isTrainNum() >= this.minCanTrainImageNum);
  }

  public canTrain(): boolean {
    this.trainClassList = [];

    for (let i = 0; i < this.labeledDatas.length; i++) {
      if (this.canTrainClass(i)) {
        this.trainClassList.push(i);
      }
    }

    return (this.trainClassList.length >= this.minCanTrainClassNum);
  }

  private async buildModel(): Promise<void> {
    console.log((new Date()).toString(), 'start build model');
    const start = performance.now();

    this.model = tf.sequential();

    const modelPath = 'assets/base/' + this.baseModel + '/model.json';
    const featureModel = await tf.loadLayersModel(modelPath);

    for (let layer of featureModel.layers) {
      layer.trainable = false;
    }

    const inputShape = featureModel.outputs[0].shape.slice(1);

    const transferModel = tf.sequential({
      layers: [
        tf.layers.globalAveragePooling2d({ inputShape: inputShape }),
        tf.layers.dense({ units: 64 }),
        tf.layers.dense({ units: this.trainClassList.length, activation: 'softmax' })
      ]
    });

    this.model.add(featureModel);
    this.model.add(transferModel);

    let optimizer = tf.train.adam(Number(this.learningRate));
    let loss = (this.trainClassList.length == 2) ? 'binaryCrossentropy' : 'categoricalCrossentropy';

    this.model.compile({
      optimizer: optimizer,
      loss: loss,
      metrics: ['acc']
    });

    // this.model.summary();

    const proccessTime = performance.now() - start;
    console.log((new Date()).toString(), 'finish build model', this.utilService.convertMsToTime(proccessTime));
  }

  private arrayShuffle(array: any[]): any[] {
    for (let i = (array.length - 1); 0 < i; i--) {

      let r = Math.floor(Math.random() * (i + 1));

      let tmp = array[i];
      array[i] = array[r];
      array[r] = tmp;
    }
    return array;
  }

  private async createDataset(): Promise<{ trainImages: ImageData[], trainLabels: number[], valImages: ImageData[], valLabels: number[] }> {
    console.log((new Date()).toString(), 'start create datasets');
    const start = performance.now();

    let trainImages: ImageData[] = [];
    let trainLabels: number[] = [];
    let valImages: ImageData[] = [];
    let valLabels: number[] = [];

    for (let index of this.trainClassList) {
      const trainNum = this.labeledDatas[index].isTrainNum();
      const splitNum = Math.round(trainNum * Number(this.validationSplit));
      let count = 0;
      const imageInfos = this.arrayShuffle(this.labeledDatas[index].imageInfos.slice())
      for (let imageInfo of imageInfos) {
        if (imageInfo.isTrain) {
          if (count < splitNum) {
            valImages.push(await this.canvasService.getTrainingImage(imageInfo.base64));
            valLabels.push(index);
          } else {
            trainImages.push(await this.canvasService.getTrainingImage(imageInfo.base64));
            trainLabels.push(index);
          }
          count += 1;
        }
      }
    }

    const proccessTime = performance.now() - start;
    console.log((new Date()).toString(), 'finish create datasets', this.utilService.convertMsToTime(proccessTime));

    return { trainImages: trainImages, trainLabels: trainLabels, valImages: valImages, valLabels: valLabels };
  }

  private drawReport(): void {
    const start = performance.now();

    let labels: number[] = [0];
    for (let i = 0; i < this.history.history['acc'].length; i++) {
      labels.push(i + 1);
    }

    const acc: (number | null)[] = this.history.history['acc'].slice() as number[];
    const val_acc: (number | null)[] = this.history.history['val_acc'].slice() as number[];
    const loss: (number | null)[] = this.history.history['loss'].slice() as number[];
    const val_loss: (number | null)[] = this.history.history['val_loss'].slice() as number[];

    acc.unshift(null);
    val_acc.unshift(null);
    loss.unshift(null);
    val_loss.unshift(null);

    this.accLineChartData = {
      labels: labels,
      datasets: [
        {
          label: 'acc',
          data: acc,
          tension: 0,
        },
        {
          label: 'val_acc',
          data: val_acc,
          tension: 0,
        }
      ]
    };

    this.lossLineChartData = {
      labels: labels,
      datasets: [
        {
          label: 'loss',
          data: loss,
          tension: 0,
        },
        {
          label: 'val_loss',
          data: val_loss,
          tension: 0,
        }
      ]
    };
  }

  public onCancelTraining(): void {
    this.isCancelTraining = true;
    this.cancelStatus = 'preparing cancel training...'
  }

  public hasTrained(): boolean {
    return this.trainedClassList.length > 0
  }

  public async startTraining(): Promise<void> {
    console.log((new Date()).toString(), 'start training');
    const start = performance.now();
    const startPreparing = performance.now();

    if (!this.canTrain()) {
      return;
    }

    this.isTraining = true;
    this.isCancelTraining = false;
    this.cancelStatus = ''

    tf.engine().startScope();
    console.log('start scope');
    this.utilService.printMemory();

    this.trainingStatus = 'preparing model...';
    this.trainingRate = -1;
    await this.buildModel();

    this.trainingStatus = 'preparing training data...';
    const dataset = await this.createDataset();

    // create training data
    tf.util.shuffleCombo(dataset.trainImages, dataset.trainLabels);

    const getTrainImages = await dataset.trainImages.map(image => {
      const data = tf.browser.fromPixels(image);
      const cachedImage = tf.image.resizeBilinear(data, [this.inputShape[0], this.inputShape[1]], true);
      return cachedImage.div(255).reshape(this.inputShape);
    });

    const getTrainLabels = await dataset.trainLabels.map(label => {
      const cachedLabel = tf.oneHot(label, this.trainClassList.length);
      return cachedLabel;
    });

    const trainImages = getTrainImages;
    const trainLabels = getTrainLabels;

    const xTrain = tf.data.array(trainImages);
    const yTrain = tf.data.array(trainLabels);
    const train = tf.data.zip({ xs: xTrain, ys: yTrain }).shuffle(100).batch(Number(this.batchSize));

    // create validation data
    tf.util.shuffleCombo(dataset.valImages, dataset.valLabels);

    const getValImages = await dataset.valImages.map(image => {
      const data = tf.browser.fromPixels(image);
      const cachedImage = tf.image.resizeBilinear(data, [this.inputShape[0], this.inputShape[1]], true);
      return cachedImage.div(255).reshape(this.inputShape);
    });

    const getValLabels = await dataset.valLabels.map(label => {
      const cachedLabel = tf.oneHot(label, this.trainClassList.length);
      return cachedLabel;
    });

    const valImages = getValImages;
    const valLabels = getValLabels;

    const xVal = tf.data.array(valImages);
    const yVal = tf.data.array(valLabels);
    const val = tf.data.zip({ xs: xVal, ys: yVal }).shuffle(100).batch(Number(this.batchSize));

    this.utilService.printMemory();
    this.trainingStatus = 'training... 0 / ' + this.epochs;
    this.trainingRate = 0;

    const preparingTime = performance.now() - startPreparing;
    const startTraining = performance.now();

    const history = await this.model.fitDataset(train, {
      validationData: val,
      epochs: Number(this.epochs),
      callbacks: {
        onBatchEnd: () => {
          if (this.isCancelTraining) {
            this.cancelStatus = 'canceled training'
            this.model.stopTraining = true;
          }
        },
        onEpochEnd: async (epoch: any, logs: any) => {
          const currentEpoch = epoch + 1
          this.trainingStatus = 'training... ' + (currentEpoch) + ' / ' + this.epochs;

          const elapsedTime = performance.now() - startTraining;
          const averageTime = elapsedTime / currentEpoch;
          const remainingTime = averageTime * (Number(this.epochs) - currentEpoch);
          this.trainingStatus += ', Estimated remaining time : ' + this.utilService.convertMsToTime(remainingTime);

          this.trainingRate = Math.trunc(((currentEpoch) / Number(this.epochs)) * 100);
          console.log(currentEpoch, "log :", logs);
          this.utilService.printMemory();
          if (this.isCancelTraining) {
            this.cancelStatus = 'canceled training'
            this.model.stopTraining = true;
          }
        }
      },
    });

    this.isTraining = false;
    this.trainingStatus = '';
    this.trainingRate = -1;

    this.utilService.printMemory();
    console.log('end scope');
    tf.engine().endScope();
    this.utilService.printMemory();

    if (!this.isCancelTraining) {
      const trainingTime = performance.now() - startTraining;

      this.reportLogs = [];
      this.reportLogs.push(new ReportLog('preparing time', this.utilService.convertMsToTime(preparingTime)));
      this.reportLogs.push(new ReportLog('training time', this.utilService.convertMsToTime(trainingTime)));
      this.reportLogs.push(new ReportLog('total time', this.utilService.convertMsToTime(preparingTime + trainingTime)));

      this.history = history;

      this.trainedClassList = this.trainClassList.slice();

      await this.model.save('indexeddb://' + constant.TMP_MODEL_NAME);
      this.commonService.setTrainedIndexClass(this.trainedClassList);
      this.commonService.setReportLogs(this.reportLogs);
      this.commonService.setHistory(this.history);

      tf.dispose(this.model);

      console.log('dispose model');
      this.utilService.printMemory();

      this.drawReport();

      await this.utilService.sleep(100);
      const target = document.getElementById('report-area') as HTMLElement;
      target.scrollIntoView(true);
    }


    const proccessTime = performance.now() - start;
    console.log((new Date()).toString(), 'finish training', this.utilService.convertMsToTime(proccessTime));
  }

  public async changeDisplayReport(): Promise<void> {
    this.displayReport = !this.displayReport;
    if (this.displayReport) {
      await this.utilService.sleep(100);
      const target = document.getElementById('report-area') as HTMLElement;
      target.scrollIntoView(true);
    }
  }

  ngOnInit(): void {
    this.labeledDatas = this.commonService.getLabeledDatas();
    this.history = this.commonService.getHistory();
    this.reportLogs = this.commonService.getReportLogs();
    this.trainedClassList = this.commonService.getTrainedIndexClass();

    this.baseModel = this.commonService.getBaseModel();
    this.epochs = this.commonService.getEpochs();
    this.batchSize = this.commonService.getBatchSize();
    this.learningRate = this.commonService.getLearningRate();
  }

  ngAfterViewInit(): void {
    for (let i = 0; i < this.labeledDatas.length; i++) {
      for (let imageInfo of this.labeledDatas[i].imageInfos) {
        this.addThumbnail(i, imageInfo.base64, imageInfo.id);
      }
    }
    if (this.hasTrained()) {
      this.drawReport();
    }
    this.changeSummaryBarWidth();
    this.drawSummary();
  }

  ngOnDestroy(): void {
    this.commonService.setLabeledDatas(this.labeledDatas);

    this.commonService.setBaseModel(this.baseModel);
    this.commonService.setEpochs(this.epochs);
    this.commonService.setBatchSize(this.batchSize);
    this.commonService.setLearningRate(this.learningRate);

    console.clear();
  }
}
