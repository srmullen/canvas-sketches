const canvasSketch = require('canvas-sketch');
const { GPU } = require('gpu.js/src/index');

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true },
  orientation: 'portrait',
  dimensions: 'a4',
  pixelsPerInch: 300
};

const sketch = ({ canvas, context }) => {
  const gpu = new GPU({
    canvas,
    context
  });

  const kernel = gpu.createKernel(function (width, height, time) {
    const red = this.thread.x / width;
    const green = this.thread.y / height;
    const blue = (this.thread.y + this.thread.x) / (this.thread.y + this.thread.x);
    this.color((red + time) % 1, (green + time) % 1, (blue + time) % 1);
  }, {
    graphical: true,
    output: [canvas.width, canvas.height]
  })

  // Return the renderer function
  return ({ time }) => {
    kernel(canvas.width, canvas.height, time);
  };
};

canvasSketch(sketch, settings);
