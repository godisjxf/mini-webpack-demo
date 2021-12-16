const path = require("path");
const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("babel-core");
const ejs = require("ejs");
let count = 1;

function asserts(fileName) {
  const source = fs.readFileSync(fileName, "utf-8");
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
function creatGraph(fileName) {
  let mainAsset = asserts(fileName);
  let queue = [mainAsset];
  let base = path.dirname(fileName);
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
bundle(creatGraph("./example/main.js"));
