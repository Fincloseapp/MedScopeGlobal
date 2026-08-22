/**
 * FAT32 (D:) reports EISDIR on fs.readlink for ordinary files.
 * Webpack/Next treat that as fatal; EINVAL means "not a symlink" and the build continues.
 * Loaded via NODE_OPTIONS --require so it applies inside `next build`.
 */
"use strict";

const fs = require("fs");

function asNotASymlink(err) {
  const e = new Error(err.message);
  e.code = "EINVAL";
  e.errno = err.errno;
  e.path = err.path;
  e.syscall = err.syscall;
  return e;
}

function wrapCallback(fn) {
  return function patchedReadlink(...args) {
    const cb = typeof args[args.length - 1] === "function" ? args.pop() : null;
    if (!cb) {
      try {
        return fn.apply(this, args);
      } catch (err) {
        if (err && err.code === "EISDIR") throw asNotASymlink(err);
        throw err;
      }
    }
    return fn.call(this, ...args, (err, link) => {
      if (err && err.code === "EISDIR") err = asNotASymlink(err);
      cb(err, link);
    });
  };
}

fs.readlink = wrapCallback(fs.readlink);
fs.readlinkSync = wrapCallback(fs.readlinkSync);

if (fs.promises && fs.promises.readlink) {
  const orig = fs.promises.readlink.bind(fs.promises);
  fs.promises.readlink = async function patchedReadlinkPromise(...args) {
    try {
      return await orig(...args);
    } catch (err) {
      if (err && err.code === "EISDIR") throw asNotASymlink(err);
      throw err;
    }
  };
}
