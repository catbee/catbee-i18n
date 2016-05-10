const _get = require('lodash.get');
const i18nMethods = require('i18n-base-methods');

const glue = '\u0004'; // po2json glue symbol
exports.glue = glue;

const INJECT_VARIABLES_REGEXP = /\$[a-zA-Z]+[a-zA-Z0-9.]*/g;

class I18n {
  constructor (locator) {
    this._bus = locator.resolve('eventBus');
    this._config = locator.resolve('config');
    this._glue = _get(this._config, 'i18n.glue', glue);
    this._plural = _get(this._config, 'i18n.plural', 'nplurals=1; plural=0;');
    this._context = _get(this._config, 'i18n.context', 'l10n');
  }

  /**
   * Односложная фраза без склонений и прочего.
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

    let template;

    try {
      template = i18nMethods
        ._t({ l10n, plural: this._plural }, str);
    } catch (e) {
      this._bus.emit('error', e);
      template = str;
    }

    return this._injectVariables(ctx, template);
  }

  /**
   * Фраза, перевод которой зависит от контекста.
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

    let template;

    try {
      template = i18nMethods
        ._pt({ l10n, plural: this._plural }, context, str);
    } catch (e) {
      this._bus.emit('error', e);
      template = str;
    }

    return this._injectVariables(ctx, template);
  }

  /**
   * Фраза со склонением. Плюральные формы и вот это вот всё.
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

    let template;

    try {
      template = i18nMethods
        ._nt({ l10n, plural: this._plural }, plurals, number);
    } catch (e) {
      this._bus.emit('error', e);
      template = str;
    }

    return this._injectVariables(ctx, template);
  }

  /**
   * Фраза с зависимостью от контекста и склоняемая.
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

    let template;

    try {
      template = i18nMethods
        ._npt({ l10n, plural: this._plural }, context, plurals, number);
    } catch (e) {
      this._bus.emit('error', e);
      template = str;
    }

    return this._injectVariables(ctx, template);
  }

  /**
   * replace $varName with l10n.varName value
   *
   * Имена переменных не должны быть вложенными: $n, $nn
   *
   * @example:
   *  this = { n1: 'боль', n2: 'Руди' };
   *  function.call(this, '$n1 у $n2 от твоего кода') == 'боль у Руди от твоего кода'
   *
   * @param {Object} ctx
   * @param {string} str
   * @return {string}
   */
  _injectVariables (ctx, str = '') {
    return str.replace(INJECT_VARIABLES_REGEXP, (path) => this
      ._validateVariable(path, _get(ctx, path.substr(1))));
  }

  /**
   * value must be string or number.
   *
   * @param {string} path - variable name in l10n
   * @param {string|number} value
   * @return {string|number}
   */
  _validateVariable (path, value) {
    if (!/(string|number)/.test(typeof value)) {
      this._bus.emit('error', new TypeError(
        `i18n - cannon inject ${path}, not a string or number`
      ));
    }

    return `${value}`;
  }
}

module.exports = I18n;
