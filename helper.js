const SECTIONS = require('./const').SECTIONS;
const inquirer = require('inquirer');
const git = require('./git/index');

module.exports = {

  getSectionChoice (sec, list) {
    let choice = {
      name: '  ' + sec + ': ',
      value: sec,
      type: 'section',
      color: 'magenta',
      list: list
    };
    return choice;
  },

  getChoices (gitfiles) {
    let choices = [];

    if (gitfiles.staged.length) {
      // added STAGED
      choices.push(this.getSectionChoice(SECTIONS.STAGED, gitfiles.staged));

      gitfiles.staged.forEach(file => {
        choices.push({
          name: '    ' + file.label + '  ' + file.file,
          value: file,
          section: SECTIONS.STAGED,
          color: 'green'
        });
      });
    }

    if (gitfiles.unstaged.length) {
      // added UNSTAGED
      choices.push(new inquirer.Separator(' '));
      choices.push(this.getSectionChoice(SECTIONS.UNSTAGED, gitfiles.unstaged));


      gitfiles.unstaged.forEach(file => {
        choices.push({
          name: '    ' + file.label + '  ' + file.file,
          value: file,
          section: SECTIONS.UNSTAGED,
          color: 'red'
        });
      });
    }

    if (gitfiles.untracked.length) {
      // added UNTRACKED

      choices.push(new inquirer.Separator(' '));
      choices.push(this.getSectionChoice(SECTIONS.UNTRACKED, gitfiles.untracked));

      gitfiles.untracked.forEach(file => {
        choices.push({
          name: '    ' + file.file,
          section: SECTIONS.UNTRACKED,
          value: file
        });
      });

    }

    if (gitfiles.staged.length + gitfiles.unstaged.length + gitfiles.untracked.length === 0) {
      // TODO: clear work tree
    }

    return choices;
  }
}
