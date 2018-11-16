const SECTIONS = require('./const').SECTIONS;
const inquirer = require('inquirer');
const verCompare = require('compare-versions');
const npm = require('./npm');

module.exports = {

  versionCheck () {
    npm.version('gsti').then(version => {
      let hasUpdate = helper.hasUpdate(version);
      if (hasUpdate) {
        inquirer.prompt([
          {
            type: 'confirm',
            name: 'update',
            message: `version ${version} found, do you wish to update?`
          }
        ]).then(answser => {
          if (answser.update) {
            npm.exec(['install', 'gsti@' + version, '-g']).then(({ stdout }) => {
              console.log(stdout);
            }).catch(e => {
              console.log(e);
            });
          }
        });
      }
    }).catch(e => {
      // Ignore checking version
    });
  },

  hasUpdate (remoteVersion) {
    let pkg = require('../package.json');
    return verCompare(pkg.version, remoteVersion) === -1;
  },

  getSectionChoice (sec, list) {
    let choice = {
      name: `  ${sec}: `,
      value: sec,
      type: 'section',
      color: 'magenta',
      list
    };
    return choice;
  },

  getChoices (gitfiles) {
    let choices = [];

    if (gitfiles.stashes.length) {
      // added STASH
      choices.push(this.getSectionChoice(SECTIONS.STASH, gitfiles.stashes));

      gitfiles.stashes.forEach(file => {
        choices.push({
          name: `    ${file.id}: ${file.item}`,
          value: file.id,
          section: SECTIONS.STASH,
          color: 'gray'
        });
      });
    }

    if (gitfiles.staged.length) {
      // added STAGED
      choices.push(this.getSectionChoice(SECTIONS.STAGED, gitfiles.staged));

      gitfiles.staged.forEach(file => {
        let name = `    ${file.label}  ${file.file}`;
        if (file.rename) {
          name = `    ${file.label}  ${file.old} -> ${file.new}`;
        }
        choices.push({
          name: name,
          value: file,
          section: SECTIONS.STAGED,
          color: 'green'
        });
      });
    }

    if (gitfiles.unmerged.length) {
      // added unmerged
      choices.push(new inquirer.Separator(' '));
      choices.push(this.getSectionChoice(SECTIONS.UNMERGED, gitfiles.unmerged));

      gitfiles.unmerged.forEach(file => {
        let name = `    ${file.label}  ${file.file}`;
        if (file.rename) {
          name = `    ${file.label}  ${file.old} -> ${file.new}`;
        }
        choices.push({
          name: name,
          value: file,
          section: SECTIONS.UNMERGED,
          color: 'red'
        });
      });
    }

    if (gitfiles.unstaged.length) {
      // added UNSTAGED
      choices.push(new inquirer.Separator(' '));
      choices.push(this.getSectionChoice(SECTIONS.UNSTAGED, gitfiles.unstaged));

      gitfiles.unstaged.forEach(file => {
        let name = `    ${file.label}  ${file.file}`;
        if (file.rename) {
          name = `    ${file.label}  ${file.old} -> ${file.new}`;
        }
        choices.push({
          name: name,
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
          name: `    ${file.file}`,
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
