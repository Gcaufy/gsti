const path = require('path');
const git = require('./git/index');
const editor = require('editor');
const cliCursor = require('cli-cursor');
const clipboardy = require('clipboardy');
const helper = require('./helper');
const template = require('./template');
const SECTIONS = require('./const').SECTIONS;

let actions = {
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
  y: function yank (choice) {
    if (choice.type === 'section')
      return;
    let file = choice.value.file;
    clipboardy.writeSync(file);
  },
  /*
   * Apply the stash
   */
  a: function apply (choice) {
    if (choice.type === 'section')
      return;
    let selected = choice.value;
    git.stash.apply(selected).then(actions.r.bind(this));
  },
  /*
   * pop stash
   */
  A: function pop (choice) {
    if (choice.type === 'section')
      return;
    let selected = choice.value;
    git.stash.pop(selected).then(actions.r.bind(this));
  },
  /*
   * Save a stash
   */
  z: function stashSave () {
    git.stash.save().then(actions.r.bind(this));
  },
  /*
   * Save all files into stash
   */
  Z: function stashSave () {
    git.stash.save('-u').then(actions.r.bind(this));
  },
  /*
   * Edit the file
   */
  e: function edit (choice) {
    if (choice.type === 'section')
      return;
    let file = choice.value.file;

    if (file.endsWith(path.sep)) { // It's a directory
      return;
    }

    this.rl.pause();
    editor(file, () => {
      this.rl.resume();
      actions.r.call(this);
    });
  },
  /*
   * Stage the file
   */
  s: function stage (choice) {
    if (choice.type === 'section') {
      switch (choice.value) {
        case SECTIONS.UNTRACKED:
        case SECTIONS.UNSTAGED:
          git.add(choice.list.map(v => v.file)).then(actions.r.bind(this));
          break;
      }
    } else {
      let file = choice.value.file;

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
      let { value: {file}, section } = choice;
      files = file;
    }
    if (files) {

      this.rl.pause();
      cliCursor.show();
      git.add(files, '--patch').then(() => {
        this.rl.resume();
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
      this.rl.pause();
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
    }).catch(() => {
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
  'x.confirm': function discard (choice) {
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
        case SECTIONS.STASH:
          let stashes = choice.list.map(v => `stash@{${v.id}}`);
          git.stash.drop(stashes).then(actions.r.bind(this));
          break;
      }
    } else {
      let { value: { file }, section } = choice;
      if (section === SECTIONS.UNTRACKED) {
        git.clean(file).then(actions.r.bind(this));
      } else if (section === SECTIONS.UNSTAGED) {
        git.checkout(file).then(actions.r.bind(this));
      } else if (section === SECTIONS.STAGED) {
        git.reset(file).then(() => {
          return git.checkout(file)
        }).then(actions.r.bind(this));
      } else if (section === SECTIONS.STASH) {
        git.stash.drop(`stash@{${choice.value}}`).then(actions.r.bind(this));
      }
    }
  },
  'x.cancel': function discard (choice) {
    // Do nothing
  }
};

module.exports = actions;
