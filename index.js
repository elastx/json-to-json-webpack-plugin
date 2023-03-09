const fs = require("fs");
const path = require("path");

class JSONToJSONWebpackPlugin {
  constructor(options) {
    this.options = options;
    this.timestamps = new Map();
  }

  apply(compiler) {
    const { webpack } = compiler;
    const { RawSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap(
      "JSONToHTMLWebpackPlugin",
      (compilation) => {
        this.options.pages.forEach((page) => {
          page.jsonFiles.forEach((jsonFile) => {
            // Add each json file to deps
            if (!compilation.fileDependencies.has(path.resolve(jsonFile))) {
              compilation.fileDependencies.add(path.resolve(jsonFile));
            }
          });
        });

        compilation.hooks.processAssets.tap(
          {
            name: "JSONToHTMLWebpackPlugin",
            stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
          },
          () => {
            const dependencies = this.options.pages
              .reduce((acc, page) => [...acc, ...page.jsonFiles], [])
              .map((file) => path.resolve(file));

            const changedDependencies = dependencies.filter((file) => {
              return (
                !this.timestamps.has(file) ||
                this.timestamps.get(file) < fs.statSync(file).mtimeMs
              );
            });

            changedDependencies.forEach((file) => {
              this.timestamps.set(file, fs.statSync(file).mtimeMs);
            });

            // Get all pages that depend on changed files
            const pagesWithChangedDependencies = this.options.pages.filter(
              (page) => {
                return page.jsonFiles.some((jsonFile) => {
                  return changedDependencies.includes(path.resolve(jsonFile));
                });
              }
            );

            // Render each json file
            pagesWithChangedDependencies.forEach((page) => {
              const { jsonFiles, transformer, outputFile } = page;

              const rawData = {};
              jsonFiles.forEach((jsonFile) => {
                const jsonFilePath = path.resolve(jsonFile);
                const jsonData = JSON.parse(
                  fs.readFileSync(jsonFilePath, "utf8")
                );
                rawData[path.basename(jsonFilePath, ".json")] = jsonData;
              });

              let data = rawData;
              if (transformer) {
                data = transformer(rawData);
              }

              compilation.emitAsset(
                outputFile,
                new RawSource(JSON.stringify(data))
              );
            });
          }
        );
      }
    );
  }
}

module.exports = JSONToJSONWebpackPlugin;
