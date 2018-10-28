# Git Status Interactively

gsti gives you a very simple UI for `git status` in command line, you can easily do interactive in command line.

![image](https://user-images.githubusercontent.com/2182004/47619060-3bddfc00-db15-11e8-96da-a001a243e8b9.png)



## Install

```
$ npm install gsti -g
$ git sti
```

## Usage


### Movement:

```
k = previous item
j = next section
```

### Staging: 

```
s = stage file/section
u = unstage file/section
x = discard file/section
```

### Commit: 

```
c = commit
C = commit -a (add unstaged)
```

### File: 

```
e = edit file
d = view diff
```



## TODO List


```
[x] git add --patch
[x] git stash
```


## Reference

[SublimeGit](https://github.com/SublimeGit/SublimeGit)
