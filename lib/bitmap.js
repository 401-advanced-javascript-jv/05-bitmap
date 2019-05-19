'use strict';

const transforms = require('./transforms.js');

// These are the byte offsets where the named information is stored in the BMP file
const bitmap16Offsets = {
  bitDepth: 28,
};

const bitmap32Offsets = {
  bitmapSize: 2,
  pixelArray: 10,
  headerSize: 14,
  width: 18,
  height: 22,
  compressionMethod: 30,
  paletteColorCount: 46,
};

/**
 * Bitmap -- receives a file name, used in the transformer to note the new buffer
 * @param filePath
 */

class Bitmap {
  constructor(filePath, buffer) {
    if (!filePath) {
      this.invalid = true;
      return this;
    }

    this.file = filePath;
    this.info = {};

    this.buffer = buffer;
    this.type = buffer.toString('utf-8', 0, 2);

    // file must be type 'BM', or it's not a valid bitmap
    if (this.type !== 'BM') {
      this.invalid = true;
      return;
    }

    for (let offset16 in bitmap16Offsets) {
      this.info[offset16] = buffer.readInt16LE(bitmap16Offsets[offset16]);
    }

    for (let offset32 in bitmap32Offsets) {
      this.info[offset32] = buffer.readInt32LE(bitmap32Offsets[offset32]);
    }

    // compressionMethod isn't something we can handle
    // if (this.info.compressionMethod) {
    //   this.invalid = true;
    //   return;
    // }

    // stride is the number of bytes per row
    // rows are padded up to a multiple of 4 bytes
    // bitDepth * width = # bits per row
    // There are 32 bits per 4-byte block
    // dividing by this will give the number of 4 byte blocks per row
    // Math.ceil to round up. Multiply by 4 to get the number of bytes per row
    this.info.stride =
      Math.ceil((this.info.bitDepth * this.info.width) / 32) * 4;

    // If there are colors in the indexed palette, they are 4-byte blocks
    // Stored as B G R 0
    if (this.info.paletteColorCount) {
      // The colorPaletteOffset is immediately after the file and DIB headers
      this.info.colorPaletteOffset = 14 + this.info.headerSize;

      this.info.colorPalette = new Array(this.info.paletteColorCount);
      for (let i = 0; i < this.info.paletteColorCount; i++) {
        // each color is a multiple of 4 bytes, hence i*4 below
        this.info.colorPalette[i] = {
          r: this.buffer.readUInt8(this.info.colorPaletteOffset + i * 4 + 2),
          g: this.buffer.readUInt8(this.info.colorPaletteOffset + i * 4 + 1),
          b: this.buffer.readUInt8(this.info.colorPaletteOffset + i * 4 + 0),
        };
      }
    }
  }

  /**
   * Transform a bitmap using some set of rules. The operation points to some function, which will operate on a bitmap instance
   * @param operation
   */
  transform(operation) {
    switch (operation) {
    case 'colors':
    case 'colours':
      transforms.transformColors(this);
      break;
    case 'invert':
      transforms.doTheInversion(this);
      break;
    case 'rows':
      transforms.rows(this);
      break;
    case 'columns':
      transforms.columns(this);
      break;
    default:
      this.invalidOperation = true;
      return;
    }

    this.newFile = this.file.replace(/\.bmp$/, `.${operation}.bmp`);
  }

  /**
   * Returns the byte-offset of the pixel specified, from the top left corner
   * @param {int} x 0-based x-coordinate of the pixel
   * @param {int} y 0-based y-coordinate of the pixel
   * @returns {int} byte-offset of the pixel
   */
  getPixelOffset(x, y) {
    if (this.info.height > 0) { y = this.info.height - y; }
    else { y--; }
    return (
      this.info.pixelArray + y * this.info.stride + (--x * this.info.bitDepth) / 8
    );
  }

  /**
   * Method to get or set pixel color. If a pixel color is supplied, this
   * method will set the given color for that pixel.
   * @param {int} x X position to work on
   * @param {int} y Y position to work on
   * @param {Object} color {r, g, b} value, from 0-255 each
   * @returns {Object} Returns the pixel's color (or new color if changed)
   */
  pixelColor(x, y, color = null) {
    let pixelColor = {};

    let offset = this.getPixelOffset(x, y);

    switch (this.info.bitDepth) {
    case 1:
    case 4:
      console.error(`Cannot process a ${this.info.bitDepth}-bit BMP`);
      return null;
    case 8:
      if (color) {
        this.buffer.writeUInt8(color[8], offset);
      }
      // pixelColor = this.info.colorPalette[this.buffer.readUInt8(offset)];
      pixelColor = this.buffer.readUInt8(offset);
      break;
    case 16: {
      if (color) {
        let pixelString = color.b.toString(2) + color.g.toString(2) + 
          color.r.toString(2) + '1';
        this.buffer.writeUInt16LE(parseInt(pixelString, 2), offset);
      }
      let pixel = this.buffer.readUInt16LE(offset).toString(2);
      pixelColor = {
        r: parseInt(pixel.slice(1, 6), 2),
        g: parseInt(pixel.slice(6, 11), 2),
        b: parseInt(pixel.slice(11, 16), 2),
      };
      break;
    }
    case 24:
    case 32: {
      if (color) {
        this.buffer.writeUInt8(color.b, offset);
        this.buffer.writeUInt8(color.g, offset + 1);
        this.buffer.writeUInt8(color.r, offset + 2);
      }
      pixelColor = {
        r: this.buffer.readUInt8(offset + 2),
        g: this.buffer.readUInt8(offset + 1),
        b: this.buffer.readUInt8(offset),
      };
      break;
    }
    }

    return pixelColor;
  }

}

module.exports = Bitmap;
