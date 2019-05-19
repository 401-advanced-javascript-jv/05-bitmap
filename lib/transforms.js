'use strict';

/**
 * @param bmp
 */
const transformColors = (bmp) => {
  console.log('Scrambling image', bmp);
  // TODO: Make a scramblePixel method that scrambles the value of a pixel
  // On 1-bit and 4-bit images, pixels are either 1 bit or 4 bits, so deal
  // with those differently
  // On 8-bit images pixels are 1 byte, 16-bit are 2 bytes, 24-bits are 3
  // bytes, and 32-bit is 4 bytes
};

const doTheInversion = (bmp) => {
  // TODO: Build an inverted pixelArray: Read row-by-row and concat to front of destination buffer, row-by-row
  // buffer.concat([readrow, buffer]);
  console.log('inverting image');
};

const rows = (bmp) => {
  // randomize the pixels on every other line
  // Use the scramblePixel method on every pixel of every other line
  console.log('randomizing rows');
};

const columns = (bmp) => {
  // randomizes the pixels on every other pixel -- same pixel per row
  console.log('randomizing columns');
};

module.exports = exports = {transformColors, doTheInversion, rows, columns};
