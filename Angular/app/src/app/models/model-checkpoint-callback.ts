import * as tf from '@tensorflow/tfjs';

export class ModelCheckpointCallback extends tf.Callback {
  public best: number = Infinity;
  public checkpoint: any = null;
  public minEpoch: number;
  constructor(minEpoch: number = 10) {
    super();
    this.minEpoch = minEpoch;
  }

  public override async onEpochEnd(epoch: any, logs: any): Promise<void> {
    const currentLoss = logs.loss;
    if (currentLoss < this.best) {
      this.best = currentLoss;
      if (epoch > this.minEpoch) {
        console.log(epoch, ': check point')
        this.checkpoint = this.model;
      }
    }
  }
}
