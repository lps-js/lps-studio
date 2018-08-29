const fs = require('fs');
const metadata = require('../package.json');

module.exports = {
  'font-awesome@4.7.0': {
    license: 'MIT, SIL OFL 1.1',
    source: 'https://fontawesome.com/v4.7.0/license/',
    sourceText: fs.readFileSync(__dirname + '/licenses/font-awesome.txt', 'utf8')
  },

  `${metadata.name}@${metadata.version}`: {
    license: 'BSD-3-Clause, MIT',
    source: 'https://github.com/mauris/lps-studio/',
    sourceText: fs.readFileSync(__dirname + '/../LICENSE', 'utf8')
  }
};
