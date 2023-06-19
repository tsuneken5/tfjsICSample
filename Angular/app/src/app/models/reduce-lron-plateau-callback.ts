import * as tf from '@tensorflow/tfjs';

import * as constant from '../properties/constant';

export class ReduceLROnPlateauCallback extends tf.Callback {
  public factor: number;
  public patience: number;
  public minDelta: number;
  public wait: number;
  public best: number;

  constructor(factor: number = 1.0, patience: number = 3, minDelta: number = 0) {
    super();
    this.factor = factor;
    this.patience = patience;
    this.minDelta = minDelta;
    this.wait = 0;
    this.best = Infinity;
  }

  public override async onEpochEnd(epoch: any, logs: any): Promise<void> {
    // @ts-ignore
    const oldLearningRate = this.model.optimizer.learningRate;
    if (oldLearningRate <= constant.MIN_LEARNING_RATE) {
      return;
    }

    const currentLoss = logs.loss;
    if (currentLoss < this.best - this.minDelta) {
      this.best = currentLoss;
      this.wait = 0;
    } else {
      this.wait += 1;
      if (this.wait >= this.patience) {
        let newLearningRate = oldLearningRate * this.factor;
        if (newLearningRate < constant.MIN_LEARNING_RATE) {
          newLearningRate = constant.MIN_LEARNING_RATE;
        }
        // @ts-ignore
        this.model.optimizer.learningRate = newLearningRate;
        this.wait = 0;
        console.log('learning rate', oldLearningRate, '->', newLearningRate);
      }
    }
  }
}
