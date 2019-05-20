'use strict';

const { _randInt } = require('./helpers.js');

/**
 * @param bmp
 */
const transformColors = (bmp) => {
  // Pixel coordinates are 1-indexed. Anything less will cause errors when
  // finding offset.
  for (let y = 1; y <= Math.abs(bmp.info.height); y++) {
    for (let x = 1; x <= bmp.info.width; x++) {
      scramblePixel(bmp, x, y);
    }
  }
  return;
};

const doTheInversion = (bmp) => {
  let buffer = Buffer.alloc(0);
  for (let i = 0; i < Math.abs(bmp.info.height); i++) {
    let start = bmp.info.pixelArray + i * bmp.info.stride;
    let end = start + bmp.info.stride;
    let row = bmp.buffer.slice(start, end);
    buffer = Buffer.concat([row, buffer]);
  }
  buffer.copy(bmp.buffer, bmp.info.pixelArray);
  return;
};

const flip = (bmp) => {
  if (bmp.info.bitDepth < 8) {
    console.error(`This transformation is not supported for ${bmp.info.bitDepth}-bit BMP images.`);
    return;
  }
  for (let i = 0; i < Math.abs(bmp.info.height); i++) {
    let pixByte = bmp.info.bitDepth / 8;
    let start = bmp.info.pixelArray + i * bmp.info.stride;
    let end = start + bmp.info.width * pixByte;
    let row = bmp.buffer.slice(start, end);
    let pivot = Math.floor((bmp.info.width - 1) / 2);
    for (let i = 0; i < pivot ; i++) {
      let temp = [];
      for (let j = 0; j < pixByte; j++) {
        temp[j] = row[i * pixByte + j];
        row[i * pixByte + j] = row[(bmp.info.width - 1 - i) * pixByte + j];
        row[(bmp.info.width - 1 - i) * pixByte + j] = temp[j];
      }
    }
  }
  return;
};

const rows = (bmp) => {
  // randomize the pixels on every other line
  // Use the scramblePixel method on every pixel of every other line
  for (let y = 1; y <= Math.abs(bmp.info.height); y++) {
    for (let x = 1; x <= bmp.info.width; x++) {
      if ( y % 2 === 1 ) {
        scramblePixel(bmp, x, y);
      }
    }
  }
  return;
};

const columns = (bmp) => {
  // randomizes the pixels on every other pixel -- same pixel per row
  for (let y = 1; y <= Math.abs(bmp.info.height); y ++) {
    for (let x = 1; x <= bmp.info.width; x++) {
      if (x % 2 === 1) {
        scramblePixel(bmp, x, y);
      }
    }
  }
};

const scramblePixel = (bmp, x, y) => {
  // Indexed colors should scamble their index
  // True color pixels should scramble the RGB values for each pixel
  if (bmp.info.bitDepth < 16) {
    let newIdx = _randInt(0, bmp.info.paletteColorCount - 1);
    bmp.pixelColor(x, y, newIdx);
  } else {
    let newColor = {
      r: _randInt(0, 255),
      g: _randInt(0, 255),
      b: _randInt(0, 255),
    };
    bmp.pixelColor(x, y, newColor);
  }
  return;
};

module.exports = exports = { transformColors, doTheInversion, rows, columns, flip };
