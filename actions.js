const path = require('path');
const git = require('./git/index');
const editor = require('editor');
const cliCursor = require('cli-cursor');
const clipboardy = require('clipboardy');
const helper = require('./helper');
const template = require('./template');
const SECTIONS = require('./const').SECTIONS;

let actions = {
  backspace (choice, index) {

  },
  /*
   * Refresh status list
   */
  r: function refresh () {
    template.clearStatusCache();
    git.status().then(res => {
      let choices = helper.getChoices(res);
      this.render(choices);
    }).catch(e => {
      console.log(e.message);
    });
  },
  /*
   * Copy file name to clipboard
   */
  y: function yank (choice, index) {
    if (choice.type === 'section')
      return;
    let file = choice.value.file;
    clipboardy.writeSync(file);
  },
  /*
   * Edit the file
   */
  e: function edit (choice, index) {
    if (choice.type === 'section')
      return;
    let file = choice.value.file;

    if (file.endsWith(path.sep)) { // It's a directory
      return;
    }

    this.rl.pause();
    editor(file, (error, sig) => {
      this.rl.resume();
      actions.r.call(this);
      if (error) {

      } else {

      }
    });
  },
  /*
   * Stage the file
   */
  s: function stage (choice, index) {
    if (choice.type === 'section') {
      switch (choice.value) {
        case SECTIONS.UNTRACKED:
        case SECTIONS.UNSTAGED:
          git.add(choice.list.map(v => v.file)).then(actions.r.bind(this));
          break;
      }
    } else {
      let file = choice.value.file;
      let label = choice.value.label;

      git.add(file).then(() => {
        actions.r.call(this);
      });
    }
  },
  p: function patch (choice) {
    let files;
    // TODO: frozen window
    return;
    if (choice.type === 'section' && choice.value === SECTIONS.UNSTAGED) {
      files = choice.list.map(v => v.file);
    } else {
      let { value: {file, label}, section } = choice;
      files = file;
    }
    if (files) {

      this.rl.pause();
      cliCursor.show();
      git.add(files, '--patch').then(() => {
        debugger;
        //this.rl.resume();
        actions.r.call(this);
      });
    }

  },
  /*
   * Unstage the file or section
   */
  u: function unstage (choice, index) {
    if (choice.type === 'section') {
      // TODO: unstage the section
      git.unstage(choice.list.map(v => v.file)).then(actions.r.bind(this));
    } else {
      let { value: {file, label}, section } = choice;
      if (section === SECTIONS.UNSTAGED || section === SECTIONS.UNTRACKED) {
        return;
      } else {
        git.unstage(file).then(actions.r.bind(this));
      }
    }
  },
  /*
   * Git diff
   */
  d: function diff (choice) {
    if (choice.type === 'section') {
      return;
    }
    let { value: {file, label}, section } = choice;
    if (section === SECTIONS.UNSTAGED) {
      this.rl.pause();
      git.diff(file).then(() => {
        this.rl.resume();
      });
    } else if (section === SECTIONS.STAGED) {
      git.diff(['--cached', file]).then(() => {
        this.rl.resume();
      });
    }
  },
  /*
   * Git commit
   */
  c: function commit (choice, option) {
    let choices = this.opt.choices.realChoices;
    let hasCommit = false;
    if (option === '-a') {
      // There are files
      hasCommit = choices.some(ch => ch.type !== 'section');
    } else {
      // There has to be some files staged
      hasCommit = choices.some(ch => ch.type === 'section' && ch.value === SECTIONS.STAGED && ch.list.length > 0);
    }
    if (!hasCommit) {
      // Do nothing
      return;
    }
    this.rl.pause();
    git.commit(typeof option === 'string' ? option : undefined).then(() => {
      this.rl.resume();
      actions.r.call(this);
    }).catch(e => {
      // Maybe user canceled commit
      this.rl.resume();
      actions.r.call(this);
    });
  },
  /*
   * Git commit --all
   */
  C: function commitAll (choice) {
    actions.c.call(this, choice, '-a');
  },
  /*
   * Discard files
   */
  x: {
    type: 'confirm',
    text: 'Make sure you really want to discard all the changes? (Yes/No):',
    confirmText: 'yes',
    cancelText: 'no'
  },
  'x.confirm': function discard (choice, index) {
    if (choice.type === 'section') {
      let files = [];
      switch (choice.value) {
        case SECTIONS.UNTRACKED:
          git.clean().then(actions.r.bind(this));
          break;
        case SECTIONS.UNSTAGED:
          files = choice.list.map(v => v.file);
          git.checkout(files).then(actions.r.bind(this));
          break;
        case SECTIONS.STAGED:
          files = choice.list.map(v => v.file);
          git.reset(files).then(() => git.checkout(files)).then(actions.r.bind(this));
          break;
      }
    } else {
      let { value: {file, label}, section } = choice;
      if (section === SECTIONS.UNTRACKED) {
        git.clean(file).then(actions.r.bind(this));
      } else if (section === SECTIONS.UNSTAGED) {
        git.checkout(file).then(actions.r.bind(this));
      } else if (section === SECTIONS.STAGED) {
        git.reset(file).then(() => {
          return git.checkout(file)
        }).then(actions.r.bind(this));
      }
    }
  },
  'x.cancel': function discard (choice, index) {
    // Do nothing
  }
};

module.exports = actions;
