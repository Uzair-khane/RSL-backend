// test/app.test.js
const chai = require('chai');
const expect = chai.expect;

describe('Basic Test', function() {
  it('should return true when 1 + 1 equals 2', function() {
    expect(1 + 1).to.equal(2);
  });
});