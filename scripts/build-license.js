const path = require('path');
const fs = require('fs');
const legalEagle = require('legal-eagle');
const licenseOverrides = require('./license-overrides.js');
const appRootPath = path.resolve(__dirname, '../');
const legalEagleOptions = {
  path: appRootPath,
  overrides: licenseOverrides
};
const targetOutputFile = '_licenses.json';

legalEagle(legalEagleOptions, (err, summary) => {
  if (err) {
    console.error(err);
    return;
  }
  fs.writeFileSync(path.join(appRootPath, targetOutputFile), JSON.stringify(summary));
});
