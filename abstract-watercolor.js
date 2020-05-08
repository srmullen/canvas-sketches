import canvasSketch from 'canvas-sketch';
import { random } from 'canvas-sketch-util';
import palettes from 'nice-color-palettes';
import P5 from 'p5';
import convert from 'color-convert';

const p5 = new P5();

window.palettes = palettes;
window.random = random;

const settings = {
  p5: true,
  // dimensions: [ 2048, 2048 ]
  orientation: 'portrait',
  dimensions: 'postcard',
  pixelsPerInch: 300,
  // units: 'in'
};

const nRects = 200;
const rectIters = 200;
const rectSize = 150;
const alpha = 5;
const circleSize = 150;
const noiseRate = 0.01;

// random.setSeed(21);

function rect(pos, size) {
  for (let i = 0; i < rectIters; i++) {
    // p5.circle(
    //   // pos.x + (random.value() - 0.5) * size.x,
    //   // pos.y + (random.value() - 0.5) * size.y,
    //   pos.x + random.gaussian() * size.x,
    //   pos.y + random.gaussian() * size.y,
    //   circleSize
    // );
    p5.rect(
      pos.x + random.gaussian() * size.x,
      pos.y + random.gaussian() * size.y,
      size.x,
      size.y
    );
  }
}

const palette = random.pick(palettes);

function createGrid(nx, ny) {
  const grid = [];
  for (let x = 0; x < nx; x++) {
    for (let y = 0; y < ny; y++) {
      const u = nx < 1 ? 0.5 : (x / (nx - 1));
      const v = ny < 1 ? 0.5 : (y / (ny - 1));
      grid.push([u, v]);
    }
  }
  return grid;
}

const sketch = () => {
  return ({ width, height }) => {
    p5.noStroke();

    for (let i = 0; i < nRects; i++) {
      const x = (width / 2) + (random.value() - 0.5) * width;
      const y = (height / 2) + (random.value() - 0.5) * height;
      const n = Math.floor(((random.noise2D(x * noiseRate, y * noiseRate) + 1) * 0.5) * palette.length);
      const hex = palette[n];
      const color = convert.hex.rgb(hex);
      
      p5.fill(...color, alpha);
      
      rect(
        { x, y },
        { x: rectSize, y: rectSize }
      );
    }
  };
};

canvasSketch(sketch, settings);
