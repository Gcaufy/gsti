const chalk = require('chalk');
const git = require('./git/index');

module.exports = {
  build (words) {
    let output = '';
    return words.map(w => {
      let t = '';
      if (typeof w === 'string') {
        return w;
      }
      for (let k in w) {
        t += chalk[k](w[k]);
      }
      return t;
    }).join('');
  },
  clean () {
    let words = [
      ' \n',
      { green: '    Nothing to commit, working tree clean' },
      ' \n \n',
    ]
    return this.build(words);
  },
  section (item) {
    let output = ' \n \n \n';

    let words = [
      { gray: '  # Movement: '},
      { yellow: 'k' },
      { gray: ',' },
      { yellow: 'up' },
      { gray: ' = up, ' },
      { yellow: 'j' },
      { gray: ',' },
      { yellow: 'down' },
      { gray: ' = down ' },
      '  \n',
      { gray: '  # Staging: ' },
      { yellow: 's' },
      { gray: ' = stage section, ' },
      { yellow: 'S' },
      { gray: ' = stage all unstaged and untracked files, ' },
      '  \n',
      { gray: '  # Stashes: ' },
      { yellow: 'a' },
      { gray: ' = apply stash, ' },
      { yellow: 'A' },
      { gray: ' = pop stash, ' },
      { yellow: 'z' },
      { gray: ' = create a stash, ' },
      { yellow: 'Z' },
      { gray: ' = create a stash include untracked files, ' },
      '  \n',
      { gray: '  # Commit: ' },
      { yellow: 'c' },
      { gray: ' = commit, ' },
      { yellow: 'C' },
      { gray: ' = commit -a ' },
      '  \n',
      { gray: '  # File: ' },
      { yellow: 'e' },
      { gray: ' = edit file, ' },
      { yellow: 'd' },
      { gray: ' = view diff ' },
      '  \n',
      { gray: '  # Other: ' },
      { yellow: 'y' },
      { gray: ' = yank, ' },
      { yellow: 'x' },
      { gray: ' = discard files, sections, ' },
      { yellow: 'q' },
      { gray: ',' },
      { yellow: 'esc' },
      { gray: ' = quite, ' },

      { yellow: 'h' },
      { gray: ' = help ' },
      ' \n \n'
    ]
    output += this.build(words);
    return output;
  },
  clearStatusCache () {
    this._statusCache = null;
  },
  status (refresh = false) {
    if (refresh)
      this._statusCache = null;

    if (this._statusCache) {
      return Promise.resovle(this._statusCache);
    }

    return git.info().then(info => {
      let words = [];

      if (info.remote.name || info.remote.url) {
        words.push({ gray: '  \n  Remote:    ' });
        if (info.remote.name) {
          words.push({ yellow: info.remote.name });
        }
        if (info.remote.url) {
          words.push({ gray: ' @ ' });
          words.push({ yellow: info.remote.url });
        }
      }
      if (info.branch) {
        words.push({ gray: '  \n  Local:     ' });
        words.push({ blue: info.branch });
        words.push({ gray: ' ' + process.cwd() });
      }
      words.push({ gray: '  \n  Head:      ' });
      words.push(info.head ? info.head : 'nothing committed yet');

      return chalk.reset(' ') + this.build(words) + ' \n \n';
    });
  }
}
