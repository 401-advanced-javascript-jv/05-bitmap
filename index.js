'use strict';

const fs = require('fs');

const Bitmap = require('./lib/bitmap.js');

const displayHelp = () => {
  console.log(`
Usage notes:
node index.js <file>.bmp <operation>
Operation must be one of:
- colors  : randomizes the colors - scrambles everything in unexpected ways
- colours : same as colors
- invert  : inverts the image
- rows   : randomizes the colors of each pixel on every other line
`);
  return;
};

// ------------------ GET TO WORK ------------------- //

function transformWithCallbacks() {
  fs.readFile(file, (err, buffer) => {
    if (err) {
      console.error('Unable to read the file');
      return;
    }

    bitmap.parse(buffer);

    if (bitmap.invalid) {
      displayHelp();
      return;
    }

    bitmap.transform(operation);

    if (bitmap.invalidOperation) {
      console.error('Invalid transformation requested');
      displayHelp();
      return;
    }

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
