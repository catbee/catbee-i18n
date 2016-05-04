const _memoize = require('lodash.memoize');
const _get = require('lodash.get');

const glue = '\u0004'; // po2json glue symbol
exports.glue = glue;

const INJECT_VARIABLES_REGEXP = /\$[a-zA-Z]+[a-zA-Z0-9.]*/g;

class I18n {
  constructor (locator) {
    this._bus = locator.resolve('eventBus');
    this._config = locator.resolve('config');
    this._glue = _get(this._config, 'l10n.glue', glue);
    this._plural = _get(this._config, 'l10n.plural', 'nplurals=2; plural=(n != 1)');
    this._context = _get(this._config, 'l10n.context', 'l10n');

    this._parsePluralForm = _memoize(this._parsePluralForm.bind(this));
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
    const l10n = _get(ctx, this._context);

    const template = _get(l10n, [str, 1], str);

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
    const l10n = _get(ctx, this._context);

    const template = _get(l10n, [`${context}${this._glue}${str}`, 1], str);

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
    const ctx = rest.pop();
    const number = rest.pop();

    const l10n = _get(ctx, this._context);

    const plural = [str, ...rest];
    const n = this._getPluralNumber(l10n, number);

    const template = _get(l10n, [str, n + 1], plural[n]);

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
    const ctx = rest.pop();
    const number = rest.pop();

    const l10n = _get(ctx, this._context);

    const plural = [str, ...rest];
    const n = this._getPluralNumber(l10n, number);

    const template = _get(l10n, [`${context}${this._glue}${str}`, n + 1], plural[n]);

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
      this._bus.emit('error', new TypeError(`Cannon inject ${path}, not a string or number`));
    }

    return `${value}`;
  }

  _getPluralNumber (l10n, number) {
    const form = _get(l10n, ['', 'plural-forms'], this._plural);
    const rule = this._parsePluralForm(form);

    return rule(number);
  }

  _parsePluralForm (form) {
    const re = /^(\s*nplurals\s*=\s*[0-9]+\s*;\s*plural\s*=\s*(?:\s|[-\?\|&=!<>+*/%:;a-zA-Z0-9_()])+)$/m;

    if (re.test(form)) {
      let pf = form;
      if (!/;\s*$/.test(pf)) {
        pf += ';';
      }

      const code = `
        var plural;
        var nplurals;
        ${pf}
        return (plural === true ? 1 : plural ? plural : 0);
      `;

      try {
        return new Function('n', code); // eslint-disable-line no-new-func
      } catch (e) {
        this._bus.emit('error', e);
        return () => 0;
      }
    }

    throw new SyntaxError(`Plural-Forms is invalid [${form}]`);
  }
}

module.exports = I18n;
