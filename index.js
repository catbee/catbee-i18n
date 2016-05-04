const I18n = require('./src/i18n');

module.exports = {
  register (locator) {
    locator.register('i18n', I18n, true);
  }
};
