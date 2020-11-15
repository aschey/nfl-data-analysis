import { CustomLayerProps, Datum } from '@nivo/line';
import React, { useMemo } from 'react';
import { AnimatedPath } from './AnimatedPath';

interface Point {
  x: number;
  y: number;
}

interface CubicCoefficients {
  a: number;
  b: number;
  c: number;
  d: number;
}

interface CubicParams extends CubicCoefficients {
  x: number;
}

const pointDistance = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const computeCubic = ({ a, b, c, d, x }: CubicParams) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;

const findZero = ({ a, b, c, d }: CubicCoefficients, tMax: number, yZero: number, epsilon: number) => {
  let an = 1 / tMax;
  let bn = 1;
  let f = (x: number) => computeCubic({ a, b, c, d, x }) - yZero;
  const pFirst = f(an);
  const pLast = f(bn);

  if (pFirst * pLast >= 0) {
    return 0;
  }

  let maxIters = 100;
  for (let i = 0; i < maxIters; i++) {
    const mn = (an + bn) / 2;
    const fmn = f(mn);
    if (Math.abs(fmn) <= epsilon) {
      return mn;
    } else if (f(an) * fmn < 0) {
      bn = mn;
    } else if (f(bn) * fmn < 0) {
      an = mn;
    } else {
      return 0;
    }
  }
  return 0;
};

const getTangeantX = (t0: number, t1: number, t2: number, p0: Point, p1: Point, p2: Point) =>
  (p0.x - p1.x) / (t0 - t1) - (p0.x - p2.x) / (t0 - t2) + (p1.x - p2.x) / (t1 - t2);
const getTangeantY = (t0: number, t1: number, t2: number, p0: Point, p1: Point, p2: Point) =>
  (p0.y - p1.y) / (t0 - t1) - (p0.y - p2.y) / (t0 - t2) + (p1.y - p2.y) / (t1 - t2);

const catmullRomDistance = ({ p0, p1, p2, p3 }: SplinePoints, yZero: number, toZero: boolean, fromZero: boolean) => {
  // from https://qroph.github.io/2018/07/30/smooth-paths-using-catmull-rom-splines.html
  let t0 = 0.0;
  // default alpha in d3-shape
  let alpha = 0.5;
  let t1 = t0 + Math.pow(pointDistance(p0, p1), alpha);
  let t2 = t1 + Math.pow(pointDistance(p1, p2), alpha);
  let t3 = t2 + Math.pow(pointDistance(p2, p3), alpha);

  const tDiff = t2 - t1;
  const m1x = tDiff * getTangeantX(t0, t1, t2, p0, p1, p2);
  const m1y = tDiff * getTangeantY(t0, t1, t2, p0, p1, p2);
  const m2x = tDiff * getTangeantX(t1, t2, t3, p1, p2, p3);
  const m2y = tDiff * getTangeantY(t1, t2, t3, p1, p2, p3);

  const xCoeffs: CubicCoefficients = {
    a: 2 * p1.x - 2 * p2.x + m1x + m2x,
    b: -3 * p1.x + 3 * p2.x - 2 * m1x - m2x,
    c: m1x,
    d: p1.x,
  };

  const yCoeffs: CubicCoefficients = {
    a: 2 * p1.y - 2 * p2.y + m1y + m2y,
    b: -3 * p1.y + 3 * p2.y - 2 * m1y - m2y,
    c: m1y,
    d: p1.y,
  };
  const amount = Math.round(pointDistance(p0, p1)) * 10;
  let epsilon = 0.5;
  let total = 0;
  let prevX = 0;
  let prevY = 0;
  let start = 1;
  let stop = amount;
  if (fromZero || toZero) {
    let zero = findZero(yCoeffs, amount, yZero, epsilon);
    if (fromZero) {
      start = zero * amount;
    } else if (toZero) {
      stop = zero * amount + 1;
    }
  }
  let s = start / amount;
  prevX = computeCubic({ ...xCoeffs, x: s });
  prevY = computeCubic({ ...yCoeffs, x: s });
  start++;
  for (let j = start; j <= stop; j++) {
    const t = j / amount;
    const px = computeCubic({ ...xCoeffs, x: t });
    const py = computeCubic({ ...yCoeffs, x: t });
    total += Math.sqrt(Math.pow(px - prevX, 2) + Math.pow(py - prevY, 2));

    prevX = px;
    prevY = py;
  }

  return total;
};

interface SplinePoints {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
}

const getDummyPoint = (p1: Point, p2: Point): Point => ({ x: 2 * p1.x - p2.x, y: 2 * p1.y - p2.y });

const linearDistance = ({ p1, p2 }: SplinePoints, yZero: number, toZero: boolean, fromZero: boolean) => {
  if (toZero || fromZero) {
    let m = (p2.y - p1.y) / (p2.x - p1.x);
    let b = p1.y - m * p1.x;
    let intercept = (yZero - b) / m;
    return toZero
      ? Math.sqrt(Math.pow(intercept - p1.x, 2) + Math.pow(yZero - p1.y, 2))
      : Math.sqrt(Math.pow(p2.x - intercept, 2) + Math.pow(p2.y - yZero, 2));
  }
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getDistances = ({ series, xScale, yScale, mode }: HighlightLineProps) => {
  console.log('test');
  let positiveDistances: number[] = [0];
  let negativeDistances: number[] = [0];
  let yZero = yScale(0);
  const distanceFunc = mode === 'catmullRom' ? catmullRomDistance : linearDistance;
  const getPoint = (datum: Datum): Point => {
    return {
      x: xScale(datum.x ?? 0),
      y: yScale(datum.y ?? 0),
    };
  };
  for (let serie of series) {
    for (let i = 0; i < serie.data.length - 1; i++) {
      const p1 = getPoint(serie.data[i].data);
      const p2 = getPoint(serie.data[i + 1].data);
      const splinePoints: SplinePoints = {
        p0: i > 0 ? getPoint(serie.data[i - 1].data) : getDummyPoint(p1, p2),
        p1,
        p2,
        p3: i < serie.data.length - 2 ? getPoint(serie.data[i + 2].data) : getDummyPoint(p2, p1),
      };

      const crossesZeroAscending = p1.y < yZero && p2.y > yZero;
      const crossesZeroDescending = p1.y > yZero && p2.y < yZero;

      let distanceToZero = 0;
      let distanceFromZero = 0;
      let totalDistance = 0;

      if (crossesZeroAscending || crossesZeroDescending) {
        distanceToZero = distanceFunc(splinePoints, yZero, true, false);
        distanceFromZero = distanceFunc(splinePoints, yZero, false, true);
      } else {
        totalDistance = distanceFunc(splinePoints, yZero, false, false);
      }

      if (crossesZeroAscending) {
        positiveDistances[positiveDistances.length - 1] += distanceToZero;
        negativeDistances.push(distanceFromZero);
      } else if (crossesZeroDescending) {
        negativeDistances[negativeDistances.length - 1] += distanceToZero;
        positiveDistances.push(distanceFromZero);
      } else if (p1.y === yZero && p2.y > yZero && i > 0 && splinePoints.p0.y < yZero) {
        negativeDistances.push(totalDistance);
      } else if (p1.y === yZero && p2.y < yZero && i > 0 && splinePoints.p0.y > yZero) {
        positiveDistances.push(totalDistance);
      } else if (p2.y > yZero || (p2.y === yZero && p1.y > yZero)) {
        negativeDistances[negativeDistances.length - 1] += totalDistance;
      } else if (p2.y < yZero || (p2.y === yZero && p1.y < yZero)) {
        positiveDistances[positiveDistances.length - 1] += totalDistance;
      }
    }
  }
  return [negativeDistances, positiveDistances];
};

interface HighlightLineProps extends CustomLayerProps {
  mode: 'catmullRom' | 'linear';
}

export const HighlightLine: React.FC<HighlightLineProps> = (props: HighlightLineProps) => {
  const [negativeDistances, positiveDistances] = useMemo(() => getDistances(props), [
    props.innerHeight,
    props.innerWidth,
    props.mode,
    props.data,
  ]);
  return (
    <>
      {props.series.map(({ id, data }) => (
        <AnimatedPath
          data={data}
          key={id}
          positiveDistances={positiveDistances}
          negativeDistances={negativeDistances}
          layerProps={props}
        />
      ))}
    </>
  );
};
