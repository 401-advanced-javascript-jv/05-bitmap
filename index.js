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
- rows    : randomizes the colors of each pixel on every other line
- columns : randomizes the colors of each pixel on every other column
`);
  return;
};

// ------------------ GET TO WORK ------------------- //

function transformWithCallbacks(file, operation) {
  fs.readFile(file, (err, buffer) => {
    if (err) {
      console.error('Unable to read the file');
      return;
    }

    let bitmap = new Bitmap(file, buffer);

    if (bitmap.invalid) {
      displayHelp();
      return;
    }

    // console.log(bitmap);
    // console.log(bitmap.pixelColor(26, 16));
    // console.log(bitmap.pixelColor(26, 16, ))
    // console.log(bitmap.pixelColor(25, 16));
    console.log('white', bitmap.pixelColor(1, 1));
    console.log('black', bitmap.pixelColor(2, 1));
    console.log('red', bitmap.pixelColor(3, 1));
    console.log('green', bitmap.pixelColor(4, 1));
    console.log('blue', bitmap.pixelColor(5, 1));
    
    // bitmap.transform(operation);

    if (bitmap.invalidOperation) {
      console.error('Invalid transformation requested');
      displayHelp();
      return;
    }

    // Note that this has to be nested!
    // Also, it uses the bitmap's instance properties for the name and thew new buffer
    // fs.writeFile(bitmap.newFile, bitmap.buffer, (err, out) => {
    //   if (err) {
    //     console.error('Unable to write file');
    //     return;
    //   }
    //
    //   console.log(`Bitmap Transformed: ${bitmap.newFile}`);
    // });
  });
}

function main() {

  const [file, operation] = process.argv.slice(2);

  if (!file) {
    displayHelp();
    return;
  }
  
  if (operation === 'help') {
    displayHelp();
    return;
  }
  
  transformWithCallbacks(file, operation);
}

main();
