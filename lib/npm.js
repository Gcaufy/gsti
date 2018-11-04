const execa = require('execa');

const BINS = ['cnpm', 'yarn', 'npm'];

function cached (fn) {
  let _cache = [];
  return function (...args) {
    let key = args.join('-');
    if (_cache[key]) {
      return Promise.resolve(_cache[key]);
    }
    return fn.apply(this, args).then(res => {
      _cache[key] = res;
      return res;
    });
  }
}
module.exports = {
  available: cached(function (list) {
    list = list || BINS;

    return execa('type', list).then(({ stdout }) => {
      let installed = [];
      stdout.split('\n').forEach(line => {
        installed.push(line.replace(/\sis\s.*/, ''));
      });
      return installed;
    });
  }),
  command (command) {
    if (command) {
      this._command = command;
      return Promise.resolve(command);
    } else {
      if (this._command) {
        return Promise.resolve(this._command);
      } else {
        return this.available().then(installed => {
          let command = installed[0];
          if (command) {
            return command;
          } else {
            throw new Error('npm is not installed.');
          }
        });
      }
    }
  },
  exec (command, arg) {
    if (arguments.length >= 2) {
      return execa(command, arg);
    } else if (arguments.length === 1) {
      return this.command().then(command => {
        return this.exec(command, arg);
      });
    }
  },
  version (pkg) {
    return this.command().then(command => {
      if (command !== 'yarn') {
        return execa(command, ['info', pkg, 'version']).then(({ stdout }) => stdout);
      } else {
        return execa(command, ['info', pkg, 'version']).then(({ stdout }) => {
          return stdout.split('\n')[1];
        });
      }
    });
  }
}
