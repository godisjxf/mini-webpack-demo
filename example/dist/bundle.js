(function (modules) {
  function require(id) {
    const [fn, mapping] = modules[id];
    function localRequire(fileName) {
      const id = mapping[fileName];
      return require(id);
    }

    const module = { exports: {} };
    fn(localRequire, module, module.exports);
    return module.exports;
  }
  require(1);
})({
  1: [
    function (require, module, exports) {
      "use strict";

      var _foo = require("./foo.js");

      (0, _foo.foo)();
    },
    { "./foo.js": 2 },
  ],

  2: [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports.foo = foo;

      function foo() {
        console.log("foo");
      }
    },
    {},
  ],
});
