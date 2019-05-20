'use strict';

// Inclusive random integer
let _randInt = function (a = 0, b = 0) {
  let min = Math.min(a, b);
  let max = Math.max(a, b);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Takes in a bitmask and an unmasked int (endianness must match)
 * Returns the masked number, as an integer
 * e.g. with binary representations:
 * bitmask 0011100 & 1110100 = 0010100 -> 101 = 5
 * @param {int} bitmask Bitmask to work with
 * @param {int} unmasked Number to mask
 * @returns {int}
 */
function bitmaskToNumber(bitmask, unmasked) {
  if (bitmask == null || unmasked == null) {
    return 0;
  }
  const length = bitmask.toString(2).lastIndexOf('1') + 1;
  const masked = (bitmask & unmasked).toString(2).slice(0, length);
  return parseInt(masked, 2);
}

/**
 * Function to reverse an array in-place.
 * @param {Array} arr Array to reverse the elements of
 * @returns {Array} array which was reversed is also returned
 */
function arrayReverse(arr) {
  if (arr == null) {
    return null;
  }
  for (let i = 0; i < (arr.length - 1 ) / 2; i++) {
    let temp = arr[i];
    arr[i] = arr[arr.length - 1 - i];
    arr[arr.length - 1 - i] = temp;
  }
  return arr;
}

module.exports = exports = {_randInt, bitmaskToNumber, arrayReverse};
