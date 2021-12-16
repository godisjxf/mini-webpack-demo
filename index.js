const path = require("path");
const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("babel-core");

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
    code,
    deps,
  };
}
function creatGraph(fileName) {
  let mainAsset = asserts(fileName);
  let queue = [mainAsset];
  let base = path.dirname(fileName);
  for (const module of queue) {
    module.deps.forEach((relativePath) => {
      const asset = asserts(path.resolve(base, relativePath));
      queue.push(asset);
    });
  }
}
function bundle(graph) {}
asserts("./example/main.js");
