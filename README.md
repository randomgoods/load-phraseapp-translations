[![tests](https://github.com/randomgoods/load-phraseapp-translations/actions/workflows/tests.yml/badge.svg)](https://github.com/randomgoods/load-phraseapp-translations/actions/workflows/tests.yml)

# load-phraseapp-translations

> Originally forked from [Skookum/load-phraseapp-translations](https://github.com/Skookum/load-phraseapp-translations)

npm module for pulling down translation files from [PhraseApp](http://phraseapp.com/) for a project using the [v2 API](http://docs.phraseapp.com/api/v2/). For use in build scripts.

## Installation

```sh
npm install @randomgoods/load-phraseapp-translations --save
```

## Usage

```js
const loadTranslations = require('@randomgoods/load-phraseapp-translations');

loadTranslations.initialize({
  access_token: 1,
  project_id: 1,
  location: __dirname + '/locales'
});
```

```sh
# Translation for de downloaded successfully.
# Translation for en downloaded successfully.
```

### Arguments

#### Options (required)

 * *access_token*: Required. Your PhraseApp access token.
 * *project_id*: Required. The ID of the project you want to pull down translations for.
 * *location*: Optional, defaults to current directory. If supplied, must be an existing path.
 * *file_format*: Optional, defaults to `node_json`, the format for [i18n-node-2](https://github.com/jeresig/i18n-node-2).
 * *file_extension*: Optional, defaults to `js`.
 * *file_name_key*: Optional, defaults to `code`, but can be configured to use `name` instead.
 * *transform*: Optional function that should be called with each locale's data if additional processing is required before it is saved. Takes a string containing the data from Phrase and should return a string containing the new data. Defaults to a no-op.

#### Callback

Initialize also accepts an optional callback that returns an error and a success response.

```js
const loadTranslations = require('@randomgoods/load-phraseapp-translations');

loadTranslations.initialize({
  access_token: 1,
  project_id: 1,
  location: __dirname + '/locales'
}, function(err, res) {
    if (!err) {
    // Do something
    }
    // Do something else
});
```

## Tests

```sh
npm test
```

## Contributing

See [CONTRIBUTING](https://github.com/randomgoods/load-phraseapp-translations/blob/main/CONTRIBUTING.md)

## Credits

See [CREDITS](https://github.com/randomgoods/load-phraseapp-translations/blob/main/CREDITS)

## License

[MIT](https://github.com/randomgoods/load-phraseapp-translations/blob/main/LICENSE) (c) 2015 Skookum Digital Works, 2022 randomgoods and contributors
