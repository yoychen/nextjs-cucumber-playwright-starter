module.exports = {
  default: {
    paths: ['tests/cucumber/features/**/*.feature'],
    import: ['tests/cucumber/step-definitions/**/*.ts'],
    format: ['progress-bar', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
