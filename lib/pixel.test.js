import { Pixel } from "./pixel";
import { pixelJson } from "./pixel-track";

let fbPixel = new Pixel();

test('if date field and date object', () => {
  expect(fbPixel.isDate(['checkinDate', "12:12:12"])).toBe(false);
  expect(fbPixel.isDate(['randomDate', false])).toBe(false);
  expect(fbPixel.isDate(['checkinDate', new Date()])).toBe(true);
});

test('removing blacklisted PII without removing whitelist', () => {
  let properties = ['one', 'two', 'three', 'foo', 'bar', 'foobar'];
  let blacklist = ['foo', 'bar', 'foobar'];
  let whitelist = ['foo'];

  expect(fbPixel.removePii(properties, blacklist, whitelist)).toEqual(['one', 'two', 'three', 'foo']);
});

test('creating payload', () => {
  let track = {
    properties: {
      foo: 'one',
      bar: 'two',
      products: [
        {
          name: 'food'
        },
        {
          name: 'snacks'
        }
      ]
    }
  };

  let blacklist = ['foo', 'bar', 'foobar'];
  let whitelist = ['foo'];

  let expectedValue = {
    properties: {
      foo: 'one',
      bar: 'two',
      products: [
        {
          name: 'food'
        },
        {
          name: 'snacks'
        }
      ]
    }
  };

  expect(fbPixel.createPayload(track, blacklist, whitelist)).toEqual(expectedValue);
});
