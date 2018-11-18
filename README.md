# Git Status Interactively

gsti gives you a very simple UI for `git status` in command line, you can easily do interactive `git status` in command line.

![image](https://user-images.githubusercontent.com/2182004/47619060-3bddfc00-db15-11e8-96da-a001a243e8b9.png)



## Install

```
$ npm install gsti -g
```

## Key Bindings

### Movement

| **key** | **description** |
| --- | --- |
| <kbd>up</kbd> or <kbd>j</kbd> | Move the cursor to the previous line. |
| <kbd>down</kbd> or <kbd>k</kbd> | Move the cursor to the next line. |


### Staging

| **key** | **description** |
| --- | --- |
| <kbd>s</kbd> | Stage the file/section. |
| <kbd>S</kbd> | Stage all unstaged and untracked files. |
| <kbd>p</kbd> | Interactively stage hunks of a file. |

### Stashes

| **key** | **description** |
| --- | --- |
| <kbd>a</kbd> | Apply stash. |
| <kbd>A</kbd> | Pop stash. |
| <kbd>z</kbd> | Create a stash. |
| <kbd>Z</kbd> | Create a stash include untracked files. |

### Commit

| **key** | **description** |
| --- | --- |
| <kbd>c</kbd> | Commit files. |
| <kbd>C</kbd> | Commit all staged files. |

### File

| **key** | **description** |
| --- | --- |
| <kbd>e</kbd> | Edit file. |
| <kbd>d</kbd> | View diff. |
| <kbd>y</kbd> | Yank. |
| <kbd>x</kbd> | Discard file/section. |

### Others

| **key** | **description** |
| --- | --- |
| <kbd>q</kbd> or <kbd>esc</kbd> | quite. |
| <kbd>h</kbd> | help. |


## TODO List


- [x] Support `git stash`
- [x] Support `git add --patch`
- [x] Add npm versin check


## Reference

[SublimeGit](https://github.com/SublimeGit/SublimeGit)
