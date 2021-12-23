// eslint-disable-next-line import/no-unresolved
import { RGBA } from "color-blend/dist/types";

export const parseRgba = (rgba: string): RGBA => {
  const matches = rgba.match(/\d{1,3}/g)?.map(parseFloat);
  if (matches?.length !== 4) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  const [r, g, b, a] = matches;
  return { r, g, b, a };
};

export const formatRgba = (rgba: RGBA): string =>
  `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;

export const setOpacity = (rgba: string, a: number): string =>
  rgba.replace("1)", `${a})`);

export const getIsPositive = (yVal: number, yNext: number): boolean =>
  yVal > 0 || (yVal === 0 && yNext > 0);

export const isMobile = (): boolean =>
  navigator.userAgent.match(
    /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|CRiOS|OPiOS|Mobile|FxiOS/i,
  ) != null;
