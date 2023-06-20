
import * as constant from '../properties/constant';

export class CallbacksParam {
  constructor(
    // ReduceLROnPlateau
    public reduceLROnFlag: boolean = constant.DEFAULT_REDUSE_LRON_FLAG,
    public reduceFactor: number = constant.DEFAULT_REDUSE_FACTOR,
    public reducePatience: number = constant.DEFAULT_REDUSE_PATIENCE,
    public reduceMinDelta: number = constant.DEFAULT_REDUSE_MIN_DELTA,

    // earlyStopping
    public earlyStoppingFlag: boolean = constant.DEFAULT_EARLY_STOPPING_FLAG,
    public earlyStopPatience: number = constant.DEFAULT_EARLY_STOPPING_PATIENCE,
    public earlyStopMinDelta: number = constant.DEFAULT_EARLY_STOPPING_MIN_DELTA,
  ) { };
}
