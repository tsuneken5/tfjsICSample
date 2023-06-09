import { Param } from './models/param';

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