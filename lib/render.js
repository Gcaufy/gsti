const git = require('./git');
const ui = require('./ui/index');
const actions = require('./actions');
const helper = require('./helper');
const chalk = require('chalk');


module.exports = function () {
  git.status().then(status => {
    let choices = helper.getChoices(status);
    let footer, header;
    ui.render({
      choices,
      header,
      footer,
      actions
    });
  }).catch(e => {
    if (e.stderr) {
      console.log(chalk.red(e.stderr));
    } else {
      console.log(e);
    }
  });
};
