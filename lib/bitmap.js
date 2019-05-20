'use strict';

const transforms = require('./transforms.js');
const {bitmaskToNumber} = require('./helpers.js');

// These are the byte offsets where the named information is stored in the BMP file
const bitmap16Offsets = {
  bitDepth: 28,
};

const bitmap32OffsetsUnsigned = {
  bitmapSize: 2,
  pixelArray: 10,
  headerSize: 14,
  compressionMethod: 30,
  paletteColorCount: 46,
};

const bitmap32OffsetsSigned = {
  width: 18,
  height: 22,
};

const bitmasks = {
  r: 54,
  g: 58,
  b: 62,
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
      this.info[offset16] = buffer.readUInt16LE(bitmap16Offsets[offset16]);
    }

    for (let offset32s in bitmap32OffsetsSigned) {
      this.info[offset32s] = buffer.readInt32LE(
        bitmap32OffsetsSigned[offset32s]
      );
    }

    for (let offset32u in bitmap32OffsetsUnsigned) {
      this.info[offset32u] = buffer.readUInt32LE(
        bitmap32OffsetsUnsigned[offset32u]
      );
    }

    // compression method 0 is uncompressed, 3 and 6 deal with bitmasks, which
    // we need when this is a 16-bit image
    if (![0, 3, 6].includes(this.info.compressionMethod)) {
      this.invalid = true;
      return;
    }

    // get bitmasks; use these with bitwise and to get only the desired color
    // in the pixelColor method.
    if ([3, 6].includes(this.info.compressionMethod)) {
      this.info.bitmask = {};
      for (let color in bitmasks) {
        this.info.bitmask[color] = buffer.readUInt32LE(bitmasks[color]);
      }
    }

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
      this.info.colorPaletteOffset =
        14 + this.info.headerSize + 4 * this.info.compressionMethod;

      this.info.colorPalette = new Array(this.info.paletteColorCount);
      for (let i = 0; i < this.info.paletteColorCount; i++) {
        // each color is a multiple of 4 bytes, hence i*4 below
        this.info.colorPalette[i] = {
          r: this.buffer.readUInt8(this.info.colorPaletteOffset + i * 4 + 2),
          g: this.buffer.readUInt8(this.info.colorPaletteOffset + i * 4 + 1),
          b: this.buffer.readUInt8(this.info.colorPaletteOffset + i * 4),
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
    if (this.info.height > 0) {
      y = this.info.height - y;
    } else {
      y--;
    }
    return (
      this.info.pixelArray +
      y * this.info.stride +
      (--x * this.info.bitDepth) / 8
    );
  }

  /**
   * Method to get or set pixel color. If a pixel color is supplied, this
   * method will set the given color for that pixel.
   * @param {int} x X position to work on; MUST be positive at all times!
   * @param {int} y Y position to work on; MUST be positive at all times!
   * @param {Object} color {r, g, b} value, from 0-255 each
   * @returns {Object} Returns the pixel's color (or new color if changed)
   */
  pixelColor(x, y, color = null) {
    let pixelColor = {};

    const offset = this.getPixelOffset(x, y);

    switch (this.info.bitDepth) {
    case 1:
    case 2:
    case 4:
      console.error(`Cannot process a ${this.info.bitDepth}-bit BMP`);
      return null;
    case 8: {
      // color needs to be an index in the colorPalette to write it here.
      if (color && typeof color === 'number') {
        this.buffer.writeUInt8(color, offset);
      }
      const index = this.buffer.readUInt8(offset);
      pixelColor = this.info.colorPalette[index];
      pixelColor.bit = this.info.bitDepth;
      pixelColor.index = index;
      break;
    }
    case 16: {
      if (color) {
        let write = 0;
        for (let c in this.info.bitmask) {
          const bitstring = this.info.bitmask[c].toString(2);
          const length = bitstring.lastIndexOf('1') + 1;

          // On 6-bit color lengths, the color space is doubled, from 0-63
          if (length === 6) {
            color[c] *= 2;
          }

          const bits = parseInt(
            color[c]
              .toString(2)
              .padStart(length, '0')
              .padEnd(bitstring.length, '0'),
            2
          );

          write = write | bits;
        }
        this.buffer.writeUInt16LE(write, offset), 'written';
      }
      const pixel = this.buffer.readUInt16LE(offset);
      pixelColor = {
        r: bitmaskToNumber(this.info.bitmask.r, pixel),
        g: bitmaskToNumber(this.info.bitmask.g, pixel),
        b: bitmaskToNumber(this.info.bitmask.b, pixel),
        bit: this.info.bitDepth,
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
        bit: this.info.bitDepth,
      };
      break;
    }
    }

    return pixelColor;
  }
}

module.exports = Bitmap;
