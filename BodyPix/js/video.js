// BodyPix load properties
const ARCHITECTURE = 'MobileNetV1'; 					// Can be either MobileNetV1 or ResNet50. It determines which BodyPix architecture to load.
const MILTIPLIER = 1; 									// Can be one of 1.0, 0.75, or 0.50 (The value is used only by the MobileNetV1 architecture and not by the ResNet architecture). It is the float multiplier for the depth (number of channels) for all convolution ops. The larger the value, the larger the size of the layers, and more accurate the model at the cost of speed. A smaller value results in a smaller model and faster prediction time but lower accuracy.
const OUTPUT_STRIDE = 16;								// Can be one of 8, 16, 32 (Stride 16, 32 are supported for the ResNet architecture and stride 8, and 16 are supported for the MobileNetV1 architecture). It specifies the output stride of the BodyPix model. The smaller the value, the larger the output resolution, and more accurate the model at the cost of speed. A larger value results in a smaller model and faster prediction time but lower accuracy.
const QUANT_BYTES = 2;									// This argument controls the bytes used for weight quantization. The available options are:
														//		4. 4 bytes per float (no quantization). Leads to highest accuracy and original model size.
														//		2. 2 bytes per float. Leads to slightly lower accuracy and 2x model size reduction.
														//		1. 1 byte per float. Leads to lower accuracy and 4x model size reduction.

// Segmentation properties
const SEGM_FLIP_HORIZONTAL = false;
const INTERNAL_RESOLUTION = 'medium';					// Defaults to medium. The internal resolution percentage that the input is resized to before inference. The larger the internalResolution the more accurate the model at the cost of slower prediction times. Available values are low, medium, high, full, or a percentage value between 0 and 1. The values low, medium, high, and full map to 0.25, 0.5, 0.75, and 1.0 correspondingly.
const SEGMENTATION_THRESHOLD = 0.7;						// Defaults to 0.7. Must be between 0 and 1. For each pixel, the model estimates a score between 0 and 1 that indicates how confident it is that part of a person is displayed in that pixel. This segmentationThreshold is used to convert these values to binary 0 or 1s by determining the minimum value a pixel's score must have to be considered part of a person. In essence, a higher value will create a tighter crop around a person but may result in some pixels being that are part of a person being excluded from the returned segmentation mask.
const SCORE_THRESHOLD_ID = 0.9;							// Defaults to 0.3. For pose estimation, only return individual person detections that have root part score greater or equal to this value

// Mask properties
const FOREGROUND_COLOR= {r: 0, g: 0, b: 0, a: 0};
const BACKGROUND_COLOR= {r: 0, g: 0, b: 0, a: 255};

const OPACITY = 1;
const MASK_BLUR_AMOUNT = 0;
const DRAW_FLIP_HORIZONTAL = true;
 
const videoElement = document.getElementById('video');
const canvas = document.getElementById('canvas');

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const blurBtn = document.getElementById('blur-btn');
const unblurBtn = document.getElementById('unblur-btn');

const ctx = canvas.getContext('2d');

startBtn.addEventListener('click', e => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  unblurBtn.disabled = false;
  blurBtn.disabled = false;

  startVideoStream();
});

stopBtn.addEventListener('click', e => {
  startBtn.disabled = false;
  stopBtn.disabled = true;

  unblurBtn.disabled = true;
  blurBtn.disabled = true;

  unblurBtn.hidden = true;
  blurBtn.hidden = false;

  videoElement.hidden = false;
  canvas.hidden = true;

  stopVideoStream();
});

blurBtn.addEventListener('click', e => {
  blurBtn.hidden = true;
  unblurBtn.hidden = false;

  videoElement.hidden = true;
  canvas.hidden = false;

  loadBodyPix();
});

unblurBtn.addEventListener('click', e => {
  blurBtn.hidden = false;
  unblurBtn.hidden = true;

  videoElement.hidden = false;
  canvas.hidden = true;
});

videoElement.onplaying = () => {
  canvas.height = videoElement.videoHeight;
  canvas.width = videoElement.videoWidth;
};

function startVideoStream() {
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(stream => {
      videoElement.srcObject = stream;
      videoElement.play();
    })
    .catch(err => {
      startBtn.disabled = false;
      blurBtn.disabled = true;
      stopBtn.disabled = true;
      alert(`Following error occured: ${err}`);
    });
}

function stopVideoStream() {
  const stream = videoElement.srcObject;

  stream.getTracks().forEach(track => track.stop());
  videoElement.srcObject = null;
}

function loadBodyPix() {
  options = {
	architecture: ARCHITECTURE, // architecture - Can be either MobileNetV1 or ResNet50. It determines which BodyPix architecture to load.
    multiplier: MILTIPLIER,
    outputStride: OUTPUT_STRIDE,
    quantBytes: QUANT_BYTES
  }
  bodyPix.load(options)
    .then(net => perform(net))
    .catch(err => console.log(err))
}

const segmentationProperties = {
  flipHorizontal: SEGM_FLIP_HORIZONTAL,
  internalResolution: INTERNAL_RESOLUTION,
  segmentationThreshold: SEGMENTATION_THRESHOLD,
  scoreThreshold: SCORE_THRESHOLD_ID
};

async function perform(net) {

  while (startBtn.disabled && blurBtn.hidden) {
    const segmentation = await net.segmentPerson(video, segmentationProperties);

	const backgroundDarkeningMask = bodyPix.toMask(
		segmentation, FOREGROUND_COLOR, BACKGROUND_COLOR);
	
	const opacity = 1;
	const maskBlurAmount = 0;
	const flipHorizontal = true;
	bodyPix.drawMask(
		canvas, videoElement, backgroundDarkeningMask, OPACITY, MASK_BLUR_AMOUNT, DRAW_FLIP_HORIZONTAL);
  }
}
