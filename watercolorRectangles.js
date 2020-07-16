import canvasSketch from 'canvas-sketch';
import { random } from 'canvas-sketch-util';
import { lerp } from 'canvas-sketch-util/math';
import palettes from 'nice-color-palettes';
import { Point } from 'paper/dist/paper-core';
import P5, { Vector } from 'p5';
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

function rectangle({
  pos,
  width,
  height,
  splotch,
  iters = 1000
}) {
  let count = 0;
  while (count < iters) {
    const x = lerp(pos.x, pos.x + width, random.value());
    const y = lerp(pos.y, pos.y + height, random.value());
    splotch(new Point(x, y));
    count++;
  }
}

/**
 * Ideas
 * - Circle packing with watercolor circles.
 * - Fill the grid with rectangles. With overlaps, without overlaps.
 * - Poisson-disc sampling to fill page with circles.
 * - Fill shapes with lines rather than rectangles.
 */

const palette = random.pick(palettes);
// const palette = ["#a3a948", "#edb92e", "#f85931", "#ce1836", "#009989"];
// const palette = ['#f05d5e', '#0f7173', '#e7ecef', '#272932', '#d8a47f'];
console.log(palette);

const colors = palette.map(hex => convert.hex.rgb(hex));

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
  const nRects = 200;

  return ({ width, height }) => {
    p5.noStroke();

    const splotch = (pos) => {
      const size = 100
      p5.push();
      p5.translate(pos.x, pos.y);
      p5.rotate(Math.PI * 2 * random.value());
      p5.rect(-size / 2, -size / 2, size, size);
      p5.pop();
    }

    const rectangles = [];
    while (rectangles.length < nRects) {
      const x = random.value() * width;
      const y = random.value() * height;
      rectangles.push({
        pos: new Point(x, y),
        width: lerp(50, 500, random.value()),
        height: lerp(50, 500, random.value())
      });
    }

    for (let i = 0; i < rectangles.length; i++) {
      const rect = rectangles[i];
      const hex = random.pick(palette);
      const color = convert.hex.rgb(hex);
      p5.fill(...color, alpha);

      rectangle({
        pos: rect.pos,
        width: rect.width,
        height: rect.height,
        splotch,
        iters: 1000
      });
    }
  }
}

function create2dGrid(nx, ny, fill = (u, v) => ([u, v])) {
  const rows = [];
  for (let x = 0; x < nx; x++) {
    const col = [];
    const u = nx < 1 ? 0.5 : (x / (nx - 1));
    for (let y = 0; y < ny; y++) {
      const v = ny < 1 ? 0.5 : (y / (ny - 1));
      col.push(fill(u, v));
    }
    rows.push(col);
  }
  return rows;
}

function generateRect(nx, ny, maxWidth, maxHeight) {
  const x = Math.floor(random.range(0, nx));
  const y = Math.floor(random.range(0, ny));
  const width = Math.floor(random.range(1, Math.min(maxWidth, nx - x)));
  const height = Math.floor(random.range(1, Math.min(maxHeight, ny - y)));
  const points = [];
  for (let i = x; i < x + width; i++) {
    for (let j = y; j < y + height; j++) {
      points.push([
        Math.min(Math.max(i, 0), nx-1), 
        Math.min(Math.max(j, 0), ny-1)
      ]);
    }
  }
  return points;
}

function drawGridSquares(grid, shape, options) {
  const margin = options.margin;
  const cellSize = options.cellSize;
  const color = random.pick(colors);
  p5.fill(...color, options.alpha);
  for (let pos of shape) {
    const [u, v] = grid[pos[0]][pos[1]];
    const x = lerp(margin, width - margin, u)
    const y = lerp(margin, height - margin, v);
    p5.push();
    p5.translate(x, y);
    const m = lerp(0.8, 1.5, random.noise2D(u, v));
    p5.rect(0, 0, cellSize * m, cellSize * m);
    p5.pop();
  }
}

function drawPoissonPoints(rect, { nPoints = 20000, r = 2, k = 30} = {}) {
  p5.noStroke();

  function createGrid(cols, rows) {
    const grid = [];
    for (let i = 0; i < cols * rows; i++) {
      grid[i] = undefined;
    }
    return grid;
  }

  // const nPoints = 20000;
  // const r = 2; // Minimum distance between points.
  // const k = 30; // For rejection algorithm
  const w = r / Math.sqrt(2);

  const cols = Math.floor(rect.width / w);
  const rows = Math.floor(rect.height / w);
  const grid = createGrid(10, 10);
  const active = [];

  // Fill the active list
  for (let i = 0; i < nPoints; i++) {
    const x = lerp(0, rect.width, random.value());
    const y = lerp(0, rect.height, random.value());

    const u = Math.floor(x / w);
    const v = Math.floor(y / w);
    const pos = p5.createVector(x, y);
    const index = u + v * cols;
    if (!grid[index]) {
      grid[index] = pos;
      active.push(pos);
    }
  }

  const inBounds = (col, row) => {
    return col >= 0 && col < cols && row >= 0 && row < rows && grid[col + row * cols];
  }

  let count = 0;
  while (active.length > 0 && count < 100000) {
    count++;
    const randIndex = Math.floor(p5.random(active.length));
    const pos = active[randIndex];
    let found = false;
    for (let n = 0; n < k; n++) {
      const sample = Vector.random2D();
      const m = p5.random(r, 2 * r);
      sample.setMag(m);
      sample.add(pos);
      const col = Math.floor(sample.x / w);
      const row = Math.floor(sample.y / w);
      if (inBounds(col, row)) {
        let ok = true;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const index = (col + i) + (row + j) * cols;
            const neighbor = grid[index];
            if (neighbor) {
              const d = Vector.dist(sample, neighbor);
              if (d < r) {
                ok = false
              }
            }
          }
        }
        if (ok) {
          found = true;
          grid[col + row * cols] = sample;
          active.push(sample);
        }
      }
    }

    if (!found) {
      active.splice(randIndex, 1)
    }
  }
  console.log('count', count);

  for (let i = 0; i < grid.length; i++) {
    if (grid[i]) {
      const pos = grid[i];
      // p5.fill(255, 0, 0);
      p5.stroke(rect.color);
      p5.push();
      p5.translate(rect.pos.x, rect.pos.y);
      // p5.circle(
      //   pos.x,
      //   pos.y,
      //   10
      // );
      p5.point(pos.x, pos.y);
      p5.pop();
    }
  }
}

const colorGrid = () => {
  const alpha = 10;
  const cellSize = 100;
  const nx = 20;
  const ny = 25;
  const nShapes = 250;
  const maxRectSize = [10, 10]
  const grid = create2dGrid(nx, ny);

  const shapes = [];
  for (let i = 0; i < nShapes; i++) {
    shapes.push(generateRect(nx, ny, ...maxRectSize));
  }

  const margin = 200;

  return ({ width, height }) => {
    p5.noStroke();
    p5.background(255);

    p5.rectMode(p5.CENTER);
    for (let shape of shapes) {
      drawGridSquares(grid, shape, { alpha, margin, cellSize });
    }

    // for (let i = 0; i < nx; i++) {
    //   for (let j = 0; j < ny; j++) {
    //     const [u, v] = grid[i][j];
    //     const color = random.pick(colors);
    //     const x = lerp(margin, width-margin, u)
    //     const y = lerp(margin, height-margin, v);

    //     p5.fill(...color);
    //     p5.rectMode(p5.CENTER)
    //     p5.rect(x, y, 200, 200);
    //   }
    // }
  }
}

const poissonGrid = () => {

  function generateRect(nx, ny, maxWidth, maxHeight) {
    const x = Math.floor(random.range(0, nx));
    const y = Math.floor(random.range(0, ny));
    const width = Math.floor(random.range(1, Math.min(maxWidth, nx - x)));
    const height = Math.floor(random.range(1, Math.min(maxHeight, ny - y)));
    const points = [];
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        points.push([
          Math.min(Math.max(i, 0), nx - 1),
          Math.min(Math.max(j, 0), ny - 1)
        ]);
      }
    }
    return points;
  }

  const cellSize = 100;
  const nx = 20;
  const ny = 25;
  const nShapes = 250;
  const maxRectSize = [10, 10]
  const grid = create2dGrid(nx, ny);

  const shapes = [];
  for (let i = 0; i < nShapes; i++) {
    shapes.push(generateRect(nx, ny, ...maxRectSize));
  }

  const margin = 200;

  return ({ width, height }) => {
    p5.noStroke();
    p5.background(255);

    // This would be easier to create shapes with from/to style object.
    let shapes = [{
      pos: { 
        x: margin, 
        y: margin
      }, 
      width: width-400, 
      height: 100,
      color: [255, 0, 0]
    }, {
        pos: { x: 500, y: 100 },
        width: 200,
        height: 2000 ,
        color: [0, 255, 0]
    }];

    p5.rectMode(p5.CENTER);
    for (let shape of shapes) {
      // drawGridSquares(grid, shape, { alpha, margin, cellSize });
      drawPoissonPoints(shape, {
        nPoints: (shape.width * shape.height) / 2
      });
    }
  }
}

// canvasSketch(sketch, settings);
// canvasSketch(colorGrid, settings);
canvasSketch(poissonGrid, settings);