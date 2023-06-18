import { Component, Input } from '@angular/core';

import { ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import * as constant from '../../../properties/constant';
import { CommonService } from '../../../services/common.service';
import { CanvasService } from '../../../services/canvas.service';
import { LabeledData } from '../../../models/labeled-data';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent {
  @Input() prefix!: string;
  public labeledDatas: LabeledData[] = [];
  public summaryTitle: string = '';
  public summaryMessage: string = '';

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

  public hasEmptyImage(): boolean {
    let count = 0;

    for (const labeledData of this.labeledDatas) {
      count += labeledData.imageInfos.length;
    }

    return (count == 0);
  }

  public canTrainClass(index: number): boolean {
    return (this.labeledDatas[index].isTrainNum() >= constant.MIN_CAN_TRAIN_IMAGE_NUM);
  }

  public canTrain(): boolean {
    let trainClassList = [];

    for (let i = 0; i < this.labeledDatas.length; i++) {
      if (this.canTrainClass(i)) {
        trainClassList.push(i);
      }
    }

    return (trainClassList.length >= constant.MIN_CAN_TRAIN_CLASS_NUM);
  }

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
    private canvasService: CanvasService,
    private commonService: CommonService
  ) { }

  public canDraw(): boolean {
    switch (this.prefix) {
      case constant.PREFIX_COLLECTION:
        return !this.hasEmptyImage();
      case constant.PREFIX_TRAINING:
        return this.canTrain();
      default:
        return false;
    }
  }

  public async changeSummary(): Promise<void> {
    const index = this.viewSummarys.indexOf(this.viewSummary);
    this.viewSummary = this.viewSummarys[(index + 1) % this.viewSummarys.length];
  }

  public changeSummaryBarWidth(): void {
    const area = document.getElementById(this.prefix + '-summary-bar') as HTMLElement;
    this.labeledDatas = this.commonService.getLabeledDatas();
    const size = this.summaryBarWidth * this.labeledDatas.length;
    area.style.width = size + 'px';
  }

  public changeDisplaySummary(): void {
    this.displaySummary = !this.displaySummary;
  }

  public summaryClick(event: any): void {
    console.log(event);
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

      const canvas = document.getElementById(this.prefix + '-summary-doughnut') as HTMLCanvasElement;
      const labels: string[] = [label, Math.round((num / sum) * 100) + ' %'];
      const font = '15px Meiryo bold';
      this.canvasService.drawCenteredLabels(canvas, labels, font, centerX, centerY);
    }
  }

  public drawSummary(): void {
    this.labeledDatas = this.commonService.getLabeledDatas();

    if (this.hasEmptyImage()) {
      return;
    }

    if (this.prefix == constant.PREFIX_TRAINING && !this.canTrain()) {
      return;
    }

    const labels: string[] = [];
    const data: number[] = [];
    for (let labeledData of this.labeledDatas) {
      switch (this.prefix) {
        case constant.PREFIX_COLLECTION:
          labels.push(labeledData.label);
          data.push(labeledData.imageInfos.length);
          break;
        case constant.PREFIX_TRAINING:
          labels.push(labeledData.label);
          data.push(labeledData.isTrainNum());
          break;
      }
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

  ngOnInit(): void {
    this.labeledDatas = this.commonService.getLabeledDatas();

    console.log('prefix', this.prefix);

    switch (this.prefix) {
      case constant.PREFIX_COLLECTION:
        this.summaryTitle = 'collection summary';
        this.summaryMessage = 'add image samples.'
        break;
      case constant.PREFIX_TRAINING:
        this.summaryTitle = 'training summary';
        this.summaryMessage = 'Not enough classes available for training.'
        break
      default:
        this.summaryTitle = 'summary';
    }
  }

  ngAfterViewInit(): void {
    this.changeSummaryBarWidth();
    this.drawSummary();

    const area = document.getElementById(this.prefix + '-summary-area') as HTMLElement;
    area.style.display = '';
  }
}
