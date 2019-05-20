'use strict';

const {_randInt, bitmaskToNumber, arrayReverse} = require('../../lib/helpers.js');

describe('randInt() function', () => {
  it('returns 0 with no input', () => {
    expect(_randInt()).toStrictEqual(0);
  });
});

describe('bitmaskToNumber() function', () => {
  it('returns 0 if inputs are missing', () => {
    expect(bitmaskToNumber()).toStrictEqual(0);
    expect(bitmaskToNumber(0)).toStrictEqual(0);
  });
});

describe('arrayReverse() function', () => {
  it('returns null with no input', () => {
    expect(arrayReverse()).toBeNull();
  });
});
