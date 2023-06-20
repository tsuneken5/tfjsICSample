import { Component, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';

import * as tf from '@tensorflow/tfjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';

import * as constant from '../../../properties/constant';
import { CommonService } from '../../../services/common.service';
import { LabeledData } from '../../../models/labeled-data';

import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { AlartDialogComponent } from '../../shared/alart-dialog/alart-dialog.component';

@Component({
  selector: 'app-project-menu',
  templateUrl: './project-menu.component.html',
  styleUrls: ['./project-menu.component.css']
})
export class ProjectMenuComponent {
  @Output() setDataset = new EventEmitter<{}>();
  @Output() getDataset = new EventEmitter<{}>();

  public saveProjectName: string = '';
  public loadProjectName: string = '';
  public deleteProjectName: string = '';
  public projects: string[] = [];

  public includeParams: boolean = true;
  public paramList: string[] = [];

  constructor(
    private commonService: CommonService,
    private dbService: NgxIndexedDBService,
    private dialog: MatDialog,
  ) { }

  public async saveProject(): Promise<void> {
    if (!this.saveProjectName) {
      const message = 'The project name has not been entered.'

      const dialogRef = this.dialog.open(AlartDialogComponent, {
        data: { text: message },
      });

      await lastValueFrom(dialogRef.afterClosed());

      return;
    }

    if (this.projects.includes(this.saveProjectName)) {
      const message = 'Overwrite the project. Are you sure?'

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { text: message },
      });

      const result = await lastValueFrom(dialogRef.afterClosed());
      if (!result) {
        return;
      }
    }

    this.setDataset.emit({});
  }

  public async addProject(): Promise<void> {
    const labeledDatas = this.commonService.getLabeledDatas();
    const trainedClassList = this.commonService.getTrainedIndexClass();

    let model: any = null;
    if (trainedClassList.length) {
      model = await tf.loadLayersModel('indexeddb://' + constant.TMP_MODEL_NAME);
    }

    if (this.projects.includes(this.saveProjectName)) {
      await lastValueFrom(this.dbService
        .update(constant.PROJECT_STORE_NAME, {
          project: this.saveProjectName,
          labeledDatas: labeledDatas,
          trainedClassList: trainedClassList,
        }));
    } else {
      await lastValueFrom(this.dbService
        .add(constant.PROJECT_STORE_NAME, {
          project: this.saveProjectName,
          labeledDatas: labeledDatas,
          trainedClassList: trainedClassList,
        }));

      this.projects.push(this.saveProjectName);
      this.projects.sort();
    }
    if (trainedClassList.length) {
      model.save('indexeddb://' + this.saveProjectName);
    }
    this.loadProjectName = this.saveProjectName;

    if (this.includeParams) {
      const trainingParam = this.commonService.getTrainingParam();
      const augmentParam = this.commonService.getAugmentParam();
      const callbacksParam = this.commonService.getCallbacksParam();

      if (this.paramList.includes(this.saveProjectName)) {
        await lastValueFrom(this.dbService
          .update(constant.PARAM_STORE_NAME, {
            project: this.saveProjectName,
            training: trainingParam,
            augment: augmentParam,
            callbacks: callbacksParam,

          }));
      } else {
        await lastValueFrom(this.dbService
          .add(constant.PARAM_STORE_NAME, {
            project: this.saveProjectName,
            training: trainingParam,
            augment: augmentParam,
            callbacks: callbacksParam,
          }));

        this.paramList.push(this.saveProjectName);
        this.paramList.sort();
      }
    }

    this.commonService.setProject(this.saveProjectName);
  }

  public async loadProject(): Promise<void> {
    if (!this.loadProjectName) {
      console.log('load project name is empty');
      return;
    }

    const result: any = await lastValueFrom(this.dbService.getByKey(constant.PROJECT_STORE_NAME, this.loadProjectName));

    const labeledDatas: LabeledData[] = [];
    for (let data of result.labeledDatas) {
      const labeledData = new LabeledData(data.id);
      labeledData.label = data.label;
      labeledData.isTrain = data.isTrain;
      labeledData.imageInfos = data.imageInfos;
      labeledDatas.push(labeledData);
    }

    this.commonService.setLabeledDatas(labeledDatas);
    this.commonService.setTrainedIndexClass(result.trainedClassList);
    if (result.trainedClassList.length) {
      const model = await tf.loadLayersModel('indexeddb://' + this.loadProjectName);
      await model.save('indexeddb://' + constant.TMP_MODEL_NAME);
    }

    if (this.includeParams && this.paramList.includes(this.loadProjectName)) {
      const result: any = await lastValueFrom(this.dbService.getByKey(constant.PARAM_STORE_NAME, this.loadProjectName));

      this.commonService.setTrainingParam(result.training);
      this.commonService.setAugmentParam(result.augment);
      this.commonService.setCallbacksParam(result.callbacks);
    }

    this.getDataset.emit();

    this.saveProjectName = this.loadProjectName;
    this.commonService.setProject(this.saveProjectName);
    this.commonService.setHistory(null);
  }

  public async deleteProject(): Promise<void> {
    if (!this.deleteProjectName) {
      const message = 'The project name has not been entered.'

      const dialogRef = this.dialog.open(AlartDialogComponent, {
        data: { text: message },
      });

      await lastValueFrom(dialogRef.afterClosed());

      return;
    }

    const message = 'delete the project. Are you sure?'
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { text: message },
    });

    const result = await lastValueFrom(dialogRef.afterClosed());
    if (!result) {
      return;
    }

    let index = this.projects.indexOf(this.deleteProjectName);
    if (index < 0) {
      console.log('delete project name is not existed');
      this.deleteProjectName = '';
      return;
    }

    this.projects.splice(index, 1);

    await lastValueFrom(this.dbService.delete(constant.PROJECT_STORE_NAME, this.deleteProjectName));

    if (this.loadProjectName == this.deleteProjectName) {
      if (this.projects.length) {
        this.loadProjectName = this.projects[0];
      } else {
        this.loadProjectName = '';
      }
    }

    const modelList = JSON.parse(JSON.stringify(await tf.io.listModels()));
    let removeModel: string = '';
    const name = 'indexeddb://' + this.deleteProjectName
    for (let modelName in modelList) {
      if (modelName == name) {
        removeModel = modelName;
        break;
      }
    }

    if (removeModel) {
      tf.io.removeModel('indexeddb://' + this.deleteProjectName);
    }

    index = this.paramList.indexOf(this.deleteProjectName)
    if (this.paramList.includes(this.deleteProjectName)) {
      this.paramList.splice(index, 1);
      await lastValueFrom(this.dbService.delete(constant.PARAM_STORE_NAME, this.deleteProjectName));
    }

    this.deleteProjectName = '';
  }

  private async getProjectNames(): Promise<void> {
    this.projects = [];

    const result: any = await lastValueFrom(this.dbService.getAll(constant.PROJECT_STORE_NAME));

    for (let project of result) {
      this.projects.push(project.project);
    }

    if (this.projects) {
      this.projects.sort();
      this.loadProjectName = this.projects[0];
    }
  }

  private async getParamList(): Promise<void> {
    this.paramList = [];

    const result: any = await lastValueFrom(this.dbService.getAll(constant.PARAM_STORE_NAME));

    for (let param of result) {
      this.paramList.push(param.project);
    }

    if (this.paramList) {
      this.paramList.sort();
    }
  }

  async ngOnInit(): Promise<void> {
    await this.getProjectNames();
    await this.getParamList();

    this.saveProjectName = this.commonService.getProject();

    if (this.saveProjectName && this.projects.includes(this.saveProjectName)) {
      this.loadProjectName = this.saveProjectName;
    }
  }
}
