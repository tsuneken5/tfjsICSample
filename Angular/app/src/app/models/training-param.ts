import * as constant from '../properties/constant';

export class TrainingParam {
  constructor(
    public baseModel: string = constant.DEFAULT_BASE_MODEL,
    public epochs: number = constant.DEFAULT_EPOCHS,
    public batchSize: number = constant.DEFAULT_BACTH_SIZE,
    public learningRate: number = constant.DEFAULT_LEARNING_RATE,
    public validationSplit: number = constant.DEFAULT_VALIDATION_SPLIT,
  ) { };
}

