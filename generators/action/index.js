'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');

module.exports = class extends Generator {
  prompting() {

    const prompts = [{
      type: 'input',
      name: 'actionName',
      message: 'Action name',
      default: 'main'
    }];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.fs.copy(
      this.templatePath('action.js'),
      this.destinationPath('actions/hello/hello.js')
    );
  }

};
