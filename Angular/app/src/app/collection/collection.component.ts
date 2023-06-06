import { Component, ViewChildren, QueryList } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatDialog } from '@angular/material/dialog';

import * as constant from '../constant';
import { UtilService } from '../util/util.service';
import { CommonService } from '../common/common.service';
import { CanvasService } from '../canvas/canvas.service';

import { LabeledData } from '../models/labeled-data';
import { ImageInfo } from '../models/image-info';
import { Param } from '../models/param';

import { ThumbnailComponent } from '../thumbnail/thumbnail.component';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component'

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent {
  @ViewChildren(ThumbnailComponent) thumbnailComponent!: QueryList<ThumbnailComponent>;

  public prefix: string = constant.PREFIX_COLLECTION;

  public labeledDatas: LabeledData[] = [];
  public isAddingImage: boolean = false;

  public minCanTrainImageNum = constant.MIN_CAN_TRAIN_IMAGE_NUM;
  private maxClassesLength: number = constant.MAX_CLASS_SIZE;

  private deleteList: number[] = [];

  public openWebcamAreaFlg: boolean = false;
  private webcamElement: any = null;
  private webcamSize: number = constant.COLL_WEBCAM_SIZE;
  public isCutSquare: boolean = false;

  public recordLabel: string = 'Record'
  public fps: string = constant.DEFAULT_FPS;
  public delay: string = constant.DEFAULT_DELAY;
  public duration: string = constant.DEFAULT_DURATION;
  public fpsParams: Param[] = constant.FPS_PARAMS;
  public delayParams: Param[] = constant.DELAY_PARAMS;
  public durationParams: Param[] = constant.DURATION_PARAMS;

  public displaySummary: boolean = false;

  public viewSummarys: string[] = ['doughnut', 'bar']
  public viewSummary: string = this.viewSummarys[0]

  private summaryBarWidth: number = constant.SUMMARY_BAR_WIDTH;

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
    private dialog: MatDialog,
  ) { }

  public hasEmptyImage(): boolean {
    let count = 0;

    for (const labeledData of this.labeledDatas) {
      count += labeledData.imageInfos.length;
    }

    return (count == 0);
  }

  public async changeSummary(): Promise<void> {
    const index = this.viewSummarys.indexOf(this.viewSummary);
    this.viewSummary = this.viewSummarys[(index + 1) % this.viewSummarys.length];
  }

  private changeSummaryBarWidth(): void {
    const area = document.getElementById('coll-summary-bar') as HTMLElement;
    const size = this.summaryBarWidth * this.labeledDatas.length;
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
      for (let i = 0; i < this.labeledDatas.length; i++) {
        sum += this.labeledDatas[i].imageInfos.length;
        if (i == index) {
          num = this.labeledDatas[i].imageInfos.length
          label = this.labeledDatas[i].label;
        }
      }

      const centerX = event.active[0].element.x;
      const centerY = event.active[0].element.y;

      const canvas = document.getElementById('coll-summary-doughnut') as HTMLCanvasElement;
      const labels: string[] = [label, Math.round((num / sum) * 100) + ' %'];
      const font = '15px Meiryo bold';
      this.canvasService.drawCenteredLabels(canvas, labels, font, centerX, centerY);
    }
  }

  private drawSummary(): void {
    const labels: string[] = [];
    const data: number[] = [];
    for (let labeledData of this.labeledDatas) {
      labels.push(labeledData.label);
      data.push(labeledData.imageInfos.length);
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

  private getClassIndex(id: number): number {
    let index = -1;

    for (let i = 0; i < this.labeledDatas.length; i++) {
      const idList: number[] = this.labeledDatas[i].imageInfos.map(function (o: any) { return o.id; });
      if (idList.includes(id)) {
        index = i;
        break;
      }
    }

    return index;
  }

  public getImageInfo(args: any): void {
    let idList = this.labeledDatas[args.index].imageInfos.map(function (o: any) { return o.id; });
    const index = idList.indexOf(args.id);

    const thumbnailComponent = this.thumbnailComponent.toArray()[args.index];
    thumbnailComponent.attachCanvas(this.labeledDatas[args.index].imageInfos[index]);
  }

  public changeDeleteFlag(args: any): void {
    const listIndex = this.deleteList.indexOf(args.id);

    const thumbnailComponent = this.thumbnailComponent.toArray()[args.index];

    if (listIndex > -1) {
      this.deleteList.splice(listIndex, 1);
      let idList = this.labeledDatas[args.index].imageInfos.map(function (o: any) { return o.id; });
      let index = idList.indexOf(args.id);
      thumbnailComponent.drawThumbnail(this.labeledDatas[args.index].imageInfos[index].base64, args.id);
    } else {
      this.deleteList.push(args.id);
      thumbnailComponent.changeGrayScale(args.id);
    }
  }

  private selectDeleteFlag(id: number, index: number): void {
    const listIndex = this.deleteList.indexOf(id);
    const thumbnailComponent = this.thumbnailComponent.toArray()[index];

    if (listIndex < 0) {
      this.deleteList.push(id);
      thumbnailComponent.changeGrayScale(id);
    }
  }

  private deleteThumbnail(id: number): void {
    const index = this.getClassIndex(id);

    const thumbnailComponent = this.thumbnailComponent.toArray()[index];
    thumbnailComponent.deleteThumbnail(id);

    this.drawSummary();
  }

  private async addThumbnail(index: number, imgStr: string, id: number): Promise<void> {
    const thumbnailComponent = this.thumbnailComponent.toArray()[index];
    thumbnailComponent.addThumbnail(imgStr, id);
    this.drawSummary();
  }

  private addImage(index: number, imageInfo: ImageInfo): void {
    let id = -1;
    for (let labeledData of this.labeledDatas) {
      if (id < labeledData.getMaxImageId()) {
        id = labeledData.getMaxImageId();
      }
    }
    imageInfo.id = id + 1;
    this.labeledDatas[index].imageInfos.push(imageInfo);

    this.addThumbnail(index, imageInfo.base64, imageInfo.id);
  }

  private async readFile(index: number, file: File): Promise<void> {
    const reader = new FileReader();
    const that = this;
    reader.readAsDataURL(file);

    const imageInfo: ImageInfo = await new Promise((resolve, reject) => {
      reader.onload = function () {
        resolve(that.canvasService.getImageFromBase64(reader.result as string, that.isCutSquare));
      };
      reader.onerror = function (error) {
        console.log(error);
        reject;
      };
    });

    this.addImage(index, imageInfo);
  }

  public selectedFile(index: number): void {
    const inputNode: any = document.querySelector('#coll-file' + index);
    if (inputNode.files.length > 0) {
      this.isAddingImage = true;
      const files: File[] = [].slice.call(inputNode.files)
      for (let file of files) {
        this.readFile(index, file);
      }
      inputNode.value = '';
    }
    this.isAddingImage = false;
  }

  public async startRecord(index: number): Promise<void> {
    const fps = Number(this.fps);
    const delay = Number(this.delay);
    const duration = Number(this.duration)

    this.isAddingImage = true;
    const interval = 1.0 / fps;

    this.recordLabel = 'Recording in ' + this.delay + ' sec';
    for (let i = 0; i < delay; i++) {
      await this.utilService.sleep(1000);
      this.recordLabel = 'Recording in ' + (delay - (i + 1)) + ' sec';
    }

    this.recordLabel = 'Recording 0 sec'
    for (let i = 0; i < (duration * fps); i++) {
      const imageInfo = this.canvasService.getImageFromVideoElement(this.webcamElement, this.isCutSquare);
      this.addImage(index, imageInfo);
      if ((i + 1) % fps == 0) {
        this.recordLabel = 'Recording ' + ((i + 1) / fps) + ' sec'
      }
      await this.utilService.sleep(interval * 1000);
    }

    this.recordLabel = 'Record'
    this.isAddingImage = false;
  }

  public openWebcamArea(index: number): void {
    this.openWebcamAreaFlg = true;

    const webcamArea = document.getElementById('coll-webcam-area' + index) as HTMLElement;
    webcamArea.style.display = '';

    const menuArea = document.getElementById('coll-menu-area' + index) as HTMLElement;
    menuArea.style.display = 'none';

    this.webcamElement = document.getElementById('coll-webcam' + index) as HTMLVideoElement;
    this.webcamElement.width = this.webcamSize;
    this.webcamElement.height = this.webcamSize;

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    }).then(stream => {
      this.webcamElement.srcObject = stream;
    }).catch(error => {
      console.log(error);
    });

    this.webcamElement.play();
  }

  private stopWebcam(): void {
    if (this.webcamElement != null) {
      const tracks = this.webcamElement.srcObject.getTracks();
      for (let track of tracks) {
        track.stop();
      }
      this.webcamElement.srcObject = null;

      this.webcamElement.load();
      this.webcamElement = null;
    }
  }

  public closeWebcamArea(index: number): void {
    const webcamArea = document.getElementById('coll-webcam-area' + index) as HTMLElement;
    webcamArea.style.display = 'none';

    const menuArea = document.getElementById('coll-menu-area' + index) as HTMLElement;
    menuArea.style.display = '';

    this.stopWebcam();

    this.openWebcamAreaFlg = false;
  }

  private deleteImage(id: number): void {
    const deleteListIndex = this.deleteList.indexOf(id);
    if (deleteListIndex > -1) {
      this.deleteList.splice(deleteListIndex, 1)
    }

    this.deleteThumbnail(id);

    for (let i = 0; i < this.labeledDatas.length; i++) {
      let idList = this.labeledDatas[i].imageInfos.map(function (o: any) { return o.id; });
      let index = idList.indexOf(id);
      if (index > -1) {
        this.labeledDatas[i].imageInfos.splice(index, 1);
        break;
      }
    }
  }

  public selectImageInClass(index: number): void {
    for (let imageInfo of this.labeledDatas[index].imageInfos) {
      this.selectDeleteFlag(imageInfo.id, index);
    }
  }


  private deleteImageInList(): void {
    while (this.deleteList.length > 0) {
      this.deleteImage(this.deleteList[0]);
    }
  }

  public pushDeleteImageInList(): void {
    const message = 'Delete selected image(s). Are you sure?'

    const dialogRef = this.dialog.open(MessageDialogComponent, {
      data: { text: message },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteImageInList();
      }
    });

  }

  private deleteImageAll(): void {
    for (let i = 0; i < this.labeledDatas.length; i++) {
      while (this.labeledDatas[i].imageInfos.length > 0) {
        this.deleteImage(this.labeledDatas[i].imageInfos[0].id);
      }
    }
  }

  public pushDeleteImageAll(): void {
    const message = 'Delete all images. Are you sure?'

    const dialogRef = this.dialog.open(MessageDialogComponent, {
      data: { text: message },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteImageAll();
      }
    });
  }

  private async refreshDataset(): Promise<void> {
    this.deleteImageAll();
    this.labeledDatas = [];
    for (let i = 0; i < constant.DEFAULT_LABELED_DATAS_SIZE; i++) {
      this.labeledDatas.push(new LabeledData(i + 1));
    }

    await this.utilService.sleep(100);
    for (let i = 0; i < this.labeledDatas.length; i++) {
      this.changeLabelWidth(i);
    }
    this.changeSummaryBarWidth();
    this.refreshLocalProject();
  }

  public pushRefreshDataset(): void {
    const message = 'Refresh dataset. Are you sure?'

    const dialogRef = this.dialog.open(MessageDialogComponent, {
      data: { text: message },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshDataset();
      }
    });
  }

  private getInputWidth(txt: string, font: string): number {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.font = font;
    return ctx.measureText(txt).width;
  }

  private changeLabelWidth(index: number): void {
    const labelElem = document.getElementById('coll-label' + index) as HTMLElement;
    const style = window.getComputedStyle(labelElem);
    const font = style.getPropertyValue('font')
    const width = this.getInputWidth(this.labeledDatas[index].label, font);
    labelElem.style.width = width + 10 + 'px';
  }

  public changeLabelName(index: number): void {
    this.changeLabelWidth(index);
    this.drawSummary();
  }

  public myTrackBy(index: number, obj: any): any {
    return index;
  }

  public canAddClass(): boolean {
    return this.labeledDatas.length < this.maxClassesLength;
  }

  public async addClass(): Promise<void> {
    if (!this.canAddClass()) {
      console.log('class is max size');
      return;
    }

    let id = 1;
    if (this.labeledDatas.length > 0) {
      id = this.labeledDatas[this.labeledDatas.length - 1].id + 1;
    }
    this.labeledDatas.push(new LabeledData(id));

    this.drawSummary();

    await this.utilService.sleep(100);
    this.changeLabelWidth(this.labeledDatas.length - 1);
    this.changeSummaryBarWidth();
    this.refreshLocalProject();
  }

  private refreshLocalProject(): void {
    this.commonService.setTrainedIndexClass([]);
    this.commonService.setReportLogs([]);
  }

  private deleteClass(index: number): void {
    for (let i = 0; i < this.labeledDatas.length; i++) {
      for (let imageInfo of this.labeledDatas[i].imageInfos) {
        if (i == index) {
          const deleteListIndex = this.deleteList.indexOf(imageInfo.id);
          if (deleteListIndex > -1) {
            this.deleteList.splice(deleteListIndex, 1);
          }
        }
        this.deleteThumbnail(imageInfo.id);
      }
    }

    this.labeledDatas.splice(index, 1);

    for (let i = 0; i < this.labeledDatas.length; i++) {
      this.changeLabelWidth(i);
      for (let imageInfo of this.labeledDatas[i].imageInfos) {
        this.addThumbnail(i, imageInfo.base64, imageInfo.id);
      }
    }

    this.changeSummaryBarWidth();
    this.refreshLocalProject();
  }

  public pushDeleteClass(index: number): void {
    const message = 'Delete selected class. Are you sure?'

    const dialogRef = this.dialog.open(MessageDialogComponent, {
      data: { text: message },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteClass(index);
      }
    });

  }

  public async downloadDataset(): Promise<void> {
    let dataset: any = { dataset: this.labeledDatas };

    const contentType = 'application/json';
    const fileName = 'dataset.json';

    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: contentType });

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = fileName;
    anchor.href = url;

    await this.utilService.sleep(100);
    anchor.click();
  }

  public async drawLoadDatas(): Promise<void> {
    await this.utilService.sleep(100);

    await this.utilService.sleep(100);
    for (let i = 0; i < this.labeledDatas.length; i++) {
      for (let imageInfo of this.labeledDatas[i].imageInfos) {
        this.addThumbnail(i, imageInfo.base64, imageInfo.id);
      }
      this.changeLabelWidth(i);
    }
    this.changeSummaryBarWidth();
  }

  public async uploadDataset(): Promise<void> {
    this.deleteImageAll();

    let inputNode: any = document.querySelector('#json');
    if (inputNode.files.length > 0) {
      const fileArray: File[] = [].slice.call(inputNode.files);

      const reader = new FileReader();
      reader.readAsText(fileArray[0]);
      const datasets: any = await new Promise((resolve, reject) => {
        reader.onload = function () {
          resolve(JSON.parse(reader.result as string));
        }
        reader.onerror = function (error) {
          console.log(error);
          reject;
        }
      });
      inputNode.value = '';

      try {
        this.deleteImageAll();
        this.labeledDatas = [];
        for (let dataset of datasets.dataset) {
          let labeledData = new LabeledData(-1);
          labeledData.id = dataset.id as number;
          labeledData.label = dataset.label as string;
          labeledData.isTrain = dataset.isTrain as boolean;
          for (let image of dataset.imageInfos) {
            let imageInfo = new ImageInfo(
              image.id as number,
              image.base64 as string,
              image.resizeWidth as number,
              image.resizeHeight as number,
              image.naturalWidth as number,
              image.naturalHeight as number
            );
            imageInfo.isTrain = image.isTrain as boolean;

            labeledData.imageInfos.push(imageInfo);
          }
          this.labeledDatas.push(labeledData);
        }
      } catch (error) {
        this.refreshDataset();
        console.log(error);
      }
    }
    this.drawLoadDatas();
    this.refreshLocalProject();
  }

  ngOnInit(): void {
    this.labeledDatas = this.commonService.getLabeledDatas();
  }

  ngAfterViewInit(): void {
    for (let i = 0; i < this.labeledDatas.length; i++) {
      for (let imageInfo of this.labeledDatas[i].imageInfos) {
        this.addThumbnail(i, imageInfo.base64, imageInfo.id);
      }
      this.changeLabelWidth(i);
    }

    this.changeSummaryBarWidth();

    const area = document.getElementById('coll-summary-area') as HTMLElement;
    area.style.display = '';
  }

  ngOnDestroy(): void {
    this.commonService.setLabeledDatas(this.labeledDatas);
    this.stopWebcam();
    console.clear();
  }
}
