const path = require("path");
const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("babel-core");
const ejs = require("ejs");
const { SyncHook, AsyncSeriesHook } = require("tapable");
const MyPlugin = require("./example/myPlugin");
let count = 1;
let globalConfig = {};
let hooks = {
  run: new SyncHook(),
  emit: new AsyncSeriesHook(["compiler"]),
};
function asserts(fileName) {
  let source = fs.readFileSync(fileName, "utf-8");
  const rules = globalConfig.module.rules;
  rules.forEach(({ test, use: loader }) => {
    if (test.test(fileName)) {
      source = loader(source);
    }
  });
  console.log(source);
  const ast = parser.parse(source, { sourceType: "module" });
  let deps = [];
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      deps.push(node.source.value);
    },
  });
  //es6+ ->es5
  const { code } = transformFromAst(ast, null, { presets: "env" });
  return {
    id: count++,
    fileName,
    code,
    deps,
    mapping: {},
  };
}
function creatGraph() {
  hooks.run.call();
  let mainAsset = asserts(globalConfig.entry);
  let queue = [mainAsset];
  let base = path.dirname(globalConfig.entry);
  for (const module of queue) {
    module.deps.forEach((relativePath) => {
      const asset = asserts(path.resolve(base, relativePath));
      module.mapping[relativePath] = asset.id;
      queue.push(asset);
    });
  }
  // console.log(queue);
  return queue;
}
function bundle(graph) {
  const context = "jxf";
  function creatModules(graph) {
    const modules = {};
    graph.forEach((module) => {
      modules[module.id] = [module.code, module.mapping];
    });
    return modules;
  }
  // console.log(creatModules(graph));
  const modules = creatModules(graph);
  const bundleTemplate = fs.readFileSync("./bundle.ejs", "utf-8");
  const code = ejs.render(bundleTemplate, {
    modules,
  });
  function emitFile(context) {
    fs.writeFileSync("./example/dist/bundle.js", context);
  }
  emitFile(code);
}
function initPlugins() {
  globalConfig.plugins.forEach((plugin) => {
    plugin.apply?.call(plugin, { hooks });
  });
}
const myLoader = function () {
  console.log("myLoader");
  return "export default 'this myLoader'";
};
const webpackConfig = {
  entry: "./example/main.js",
  module: {
    rules: [{ test: /.md$/, use: myLoader }],
  },
  plugins: [new MyPlugin()],
};
function webpack(config) {
  globalConfig = config;
  initPlugins();
  const graph = creatGraph(config.entry);
  hooks.emit.callAsync([{ type: "compilation" }], () => {
    console.log("emit 处理完毕");
  });
  bundle(graph);
}
webpack(webpackConfig);
