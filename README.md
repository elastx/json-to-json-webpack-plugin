# JSONToJSONWebpackPlugin

A webpack plugin to transform JSON files into a single JSON file.

## Installation

```bash
npm install json-to-json-webpack-plugin
```

## Usage

In your webpack configuration file:

```javascript
const JSONToJSONWebpackPlugin = require("json-to-json-webpack-plugin");

module.exports = {
  // other Webpack options...
  plugins: [
    new JSONToJSONWebpackPlugin({
      pages: [
        {
          jsonFiles: ["./path/to/file1.json", "./path/to/file2.json"],
          outputFile: "./output/file.json",
          transformer: (data) => {
            // optional transformation function
            return {
              ...data.file1,
              example: data.file2,
            };
          },
        },
        // optional more pages...
      ],
    }),
    // other Webpack plugins...
  ],
  // other Webpack options...
};
```

## Options

- `pages` _(required)_ An array of objects, each with the following properties:
  - `jsonFiles`: _(required)_ An array of strings, each representing a path to a JSON file.
  - `outputFile`: _(required)_ A string representing the path to the output file.
  - `transformer` _(optional)_: A function that takes the raw JSON data as input and returns the transformed data.

## License

MIT.
