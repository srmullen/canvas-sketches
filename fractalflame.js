const canvasSketch = require('canvas-sketch');
const { GPU } = require('gpu.js/src/index');

const settings = {
  // Make the loop animated
  animate: false,
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

  const kernel1 = gpu.createKernel(function (width, height, time) {
    const r = this.thread.x / width;
    const g = this.thread.y / height;
    const b = 0.5;
    return [r, g, b];
  }, {
    // graphical: true,
    output: [canvas.width, canvas.height],
    pipeline: true,
    constants: {
      iters: 4
    }
  });

  const kernel2 = gpu.createKernel(function (v, width, height) {
    const pix = v[this.thread.y][this.thread.x];

    let red = pix[0];
    let green = pix[1];
    let blue = pix[2];
    this.color(red, green, blue);
  }, {
    graphical: true,
    output: [canvas.width, canvas.height]
  });

  // Return the renderer function
  return ({ time }) => {
    const result = kernel1(canvas.width, canvas.height, time);
    // console.log(result);
    window.result = result;
    // console.log(kernel.getPixels());
    kernel2(result, canvas.width, canvas.height);
    // How to pass output pixels back into the kernel?
  };
};

canvasSketch(sketch, settings);
