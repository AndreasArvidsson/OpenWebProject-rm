const fsPromises = require("fs").promises;

module.exports = async function remove(path, options = {}) {
    try {
        const stats = await fsPromises.stat(path);

        if (stats.isDirectory()) {
            if (!options.recursive && !options.dir) {
                throw `rm: cannot remove '${path}': Is a directory`;
            }
            await fsPromises.rmdir(path, { recursive: options.recursive || false });
            if (options.verbose) {
                return `removed directory '${path}'`;
            }
        }
        else {
            await fsPromises.unlink(path);
            if (options.verbose) {
                return `removed '${path}'`;
            }
        }

        return true
    }
    catch (err) {
        switch (err.code) {
            //No such file or directory
            case "ENOENT":
                if (options.force) {
                    return false;
                }
                throw `rm: cannot remove '${path}': No such file or directory`;
            //Directory not empty,
            case "ENOTEMPTY":
                throw `rm: cannot remove '${path}': Directory not empty`;
        }
        throw err;
    }
};