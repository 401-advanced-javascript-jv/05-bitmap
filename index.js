'use strict';

const fs = require('fs');

const bitmap32Offsets = {
  bitmapSize: 21,
  pixelArray: 10,
  headerSize: 14,
  width: 18,
  height: 22,
  bitDepth: 28,
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

    for (let offset in bitmap32Offsets) {
      this.info[offset] = buffer.readInt32LE(bitmap32Offsets[offset]);
    }



  }
  /**
   * Transform a bitmap using some set of rules. The operation points to some function, which will operate on a bitmap instance
   * @param operation
   */
  transform(operation) {
    transforms[operation](this);
    switch (operation) {
    case 'invert':
      doTheInversion(this);
      break;
    case 'greyscale':
    case 'grayscale':
      transformGreyscale(this);
      break;
    case 'skew':
      skewByOne(this);
      break;
    default:
      console.log('An invalid operation was supplied');
      return this;
    }
    this.newFile = this.file.replace(/\.bmp$/, `.${operation}.bmp`);
  }
}

// These are the byte offsets where the named information is stored in the BMP file

/**
 * Sample Transformer (greyscale)
 * Would be called by Bitmap.transform('greyscale')
 * Pro Tip: Use "pass by reference" to alter the bitmap's buffer in place so you don't have to pass it around ...
 * @param bmp
 */
const transformGreyscale = (bmp) => {
  console.log('Transforming bitmap into greyscale', bmp);

  //TODO: Figure out a way to validate that the bmp instance is actually valid before trying to transform it

  //TODO: alter bmp to make the image greyscale ...
};

const doTheInversion = (bmp) => {
  bmp = {};
};

const skewByOne = (bmp) => {
  bmp = {};
};

/**
 * A dictionary of transformations
 * Each property represents a transformation that someone could enter on the command line and then a function that would be called on the bitmap to do this job
 */
const transforms = {
  greyscale: transformGreyscale,
  invert: doTheInversion,
};

// ------------------ GET TO WORK ------------------- //

function transformWithCallbacks() {
  fs.readFile(file, (err, buffer) => {
    if (err) {
      console.error('Unable to read the file');
      throw err;
    }

    bitmap.parse(buffer);

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
