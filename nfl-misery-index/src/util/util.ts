import { RGBA } from 'color-blend/dist/types';

export const parseRgb = (rgba: string): RGBA => {
  let matches = rgba.match(/\d{1,3}/g)?.map(parseFloat);
  if (matches?.length !== 4) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  let [r, g, b, a] = matches;
  return { r, g, b, a };
};

export const setOpacity = (rgba: string, a: number) => rgba.replace('1)', `${a})`);
