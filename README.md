# OpenWebProject rm
Unix like rm command for node

## Installation
```
npm install owp.rm --save
```

## Usage
```javascript
rm(path: String, options: Object) => Promise
```

```javascript
const rm = require("owp.rm");

try {
    const response = await rm("myFile", { verbose: true });
}
catch(error) {

}

//OR

rm("myDir", { verbose: true, recursive: true })
    .then(response => {

    })
    .catch(error => {

    });
```

### Wildcards
Supports wildcard to remove files inside a directory while keeping the directory itself.
```javascript
rm("myDir/*");
```

## Options

Option | Description | Default
-- | -- | --
force | Ignore nonexistant files, and never prompt before removing. | false
recursive | Remove directories and their contents recursively. | false
dir | Remove empty directories. This option permits you to remove a directory without specifying recursive, provided  that the directory is empty. | false
verbose | Verbose mode; explain at all times what is being done. | false
