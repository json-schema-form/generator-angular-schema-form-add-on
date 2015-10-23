var generators = require('yeoman-generator');
var chalk = require('chalk');
var path = require('path');
var fsp = require('fs-promise');
var q = require('q');
var read = require('fs-readdir-recursive');
var camelcase = require('camelcase');

module.exports = generators.Base.extend({

  init: function() {

    /* Welcome the user!!
     */
    this.log(chalk.blue.bold('.-========================-.'));
    this.log(chalk.blue.bold('||                        ||'));
    this.log(chalk.blue.bold('||  ' + chalk.yellow('Angular schema form') + '   ||'));
    this.log(chalk.blue.bold('||    ' + chalk.yellow('Add-on generator') + '    ||'));
    this.log(chalk.blue.bold('||                        ||'));
    this.log(chalk.blue.bold('\'-========================-\'\n'));

    /* Setting up our config object
     */
    this.addon = {files: {}};
  },

  prompting: function() {
    /* We tell yeoman we don't want to continue until we run our done().
     */
    var done = this.async();

    this.prompt([{
      type: 'input',
      name: 'name',
      message: 'Your add-on name',
      default: this.appname
    },
    {
      type: 'list',
      name: 'type',
      message: 'What kind of form type do you want?',
      choices: ['Input' /*, 'Radio', 'Checkbox', 'Array'*/, 'Empty' ],
      default: 'Input'
    }], function(answers) {

      /* Nice, we now have the answers. let's put it in our config.
       */
      this.addon.name = answers.name;
      this.addon.type = answers.type;

      /* Changing cases
       */
      this.addon.type = this.addon.type.toLowerCase(); // ex. Input > input
      this.addon.directive = camelcase(this.addon.name); // ex. add on > addOn
      this.addon.typeName = this.addon.name.replace(/ /g, ''); // ex. add on > addon
      this.addon.paramName = this.addon.name.replace(/ /g, '-'); // ex. add on > add-on

      /* We are done here... Let's continue
       */
      done();
    }.bind(this));

  },

  configure: function() {

    var done = this.async();

    /* Let's get a list of our base files and type specific files.
     */
    this.addon.files.base = read(this.templatePath() + '/base');
    this.addon.files[this.addon.type] = read(this.templatePath() + '/' + this.addon.type + '/src');

    done();
  },

  writing: function() {

    var done = this.async();

    var schema = this.fs.read(this.templatePath(this.addon.type + '/schema.json'));
    var form = this.fs.read(this.templatePath(this.addon.type + '/form.json'));

    /* TODO: Just a fast and easy fix for now..
     */
    form = JSON.parse(form);
    if (form[0].hasOwnProperty('type')) {
      form[0].type = this.addon.typeName;
    }

    this.addon.files.base.forEach(function(file) {
      /* What to inject in the test controller
       */
      var testModule = ['schemaForm'];
      var dest = file.replace('_', '.')
                     .replace('module.js', this.addon.paramName + '.js');

      if (this.addon.type !== 'empty') {
        testModule.push(this.addon.directive);
      }

      /* Base files */
      this.fs.copyTpl(
        this.templatePath(this.templatePath('base/') + file),
        this.destinationPath('./') + dest,
        {
          name: this.addon.name,
          directive: this.addon.directive,
          testModuleInj: JSON.stringify(testModule),
          typeName: this.addon.typeName,
          paramName: this.addon.paramName,
          schema: schema,
          form: JSON.stringify(form)
        }
      );
    }.bind(this));

    /* Type files */
    this.addon.files[this.addon.type].forEach(function(file) {
      var dest = file.replace('_', '.')
                     .replace('template.html', this.addon.paramName + '.html')
                     .replace('module.js', this.addon.paramName + '.js');

      this.fs.copyTpl(
        this.templatePath(this.templatePath(this.addon.type + '/src/') + file),
        this.destinationPath('./src/') + dest,
        {
          name: this.addon.name,
          directive: this.addon.directive,
          typeName: this.addon.typeName,
          paramName: this.addon.paramName
        }
      );
    }.bind(this));

    done();

  },

  install: function() {
    var npmDevDeps = [
      "gulp",
      "gulp-angular-templatecache",
      "gulp-concat",
      "gulp-connect",
      "gulp-livereload",
      "gulp-rename",
      "gulp-server-livereload",
      "gulp-uglify",
      "streamqueue"
    ];

    var bowerDevDeps = [
      'angular-schema-form',
      'angular-schema-form-bootstrap',
      'bootstrap'
    ];

    console.log(chalk.white('\nAlmost done! Just running ' + chalk.green.bold('npm install') + ' and ' + chalk.green.bold('bower install') + ' for you!\n'));

    this.npmInstall(npmDevDeps, { 'saveDev': true });
    this.bowerInstall(bowerDevDeps, { 'saveDev': true });

  },

  end: function() {
    console.log(chalk.green('\nEverything is done! \nJust run ' + chalk.bold.green('gulp') + ' to start a livereload server to test your addon.'));
  }

});
