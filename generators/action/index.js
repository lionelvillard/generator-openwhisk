/*
 * Copyright 2017 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const path = require('path');

module.exports = class extends Generator {

  initializing() {
    this.packageName = ''
    // Try inferring defaults

    const parts = process.cwd().split(path.sep);

    const last = parts.length - 1;

    if (parts[last - 1] === 'actions') { // inside actions/actionname?
      this.actionPathTpl = '.'
      this.actionName = parts[last]
      if (parts[last - 3] === 'packages') { // inside packages/{name}/actions/actionname?
        this.packageName = parts[last - 2]
      } else {
        this.packageName = 'default'
      }
    } else if (parts[last] === 'actions') {    // inside actions?
      this.actionPathTpl = '{actionname}'
      if (parts[last - 2] === 'packages') {  // inside packages/{name}/actions ?
        this.packageName = parts[last - 1]
      }
    } else if (parts[last - 1] === 'packages') {  // inside packages/{name}
      this.actionPathTpl = 'actions/{actionname}'
    } else {
      this.actionPathTpl = '{pkgbase}actions/{actionname}'
    }
  }

  prompting() {

    function escape(str) {
      return str ? str.replace(/[\s@_]/, '.') : str;
    }


    const prompts = []

    if (this.packageName !== 'default')
      prompts.push({

        type: 'input',
        name: 'packageName',
        message: 'PackageName',
        default: this.packageName
      })
    prompts.push(
      {
        type: 'input',
        name: 'actionName',
        message: 'Action name',
        default: this.actionName
      },
      {
        type: 'list',
        name: 'kind',
        message: 'Action kind',
        choices: [
          'nodejs',
          'docker'
        ]
      },
      {
        type: 'list',
        name: 'nodeversion',
        message: 'Node version',
        choices: [
          'default',
          'latest',
          'other'
        ],
        when: (props) => new Promise(resolve => resolve(props.kind === 'nodejs'))
      },
      {
        type: 'input',
        name: 'othernodeversion',
        message: 'Other node version',
        default: '8.4.x',
        when: (props) => new Promise(resolve => resolve(props.nodeversion === 'other'))
      },
      {
        type: 'input',
        name: 'dockerimage',
        message: 'Docker image name',
        default: (props) => new Promise(resolve => resolve(`${escape(props.packageName || this.packageName)}/${escape(props.actionName)}`)),
        when: (props) => new Promise(resolve => resolve(props.nodeversion !== '6.x.x'))
      },
      {
        type: 'input',
        name: 'dockerusername',
        message: 'Docker username',
        when: (props) => new Promise(resolve => resolve(props.nodeversion !== '6.x.x'))
      });

    return this.prompt(prompts).then(props => {
      this.props = props;
      this.actionPath = this.actionPathTpl.replace('{actionname}', props.actionName);
      if (props.packageName !== 'default') {
        this.actionPath = this.actionPath.replace('{pkgbase}', `${props.packageName}/`);
      }
    });
  }

  writing() {
    if (this.props.kind === 'nodejs') {
      if (this.props.nodeversion === '6.x.x') {
        this.fs.copy(this.templatePath('action.js'), this.destinationPath(this.actionPath, 'index.js'))
      } else {
        const nodeversion = this.props.nodeversion === 'latest' ? 'latest' : this.props.othernodeversion;
        this.fs.copyTpl(
          this.templatePath('Dockerfile'),
          this.destinationPath(this.actionPath, 'Dockerfile'),
          { NODE_VERSION: nodeversion }
        )
        this.fs.copyTpl(
          this.templatePath('docker-build.sh'),
          this.destinationPath(this.actionPath, 'build.sh'),
          {
            image: this.props.dockerimage,
            username: this.props.dockerusername
          }
        )
      }
    }

  }

};
