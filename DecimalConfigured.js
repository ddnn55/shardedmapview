// work around Safari/WebKit bug yikes - https://github.com/MikeMcl/decimal.js/pull/56
if (Object.keys({'250': 0.5, '1000': 0.1}).length !== 2) {
  Array.prototype.unshift = function () {
    Array.prototype.splice.apply(this, Array.prototype.concat.apply([0, 0], arguments));
    return this.length;
  };
  Array.prototype.shift = function () {
    return Array.prototype.splice.call(this, 0, 1)[0];
  };
}

const Decimal = require('decimal.js').default;
Decimal.set({precision: 200});

module.exports = Decimal;
