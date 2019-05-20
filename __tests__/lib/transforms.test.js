'use strict';

const { transformColors, doTheInversion, rows, columns, flip } = require('../../lib/transforms.js');

describe('image transforms', () => {
  describe('transformColors()', () => {
    it('returns null when called with no parameters', () => {
      expect(transformColors()).toBeNull();
    });
  });

  describe('doTheInversion()', () => {
    it('returns null when called with no parameters', () => {
      expect(doTheInversion()).toBeNull();
    });
  });

  describe('rows()', () => {
    it('returns null when called with no parameters', () => {
      expect(rows()).toBeNull();
    });
  });

  describe('columns()', () => {
    it('returns null when called with no parameters', () => {
      expect(columns()).toBeNull();
    });
  });

  describe('flip()', () => {
    it('returns null when called with no parameters', () => {
      expect(flip()).toBeNull();
    });
  });

});