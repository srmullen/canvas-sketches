import canvasSketch from 'canvas-sketch';
import { random } from 'canvas-sketch-util';
import { lerp } from 'canvas-sketch-util/math';
import palettes from 'nice-color-palettes';
import { Point } from 'paper/dist/paper-core';
import P5, { Vector } from 'p5';
import convert from 'color-convert';

const p5 = new P5();

window.random = random;

const settings = {
  p5: true,
  animate: true,
  orientation: 'portrait',
  dimensions: [3000, 3000],
  // pixelsPerInch: 300
};

const BARNSLEY_FERN = [
  {
    a: 0.85,
    b: 0.04,
    c: -0.04,
    d: 0.85,
    tx: 0,
    ty: 1.6,
    weight: 0.85
  },
  {
    a: -0.15,
    b: 0.28,
    c: 0.26,
    d: 0.24,
    tx: 0,
    ty: 0.44,
    weight: 0.07
  },
  {
    a: 0.2,
    b: -0.26,
    c: 0.23,
    d: 0.22,
    tx: 0,
    ty: 1.6,
    weight: 0.07
  },
  {
    a: 0,
    b: 0,
    c: 0,
    d: 0.16,
    tx: 0,
    ty: 0,
    weight: 0.01
  },
];

function randomRule() {
  return {
    a: random.range(-1, 1),
    b: random.range(-1, 1),
    c: random.range(-1, 1),
    d: random.range(-1, 1),
    tx: random.range(-1, 1),
    ty: random.range(-1, 1),
    color: random.range(0, 360),
    weight: random.value()
  }
}

function getColor(rule) {
  return rule.color;
}

const sketch = () => {
  
  // const rules = BARNSLEY_FERN;
  // const rules = RANDOM;

  p5.background(0, 0, 0);

  const rules = [];
  // const nRules = Math.floor(random.range(3, 10));
  const nRules = 10;
  console.log(nRules);
  for (let i = 0; i < nRules; i++) {
    rules.push(randomRule());
  }

  const weights = rules.map(rule => rule.weight);
  function getRule() {
    return rules[random.weighted(weights)];
  }

  function iterate([x, y]) {
    const rule = getRule();
    const color = getColor(rule);
    const point = [
      x * rule.a + y * rule.b + rule.tx,
      x * rule.c + y * rule.d + rule.ty
    ];
    return {
      point,
      color
    };
  }

  let point = [random.value(), random.value()];
  let color = 0;

  // p5.translate(-500, -500);
  // p5.translate(-width/2, -height/2);

  // p5.stroke(255, 0, 0);
  p5.noStroke();
  p5.colorMode(p5.HSB);
  const spread = 1000;
  const radius = 1;
  const opacity = 0.7;
  return ({ width, height }) => {
    for (let i = 0; i < 10000; i++) {
      // For barnsley fern
      // p5.circle(-point[0] * 200 + width / 2, -point[1] * 200 + height, 5);

      const o = iterate(point);
      point = o.point;

      p5.fill(o.color, 100, 100, opacity);

      p5.circle(-point[0] * spread + width / 2, -point[1] * spread + height / 2, radius);

    }
  };
};

canvasSketch(sketch, settings);
