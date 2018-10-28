# Git Status Interactively

gsti gives you a very simple UI for `git status` in command line, you can easily do interactive in command line.

![image](https://user-images.githubusercontent.com/2182004/47618994-55cb0f00-db14-11e8-854e-924046b73edd.png)


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
