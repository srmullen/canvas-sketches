import canvasSketch from 'canvas-sketch';
import { random } from 'canvas-sketch-util';
import { lerp } from 'canvas-sketch-util/math';
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
  dimensions: 'a4',
  pixelsPerInch: 300,
  // units: 'in'
};

const alpha = 5;

const seed = Math.floor(Math.random() * 100000);
console.log(seed);
random.setSeed(seed);

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
    const vec = new Point(1, 0)
      .rotate(random.value() * 360)
      .multiply(radius * extent);

    const p = center.add(vec);
    splotch(p);
  }
}

// Choose locations randomly and if they are within the circle, keep them.
function circle2({
  center,
  radius,
  splotch = (pos) => { p5.rect(pos.x, pos.y, 20, 20) },
  iters = 1000
}) {
  let count = 0;
  while (count < iters) {
    const x = random.value(-1, 1) * radius * 2;
    const y = random.value(-1, 1) * radius * 2;
    const point = center.subtract(radius).add(x, y);
    if (center.getDistance(point) < radius) {
      splotch(point);
      count++;
    }
  }
}

function rectangle({
  pos, 
  width, 
  height,
  splotch,
  iters = 1000
}) {
}

/**
 * Ideas
 * - Circle packing with watercolor circles.
 * - Fill the grid with rectangles. With overlaps, without overlaps.
 * - Poisson-disc sampling to fill page with circles.
 * - Fill shapes with lines rather than rectangles.
 */

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

const randomCirclesSketch = () => {
  const nCircles = 350;
  const minRadius = 30;
  const maxRadius = 250;

  return ({ width, height }) => {
    p5.noStroke();

    const splotch = (pos) => {
      const size = 50
      p5.push();
      p5.translate(pos.x, pos.y);
      p5.rotate(Math.PI * 2 * random.value());
      p5.rect(-size / 2, -size / 2, size, size);
      p5.pop();
    }

    const circles = []
    while (circles.length < nCircles) {
      const radius = lerp(minRadius, maxRadius, random.value());
      const x = random.value() * width;
      const y = random.value() * height;
      circles.push({
        radius,
        x,
        y
      });
    }

    for (let i = 0; i < circles.length; i++) {
      const { x, y, radius } = circles[i];
      const hex = random.pick(palette);
      const color = convert.hex.rgb(hex);
      p5.fill(...color, alpha);

      circle2({
        center: new Point({ x, y }),
        radius,
        splotch,
        iters: 1000
      });
    }
  }
}

const circlePackingSketch = () => {
  const nCircles = 350;
  const minRadius = 10;
  const maxRadius = 250;

  function overlaps(c1, c2) {
    const dist = c1.center.getDistance(c2.center);
    return dist < c1.radius + c2.radius;
  }

  function packCircles(nCircles = 150) {
    let circles = [];

    let iters = 0
    while (circles.length < nCircles && iters < 10000) {
      const radius = lerp(minRadius, maxRadius, random.value());
      const x = random.value() * width;
      const y = random.value() * height;
      const circle = {
        radius,
        center: new Point(x, y)
      }
      if (!circles.length) {
        circles.push(circle);
      } else {
        let overlap = false;
        for (let i = 0; i < circles.length; i++) {
          if (overlaps(circles[i], circle)) {
            overlap = true;
            break;
          }
        }
        if (!overlap) {
          circles.push(circle);
        }
      }
      iters++;
    }

    return circles;
  }

  return ({ width, height }) => {
    p5.noStroke();

    const splotch = (pos) => {
      const size = 50
      p5.push();
      p5.translate(pos.x, pos.y);
      p5.rotate(Math.PI * 2 * random.value());
      p5.rect(-size / 2, -size / 2, size, size);
      p5.pop();
    }

    const circles = packCircles(nCircles);

    for (let i = 0; i < circles.length; i++) {
      const { center, radius } = circles[i];

      // p5.stroke('black');
      // p5.strokeWeight(5);
      // p5.noFill();
      // p5.circle(center.x, center.y, radius * 2)
      // p5.noStroke();

      const hex = random.pick(palette);
      const color = convert.hex.rgb(hex);
      p5.fill(...color, alpha);

      circle2({
        center,
        radius,
        splotch,
        iters: 1000
      });
    }
  }
}


// Circle Grid Sketch
const circleGridSketch = () => {
  return ({ width, height }) => {
    p5.noStroke();

    const grid = createGrid(5, 7);

    const splotch = (pos) => {
      const size = 50
      p5.push();
      p5.translate(pos.x, pos.y);
      p5.rotate(Math.PI * 2 * random.value());
      p5.rect(-size/2, -size/2, size, size);
      p5.pop();
    }

    const margin = 150;

    for (let i = 0; i < grid.length; i++) {
      const hex = random.pick(palette);
      const color = convert.hex.rgb(hex);
      p5.fill(...color, alpha);

      const [ u, v ] = grid[i];
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);
      circle2({
        center: new Point({ x, y }),
        radius: 100,
        splotch,
        iters: 1000
      });
    }
  };
};

// canvasSketch(circleGridSketch, settings);
// canvasSketch(randomCirclesSketch, settings);
canvasSketch(circlePackingSketch, settings);
