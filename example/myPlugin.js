class MyPlugin {
  apply({ hooks }) {
    hooks.emit.tap("myPlugin", (compilation) => {
      console.log(compilation);
      console.log("my plugin ");
    });
  }
}

module.exports = MyPlugin;
