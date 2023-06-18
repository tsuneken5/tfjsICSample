import { Component, ViewChild } from '@angular/core';

import * as tf from '@tensorflow/tfjs';

import { ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import * as constant from '../../../properties/constant';
import { UtilService } from '../../../services/util.service';
import { CommonService } from '../../../services/common.service';
import { CanvasService } from '../../../services/canvas.service';

import { LabeledData } from '../../../models/labeled-data';
import { Param } from '../../../models/param';

import { ProjectMenuComponent } from '../../shared/project-menu/project-menu.component';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {
  @ViewChild(ProjectMenuComponent) projectMenuComponent!: ProjectMenuComponent;

  public menu: string = constant.DEFAULT_DETECT_MENU;
  public detectMenus: Param[] = constant.DETECT_MENUS;

  private model: any = null;
  private trainedClassList: number[] = [];
  private inputShape = constant.INPUT_SHAPE;

  public canDetect: boolean = false;
  public setupStatus: string = '';
  public errorMessage: string = '';

  private webcamElement: any = null;
  private webcam: any = null;
  private webcamSize: number = constant.DETECT_VIDEO_SIZE;
  private webcamConfig: tf.data.WebcamConfig = {
    facingMode: 'environment',
  };
  public isPlay = false;

  private canvasElement: any = null;
  private canvasSize: number = constant.DETECT_CANVAS_SIZE;

  private labeledDatas: LabeledData[] = [];
  private classes: string[] = [];

  private detectBarHeight = constant.DETECT_BAR_HEIGHT;

  public detectBarChartLegend = false;
  public detectBarChartPlugins = [
    ChartDataLabels,
  ];

  private detectBarChartColors: string[] = constant.CHART_COLORS;

  public detectBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    scales: {
      x: {
        min: 0,
        max: 100,
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: false
  };

  public detectBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [] }
    ]
  };

  constructor(
    private utilService: UtilService,
    private commonService: CommonService,
    private canvasService: CanvasService,
  ) { }

  public setDataset(args: any): void {
    this.commonService.setLabeledDatas(this.labeledDatas);

    this.projectMenuComponent.addProject();
  }

  private setChartHeight(): void {
    const size = this.trainedClassList.length;
    const height = size * this.detectBarHeight;

    const area = document.getElementById('detect-chart-area') as HTMLElement;
    area.style.height = height + 'px';
  }

  public async getDataset(args: any): Promise<void> {
    this.errorMessage = '';
    this.setupStatus = 'preparing model ...';

    this.trainedClassList = this.commonService.getTrainedIndexClass();
    this.labeledDatas = this.commonService.getLabeledDatas();


    this.setupStatus = '';
    if (this.trainedClassList.length == 0) {
      this.errorMessage = 'let\'s training model';
      this.canDetect = false;
      this.isPlay = false;
    } else {
      try {
        this.canDetect = true;
        this.isPlay = true;
        this.model = await tf.loadLayersModel('indexeddb://' + constant.TMP_MODEL_NAME);

        this.setupStatus = 'preparing result chart ... ';
        this.classes = [];
        for (let i = 0; i < this.labeledDatas.length; i++) {
          if (this.trainedClassList.includes(i)) {
            this.classes.push(this.labeledDatas[i].label);
          }
        }
        this.drawDetect([]);

        await this.utilService.sleep(100);
        this.setupStatus = 'preparing canvas ... ';
        this.setupCanvas();
        this.setChartHeight();

        this.setupStatus = '';
      } catch {
        this.errorMessage = 'let\'s training model';
        this.canDetect = false;
        this.isPlay = false;
      }
    }
  }

  private drawDetect(score: number[]): void {
    if (score.length == 0) {
      score = new Array<number>(this.classes.length).fill(0);
    }

    this.detectBarChartData = {
      labels: this.classes,
      datasets: [
        {
          data: score,
          barPercentage: 0.5,
          backgroundColor: this.detectBarChartColors
        }
      ]
    };
  }

  private async detect(image: tf.Tensor3D): Promise<void> {
    tf.engine().startScope();
    let data = tf.image
      .resizeBilinear(image, [this.inputShape[0], this.inputShape[1]], true)
      .div(255)
      .reshape([1, this.inputShape[0], this.inputShape[1], this.inputShape[2]]);

    let result = await this.model.predict(data) as tf.Tensor

    const topk = tf.topk(result, this.classes.length);
    const classIndex = await topk.indices.data();
    const value = await topk.values.data();

    let score = new Array<number>(this.classes.length).fill(0);
    for (let i = 0; i < this.classes.length; i++) {
      score[classIndex[i]] = Math.round(value[i] * 100);
    }
    this.drawDetect(score);

    tf.dispose([topk, image, data, result]);
    tf.engine().endScope();
  }

  private async readFile(file: File): Promise<void> {
    const reader = new FileReader();
    const that = this;
    reader.readAsDataURL(file)

    const imgStr: string = await new Promise((resolve, reject) => {
      reader.onload = function () {
        resolve(reader.result as string);
      }
      reader.onerror = function (error) {
        console.log(error);
        reject;
      }
    });

    await that.canvasService.drawImage(that.canvasElement, imgStr, that.canvasSize, that.canvasSize)
    that.detect(tf.browser.fromPixels(that.canvasElement));
  }

  public selectedFile(): void {
    console.log((new Date()).toString(), 'start detect');
    const start = performance.now();

    const inputNode: any = document.querySelector('#detect-file');
    if (inputNode != null && inputNode.files.length > 0) {
      const files: File[] = [].slice.call(inputNode.files)
      this.readFile(files[0]);
    } else {
      this.drawDetect([]);
    }

    const proccessTime = performance.now() - start;
    console.log((new Date()).toString(), 'finish detect', this.utilService.convertMsToTime(proccessTime));
  }

  public async playWebcam(): Promise<void> {
    if (this.webcamElement == null) {
      await this.setupWebcam();
    }
    this.webcamElement.play();
    this.isPlay = true;

    while (this.isPlay && this.canDetect) {
      let img = await this.webcam.capture() as tf.Tensor3D;
      await this.detect(img);
      img.dispose();
      await tf.nextFrame();
    }
  }

  public pauseWebcam(): void {
    this.isPlay = false;
    if (this.webcamElement != null) {
      this.webcamElement.pause();
    }
  }

  private async setupWebcam(): Promise<void> {
    if (!this.canDetect) {
      return;
    }
    this.setupStatus = 'Setting webcam ... ';
    await this.utilService.sleep(100);

    this.webcamElement = document.getElementById('detect-webcam');
    this.webcamElement.width = this.webcamSize;
    this.webcamElement.height = this.webcamSize;
    this.webcam = await tf.data.webcam(this.webcamElement, this.webcamConfig);

    this.setupStatus = '';
  }

  private async setupCanvas(): Promise<void> {
    await this.utilService.sleep(100);

    this.canvasElement = document.getElementById('detect-canvas') as HTMLCanvasElement;
    this.canvasElement.width = this.canvasSize;
    this.canvasElement.height = this.canvasSize;
    this.canvasElement.style.border = 'thin solid red';
  }

  public async changeMenu(): Promise<void> {
    if (!this.canDetect) {
      return;
    }

    switch (this.menu) {
      case this.detectMenus[0].value:
        // file
        if (this.webcamElement != null) {
          this.webcamElement.pause;
          this.webcam.stop;
          this.isPlay = false;
        }
        this.setupCanvas();
        this.drawDetect([]);
        break;
      case this.detectMenus[1].value:
        // webcam
        await this.setupWebcam();
        this.webcam.start;
        this.playWebcam();
        break;
    }
  }

  async ngOnInit(): Promise<void> {
    this.getDataset({});
  }

  ngOnDestroy(): void {
    if (this.webcamElement) {
      this.pauseWebcam();
      this.webcam = null;

      const tracks = this.webcamElement.srcObject.getTracks();
      for (let track of tracks) {
        track.stop();
      }
      this.webcamElement.srcObject = null;
      this.webcamElement.load();
      this.webcamElement = null;
    }
    if (this.model) {
      tf.dispose(this.model);
    }
    console.clear();
  }
}
