// Karma configuration
// Generated on Thu Jul 12 2018 19:50:02 GMT+0200 (CEST)



module.exports = function(config) {
  config.set({

      frameworks: ["mocha", "karma-typescript"],

      files: [
          { pattern: "src/**/*.ts" }
      ],

      preprocessors: {
          "**/*.ts": ["karma-typescript"]
      },

      reporters: ["progress", "karma-typescript"],

      browsers: ["Chrome"],

      karmaTypescriptConfig: {
        compilerOptions: {
          target: 'es2015',
          "allowSyntheticDefaultImports": true
        }
      }
  });
};