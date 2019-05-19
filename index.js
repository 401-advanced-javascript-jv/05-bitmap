'use strict';

const fs = require('fs');

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
 * @constructor
 */

class Bitmap {
  constructor(filePath) {
    this.file = filePath;
    this.info = {};
  }
  /**
   * Parser -- accepts a buffer and will parse through it, according to the specification, creating object properties for each segment of the file
   * @param buffer
   */
  parse(buffer) {
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
    if ( this.info.compressionMethod) {
      this.invalid = true;
      return;
    }

    // stride is the number of bytes per row
    // rows are padded up to a multiple of 4 bytes
    // bitDepth * width = # bits per row
    // There are 32 bits per 4-byte block
    // dividing by this will give the number of 4 byte blocks per row
    // Math.ceil to round up. Multiply by 4 to get the number of bytes per row
    this.info.stride = Math.ceil(this.info.bitDepth * this.info.width / 32) * 4;

    this.info.colorPaletteOffset = 14 + this.info.headerSize;

    // If there are colors in the indexed palette, they are 4-byte blocks
    // Stored as B G R 0
    if (this.info.paletteColorCount) {
      this.info.colorPalette = new Array(this.info.paletteColorCount);
      for(let i = 0; i < this.info.paletteColorCount; i++) {
        // each color is a multiple of 4 bytes, hence i*4 below
        this.info.colorPalette[i] = {
          r: this.buffer.readUInt8(this.info.colorPaletteOffset + i*4 + 2),
          g: this.buffer.readUInt8(this.info.colorPaletteOffset + i*4 + 1),
          b: this.buffer.readUInt8(this.info.colorPaletteOffset + i*4 + 0),
        };
      }
    }
    console.log(this.info);
  }
  /**
   * Transform a bitmap using some set of rules. The operation points to some function, which will operate on a bitmap instance
   * @param operation
   */
  transform(operation) {
    switch (operation) {
    case 'colors':
    case 'colours':
      transformColors(this);
      break;
    case 'invert':
      doTheInversion(this);
      break;
    case 'lines':
      lines(this);
    }

    this.newFile = this.file.replace(/\.bmp$/, `.${operation}.bmp`);
  }
}

/**
 * Sample Transformer (greyscale)
 * Would be called by Bitmap.transform('greyscale')
 * Pro Tip: Use "pass by reference" to alter the bitmap's buffer in place so you don't have to pass it around ...
 * @param bmp
 */
const transformColors = (bmp) => {
  console.log('Transforming bitmap into greyscale', bmp);
  //TODO: Figure out a way to validate that the bmp instance is actually valid before trying to transform it

  //TODO: alter bmp to make the image greyscale ...
};

const doTheInversion = (bmp) => {
  // TODO: Build an inverted pixelArray: Read row-by-row and concat to front of destination buffer, row-by-row
  // buffer.concat([readrow, buffer]);
  console.log('inverting image');
};

const lines = (bmp) => {
  // change every-other-row to black, starting at row 0
  // 
  console.log('adding lines');
};

// ------------------ GET TO WORK ------------------- //

function transformWithCallbacks() {
  fs.readFile(file, (err, buffer) => {
    if (err) {
      console.error('Unable to read the file');
      throw err;
    }

    bitmap.parse(buffer);

    if (bitmap.invalid) {
      throw 'File is not a valid bitmap';
    }

    if (bitmap.invalidTransfor) {
      throw 'Invalid transformation requested';
    }

    // bitmap.transform(operation);

    // Note that this has to be nested!
    // Also, it uses the bitmap's instance properties for the name and thew new buffer
    // fs.writeFile(bitmap.newFile, bitmap.buffer, (err, out) => {
    //   if (err) {
    //     throw err;
    //   }
    //   console.log(`Bitmap Transformed: ${bitmap.newFile}`);
    // });
  });
}

// TODO: Explain how this works (in your README)
const [file, operation] = process.argv.slice(2);

let bitmap = new Bitmap(file);

transformWithCallbacks();
