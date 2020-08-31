const p = require("path");
const fsPromises = require("fs").promises;

module.exports = async function (path, options = {}) {
    if (path.endsWith("/*") || path.endsWith("\\*")) {
        path = p.resolve(path, "..");
        const files = await fsPromises.readdir(path);
        return rmFiles(path, options, files);
    }
    return rm(path, options);
};

async function rm(path, options) {
    try {
        const stats = await fsPromises.lstat(path);
        if (stats.isDirectory()) {
            return rmDir(path, options);
        }
        else {
            await fsPromises.unlink(path);
            if (options.verbose) {
                return `removed '${rel(path)}'`;
            }
            return true;
        }
    }
    catch (err) {
        //No such file or directory
        if (err.code === "ENOENT") {
            if (options.force) {
                if (options.verbose) {
                    return "";
                }
                return false;
            }
            throw `rm: cannot remove '${rel(path)}': No such file or directory`;
        }
        throw err;
    }
}

async function rmDir(path, options) {
    if (!options.recursive && !options.dir) {
        throw `rm: cannot remove '${rel(path)}': Is a directory`;
    }
    const files = await fsPromises.readdir(path);
    if (files.length && !options.recursive) {
        throw `rm: cannot remove '${rel(path)}': Directory not empty`;
    }
    const res = await rmFiles(path, options, files);
    await fsPromises.rmdir(path);
    if (options.verbose) {
        return (res ? `${res}\n` : "")
            + `removed directory '${rel(path)}'`;
    }
    return true;
}

async function rmFiles(path, options, files) {
    const promises = files.map(f =>
        rm(p.resolve(path, f), options)
    );
    const res = await Promise.all(promises);
    return options.verbose ? res.join("\n") : "";
}

function rel(path) {
    return p.relative(process.cwd(), path);
}