module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true,
        },
        modules: false, // Preserve ES modules
      },
    ],
  ],
};