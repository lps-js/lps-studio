const path = require('path');
const fs = require('fs');
const legalEagle = require('legal-eagle');
const licenseOverrides = require('./license-overrides.js');
const metadata = require('../package.json');
const appRootPath = path.resolve(__dirname, '../');
const legalEagleOptions = {
  path: appRootPath,
  overrides: licenseOverrides
};
const targetOutputFile = '_licenses.json';

legalEagle(legalEagleOptions, (err, summaryArg) => {
  if (err) {
    console.error(err);
    return;
  }
  let summary = summaryArg;

  let packageKey = `${metadata.name}@${metadata.version}`;
  summary[packageKey].license = 'BSD-3-Clause, MIT';
  summary[packageKey].sourceText = fs.readFileSync(__dirname + '/../LICENSE', 'utf8');

  fs.writeFileSync(path.join(appRootPath, targetOutputFile), JSON.stringify(summary));
});
