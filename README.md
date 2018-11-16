# Git Status Interactively

gsti gives you a very simple UI for `git status` in command line, you can easily do interactive in command line.

![image](https://user-images.githubusercontent.com/2182004/47619060-3bddfc00-db15-11e8-96da-a001a243e8b9.png)



## Install

```
$ npm install gsti -g
```

## Usage

```
$ git sti

  # Movement:

  k = previous item
  j = next section

  # Staging: 

  s = stage file/section
  u = unstage file/section
  x = discard file/section

  # Stashes: 

  a = apply stash 
  A = pop stash 
  z = create a stash 
  Z = create a stash include untracked files

  # Commit: 

  c = commit
  C = commit -a (add unstaged)

  # File: 

  e = edit file
  d = view diff
```


## TODO List


- [x] Support `git stash`
- [x] Support `git add --patch`
- [x] Add npm version check 


## Reference

[SublimeGit](https://github.com/SublimeGit/SublimeGit)
