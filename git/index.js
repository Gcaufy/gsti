const path = require('path');
const execa = require('execa');
const { spawn } = require('child_process');

const STATUS_LABELS = {
    ' ': 'Unmodified',
    'M': 'Modified  ',
    'A': 'Added     ',
    'D': 'Deleted   ',
    'R': 'Renamed   ',
    'C': 'Copied    ',
    'U': 'Unmerged  ',
    '?': 'Untracked ',
    '!': 'Ignored   ',
    'T': 'Typechange'
};

module.exports = {
  STATUS_LABELS: STATUS_LABELS,
  /*
   * git diff file
   */
  diff (file) {
    return execa('git', ['diff'].concat(file), { stdio: 'inherit' });
  },
  /*
   * git add file
   */
  add (file, option) {
    let arg = ['add'].concat(file);
    if (option) {
      arg = arg.concat(option);
    }
    return execa('git', arg, option ? { stdio: 'inherit' } : undefined);
  },
  stash: {
    list (opt) {
      let arg = ['stash', 'list'];
      if (opt) {
        arg = arg.concat(opt);
      }
      let stashRE = /^stash@{(\d+)}:\s+(.*)/;
      return execa('git', arg).then(({ stdout: list }) => {
        return !list ? [] : list.split('\n').map(item => {
          let match = item.match(stashRE);
          return {
            id: +match[1],
            item: match[2]
          };
        });
      });
    },
    apply (index) {
      let arg = ['stash', 'apply', 'stash@{' + index + '}'];
      return execa('git', arg);
    },
    pop (index) {
      let arg = ['stash', 'pop', 'stash@{' + index + '}'];
      return execa('git', arg)
    },
    save (opt) {
      // TODO: allow user to define stash message
      let arg = ['stash', 'save'];
      if (opt) {
        arg = arg.concat(opt);
      }
      return execa('git', arg);
    },
    drop (opt) {
      let arg = ['stash', 'drop'];
      if (opt) {
        arg = arg.concat(opt);
      }
      return execa('git', arg);
    }
  },
  /*
   * git commit
   */
  commit (option) {
    let arg = ['commit'];
    if (option) {
      arg = arg.concat(option);
    }
    return execa('git', arg, { stdio: 'inherit' });
  },
  /*
   * git unstage files
   */
  unstage (file) {
    return execa('git', ['reset', '-q', 'HEAD', '--'].concat(file));
  },
  remote (branch) {
    return execa('git', ['config', `branch.${branch}.remote`]).then(({ stdout: remote }) => {
      if (!remote) {
        return {};
      }
      return execa('git', ['config', `remote.${remote}.url`]).then(({ stdout: url }) => ({ name: remote, url }));
    }).catch(e => ({}));
  },
  branch () {
    let arg = ['symbolic-ref', '-q', 'HEAD'];
    return execa('git', arg).then(({ stdout: branch }) => {
      if (branch.startsWith('refs/heads/')) {
        branch = branch.substring(11);
      }
      return branch;
    }).catch(e => ''); // Catch when can not get branchs
  },
  log1 () {
    let arg = ['log', '--max-count=1', '--abbrev-commit', '--pretty=oneline'];
    return execa('git', arg).then(({ stdout: head }) => head).catch(e => '');  // Catch when there is no commits;
  },
  info () {
    return this.branch().then(branch => {
      return this.remote(branch).then(remote => {
        return this.log1().then(head => {
          return { branch, remote, head };
        });
      });
    });
  },
  /*
   * git clean
   */
  clean (file) {
    let arg = ['clean', '-f'];
    if (file) {
      arg = arg.concat(file);
    }
    return execa('git', arg);
  },
  /*
   * git checkout file
   */
  checkout (file) {
    let arg = ['checkout', file];
    return execa('git', arg);
  },
  /*
   * git reset HEAD
   */
  reset (file) {
    let arg = ['reset', 'HEAD'];
    if (file)
      arg = arg.concat(file);
    return execa('git', arg);
  },
  /*
   * git status
   */
  status () {
    let files = {
      untracked: [],
      unstaged: [],
      staged: [],
      stashes: []
    };
    return this.stash.list().then(stashes => {
      files.stashes = stashes;
    }).then(() => {
      return execa('git', ['status', '-z']).then(({ stdout: status }) => {
        status.split('\x00').forEach(line => {
          let state = line.substring(0, 2);
          let file = line.substring(3).trim();

          if (file) {
            if (state === '??') {
              files.untracked.push({
                label: STATUS_LABELS['?'],
                file: file
              });
            } else if (state === '!!') {
              // ignored files
            } else if (['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU'].indexOf(state) > -1) {
              // TODO: unmerged files
            } else {
              // ref: https://git-scm.com/docs/git-status#_short_format
              // X shows status of the index
              // Y shows status of the work tree
              let [X, Y] = state;
              if (Y !== ' ') {
                files.unstaged.push({
                  label: STATUS_LABELS[Y],
                  file: file
                });
              }
              if (X !== ' ') {
                files.staged.push({
                  label: STATUS_LABELS[X],
                  file: file
                });
              }
            }
          }

        });
        return files;
      })
    })
  }
}
