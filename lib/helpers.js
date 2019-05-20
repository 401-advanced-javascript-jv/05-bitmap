'use strict';

// Inclusive random integer
let _randInt = function (a, b) {
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
  const length = bitmask.toString(2).lastIndexOf('1') + 1;
  const masked = (bitmask & unmasked).toString(2).slice(0, length);
  return parseInt(masked, 2);
}

module.exports = exports = {_randInt, bitmaskToNumber};
