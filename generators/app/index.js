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
'use strict'

const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const fs = require('fs')
const expandHomeDir = require('expand-home-dir')
const {exec} = require('child_process')

module.exports = class extends Generator {

  initializing() {
    this.appname = this.appname.replace(' ', '-')
  }

  prompting() {
    const prompts = [{
      type: 'input',
      name: 'name',
      message: 'Your project name',
      default: this.appname
    }
      // , {
      //   type: 'input',
      //   name: 'github_username',
      //   message: 'Your GitHub user name'
      // }, {
      //   type: 'input',
      //   name: 'github_repo',
      //   message: 'Your GitHub repository (owner/repo)'
      // }
    ]

    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

  writing() {

    try {
      fs.mkdirSync('actions')
      fs.mkdirSync('bin')
    } catch (e) {
    }

    this.fs.copy(
      this.templatePath('master-deploy.sh'),
      this.destinationPath('deploy.sh')
    )
    this.fs.copy(
      this.templatePath('env-deploy.sh'),
      this.destinationPath('bin/deploy.sh')
    )
    this.fs.copy(
      this.templatePath('empty.sh'),
      this.destinationPath('bin/openwhisk.sh')
    )
    this.fs.copy(
      this.templatePath('empty'),
      this.destinationPath('bin/vars.global')
    )
    this.fs.copy(
      this.templatePath('bx-auth.sh'),
      this.destinationPath('bin/bx-auth.sh')
    )
    this.fs.copyTpl(
      this.templatePath('bluemix-vars.sh'),
      this.destinationPath('bin/vars.dev'),
      {bxspace: `${this.appname}-dev`}
    )

  }

  install() {
    fs.chmodSync('deploy.sh', 0o744)
    fs.chmodSync('bin/deploy.sh', 0o744)
    fs.chmodSync('bin/openwhisk.sh', 0o744)
    fs.chmodSync('bin/bx-auth.sh', 0o744)
  }

}
