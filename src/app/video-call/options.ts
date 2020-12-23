export const ARCHITECTURE = 'MobileNetV1';
export const MILTIPLIER = 1;
export const OUTPUT_STRIDE = 16;
export const QUANT_BYTES = 2;

// Segmentation properties
export const SEGM_FLIP_HORIZONTAL = false;
export const INTERNAL_RESOLUTION = 'medium';
export const SEGMENTATION_THRESHOLD = 0.7;
export const SCORE_THRESHOLD_ID = 0.9;

// Mask properties
export const FOREGROUND_COLOR = {r: 0, g: 0, b: 0, a: 0};
export const BACKGROUND_COLOR = {r: 0, g: 0, b: 0, a: 255};

export const OPACITY = 1;
export const MASK_BLUR_AMOUNT = 0;
export const DRAW_FLIP_HORIZONTAL = true;
