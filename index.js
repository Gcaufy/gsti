const inquirer = require('inquirer');
const git = require('./git/index');
const ui = require('./ui/index');
const actions = require('./actions');
const helper = require('./helper');


git.status().then(status => {
  let choices = helper.getChoices(status);
  let header, footer;
  ui.render({ choices, header, footer, actions });
}).catch(e => {
  console.log(e);
});

