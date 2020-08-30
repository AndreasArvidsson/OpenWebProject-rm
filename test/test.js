const path = require("path");
const fs = require("fs");
const rm = require("../index");

console.log("owp.rm: Running tests");

function init() {
    fs.mkdirSync(path.resolve(__dirname, "dir/subDir"), { recursive: true });
    fs.mkdirSync(path.resolve(__dirname, "emptyDir"));
    fs.mkdirSync(path.resolve(__dirname, "emptyDir2"));
    fs.writeFileSync(path.resolve(__dirname, "file"), "content");
    fs.writeFileSync(path.resolve(__dirname, "file2"), "content");
    return new Promise(resolve => {
        setTimeout(resolve, 500);
    });
}

function assert(name, expected, found) {
    if (expected !== found) {
        console.error(`${name}:\nexpected: '${expected}'\nfound: '${found}'`);
    }
}

function removePath(p) {
    return p.replace(path.resolve(__dirname) + path.sep, "");
}

async function assertError(rmPath, options, name, expected) {
    let error;
    try {
        await rm(rmPath, options);
    }
    catch (err) {
        error = err;
    }
    if (typeof error === "string") {
        error = removePath(error);
    }
    assert(name, expected, error);
}

async function assertResponse(rmPath, options, name, expected) {
    let response;
    try {
        response = await rm(rmPath, options);
    }
    catch (err) {
        console.log(err);
    }
    if (typeof response === "string") {
        response = removePath(response);
    }
    assert(name, expected, response);
}

async function assertRemoved(rmPath, options, name) {
    try {
        await rm(rmPath, options);
        if (fs.existsSync(rmPath)) {
            console.log(`'${removePath(rmPath)}' not removed`);
        }
    }
    catch (err) {
        console.log(err);
    }
}

init().then(() => {

    assertError(
        path.resolve(__dirname, "unexistingFile"),
        {},
        "Unexisting error",
        "rm: cannot remove 'unexistingFile': No such file or directory"
    );

    assertError(
        path.resolve(__dirname, "dir"),
        {},
        "is dir error",
        "rm: cannot remove 'dir': Is a directory"
    );

    assertError(
        path.resolve(__dirname, "dir"),
        { dir: true },
        "dir not empty error",
        "rm: cannot remove 'dir': Directory not empty"
    );

    assertRemoved(
        path.resolve(__dirname, "file"),
        {},
        "file"
    );

    assertRemoved(
        path.resolve(__dirname, "emptyDir"),
        { dir: true },
        "empty dir"
    );

    assertRemoved(
        path.resolve(__dirname, "dir"),
        { recursive: true },
        "dir"
    );

    assertResponse(
        path.resolve(__dirname, "file2"),
        { verbose: true },
        "dir",
        "removed 'file2'"
    );

    assertResponse(
        path.resolve(__dirname, "emptyDir2"),
        { dir: true, verbose: true },
        "dir",
        "removed directory 'emptyDir2'"
    );

    console.log("owp.rm: Tests done");
});