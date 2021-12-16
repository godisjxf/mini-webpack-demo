(function (modules) {
  function require(path) {
    let fn = modules[path];
    const module = { exports: {} };
    fn(require, module, module.exports);
    return module.exports;
  }
  require("./main.js");
})({
  "./main.js": function (require, module, exports) {
    const foo = require("./foo.js").foo;
    foo();
  },
  "./foo.js": function (require, module, exports) {
    exports.foo = function () {
      console.log("foo");
    };
  },
});
