/**
 * FAT32 / Windows Next.js workaround: fs.readlink on files/dirs can throw EISDIR
 * and abort webpack. Convert to EINVAL so Next treats the path as a non-symlink.
 * Load via: NODE_OPTIONS=--require ./scripts/win-fat32-fs-patch.cjs
 */
const fs = require("node:fs");

function asInvalidArg(path) {
  const err = new Error(`EINVAL: invalid argument, readlink '${path}'`);
  err.code = "EINVAL";
  err.errno = -22;
  err.syscall = "readlink";
  err.path = path;
  return err;
}

function shouldNormalize(err) {
  return Boolean(err && (err.code === "EISDIR" || err.code === "EINVAL" || err.code === "EPERM"));
}

const originalReadlink = fs.readlink.bind(fs);
const originalReadlinkSync = fs.readlinkSync.bind(fs);

fs.readlink = function patchedReadlink(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = undefined;
  }
  if (typeof callback === "function") {
    return originalReadlink(path, options, (err, link) => {
      if (shouldNormalize(err)) {
        callback(asInvalidArg(path));
        return;
      }
      callback(err, link);
    });
  }
  try {
    return originalReadlink(path, options);
  } catch (err) {
    if (shouldNormalize(err)) throw asInvalidArg(path);
    throw err;
  }
};

fs.readlinkSync = function patchedReadlinkSync(path, options) {
  try {
    return originalReadlinkSync(path, options);
  } catch (err) {
    if (shouldNormalize(err)) throw asInvalidArg(path);
    throw err;
  }
};

if (fs.promises?.readlink) {
  const originalPromise = fs.promises.readlink.bind(fs.promises);
  fs.promises.readlink = async function patchedPromise(path, options) {
    try {
      return await originalPromise(path, options);
    } catch (err) {
      if (shouldNormalize(err)) throw asInvalidArg(path);
      throw err;
    }
  };
}
