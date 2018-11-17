# Git Status Interactively

gsti gives you a very simple UI for `git status` in command line, you can easily do interactive in command line.

![image](https://user-images.githubusercontent.com/2182004/47619060-3bddfc00-db15-11e8-96da-a001a243e8b9.png)



## Install

```
$ npm install gsti -g
```

## Key Bindings

### Movement

| **command** | **description** |
| --- | --- |
| <kbd>up</kbd> or <kbd>j</kbd> | Move the cursor to the previous line. |
| <kbd>down</kbd> or <kbd>k</kbd> | Move the cursor to the next line. |


### Staging

| **command** | **description** |
| --- | --- |
| <kbd>s</kbd> | Stage the file/section. |
| <kbd>S</kbd> | Stage all unstaged and untracked files. |
| <kbd>p</kbd> | Interactively stage hunks of a file. |

### Stashes

| **command** | **description** |
| --- | --- |
| <kbd>a</kbd> | Apply stash. |
| <kbd>A</kbd> | Pop stash. |
| <kbd>z</kbd> | Create a stash. |
| <kbd>Z</kbd> | Create a stash include untracked files. |

### Commit

| **command** | **description** |
| --- | --- |
| <kbd>c</kbd> | Commit files. |
| <kbd>C</kbd> | Commit all staged files. |

### File

| **command** | **description** |
| --- | --- |
| <kbd>e</kbd> | Edit file. |
| <kbd>d</kbd> | View diff. |
| <kbd>y</kbd> | Yank. |
| <kbd>x</kbd> | Discard file/section. |

### Others

| **command** | **description** |
| --- | --- |
| <kbd>q</kbd> or <kdb>esc</kdb> | quite. |
| <kbd>h</kbd> | help. |


## TODO List


- [x] Support `git stash`
- [x] Support `git add --patch`
- [x] Add npm versin check


## Reference

[SublimeGit](https://github.com/SublimeGit/SublimeGit)
