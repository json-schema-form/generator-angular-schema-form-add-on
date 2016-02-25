'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

var _yeomanGenerator = require('yeoman-generator');

var _yosay = require('yosay');

var _yosay2 = _interopRequireDefault(_yosay);

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fsReaddirRecursive = require('fs-readdir-recursive');

var _fsReaddirRecursive2 = _interopRequireDefault(_fsReaddirRecursive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var asfAddOnGenerator = function (_Base) {
  _inherits(asfAddOnGenerator, _Base);

  function asfAddOnGenerator() {
    var _Object$getPrototypeO;

    _classCallCheck(this, asfAddOnGenerator);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    /* Setting up our config object
     */

    var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(asfAddOnGenerator)).call.apply(_Object$getPrototypeO, [this].concat(args)));

    _this.addon = {};
    return _this;
  }

  _createClass(asfAddOnGenerator, [{
    key: 'prompting',
    value: function prompting() {
      var _this2 = this;

      /* Welcome the user!!
      */
      this.log((0, _yosay2.default)('Hello and welcome to the Angular Schema Form Add-on Generator!'));

      /* We tell yeoman we don't want to continue until we run our done().
       */
      var done = this.async();

      this.prompt([{
        type: 'input',
        name: 'name',
        message: 'Your add-on name',
        default: this.appname
      }, {
        type: 'list',
        name: 'type',
        message: 'What kind of form type do you want?',
        choices: ['input', 'empty'], /*, 'Radio', 'Checkbox', 'Array'*/
        default: 'input'
      }, {
        type: 'confirm',
        name: 'useDirective',
        message: 'Do you want a directive added to your addon?',
        default: true
      }, {
        type: 'input',
        name: 'username',
        message: 'What\'s your Github username?',
        store: true
      }], function (answers) {

        /* Nice, we now have all the answers.
         */
        Object.assign(_this2.addon, answers);

        /* Changing cases
         */
        _this2.addon.module = (0, _camelcase2.default)(_this2.addon.name); // ex. add on > addOn
        _this2.addon.formType = _this2.addon.name.replace(/ /g, ''); // ex. add on > addon
        _this2.addon.paramName = _this2.addon.name.replace(/ /g, '-'); // ex. add on > add-on

        /* We are done here... Let's continue
         */
        done();
      });
    }
  }, {
    key: 'configure',
    value: function configure() {

      /* Let's get a list of our base files and type specific files.
       */
      this.addon.files = {};

      /* I do not like this, it looks ugly too me. but hell, it works for now.
       */
      this.addon.files.base = (0, _fsReaddirRecursive2.default)(this.templatePath() + '/base');
      this.addon.files[this.addon.type] = (0, _fsReaddirRecursive2.default)(this.templatePath() + '/' + this.addon.type + '/src');
    }
  }, {
    key: 'writing',
    value: function writing() {
      var _this3 = this;

      var done = this.async();
      var schema = this.fs.read(this.templatePath(this.addon.type + '/schema.json'));
      var form = this.fs.read(this.templatePath(this.addon.type + '/form.json'));

      /* TODO: Just a fast and easy fix for now..
       */
      form = JSON.parse(form);
      if (form[0].hasOwnProperty('type')) {
        form[0].type = this.addon.formType;
      }

      this.addon.files.base.forEach(function (file) {
        /* What to inject in the test controller
         */
        var testModule = ['schemaForm'];
        var sources = [];
        var dest = file.replace('_', '.');

        if (_this3.addon.type !== 'empty') {
          testModule.push(_this3.addon.module);

          /* This needs to reflect files inside the chosen types folder.
           */
          sources.push('src/module.js');
        }

        /* Base files */
        _this3.fs.copyTpl(_this3.templatePath(_this3.templatePath('base/') + file), _this3.destinationPath('./') + dest, {
          name: _this3.addon.name,
          module: _this3.addon.module,
          testModuleInj: JSON.stringify(testModule),
          formType: _this3.addon.formType,
          paramName: _this3.addon.paramName,
          schema: schema,
          form: JSON.stringify(form),
          username: _this3.addon.username,
          sources: JSON.stringify(sources)
        });
      });

      /* Type files */
      this.addon.files[this.addon.type].forEach(function (file) {
        var dest = file.replace('_', '.').replace('template.html', _this3.addon.paramName + '.html');

        _this3.fs.copyTpl(_this3.templatePath(_this3.templatePath(_this3.addon.type + '/src/') + file), _this3.destinationPath('./src/') + dest, {
          name: _this3.addon.name,
          module: _this3.addon.module,
          formType: _this3.addon.formType,
          paramName: _this3.addon.paramName,
          directive: _this3.addon.useDirective
        });
      });

      done();
    }
  }, {
    key: 'install',
    value: function install() {
      var npmDevDeps = ['gulp', 'gulp-angular-templatecache', 'gulp-concat', 'gulp-connect', 'gulp-livereload', 'gulp-rename', 'gulp-server-livereload', 'gulp-uglify', 'streamqueue'];

      var bowerDevDeps = ['angular-schema-form', 'angular-schema-form-bootstrap', 'bootstrap'];

      this.log(_chalk2.default.white('\nAlmost done! Just running ' + _chalk2.default.green.bold('npm install') + ' and ' + _chalk2.default.green.bold('bower install') + ' for you!\n'));

      this.npmInstall(npmDevDeps, { saveDev: true });
      this.bowerInstall(bowerDevDeps, { saveDev: true });
    }
  }, {
    key: 'end',
    value: function end() {
      this.log(_chalk2.default.green('\nEverything is done! \nJust run ' + _chalk2.default.bold.green('gulp') + ' to start a livereload server to test your addon.'));
    }
  }]);

  return asfAddOnGenerator;
}(_yeomanGenerator.Base);

module.exports = asfAddOnGenerator;

//# sourceMappingURL=index.js.map