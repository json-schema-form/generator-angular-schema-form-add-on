import 'babel-polyfill';
import { Base } from 'yeoman-generator';
import yosay from 'yosay';
import camelcase from 'camelcase';
import chalk from 'chalk';
import read from 'fs-readdir-recursive';

class asfAddOnGenerator extends Base {

  constructor(...args) {
    super(...args);

    /* Setting up our config object
     */
    this.addon = {};
  }

  prompting() {
    /* Welcome the user!!
    */
    this.log(yosay(`Hello and welcome to the Angular Schema Form Add-on Generator!`));

    /* We tell yeoman we don't want to continue until we run our done().
     */
    const done = this.async();

    this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Your add-on name',
        default: this.appname,
      },
      {
        type: 'list',
        name: 'type',
        message: 'What kind of form type do you want?',
        choices: ['input', 'empty'], /*, 'Radio', 'Checkbox', 'Array'*/
        default: 'input',
      },
      {
        type: 'confirm',
        name: 'useDirective',
        message: 'Do you want a directive added to your addon?',
        default: true,
      },
      {
        type: 'input',
        name: 'username',
        message: 'What\'s your Github username?',
        store: true,
      },
    ], (answers) => {

      /* Nice, we now have all the answers.
       */
      Object.assign(this.addon, answers);

      /* Changing cases
       */
      this.addon.module = camelcase(this.addon.name); // ex. add on > addOn
      this.addon.formType = this.addon.name.replace(/ /g, ''); // ex. add on > addon
      this.addon.paramName = this.addon.name.replace(/ /g, '-'); // ex. add on > add-on

      /* We are done here... Let's continue
       */
      done();
    });
  }

  configure() {

    /* Let's get a list of our base files and type specific files.
     */
    this.addon.files = {};

    /* I do not like this, it looks ugly too me. but hell, it works for now.
     */
    this.addon.files.base = read(`${this.templatePath()}/base`);
    this.addon.files[this.addon.type] = read(`${this.templatePath()}/${this.addon.type}/src`);

    if (!this.addon.useDirective) {
      this.addon.files[this.addon.type] = this.addon.files[this.addon.type].filter(dir => !dir.includes('directives'))
    }

  }

  writing() {
    const done = this.async();
    const schema = this.fs.read(this.templatePath(`${this.addon.type}/schema.json`));
    let form = this.fs.read(this.templatePath(`${this.addon.type}/form.json`));

    /* TODO: Just a fast and easy fix for now..
     */
    form = JSON.parse(form);
    if (form[0].hasOwnProperty('type')) {
      form[0].type = this.addon.formType;
    }

    const sources = [];
    const testModule = ['schemaForm'];

    if (this.addon.type !== 'empty') {
      testModule.push(this.addon.module);
      sources.push('src/module.js', 'src/**/*.js');
    }

    this.addon.files.base.forEach((file) => {
      /* What to inject in the test controller
       */
      const dest = file.replace('_', '.');

      /* Base files */
      this.fs.copyTpl(
        this.templatePath(this.templatePath('base/') + file),
        this.destinationPath('./') + dest,
        {
          name: this.addon.name,
          module: this.addon.module,
          testModuleInj: JSON.stringify(testModule),
          formType: this.addon.formType,
          paramName: this.addon.paramName,
          schema: schema,
          form: JSON.stringify(form),
          username: this.addon.username,
          sources: JSON.stringify(sources),
        }
      );
    });

    /* Type files */
    this.addon.files[this.addon.type].forEach((file) => {
      const dest = file.replace('_', '.')
                       .replace('template.html', `${this.addon.paramName}.html`)
                       .replace('template.js', `${this.addon.paramName}.js`);

      this.fs.copyTpl(
        this.templatePath(this.templatePath(`${this.addon.type}/src/`) + file),
        this.destinationPath('./src/') + dest,
        {
          name: this.addon.name,
          module: this.addon.module,
          formType: this.addon.formType,
          paramName: this.addon.paramName,
          directive: this.addon.useDirective,
        }
      );
    });

    done();
  }

  install() {
    const npmDevDeps = [
      'gulp',
      'gulp-angular-templatecache',
      'gulp-concat',
      'gulp-connect',
      'gulp-livereload',
      'gulp-rename',
      'gulp-server-livereload',
      'gulp-uglify',
      'streamqueue',
    ];

    const bowerDevDeps = [
      'angular-schema-form',
      'angular-schema-form-bootstrap',
      'bootstrap',
    ];

    this.log(chalk.white(`\nAlmost done! Just running ${chalk.green.bold('npm install')} and ${chalk.green.bold('bower install')} for you!\n`));

    this.npmInstall(npmDevDeps, { saveDev: true });
    this.bowerInstall(bowerDevDeps, { saveDev: true });
  }

  end() {
    this.log(chalk.green(`\nEverything is done! \nJust run ${chalk.bold.green('gulp')} to start a livereload server to test your addon.`));
  }

}

module.exports = asfAddOnGenerator;
