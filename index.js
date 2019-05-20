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
- rows    : randomizes the colors of each pixel on every other line
- columns : randomizes the colors of each pixel on every other column
- invert  : inverts the image horizontally
- flip    : flips the image vertically
- rotate  : rotates the image by 180 degrees
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

    bitmap.transform(operation);

    if (bitmap.invalidOperation) {
      console.error('Invalid transformation requested');
      displayHelp();
      return;
    }

    // Note that this has to be nested!
    // Also, it uses the bitmap's instance properties for the name and thew new buffer
    fs.writeFile(bitmap.newFile, bitmap.buffer, (err, out) => {
      if (err) {
        console.error('Unable to write file');
        return;
      }
    
      console.log(`
Transformed bitmap saved as:
${bitmap.newFile}
`);
    });
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
