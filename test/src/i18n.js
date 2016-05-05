const Lab = require('lab');
const lab = exports.lab = Lab.script();
const { experiment, test, beforeEach } = lab;

const assert = require('assert');
const ServiceLocator = require('catberry-locator');
const EventEmitter = require('events').EventEmitter;

const I18n = require('../../src/i18n');
const ruPluralForm = 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);';
const ruPluralContext = { l10n: {'': { 'plural-forms': ruPluralForm }}};


experiment('I18n', () => {
  let i18n, locator;

  beforeEach((done) => {
    locator = new ServiceLocator();

    locator.registerInstance('config', {});
    locator.register('eventBus', EventEmitter, true);
    locator.register('i18n', I18n, true);

    i18n = locator.resolve('i18n');

    done();
  });

  experiment('Translate functions.', () => {
    experiment('_t - Простой перевод.', () => {
      test('Без перевода.', (done) => {
        const str = 'привет';

        assert.equal(str, i18n._t(str));

        done();
      });

      test('С переменной без перевода.', (done) => {
        const str = '$str';

        const hbContext = {
          str: 'ничоси'
        };

        assert.equal(hbContext.str, i18n._t(str, hbContext));

        done();
      });

      test('С переводом.', (done) => {
        const str = 'привет';

        const root = {
          l10n: {
            привет: [null, 'hello']
          }
        };

        assert.equal('hello', i18n._t(str, root));

        done();
      });

      test('С переводом и переменной.', (done) => {
        const str = 'привет $name';

        const root = {
          l10n: {
            'привет $name': [null, 'hello $name']
          },
          name: 'Dude'
        };

        assert.equal('hello Dude', i18n._t(str, root));

        done();
      });
    });

    experiment('_pt - Перевод с контекстом.', () => {
      const context = 'Приветствие';

      test('Без перевода.', (done) => {
        const str = 'привет';

        assert.equal(str, i18n._pt(context, str));

        done();
      });

      test('С переменной без перевода.', (done) => {
        const str = '$str';

        const hbContext = {
          str: 'ничоси'
        };

        assert.equal(hbContext.str, i18n._pt(context, str, hbContext));

        done();
      });

      test('С переводом.', (done) => {
        const str = 'привет';

        const root = {
          l10n: {
            [`${context}${i18n._glue}${str}`]: [null, 'hello']
          }
        };

        assert.equal('hello', i18n._pt(context, str, root));

        done();
      });

      test('С переводом и переменной.', (done) => {
        const str = 'привет $name';

        const root = {
          l10n: {
            [`${context}${i18n._glue}${str}`]: [null, 'hello $name']
          },
          name: 'Dude'
        };

        assert.equal('hello Dude', i18n._pt(context, str, root));

        done();
      });
    });

    experiment('_nt - Перевод со склонением (plural).', () => {
      test('Без перевода.', (done) => {
        const ruPlural = [2, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1];
        const str = 'фотография';
        const plural1 = 'фотографии';
        const plural2 = 'фотографий';

        const plural = [str, plural1, plural2];

        for (let i = 0; i < ruPlural.length; i++) {
          assert.equal(
            plural[ruPlural[i]],
            i18n._nt(str, plural1, plural2, i, ruPluralContext)
          );
        }

        done();
      });

      test('С переменной без перевода.', (done) => {
        const ruPlural = [2, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1];
        const str = '$count фотография';
        const plural1 = '$count фотографии';
        const plural2 = '$count фотографий';

        const plural = ['фотография', 'фотографии', 'фотографий'];

        for (let i = 0; i < ruPlural.length; i++) {
          assert.equal(
            `${i} ${plural[ruPlural[i]]}`,
            i18n._nt(str, plural1, plural2, i, Object.assign({ count: i }, ruPluralContext))
          );
        }

        done();
      });

      test('С переводом.', (done) => {
        const csPlural = [2, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
        const str = 'филиал';
        const plural1 = 'филиала';
        const plural2 = 'филиалов';

        const plural = ['pobočka', 'pobočky', 'poboček'];

        const root = {
          l10n: {
            '': { 'plural-forms': 'nplurals=3; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2' },
            [str]: [str, ...plural]
          }
        };

        for (let i = 0; i < csPlural.length; i++) {
          assert.equal(
            plural[csPlural[i]],
            i18n._nt(str, plural1, plural2, i, root)
          );
        }

        done();
      });

      test('С переводом и переменной.', (done) => {
        const csPlural = [2, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
        const str = '$count филиал';
        const plural1 = '$count филиала';
        const plural2 = '$count филиалов';

        const plural = ['pobočka', 'pobočky', 'poboček'];

        const root = {
          l10n: {
            '': { 'plural-forms': 'nplurals=3; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2\n' },
            [str]: [str, '$count pobočka', '$count pobočky', '$count poboček']
          }
        };

        const options = {
          data: { root }
        };

        for (let i = 0; i < csPlural.length; i++) {
          assert.equal(
            `${i} ${plural[csPlural[i]]}`,
            i18n._nt(str, plural1, plural2, i, Object
              .assign({}, root, { count: i })));
        }

        done();
      });
    });

    experiment('_npt - Перевод со склонением и контекстом.', () => {
      const context = 'Банковская карта';

      test('Без перевода', (done) => {
        const ruPlural = [2, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1];
        const str = 'карта';
        const plural1 = 'карты';
        const plural2 = 'карт';

        const plural = [str, plural1, plural2];

        for (let i = 0; i < ruPlural.length; i++) {
          assert.equal(
            plural[ruPlural[i]],
            i18n._npt(context, str, plural1, plural2, i, ruPluralContext)
          );
        }

        done();
      });
      test('С переменной без перевода.', (done) => {
        const ruPlural = [2, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1];
        const str = '$count карта';
        const plural1 = '$count карты';
        const plural2 = '$count карт';

        const plural = ['карта', 'карты', 'карт'];

        for (let i = 0; i < ruPlural.length; i++) {
          assert.equal(
            `${i} ${plural[ruPlural[i]]}`,
            i18n._npt(context, str, plural1, plural2, i, Object.assign({ count: i }, ruPluralContext))
          );
        }

        done();
      });
      test('С переводом.', (done) => {
        const enPlural = [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        const str = 'карта';
        const plural1 = 'карты';
        const plural2 = 'карт';

        const plural = ['card', 'cards'];

        const root = {
          l10n: {
            '': { 'plural-forms': 'nplurals=2; plural=(n != 1)\n' },
            [`${context}${i18n._glue}${str}`]: [str, ...plural]
          }
        };

        const options = {
          data: { root }
        };

        for (let i = 0; i < enPlural.length; i++) {
          assert.equal(
            plural[enPlural[i]],
            i18n._npt(context, str, plural1, plural2, i, Object
              .assign({}, root, { count: i }))
          );
        }

        done();
      });
      test('С переводом и переменной.', (done) => {
        const enPlural = [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        const str = '$count карта';
        const plural1 = '$count карты';
        const plural2 = '$count карт';

        const plural = ['card', 'cards'];

        const root = {
          l10n: {
            '': { 'plural-forms': 'nplurals=2; plural=(n != 1)\n' },
            [`${context}${i18n._glue}${str}`]: [str, '$count card', '$count cards']
          }
        };

        const options = {
          data: { root }
        };

        for (let i = 0; i < enPlural.length; i++) {
          assert.equal(
            `${i} ${plural[enPlural[i]]}`,
            i18n._npt(context, str, plural1, plural2, i, Object
              .assign({}, root, { count: i }))
          );
        }

        done();
      });
    });
  });

  experiment('Helpers function', () => {
    experiment('_injectVariables', () => {
      test('Строка без $переменных не изменяется.', (done) => {
        const strings = [
          'ывашгр',
          'аывргшаырг  ываргшгры авгрш',
          'fsa0 j0f sdsfdj0 jj',
          "Запутанная \" 'строка' \"",
          '\''
        ];

        strings.forEach((string) => assert.equal(string, i18n._injectVariables({}, string)));

        done();
      });

      test('Все повторяющиеся переменные заменяются.', (done) => {
        const string = '$hello $hello $hello';

        const context = { hello: 'привет' };

        assert.equal('привет привет привет', i18n._injectVariables(context, string));

        done();
      });

      test('Переменные с взаимовложенными именами так же нормально заменяются', (done) => {
        const string = '$h $hh $hhh $hhhh';

        const context = {
          h: 1,
          hh: 2,
          hhh: 3,
          hhhh: 4
        };

        assert.equal('1 2 3 4', i18n._injectVariables(context, string));

        done();
      });

      test('Не переменные не заменяются', (done) => {
        const string = '$1 $ h$ $$ 100$ $10';

        assert.equal('$1 $ h$ $$ 100$ $10', i18n._injectVariables({}, string));

        done();
      });

      test('При отсутствии значения бросается ошибка', (done) => {
        const string = '$hh';
        const result = 'TypeError: Cannon inject $hh, not a string or number';

        const bus = locator.resolve('eventBus');
        bus.on('error', (error) => {
          assert.equal(result, `${error}`);
          done();
        });

        i18n._injectVariables({}, string);
      });

      test('Вытягивается путь через точку', (done) => {
        const string = '$h.h';

        const context = {
          h: {
            h: 'строка'
          }
        };

        assert.equal('строка', i18n._injectVariables(context, string));

        done();
      });
    });
  });
});

