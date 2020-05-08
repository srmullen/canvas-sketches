import canvasSketch from 'canvas-sketch';
import { random } from 'canvas-sketch-util';
import palettes from 'nice-color-palettes';
import { Point } from 'paper';
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

// Create a circle of splotches by random rotations of a vector.
function circle1({
  center, 
  radius, 
  splotch = (pos) => { p5.rect(pos.x, pos.y, 20, 20) },
  iters = 1000
}) {
  for (let i = 0; i < iters; i++) {
    // Need to push extext outwards becuase the further away from the center
    // the more space out points will be.
    const extent = random.value();
    // buckets[Math.floor(extent * 10)] += 1;
    const vec = new Point(1, 0)
      .rotate(random.value() * 360)
      .multiply(radius * extent);

    const p = center.add(vec);
    splotch(p);
  }
}

const palette = random.pick(palettes);

const sketch = () => {
  // return ({ width, height }) => {
  //   p5.noStroke();

  //   for (let i = 0; i < nRects; i++) {
  //     const x = (width / 2) + (random.value() - 0.5) * width;
  //     const y = (height / 2) + (random.value() - 0.5) * height;
  //     const n = Math.floor(((random.noise2D(x * noiseRate, y * noiseRate) + 1) * 0.5) * palette.length);
  //     const hex = palette[n];
  //     const color = convert.hex.rgb(hex);
      
  //     p5.fill(...color, alpha);
      
  //     rect(
  //       { x, y },
  //       { x: rectSize, y: rectSize }
  //     );
  //   }
  // };

  return ({ width, height }) => {
    p5.noStroke();

    p5.fill(255, 0, 0, 5);

    const splotch = (pos) => {
      const size = 50
      p5.push();
      p5.translate(pos.x, pos.y);
      p5.rotate(Math.PI * 2 * random.value());
      p5.rect(-size/2, -size/2, size, size);
      p5.pop();
    }

    circle1({
      center: new Point({ x: width / 2, y: height / 2 }),
      radius: 200,
      splotch
    });

    // for (let i = 0; i < nRects; i++) {
    //   const x = (width / 2) + (random.value() - 0.5) * width;
    //   const y = (height / 2) + (random.value() - 0.5) * height;
    //   const n = Math.floor(((random.noise2D(x * noiseRate, y * noiseRate) + 1) * 0.5) * palette.length);
    //   const hex = palette[n];
    //   const color = convert.hex.rgb(hex);

    //   p5.fill(...color, alpha);

      
    // }
  };
};

canvasSketch(sketch, settings);
