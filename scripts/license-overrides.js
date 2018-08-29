const fs = require('fs');

module.exports = {
  'font-awesome@4.7.0': {
    license: 'MIT, SIL OFL 1.1',
    source: 'https://fontawesome.com/v4.7.0/license/',
    sourceText: fs.readFileSync(__dirname + '/licenses/font-awesome.txt', 'utf8')
  }
};
