"use strict";

var _ava = require("ava");

var _ava2 = _interopRequireDefault(_ava);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// If you needs to import your files in src, you needs to require lib-es5 folder.
// import A from "../lib-es5/A";

_ava2.default.todo("We recommend you to write test for reducing bug by your updates.");

(0, _ava2.default)('This is just a sample test', function (t) {
  t.truthy(10 * 5 === 50);
});