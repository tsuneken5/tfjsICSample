import { Param } from '../models/param';

export const TMP_MODEL_NAME: string = 'tmp-model'

export const DEFAULT_LABELED_DATAS_SIZE: number = 2;
export const MAX_CLASS_SIZE: number = 10;

export const THUMBNAIL_SIZE: number = 150;
export const THUMBNAIL_LAYOUT_MENUS: string[] = ['overflow-x', 'overflow-y'];
export const DEFAUL_THUMBNAIL_LAYOUT: string = THUMBNAIL_LAYOUT_MENUS[0];

export const PREFIX_COLLECTION: string = 'coll';
export const PREFIX_TRAINING: string = 'train';

export const IMAGE_SIZE: number = 512;
export const INPUT_SHAPE: number[] = [224, 224, 3];

export const COLL_WEBCAM_SIZE: number = 224;

export const DETECT_VIDEO_SIZE: number = 512;
export const DETECT_CANVAS_SIZE: number = 512;

export const MIN_CAN_TRAIN_IMAGE_NUM: number = 10;
export const MIN_CAN_TRAIN_CLASS_NUM: number = 2;

export const SUMMARY_BAR_WIDTH: number = 75;
export const DETECT_BAR_HEIGHT: number = 50;

// collection webcam parameter
export const DEFAULT_FPS: number = 5;
export const DEFAULT_DELAY: number = 2;
export const DEFAULT_DURATION: number = 5;

// training parameter
export const BASE_MODEL_PARAMS: Param[] = [
  new Param('MobileNet v1', 'mobilenet_v1',),
  new Param('MobileNet v2', 'mobilenet_v2',),
];
export const DEFAULT_BASE_MODEL: string = BASE_MODEL_PARAMS[0].value
export const DEFAULT_EPOCHS: number = 50;
export const DEFAULT_BACTH_SIZE: number = 2;
export const DEFAULT_LEARNING_RATE: number = 0.001;
export const DEFAULT_VALIDATION_SPLIT: number = 0.2;

// data augument parameter
export const DEFAULT_AUGMENT_RATE_FLAG: boolean = false;
export const DEFAULT_AUGMENT_RATE: number = 0.2;
export const DEFAULT_RANDOM_HUE_FLAG: boolean = false;
export const DEFAULT_RANDOM_HUE: number = 0.1;
export const DEFAULT_RANDOM_SATURATION_FLAG: boolean = false;
export const DEFAULT_RANDOM_SATURATION: number = 0.1;
export const DEFAULT_RANDOM_BRIGHTNESS_FLAG: boolean = false;
export const DEFAULT_RANDOM_BRIGHTNESS: number = 0.1;
export const DEFAULT_RANDOM_CONTRAST_FLAG: boolean = false;
export const DEFAULT_RANDOM_CONTRAST: number = 0.1;
export const DEFAULT_GRAYSCALE_FLAG: boolean = false;
export const DEFAULT_NOISE_INJECTION_FLAG: boolean = false;
export const DEFAULT_NOISE_INJECTION: number = 0.1;
export const DEFAULT_BLUR_FILTER_FLAG: boolean = false;
export const DEFAULT_BLUR_FILTER: number = 0.1;
export const DEFAULT_CUT_OUT_FLAG: boolean = false;
export const DEFAULT_CUT_OUT_RANGE: number = 0.1;
export const DEFAULT_CROP_FLAG: boolean = false;
export const DEFAULT_CROP_RANGE: number = 0.9;
export const DEFAULT_SHEAR_FLAG: boolean = false;
export const DEFAULT_SHEAR_RANGE: number = 0.1;
export const DEFAULT_ROTATION_FLAG: boolean = false;
export const DEFAULT_ROTATION_RANGE: number = 5;
export const DEFAULT_WIDTH_SHIFT_FLAG: boolean = false;
export const DEFAULT_WIDTH_SHIFT_RANGE: number = 0.1;
export const DEFAULT_HEIGHT_SHIFT_FLAG: boolean = false;
export const DEFAULT_HEIGHT_SHIFT_RANGE: number = 0.1;
export const DEFAULT_HORIZONTAL_FLIP_FLAG: boolean = false;
export const DEFAULT_VERTICAL_FLIP_FLAG: boolean = false;
export const MIN_LEARNING_RATE: number = 0.00001;

// ReduceLROnPlateau
export const DEFAULT_REDUSE_LRON_FLAG: boolean = false;
export const DEFAULT_REDUSE_FACTOR: number = 0.5;
export const DEFAULT_REDUSE_PATIENCE: number = 3;
export const DEFAULT_REDUSE_MIN_DELTA: number = 0;

// earlyStopping
export const DEFAULT_EARLY_STOPPING_FLAG: boolean = false;
export const DEFAULT_EARLY_STOPPING_PATIENCE: number = 10;
export const DEFAULT_EARLY_STOPPING_MIN_DELTA: number = 0;

export const DETECT_MENUS: Param[] = [
  new Param('File'), new Param('Webcam')
];
export const DEFAULT_DETECT_MENU: string = DETECT_MENUS[0].value;

export const CHART_COLORS: string[] = [
  '#ff7f7f',
  '#ff7fbf',
  '#ff7fff',
  '#bf7fff',
  '#7f7fff',
  '#7fbfff',
  '#7fffff',
  '#7fffbf',
  '#7fff7f',
  '#bfff7f',
];

export const STORE_NAME: string = 'dataset';