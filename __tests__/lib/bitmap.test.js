'use strict';

const Bitmap = require('../../lib/bitmap.js');

describe('Bitmap class', () => {
  it('creates a Bitmap object', () => {
    expect(new Bitmap).toBeInstanceOf(Bitmap);
  });
});
