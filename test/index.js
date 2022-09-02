const should = require("chai").should(),
    fs = require("fs"),
    nock = require("nock"),
    request = require("request"),
    _ = require('lodash'),
    loadTranslations = require("../index"),
    initialize = loadTranslations.initialize,
    download = loadTranslations.download,
    fetchLocales = loadTranslations.fetchLocales,
    downloadTranslationFile = loadTranslations.downloadTranslationFile,
    configure = loadTranslations.configure;

// const http = require("http");

describe("#configure", function() {
  let config;

  before(function() {
    const options = {
        access_token: 1,
        project_id: 1,
        location: 'test'
    };

    config = configure(options);
  });

  it("is an object", function() {
    config.should.be.an("object");
  });

  it("has the required keys", function() {
    config.should.have.all.keys(
      "access_token",
      "project_id",
      "file_format",
      "file_extension",
      "file_name_key",
      "location",
      "transform"
    );
  });

  it("overrides file location", function() {
    config.should.have.property('location', 'test');
  })

  it("default transform does nothing", function() {
    const output = {
      "test": "file"
    };
    config.transform(output).should.equal(output);
  })
});

describe("#fetchLocales", function() {
  let config, api;

  before(function() {
    const options = {
      access_token: 1,
      project_id: 1
    };

    config = configure(options);
  });

  beforeEach(function() {
    api = nock("https://api.phraseapp.com")
      .get("/v2/projects/1/locales")
      .query({ access_token: 1 })
      .reply(200, [
        {
            "id": "1",
            "name": "de",
            "code": "de",
            "default": false,
            "main": false,
            "rtl": false,
            "plural_forms": [
                "zero",
                "one",
                "other"
            ],
            "created_at": "2015-07-13T15:56:07Z",
            "updated_at": "2015-07-13T15:56:07Z",
            "source_locale": null
        },
        {
            "id": "2",
            "name": "en",
            "code": "en",
            "default": true,
            "main": false,
            "rtl": false,
            "plural_forms": [
                "zero",
                "one",
                "other"
            ],
            "created_at": "2015-07-13T15:55:44Z",
            "updated_at": "2015-07-13T15:55:45Z",
            "source_locale": null
        }
      ]);
  });

  afterEach(function() {
    api.isDone();
  });

  it("has two locales", function(done) {
    fetchLocales(config, function(err, res) {
      if (err) return done(err);
      res.should.have.length(2);
      done();
    });
  });

  it("is an array", function(done) {
    fetchLocales(config, function(err, res) {
      if (err) return done(err);
      res.should.be.an("array");
      done();
    });
  });

  it("contains German and English", function(done) {
    fetchLocales(config, function(err, res) {
      if (err) return done(err);
      res.should.have.deep.members([
        {
            "id": "1",
            "name": "de",
            "code": "de",
            "default": false,
            "main": false,
            "rtl": false,
            "plural_forms": [
                "zero",
                "one",
                "other"
            ],
            "created_at": "2015-07-13T15:56:07Z",
            "updated_at": "2015-07-13T15:56:07Z",
            "source_locale": null
        },
        {
            "id": "2",
            "name": "en",
            "code": "en",
            "default": true,
            "main": false,
            "rtl": false,
            "plural_forms": [
                "zero",
                "one",
                "other"
            ],
            "created_at": "2015-07-13T15:55:44Z",
            "updated_at": "2015-07-13T15:55:45Z",
            "source_locale": null
        }
      ]);
      done();
    });
  });
});

describe("#downloadTranslationFiles", function() {
  let config, api;

  before(function() {
    const options = {
      access_token: 1,
      project_id: 1
    };

    config = configure(options);
  });

  beforeEach(function() {
    api = nock("https://api.phraseapp.com")
      .persist()
      .get("/v2/projects/1/locales/en/download")
      .query({ access_token: 1, file_format: "node_json" })
      .reply(200, {
        "greeting": "Hi, %s",
        "navigation.search": "Search",
        "navigation.shopping_cart": "Shopping Cart",
        "navigation.sign_in": "Sign In",
        "navigation.wishlist": "Wishlist"
      });
  });

  it("downloads the translation file", function(done) {
    downloadTranslationFile({ code: 'en' }, config, function(err, res) {
      if (err) return done(err);
      fs.stat(res, function(err, _) {
        if (err) done(err)

        done();
      });
    });
  });

  it("has the correct contents in the translation file", function(done) {
    let fileContents, apiFileContents, fileName;

    request("https://api.phraseapp.com/v2/projects/1/locales/en/download?access_token=1&file_format=node_json",
      function(err, res, body) {
        if (res.statusCode === 200 && !err) {
          apiFileContents = body;
        }
      });

    downloadTranslationFile({ code: 'en' }, config, function(err, res) {
      if (err) return done(err);
      fileName = res;
      fileContents = fs.readFileSync(fileName).toString();
      fileContents.should.equal(apiFileContents);
      done();
    });
  });

  afterEach(function() {
    fs.unlinkSync(config.location + "/en.js");
    api.isDone();
  });
});

describe("#download", function() {
  let config, api;

  before(function() {
    const options = {
      access_token: 1,
      project_id: 1
    };

    config = configure(options);
  });

  beforeEach(function() {
    api = nock("https://api.phraseapp.com")
      .persist()
      .get("/v2/projects/1/locales/en/download")
      .query({ access_token: 1, file_format: "node_json" })
      .reply(200, {
        "greeting": "Hi, %s",
        "navigation.search": "Search",
        "navigation.shopping_cart": "Shopping Cart",
        "navigation.sign_in": "Sign In",
        "navigation.wishlist": "Wishlist"
      })
      .get("/v2/projects/1/locales/de/download")
      .query({ access_token: 1, file_format: "node_json" })
      .reply(200, {
        "greeting": "Hallo, %s",
        "navigation.search": "Suchen",
        "navigation.shopping_cart": "Einkaufswagen",
        "navigation.sign_in": "Anmeldung",
        "navigation.wishlist": "Wunschzettel"
      })
      .get("/v2/projects/1/locales")
      .query({ access_token: 1 })
      .reply(200, [
        {
            "id": "1",
            "name": "de-foobar",
            "code": "de",
            "default": false,
            "main": false,
            "rtl": false,
            "plural_forms": [
                "zero",
                "one",
                "other"
            ],
            "created_at": "2015-07-13T15:56:07Z",
            "updated_at": "2015-07-13T15:56:07Z",
            "source_locale": null
        },
        {
            "id": "2",
            "name": "en-foobar",
            "code": "en",
            "default": true,
            "main": false,
            "rtl": false,
            "plural_forms": [
                "zero",
                "one",
                "other"
            ],
            "created_at": "2015-07-13T15:55:44Z",
            "updated_at": "2015-07-13T15:55:45Z",
            "source_locale": null
        }
      ]);
  });

  after(function() {
    fs.unlinkSync(config.location + "/en.js");
    fs.unlinkSync(config.location + "/de.js");
    fs.unlinkSync(config.location + "/en-foobar.js");
    fs.unlinkSync(config.location + "/de-foobar.js");
  });

  afterEach(function() {
    api.isDone();
  });

  it("downloads all of the files", function(done) {
    download(config, function(err, res) {
      if (err) return done(err);

      fs.existsSync(config.location + "/en-foobar.js");
      fs.existsSync(config.location + "/de-foobar.js");
    });

    done();
  });

  it("downloads all of the files and saves with name, instead of code", function(done) {
    download(
      {
        ...config,
        file_name_key: 'name',
      },
      function(err, res) {
        if (err) return done(err);

        fs.existsSync(config.location + "/en-foobar.js");
        fs.existsSync(config.location + "/de-foobar.js");
      }
    );

    done();
  });

  it("has the correct contents in the downloaded files", function(done) {
    const apiFileContents = {};
    const fileContents = {};

    request("https://api.phraseapp.com/v2/projects/1/locales/en/download?access_token=1&file_format=node_json",
      function(err, res, body) {
        if (res.statusCode === 200 && !err) {
          apiFileContents['en'] = body;
        }
      });

    request("https://api.phraseapp.com/v2/projects/1/locales/de/download?access_token=1&file_format=node_json",
      function(err, res, body) {
        if (res.statusCode === 200 && !err) {
          apiFileContents['de'] = body;
        }
      });

      download(config, function(err, res) {
        if (err) return done(err);

        fileContents['en'] = fs.readFileSync(config.location + "/en.js").toString();
        fileContents['de'] = fs.readFileSync(config.location + "/de.js").toString();

        // console.log('fileContents:', fileContents);

        fileContents.should.deep.equal(apiFileContents);
      });

      done();
  });

  it("transforms the data correctly", function(done) {
    const apiFileContents = {};
    const fileContents = {};
    const new_config = {
      ...config,
      transform: function(data) {
        data.test_key = 'hello';
        return data;
      }
    }

    download(new_config, function(err, res) {
      if (err) return done(err);

      fileContents['en'] = fs.readFileSync(config.location + "/en.js").toString();
      JSON.parse(fileContents['en']).should.contain.key('test_key');
      done();
    });
  });
});

describe("#initialize", function() {
  let api, options;

  before(function() {
    options = {
      access_token: 1,
      project_id: 1,
      location: process.cwd()
    };
  });

  beforeEach(function() {
    api = nock("https://api.phraseapp.com")
      .persist()
      .get("/v2/projects/1/locales/en/download")
      .query({ access_token: 1, file_format: "node_json" })
      .reply(200, {
        "greeting": "Hi, %s",
        "navigation.search": "Search",
        "navigation.shopping_cart": "Shopping Cart",
        "navigation.sign_in": "Sign In",
        "navigation.wishlist": "Wishlist"
      })
      .get("/v2/projects/1/locales/de/download")
      .query({ access_token: 1, file_format: "node_json" })
      .reply(200, {
        "greeting": "Hallo, %s",
        "navigation.search": "Suchen",
        "navigation.shopping_cart": "Einkaufswagen",
        "navigation.sign_in": "Anmeldung",
        "navigation.wishlist": "Wunschzettel"
      })
      .get("/v2/projects/1/locales")
      .query({ access_token: 1 })
      .reply(200, [
        {
            "id": "1",
            "name": "de",
            "code": "de",
            "default": false,
            "main": false,
            "rtl": false,
            "plural_forms": [
                "zero",
                "one",
                "other"
            ],
            "created_at": "2015-07-13T15:56:07Z",
            "updated_at": "2015-07-13T15:56:07Z",
            "source_locale": null
        },
        {
            "id": "2",
            "name": "en",
            "code": "en",
            "default": true,
            "main": false,
            "rtl": false,
            "plural_forms": [
                "zero",
                "one",
                "other"
            ],
            "created_at": "2015-07-13T15:55:44Z",
            "updated_at": "2015-07-13T15:55:45Z",
            "source_locale": null
        }
      ]);
  });

  after(function() {
    fs.unlinkSync(options.location + "/en.js");
    fs.unlinkSync(options.location + "/de.js");
  });

  afterEach(function() {
    api.isDone();
  });

  it("downloads all of the files", function(done) {
    initialize(options, function(err, res) {
      if (err) return done(err);

      fs.existsSync(options.location + "/en.js");
      fs.existsSync(options.location + "/de.js");

      done();
    });
  });

  it("has the correct contents in the downloaded files", function(done) {
    const apiFileContents = {};
    const fileContents = {};

    request("https://api.phraseapp.com/v2/projects/1/locales/en/download?access_token=1&file_format=node_json",
      function(err, res, body) {
        if (res.statusCode === 200 && !err) {
          apiFileContents['en'] = body;
        }
      });

    request("https://api.phraseapp.com/v2/projects/1/locales/de/download?access_token=1&file_format=node_json",
      function(err, res, body) {
        if (res.statusCode === 200 && !err) {
          apiFileContents['de'] = body;
        }
      });

      initialize(options, function(err, res) {
        if (err) return done(err);

        fileContents['en'] = fs.readFileSync(options.location + "/en.js").toString();
        fileContents['de'] = fs.readFileSync(options.location + "/de.js").toString();

        fileContents.should.deep.equal(apiFileContents);
        done();
      });
  });
});
