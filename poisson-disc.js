import canvasSketch from 'canvas-sketch';
import { random } from 'canvas-sketch-util';
import { lerp } from 'canvas-sketch-util/math';
import palettes from 'nice-color-palettes';
import { Point } from 'paper';
import P5, { Vector } from 'p5';
import convert from 'color-convert';

const p5 = new P5();

window.palettes = palettes;
window.random = random;
// window.p5 = p5;

const settings = {
  p5: true,
  // dimensions: [ 2048, 2048 ]
  orientation: 'portrait',
  dimensions: 'a4',
  pixelsPerInch: 300,
  // units: 'in'
  // animate: true
};

const alpha = 5;

const seed = Math.floor(Math.random() * 100000);
console.log(seed);
random.setSeed(seed);

const palette = random.pick(palettes);
const colors = palette.map(hex => convert.hex.rgb(hex));

const nPoints = 15000;
const r = 30; // Minimum distance between points.
const k = 30; // For rejection algorithm
const w = r / Math.sqrt(2);

// Implement n-dimensional background grid (2 dimensions)
// Cell size to be bounded by r / sqrt(n).
function createGrid(cols, rows) {
  const grid = [];
  for (let i = 0; i < cols * rows; i++) {
    grid[i] = undefined;
  }
  return grid;
}

const sketch = ({ width, height }) => {
  p5.noStroke();

  const cols = Math.floor(width / w);
  const rows = Math.floor(height / w);

  const grid = createGrid(cols, rows);
  const active = [];

  for (let i = 0; i < nPoints; i++) {
    const x = lerp(0, width, random.value());
    const y = lerp(0, height, random.value());

    const u = Math.floor(x / w);
    const v = Math.floor(y / w);
    const pos = p5.createVector(x, y);
    grid[u + v * cols] = pos;
    active.push(pos);
  }

  return ({ width, height }) => {

    function draw() {
      // p5.fill(0, 0, 0);
      // p5.rect(0, 0, width, height);
      p5.background(0);

      let count = 0;
      while (active.length > 0 && count < 100000) {
        count++;
        const randIndex = Math.floor(p5.random(active.length));
        const pos = active[randIndex];
        let found = false;
        for (let n = 0; n < k; n++) {
          const sample = Vector.random2D();
          const m = p5.random(r, 2*r);
          sample.setMag(m);
          sample.add(pos);
          const col = Math.floor(sample.x / w);
          const row = Math.floor(sample.y / w);

          if (col >= 0 && col < cols && row >= 0 && row < rows && grid[col + row * cols]) {
            let ok = true;
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                const index = (col + i) + (row + j) * cols;
                const neighbor = grid[index];
                if (neighbor) {
                  const d = Vector.dist(sample, neighbor);
                  if (d < r) {
                    ok = false;
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
          active.splice(randIndex, 1);
        }
      }

      for (let i = 0; i < grid.length; i++) {
        if (grid[i]) {
          // p5.stroke(255);
          // p5.strokeWeight(4);
          // p5.point(grid[i].x, grid[i].y);

          p5.noStroke();
          // p5.fill(...random.pick(palette), 100-r);
          const color = random.pick(colors);
          p5.fill(...color);
          p5.circle(grid[i].x, grid[i].y, 10);
        }
      }
    }
    draw();
  }
}

function drawShape(rect) {
  p5.noStroke();

  const nPoints = 200000;
  const r = 2; // Minimum distance between points.
  const k = 30; // For rejection algorithm
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
      p5.stroke(255, 0, 0);
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

const poissionShape = () => {
  const rect = {
    pos: { x: 100, y: 100 },
    width: 500,
    height: 2000
  };

  return ({ width , height }) => {
    drawShape(rect);
  }
}

// canvasSketch(sketch, settings);
canvasSketch(poissionShape, settings);
