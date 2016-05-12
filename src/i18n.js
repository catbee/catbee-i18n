const _get = require('lodash.get');
const i18n = require('i18n-base-methods');
const inject = require('replace-variables');

const glue = '\u0004'; // po2json glue symbol

class I18n {
  constructor (locator) {
    this._bus = locator.resolve('eventBus');
    this._config = locator.resolve('config');
    this._glue = _get(this._config, 'i18n.glue', glue);
    this._plural = _get(this._config, 'i18n.plural', 'nplurals=1; plural=0;');
    this._context = _get(this._config, 'i18n.context', 'l10n');
  }

  /**
   * Simple translate.
   *
   * @param {string} str
   * @param {Object} ctx
   * @returns {string}
   * @public
   */
  _t (str, ctx) {
    if (arguments.length < 2) {
      this._bus.emit('error', new Error('Not enough arguments for _t'));
      return str;
    }

    const l10n = _get(ctx, this._context);

    try {
      const template = i18n._t({ l10n, plural: this._plural }, str);

      return inject(ctx, template);
    } catch (e) {
      this._bus.emit('error', e);

      return str;
    }
  }

  /**
   * Simple translate with context.
   *
   * @param {string} context
   * @param {string} str
   * @param {Object|undefined} ctx
   * @returns {string}
   * @public
   */
  _pt (context, str, ctx) {
    if (arguments.length < 3) {
      this._bus.emit('error', new Error('Not enough arguments for _pt'));
      return str;
    }

    const l10n = _get(ctx, this._context);

    try {
      const template = i18n._pt({ l10n, plural: this._plural }, context, str);

      return inject(ctx, template);
    } catch (e) {
      this._bus.emit('error', e);

      return str;
    }
  }

  /**
   * Translate with plural form.
   *
   * @param {string} str
   * @param {Array} rest
   * @returns {string}
   * @public
   */
  _nt (str, ...rest) {
    if (arguments.length < 3) {
      this._bus.emit('error', new Error('Not enough arguments for _nt'));
      return str;
    }

    const ctx = rest.pop();
    const number = rest.pop();

    const l10n = _get(ctx, this._context);
    const plurals = [str, ...rest];

    try {
      const template = i18n._nt({ l10n, plural: this._plural }, plurals, number);

      return inject(ctx, template);
    } catch (e) {
      this._bus.emit('error', e);

      return str;
    }
  }

  /**
   * Translate with context and plural form.
   *
   * @param {string} context
   * @param {string} str
   * @param {Array} rest
   * @returns {string}
   * @public
   */
  _npt (context, str, ...rest) {
    if (arguments.length < 4) {
      this._bus.emit('error', new Error('Not enough arguments for _npt'));
      return str;
    }

    const ctx = rest.pop();
    const number = rest.pop();

    const l10n = _get(ctx, this._context);
    const plurals = [str, ...rest];

    try {
      const template = i18n._npt({ l10n, plural: this._plural }, context, plurals, number);

      return inject(ctx, template);
    } catch (e) {
      this._bus.emit('error', e);

      return str;
    }
  }
}

module.exports = I18n;
