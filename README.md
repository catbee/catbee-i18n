# catbee-i18n

[![Build Status][travis-img]][travis-url]
[![Code Coverage][codecov-img]][codecov-url]

# i18n service for catbee

``` js
  const i18nService = require('catbee-i18n');
  i18nService.register(serviceLocator);

  const i18n = serviceLocator.resolve('i18n');
```

## Four methods for usage in .js

- `_t (str, ctx)` - Simple translate
- `_pt (context, str, ctx)` - Simple translate with context
- `_nt (...plurals, num, ctx), ` - Translate with plural form
- `_npt (context, ...plurals, num, ctx)` - Translate with plural form and context

`ctx` - js object with translates `l10n` (name cofiguring with config) property and other properties for replace `${var}` in string by `var` variable in ctx
`plurals` - plural forms of your application default language

``` js
const ctx = {
  l10n: {
    "": {
      "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)"
    },
    "Your name ${var.value}": [ null, "Vaše jméno ${var.value}"],
  },
  var: {
    value: '1'
  }
};

i18n._t('Your name ${var.value}', ctx) // -> Vaše jméno 1
```

## config

Service get `config` from serviceLocator and use `config.i18n` property.

``` js
config = { // default config
  i18n: {
    // po2json default glue symbol to concat context and str
    glue: '\u0004',
    // plural form for your application default language
    plural: 'nplurals=1; plural=0;',
    // name of property with po2json object in ctx object
    context: 'l10n'
  }
};
```

## Errors

All errors in i18n methods will be emitted to catbee eventBus:
``` js
 eventBus.emit('error', error);
```

[travis-img]: https://travis-ci.org/catbee/catbee-i18n.svg?branch=master
[travis-url]: https://travis-ci.org/catbee/catbee-i18n

[codecov-img]: https://codecov.io/github/catbee/catbee-i18n/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/catbee/catbee-i18n?branch=master
