const fs = require("fs");
function patchReadlink(fn) {
  return function (path, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = undefined;
    }
    let stat;
    try {
      stat = fs.lstatSync(path);
    } catch (e) {
      if (cb) return cb(e);
      throw e;
    }
    if (stat.isFile()) {
      const err = Object.assign(new Error("EINVAL: invalid argument, readlink"), {
        code: "EINVAL",
        errno: -4071,
        syscall: "readlink",
        path,
      });
      if (cb) return cb(err);
      throw err;
    }
    return fn.call(fs, path, options, cb);
  };
}
const origSync = fs.readlinkSync;
fs.readlinkSync = function (path, options) {
  const stat = fs.lstatSync(path);
  if (stat.isFile()) {
    const err = Object.assign(new Error("EINVAL: invalid argument, readlink"), {
      code: "EINVAL",
      errno: -4071,
      syscall: "readlink",
      path,
    });
    throw err;
  }
  return origSync.call(fs, path, options);
};
fs.readlink = patchReadlink(fs.readlink);
if (fs.promises?.readlink) {
  const origP = fs.promises.readlink.bind(fs.promises);
  fs.promises.readlink = async function (path, options) {
    const stat = await fs.promises.lstat(path);
    if (stat.isFile()) {
      const err = Object.assign(new Error("EINVAL: invalid argument, readlink"), {
        code: "EINVAL",
        errno: -4071,
        syscall: "readlink",
        path,
      });
      throw err;
    }
    return origP(path, options);
  };
}
