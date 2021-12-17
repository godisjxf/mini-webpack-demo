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
      
       1:[function (require, module, exports) {
            "use strict";

var _foo = require("./foo.js");

var _doc = require("./doc.md");

var _doc2 = _interopRequireDefault(_doc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _foo.foo)();
console.log(_doc2.default);
            },
                {"./foo.js":2,"./doc.md":3}
        ],
        
       2:[function (require, module, exports) {
            "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.foo = foo;

function foo() {
  console.log("foo");
}
            },
                {}
        ],
        
       3:[function (require, module, exports) {
            "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = 'this myLoader';
            },
                {}
        ],
        
  });
  