module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@core": "./src/core",
            "@modules": "./src/modules",
            "@interfaces": "./src/interfaces",
            "@types": "./src/types",
            "@assets": "./assets",
          },
        },
      ],
    ],
  };
};
