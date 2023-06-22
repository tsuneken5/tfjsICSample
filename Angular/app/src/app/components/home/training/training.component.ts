import { Component, ViewChildren, ViewChild, QueryList, ComponentFactoryResolver } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

import { ChartConfiguration } from 'chart.js';

import * as constant from '../../../properties/constant';
import { UtilService } from '../../../services/util.service';
import { CommonService } from '../../../services/common.service';
import { CanvasService } from '../../../services/canvas.service';
import { DataAugmentService } from '../../../services/data-augment.service';

import { LabeledData } from '../../../models/labeled-data';
import { ReportLog, ReportRogLabels } from '../../../models/report-log';
import { Param } from '../../../models/param';
import { ReduceLROnPlateauCallback } from '../../../models/reduce-lron-plateau-callback';

import { ThumbnailComponent } from '../../shared/thumbnail/thumbnail.component';
import { ProjectMenuComponent } from '../../shared/project-menu/project-menu.component';
import { SummaryComponent } from '../../shared/summary/summary.component';
import { TrainingParam } from '../../../models/training-param';
import { AugmentParam } from '../../../models/augment-param';
import { CallbacksParam } from '../../../models/callbacks-param';
import { ModelCheckpointCallback } from '../../../models/model-checkpoint-callback';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})

export class TrainingComponent {
  @ViewChildren(ThumbnailComponent) thumbnailComponent!: QueryList<ThumbnailComponent>;
  @ViewChild(ProjectMenuComponent) projectMenuComponent!: ProjectMenuComponent;
  @ViewChild(SummaryComponent) summaryComponent!: SummaryComponent;

  public prefix: string = constant.PREFIX_TRAINING;

  public labeledDatas: LabeledData[] = [];
  private minCanTrainImageNum = constant.MIN_CAN_TRAIN_IMAGE_NUM;
  private minCanTrainClassNum = constant.MIN_CAN_TRAIN_CLASS_NUM;
  private trainClassList: number[] = [];
  public trainedClassList: number[] = [];

  public baseModelParams: Param[] = constant.BASE_MODEL_PARAMS;
  public minLearningRate: number = constant.MIN_LEARNING_RATE;

  public trainingParam: TrainingParam = new TrainingParam();
  public augmentParam: AugmentParam = new AugmentParam();
  public callbacksParam: CallbacksParam = new CallbacksParam();
  public fineTuningSize: any = constant.FINE_TUNING_LAYERS_SIZE;

  private model: any = null;
  private history: any = null;
  private inputShape = constant.INPUT_SHAPE;

  public isTraining: boolean = false;
  public displayReport: boolean = true;
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

  constructor(
    private utilService: UtilService,
    private commonService: CommonService,
    private canvasService: CanvasService,
    private dataAugmentService: DataAugmentService
  ) { }

  private initThumbnail(): void {
    for (let i = 0; i < this.labeledDatas.length; i++) {
      for (let imageInfo of this.labeledDatas[i].imageInfos) {
        this.addThumbnail(i, imageInfo.base64, imageInfo.id);
      }
    }
    if (this.hasTrained() && this.history) {
      this.drawReport();
    }
  }

  public setDataset(args: any): void {
    this.commonService.setLabeledDatas(this.labeledDatas);
    this.setTrainingParameter();
    this.projectMenuComponent.addProject();
  }

  public async getDataset(args: any): Promise<void> {
    this.labeledDatas = this.commonService.getLabeledDatas();
    this.getTrainingParameter();
    this.history = null;
    await this.utilService.sleep(100);
    this.initThumbnail();

    this.summaryComponent.changeSummaryBarWidth();
    this.summaryComponent.drawSummary();
  }


  private async addThumbnail(index: number, imgStr: string, id: number): Promise<void> {
    const thumbnailComponent = this.thumbnailComponent.toArray()[index];
    thumbnailComponent.addThumbnail(imgStr, id);

    let idList = this.labeledDatas[index].imageInfos.map(function (o: any) { return o.id; });
    let imageIndex = idList.indexOf(id);
    if (!(this.labeledDatas[index].isTrain && this.labeledDatas[index].imageInfos[imageIndex].isTrain)) {
      await this.utilService.sleep(100);
      thumbnailComponent.changeGrayScale(id);
    }
  }

  public getImageInfo(args: any): void {
    let idList = this.labeledDatas[args.index].imageInfos.map(function (o: any) { return o.id; });
    const index = idList.indexOf(args.id);

    const thumbnailComponent = this.thumbnailComponent.toArray()[args.index];
    thumbnailComponent.attachCanvas(this.labeledDatas[args.index].imageInfos[index]);
  }

  public changeIsTrainImage(args: any): void {
    if (this.isTraining) {
      this.thumbnailComponent.toArray()[args.index].changeChecked(args.id);
      return;
    }

    const thumbnailComponent = this.thumbnailComponent.toArray()[args.index];

    for (let labeledData of this.labeledDatas) {
      let idList = labeledData.imageInfos.map(function (o: any) { return o.id; });
      let index = idList.indexOf(args.id);
      if (index > -1) {
        labeledData.imageInfos[index].isTrain = !labeledData.imageInfos[index].isTrain;
        if (labeledData.imageInfos[index].isTrain) {
          if (labeledData.isTrain) {
            thumbnailComponent.drawThumbnail(labeledData.imageInfos[index].base64, args.id);
          }
        }
        else {
          thumbnailComponent.changeGrayScale(args.id);
        }
        break;
      }
    }

    this.commonService.setLabeledDatas(this.labeledDatas);
    this.summaryComponent.changeSummaryBarWidth();
    this.summaryComponent.drawSummary();
  }

  public changeIsTrainClass(index: number): void {
    if (this.isTraining) {
      return;
    }
    const thumbnailComponent = this.thumbnailComponent.toArray()[index];

    this.labeledDatas[index].isTrain = !this.labeledDatas[index].isTrain
    for (let imageInfo of this.labeledDatas[index].imageInfos) {
      if (this.labeledDatas[index].isTrain && imageInfo.isTrain) {
        thumbnailComponent.drawThumbnail(imageInfo.base64, imageInfo.id);
      }
      else {
        thumbnailComponent.changeGrayScale(imageInfo.id);
      }
    }

    this.commonService.setLabeledDatas(this.labeledDatas);
    this.summaryComponent.changeSummaryBarWidth();
    this.summaryComponent.drawSummary();
  }

  public clearIsTrainFlag(index: number): void {
    if (this.isTraining) {
      return;
    }
    const thumbnailComponent = this.thumbnailComponent.toArray()[index];

    this.labeledDatas[index].isTrain = true;
    for (let imageInfo of this.labeledDatas[index].imageInfos) {

      imageInfo.isTrain = true;
      thumbnailComponent.drawThumbnail(imageInfo.base64, imageInfo.id);
    }

    this.commonService.setLabeledDatas(this.labeledDatas);
    this.summaryComponent.changeSummaryBarWidth();
    this.summaryComponent.drawSummary();
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

    const modelPath = 'assets/base/' + this.trainingParam.baseModel + '/model.json';
    const featureModel = await tf.loadLayersModel(modelPath);

    // featureModel.summary();

    if (this.trainingParam.fineTuningFlag) {
      featureModel.trainable = true;
      const tuningLayer = constant.FINE_TUNING_LAYERS[this.trainingParam.baseModel][this.trainingParam.fineTuningLayer - 1];
      let fineTuningFlag = false;

      for (let i = 0; i < featureModel.layers.length; i++) {
        if (!fineTuningFlag && featureModel.layers[i].name == tuningLayer) {
          fineTuningFlag = true;
        }
        if (fineTuningFlag) {
          featureModel.layers[i].trainable = true;
        } else {
          featureModel.layers[i].trainable = false;
        }
      }
    } else {
      featureModel.trainable = false;
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

    let optimizer = tf.train.adam(this.trainingParam.learningRate);
    let loss = (this.trainClassList.length == 2) ? 'binaryCrossentropy' : 'categoricalCrossentropy';

    this.model.compile({
      optimizer: optimizer,
      loss: loss,
      metrics: ['acc']
    });

    const proccessTime = performance.now() - start;
    console.log((new Date()).toString(), 'finish build model', this.utilService.convertMsToTime(proccessTime));
  }

  public changeBaseModel(): void {
    this.trainingParam.fineTuningLayer = this.fineTuningSize[this.trainingParam.baseModel];
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
      const splitNum = Math.round(trainNum * this.trainingParam.validationSplit);
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

  private dataAugment(data: ImageData): ImageData {
    // random_hue
    if (this.augmentParam.randomHueFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const hueOffset = Math.random() * 360 * Number(this.augmentParam.randomHue);
      data = this.dataAugmentService.changeHue(data, hueOffset);
    }

    // random_saturation
    if (this.augmentParam.randomSaturationFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const saturationRange = Number(this.augmentParam.randomSaturation);
      const saturationOffset = this.utilService.randomInt(-saturationRange * 100, saturationRange * 100) / 100;
      data = this.dataAugmentService.changeSaturation(data, saturationOffset);
    }

    // random_brightness
    if (this.augmentParam.randomBrightnessFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const brightness = Number(this.augmentParam.randomBrightness);
      const brightnessOffset = this.utilService.randomInt(-brightness * 100, brightness * 100) / 100;
      data = this.dataAugmentService.changeBrightness(data, brightnessOffset);
    }

    // random_contrast
    if (this.augmentParam.randomContrastFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const contrastRange = Number(this.augmentParam.randomContrast);
      const contrastFactor = 1 - (this.utilService.randomInt(-contrastRange * 100, contrastRange * 100) / 100);
      data = this.dataAugmentService.changeContrast(data, contrastFactor);
    }

    // rgb_to_grayscale
    if (this.augmentParam.grayscaleFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      data = this.dataAugmentService.grayscale(data);
    }

    // noise_injection
    if (this.augmentParam.noiseInjectionFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const noiseInjection = this.augmentParam.noiseInjection;
      const sigma = this.utilService.randomInt(0, noiseInjection * 100) / 100;
      data = this.dataAugmentService.noiseInjection(data, sigma);
    }

    // blur_filter
    if (this.augmentParam.blurFilterFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const blurFilter = this.augmentParam.blurFilter;
      const radius = this.utilService.randomInt(0, blurFilter * 100) / 10;
      data = this.dataAugmentService.blurFilter(data, this.augmentParam.blurFilter * 10);
    }

    // cut_out
    if (this.augmentParam.cutOutFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const cutOutRange = Number(this.augmentParam.cutOutRange)
      const cutWidth = this.utilService.randomInt(0, cutOutRange * data.width);
      const cutHeight = this.utilService.randomInt(0, cutOutRange * data.height);
      const x = this.utilService.randomInt(0, data.width - cutWidth);
      const y = this.utilService.randomInt(0, data.height - cutHeight);

      data = this.dataAugmentService.cutOut(data, cutWidth, cutHeight, x, y);
    }

    // random_crop
    if (this.augmentParam.cropFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const randomCropRange = Number(this.augmentParam.cropRange);
      const imageWidth = Math.round(data.width * randomCropRange);
      const imageHeight = Math.round(data.height * randomCropRange);
      const x = this.utilService.randomInt(0, data.width - imageWidth);
      const y = this.utilService.randomInt(0, data.height - imageHeight);

      data = this.dataAugmentService.crop(data, imageWidth, imageHeight, x, y);
    }

    // shear_range
    if (this.augmentParam.shearFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const shearRamge = ((this.utilService.randomInt(Number(this.augmentParam.shearRange) * -1000, Number(this.augmentParam.shearRange) * 1000)) / 1000)
      data = this.dataAugmentService.shear(data, Number(shearRamge));
    }

    // rotation_range
    if (this.augmentParam.rotationFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const angle = this.utilService.randomInt(Number(this.augmentParam.rotationRange) * -1, Number(this.augmentParam.rotationRange))
      data = this.dataAugmentService.rotation(data, angle);
    }

    // width_shift_range
    let widthSift = 0;
    if (this.augmentParam.widthShiftFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const widthShiftRange = Number(this.augmentParam.widthShiftRange);
      widthSift = this.utilService.randomInt(widthShiftRange * data.width * -1, widthShiftRange * data.width);
    }

    // height_shift_range
    let heightSift = 0;
    if (this.augmentParam.heightShiftFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      const heightShiftRange = Number(this.augmentParam.heightShiftRange);
      heightSift = this.utilService.randomInt(heightShiftRange * data.height * -1, heightShiftRange * data.height);
    }

    data = this.dataAugmentService.shift(data, widthSift, heightSift);
    // horizontal_flip
    let horizontalFlip = 1;
    if (this.augmentParam.horizontalFlipFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      horizontalFlip = -1;
    }

    // vertical_flip 
    let verticalFlip = 1;
    if (this.augmentParam.verticalFlipFlag && this.utilService.randomBoolean(this.augmentParam.augmentRate)) {
      verticalFlip = -1;
    }
    data = this.dataAugmentService.flip(data, horizontalFlip, verticalFlip);

    return data;
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

    this.trainingStatus = 'preparing model...';
    this.trainingRate = -1;
    await this.buildModel();

    this.trainingStatus = 'preparing training data...';
    const dataset = await this.createDataset();

    const that = this;
    // create training data
    tf.util.shuffleCombo(dataset.trainImages, dataset.trainLabels);

    const getTrainImages = function* () {
      const images = dataset.trainImages;
      for (let image of images) {
        if (that.augmentParam.augmentRateFlag) {
          image = that.dataAugment(image);
        }
        yield tf.tidy(() => {
          const data = tf.browser.fromPixels(image);
          const cachedImage = tf.image.resizeBilinear(data, [that.inputShape[0], that.inputShape[1]], true);
          return cachedImage.div(255).reshape(that.inputShape);
        });
      }
    };

    const getTrainLabels = function* () {
      const labels = dataset.trainLabels;
      for (const label of labels) {
        yield tf.tidy(() => {
          return tf.oneHot(label, that.trainClassList.length);
        });
      }
    };

    const trainImages = getTrainImages;
    const trainLabels = getTrainLabels;

    const xTrain = tf.data.generator(trainImages);
    const yTrain = tf.data.generator(trainLabels);
    const train = tf.data.zip({ xs: xTrain, ys: yTrain }).shuffle(100).batch(this.trainingParam.batchSize);

    // create validation data
    tf.util.shuffleCombo(dataset.valImages, dataset.valLabels);

    const getValImages = function* () {
      const images = dataset.valImages;
      for (let image of images) {
        if (that.augmentParam.augmentRateFlag) {
          image = that.dataAugment(image);
        }
        yield tf.tidy(() => {
          const data = tf.browser.fromPixels(image);
          const cachedImage = tf.image.resizeBilinear(data, [that.inputShape[0], that.inputShape[1]], true);
          return cachedImage.div(255).reshape(that.inputShape);
        });
      }
    };

    const getValLabels = function* () {
      const labels = dataset.valLabels;
      for (const label of labels) {
        yield tf.tidy(() => {
          return tf.oneHot(label, that.trainClassList.length);
        });
      }
    };

    const valImages = getValImages;
    const valLabels = getValLabels;

    const xVal = tf.data.generator(valImages);
    const yVal = tf.data.generator(valLabels);
    const val = tf.data.zip({ xs: xVal, ys: yVal }).shuffle(100).batch(this.trainingParam.batchSize);

    this.trainingStatus = 'training... 0 / ' + this.trainingParam.epochs;
    this.trainingRate = 0;

    // earlystopiing
    let earlyStopPatience = this.callbacksParam.earlyStopPatience;
    let earlyStopMinDelta = this.callbacksParam.earlyStopMinDelta;
    if (!this.callbacksParam.earlyStoppingFlag) {
      earlyStopPatience = this.trainingParam.epochs;
    }

    // ReduceLROnPlateau
    let reduceFactor = this.callbacksParam.reduceFactor;
    let reducePatience = this.callbacksParam.reducePatience;
    let reduceMinDelta = this.callbacksParam.reduceMinDelta;
    if (!this.callbacksParam.reduceLROnFlag) {
      reduceFactor = 1;
      reducePatience = this.trainingParam.epochs;
    }

    // ModelCheckpoint
    let checkpointEpoch = this.trainingParam.epochs / 10;
    if (this.callbacksParam.earlyStoppingFlag) {
      checkpointEpoch = this.callbacksParam.earlyStopPatience;
    }
    const checkpoint = new ModelCheckpointCallback(checkpointEpoch);

    this.dataAugmentService.initCanvas();
    console.log('start training');

    const preparingTime = performance.now() - startPreparing;
    const startTraining = performance.now();

    const history = await this.model.fitDataset(train, {
      validationData: val,
      epochs: this.trainingParam.epochs,
      callbacks: [new tf.CustomCallback({
        onBatchEnd: () => {
          if (this.isCancelTraining) {
            this.cancelStatus = 'canceled training'
            this.model.stopTraining = true;
          }
        },
        onEpochEnd: async (epoch: any, logs: any) => {
          if (this.isCancelTraining) {
            this.cancelStatus = 'canceled training'
            this.model.stopTraining = true;
          }

          const currentEpoch = epoch + 1
          this.trainingStatus = 'training... ' + (currentEpoch) + ' / ' + this.trainingParam.epochs;

          const elapsedTime = performance.now() - startTraining;
          const averageTime = elapsedTime / currentEpoch;
          const remainingTime = averageTime * (Number(this.trainingParam.epochs) - currentEpoch);
          this.trainingStatus += ', Estimated remaining time : ' + this.utilService.convertMsToTime(remainingTime);

          this.trainingRate = Math.trunc(((currentEpoch) / Number(this.trainingParam.epochs)) * 100);
          console.log(currentEpoch, "log :", logs);
          this.utilService.printMemory();
        }
      }),
      tf.callbacks.earlyStopping({ monitor: 'loss', minDelta: earlyStopMinDelta, patience: earlyStopPatience }),
      new ReduceLROnPlateauCallback(reduceFactor, reducePatience, reduceMinDelta),
        checkpoint
      ]
    });

    this.isTraining = false;
    this.trainingStatus = '';
    this.trainingRate = -1;

    this.dataAugmentService.destroyCanvas();

    tf.engine().endScope();

    if (!this.isCancelTraining) {
      const trainingTime = performance.now() - startTraining;

      if (checkpoint.checkpoint) {
        this.model = checkpoint.checkpoint;
      }

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

      this.drawReport();

      await this.utilService.sleep(100);
      const target = document.getElementById('report-area') as HTMLElement;
      target.scrollIntoView(true);
    }
    tf.dispose(this.model);

    const proccessTime = performance.now() - start;
    console.log((new Date()).toString(), 'finish training', this.utilService.convertMsToTime(proccessTime));
  }

  public onCancelTraining(): void {
    this.isCancelTraining = true;
    this.cancelStatus = 'preparing cancel training...'
  }

  public hasTrained(): boolean {
    if (this.history) {
      return this.trainedClassList.length > 0;
    }
    return false;
  }

  public async changeDisplayReport(): Promise<void> {
    this.displayReport = !this.displayReport;
    if (this.displayReport) {
      await this.utilService.sleep(100);
      const target = document.getElementById('report-area') as HTMLElement;
      target.scrollIntoView(true);
    }
  }

  private getTrainingParameter(): void {
    this.trainingParam = this.commonService.getTrainingParam();
    this.augmentParam = this.commonService.getAugmentParam();
    this.callbacksParam = this.commonService.getCallbacksParam();
  }

  private setTrainingParameter(): void {
    this.commonService.setTrainingParam(this.trainingParam);
    this.commonService.setAugmentParam(this.augmentParam);
    this.commonService.setCallbacksParam(this.callbacksParam);
  }

  ngOnInit(): void {
    this.labeledDatas = this.commonService.getLabeledDatas();
    this.history = this.commonService.getHistory();
    this.reportLogs = this.commonService.getReportLogs();
    this.trainedClassList = this.commonService.getTrainedIndexClass();

    this.getTrainingParameter();
  }

  ngAfterViewInit(): void {
    this.initThumbnail();
  }

  ngOnDestroy(): void {
    this.commonService.setLabeledDatas(this.labeledDatas);
    this.setTrainingParameter();

    console.clear();
  }
}
