Javascipt Webcam project using HTML Canvas and TensorFlow

There is four option of Webcam Display :
1st Normal - this uses only HTML Canvas

2de Screen (blue screen) - this uses HTML Canvas with settings:
  1. Add a background image
  2. Color input selector
  3. Threshold range option
  4. Option to use a color picker, to select a color from Canvas

3th Blur Screen - this uses both HTML Canvas and TensorFlow's MediaPipe SelfieSegmentation model with settings:
  1. Background Blur range input
  2. Edge Blur range input
  3. Foreground Threshold range input

4th Image Screen - this uses both HTML Canvas and TensorFlow's MediaPipe SelfieSegmentation model with settings:
  1. Add a background image
  2. Foreground Threshold range input
  3. Mask Blur range input
  4. Mask Opacity range input

the 4th option replace the background with an image by masking the person's body
