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
      const foo = require("./foo.js").foo;
      foo();
    },
    { ".foo.js": 2 },
  ],
  2: [
    function (require, module, exports) {
      exports.foo = function () {
        console.log("foo");
      };
    },
    {},
  ],
});
