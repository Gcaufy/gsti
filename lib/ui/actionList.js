const Base = require('inquirer/lib/prompts/base');
const Paginator = require('inquirer/lib/utils/paginator');
const observe = require('inquirer/lib/utils/events');
const Choices = require('inquirer/lib/objects/choices');
const figures = require('figures');
const chalk = require('chalk');
const { takeWhile } = require('rxjs/operators');
const cliCursor = require('cli-cursor');
const _ = require('lodash');




class ActionList extends Base {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);


    if (!this.opt.choices) {
      this.throwParamError('choices');
    }

    this.firstRender = true;
    this.selected = 0;

    var def = this.opt.default;

    // If def is a Number, then use as index. Otherwise, check for value.
    if (_.isNumber(def) && def >= 0 && def < this.opt.choices.realLength) {
      this.selected = def;
    } else if (!_.isNumber(def) && def != null) {
      let index = _.findIndex(this.opt.choices.realChoices, ({ value }) => value === def);
      this.selected = Math.max(index, 0);
    }

    // Make sure no default is set (so it won't be printed)
    this.opt.default = null;

    this.paginator = new Paginator(this.screen);
  }

  _run (cb) {
    this.done = cb;

    let events = observe(this.rl);

    const dontHaveAnswer = () => !this.answer;

    events.line
      .pipe(takeWhile(dontHaveAnswer))
      .forEach(this.onSubmit.bind(this));
    events.keypress
      .pipe(takeWhile(dontHaveAnswer))
      .forEach(this.onKeypress.bind(this));

    this.render();

    return this;
  }

  render (choices) {
    if (choices) {
      this.opt.choices = new Choices(choices);
    }
    cliCursor.hide();
    let output = this.opt.hideMessage ? chalk.reset(' ') : this.getQuestion();
    // Fix selected index
    let choiceLength = this.opt.choices.realChoices.length;
    if (this.selected > choiceLength - 1) {
      this.selected = choiceLength - 1;
    }
    let choiceStr = listRender(this.opt.choices, this.selected);
    let indexPosition = this.opt.choices.indexOf(
      this.opt.choices.getChoice(this.selected)
    );

    if (this.opt.pageSize) {
      output += '\n' + this.paginator.paginate(choiceStr, indexPosition, this.opt.pageSize);
    } else {
      output += '\n' + choiceStr;
    }

    if (this.confirm) {
      output += '\n  \n  \n    ' + figures.hamburger + '  ' + chalk.red(this.confirm.text) + this.rl.line;
    }

    if (typeof this.opt.beforeRender === 'function') {
      let rst = this.opt.beforeRender.call(this, output);
      if (typeof rst === 'string') {
        this.screen.render(rst);
      } else if (rst.then) {
        rst.then(v => {
          this.screen.render(v);
        });
      }
    } else {
      this.screen.render(output);
    }
  }

  onSubmit (answer) {
    if (this.confirm) {
      answer = answer.toLowerCase();
      let action;
      if (answer === this.confirm.confirmText) {
        action = this.opt.actions[this.confirm.key + '.' + 'confirm'];
      } else if (answer === this.confirm.cancelText) {
        action = this.opt.actions[this.confirm.key + '.' + 'cancel'];
      } else {
        action = this.opt.actions[this.confirm.key + '.' + 'other'];
      }
      if (_.isFunction(action)) {
        let choice = this.opt.choices.getChoice(this.selected);
        action.call(this, choice, this.selected);
      }
      this.confirm = null;
      this.render();
    }
  }

  onEnd () {
    this.screen.done();
    this.done();
  }

  onKeypress (e, key) {
    let keyName = (e.key && e.key.name) || undefined;
    if (this.confirm) {
      this.render();
      return;
    }
    if (keyName === 'j' || keyName === 'down') {
      const len = this.opt.choices.realLength;
      this.selected = this.selected < len - 1 ? this.selected + 1 : 0;
      this.render();
    } else if (keyName === 'k' || keyName === 'up') {
      const len = this.opt.choices.realLength;
      this.selected = this.selected > 0 ? this.selected - 1 : len - 1;
      this.render();
    }
    if (e.key.ctrl) {
      if (e.key.shift) {
        keyName = '<C-S-' + keyName + '>';
      } else {
        keyName = '<C-' +keyName + '>';
      }
    } else if (e.key.shift && keyName.length === 1) {
      let code = keyName.charCodeAt(0);
      if (code >= 97 && code <= 122) { // a-z
        keyName = keyName.toUpperCase();
      }
    }

    if (this.opt.actions && this.opt.actions[keyName]) {
      let action = this.opt.actions[keyName];
      if (_.isFunction(action)) {
        let choice = this.opt.choices.getChoice(this.selected);
        action.call(this, choice, this.selected);
      } else if (_.isObject(action)) {
        if (action.type === 'confirm') {
          this.rl.line = '';
          this.confirm = buildConfirm(action, keyName);
          this.render();
        }
      }
    }
  }
}

function buildConfirm (action, keyName) {
  action.key = keyName;
  action.confirmText = action.confirmText || 'yes';
  action.cancelText = action.cancelText || 'yes';
  return action;
}


function listRender(choices, pointer) {
  let output = '';
  let separatorOffset = 0;

  choices.forEach((choice, i) => {
    let color = choice.color;
    if (color && chalk[color]) {
      color = chalk[color];
    } else {
      color = (s) => s;
    }
    if (choice.type === 'separator') {
      separatorOffset++;
      output += '  ' + choice + '\n';
      return;
    }

    if (choice.disabled) {
      separatorOffset++;
      output += '  - ' + choice.name;
      output += ' (' + (_.isString(choice.disabled) ? choice.disabled : 'Disabled') + ')';
      output += '\n';
      return;
    }

    let isSelected = i - separatorOffset === pointer;
    if (isSelected) {
      output += chalk.cyan('  ' + figures.arrowRight) + color(choice.name) + ' \n';
    } else {
      output += '   ' + color(choice.name) + ' \n';
    }
  });

  return output.replace(/\n$/, '');
}


module.exports = ActionList;
