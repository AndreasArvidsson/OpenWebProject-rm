const path = require("path");
const fs = require("fs");
const rm = require("../index");

console.log("owp.rm: Running tests");

async function init() {
    fs.mkdirSync(path.resolve(__dirname, "dir/subDir"), { recursive: true });

    fs.mkdirSync(path.resolve(__dirname, "emptyDir"));
    fs.mkdirSync(path.resolve(__dirname, "emptyDir2"));

    fs.writeFileSync(path.resolve(__dirname, "file"), "content");
    fs.writeFileSync(path.resolve(__dirname, "file2"), "content");

    fs.mkdirSync(path.resolve(__dirname, "dir2/subDir"), { recursive: true });
    fs.writeFileSync(path.resolve(__dirname, "dir2/file"), "content");
    fs.writeFileSync(path.resolve(__dirname, "dir2/subDir/file2"), "content");

    fs.mkdirSync(path.resolve(__dirname, "dir3/subDir"), { recursive: true });
    fs.writeFileSync(path.resolve(__dirname, "dir3/file"), "content");
    fs.writeFileSync(path.resolve(__dirname, "dir3/subDir/file2"), "content");
}

function assert(name, expected, found) {
    if (expected !== found) {
        console.error(`name: '${name}'\nexpected: '${expected}'\nfound: '${found}'`);
    }
}

async function assertError(rmPath, options, name, expected) {
    let error;
    try {
        await rm(rmPath, options);
    }
    catch (err) {
        error = err;
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
    assert(name, expected, response);
}

async function assertRemoved(rmPath, options, name) {
    try {
        await rm(rmPath, options);
        if (fs.existsSync(rmPath)) {
            console.log(`${name}: '${rmPath}' not removed`);
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

    assertResponse(
        path.resolve(__dirname, "dir2"),
        { recursive: true, verbose: true },
        "dir2",
        `removed 'dir2${path.sep}file'
removed 'dir2${path.sep}subDir${path.sep}file2'
removed directory 'dir2${path.sep}subDir'
removed directory 'dir2'`
    );

    assertResponse(
        path.resolve(__dirname, "dir3/*"),
        { recursive: true, verbose: true },
        "dir2",
        `removed 'dir3${path.sep}file'
removed 'dir3${path.sep}subDir${path.sep}file2'
removed directory 'dir3${path.sep}subDir'`
    );

});