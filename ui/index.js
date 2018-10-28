const inquirer = require('inquirer');
const chalk = require('chalk');
const template = require('../template');

inquirer.registerPrompt('actionList', require('./actionList'));

module.exports = {
  render ({ choices, header, footer, actions }) {
    inquirer.prompt([{
      type: 'actionList',
      name: 'test',
      message: '',
      hideMessage: true,
      choices: choices,
      footer: footer,
      header: header,
      actions: actions,
      pageSize: 20,
      beforeRender (output) {

        let help = '';
        let choices = this.opt.choices;
        if (choices.length === 0) {
           help = template.clean();
        } else {
          let choice = this.opt.choices.getChoice(this.selected);
          help = template.section(choice);
        }

        return template.status().then(status => {
          return status + output + help;
        });
      }
    }]).then(answers => {
    })
  }
}


