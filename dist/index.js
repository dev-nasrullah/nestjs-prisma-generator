"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/readdirp/esm/index.js
function readdirp(root, options = {}) {
  let type = options.entryType || options.type;
  if (type === "both")
    type = EntryTypes.FILE_DIR_TYPE;
  if (type)
    options.type = type;
  if (!root) {
    throw new Error("readdirp: root argument is required. Usage: readdirp(root, options)");
  } else if (typeof root !== "string") {
    throw new TypeError("readdirp: root argument must be a string. Usage: readdirp(root, options)");
  } else if (type && !ALL_TYPES.includes(type)) {
    throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(", ")}`);
  }
  options.root = root;
  return new ReaddirpStream(options);
}
var import_promises2, import_node_stream, import_node_path, EntryTypes, defaultOptions, RECURSIVE_ERROR_CODE, NORMAL_FLOW_ERRORS, ALL_TYPES, DIR_TYPES, FILE_TYPES, isNormalFlowError, wantBigintFsStats, emptyFn, normalizeFilter, ReaddirpStream;
var init_esm = __esm({
  "node_modules/readdirp/esm/index.js"() {
    "use strict";
    import_promises2 = require("fs/promises");
    import_node_stream = require("stream");
    import_node_path = require("path");
    EntryTypes = {
      FILE_TYPE: "files",
      DIR_TYPE: "directories",
      FILE_DIR_TYPE: "files_directories",
      EVERYTHING_TYPE: "all"
    };
    defaultOptions = {
      root: ".",
      fileFilter: (_entryInfo) => true,
      directoryFilter: (_entryInfo) => true,
      type: EntryTypes.FILE_TYPE,
      lstat: false,
      depth: 2147483648,
      alwaysStat: false,
      highWaterMark: 4096
    };
    Object.freeze(defaultOptions);
    RECURSIVE_ERROR_CODE = "READDIRP_RECURSIVE_ERROR";
    NORMAL_FLOW_ERRORS = /* @__PURE__ */ new Set(["ENOENT", "EPERM", "EACCES", "ELOOP", RECURSIVE_ERROR_CODE]);
    ALL_TYPES = [
      EntryTypes.DIR_TYPE,
      EntryTypes.EVERYTHING_TYPE,
      EntryTypes.FILE_DIR_TYPE,
      EntryTypes.FILE_TYPE
    ];
    DIR_TYPES = /* @__PURE__ */ new Set([
      EntryTypes.DIR_TYPE,
      EntryTypes.EVERYTHING_TYPE,
      EntryTypes.FILE_DIR_TYPE
    ]);
    FILE_TYPES = /* @__PURE__ */ new Set([
      EntryTypes.EVERYTHING_TYPE,
      EntryTypes.FILE_DIR_TYPE,
      EntryTypes.FILE_TYPE
    ]);
    isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);
    wantBigintFsStats = process.platform === "win32";
    emptyFn = (_entryInfo) => true;
    normalizeFilter = (filter) => {
      if (filter === void 0)
        return emptyFn;
      if (typeof filter === "function")
        return filter;
      if (typeof filter === "string") {
        const fl = filter.trim();
        return (entry) => entry.basename === fl;
      }
      if (Array.isArray(filter)) {
        const trItems = filter.map((item) => item.trim());
        return (entry) => trItems.some((f) => entry.basename === f);
      }
      return emptyFn;
    };
    ReaddirpStream = class extends import_node_stream.Readable {
      constructor(options = {}) {
        super({
          objectMode: true,
          autoDestroy: true,
          highWaterMark: options.highWaterMark
        });
        const opts = { ...defaultOptions, ...options };
        const { root, type } = opts;
        this._fileFilter = normalizeFilter(opts.fileFilter);
        this._directoryFilter = normalizeFilter(opts.directoryFilter);
        const statMethod = opts.lstat ? import_promises2.lstat : import_promises2.stat;
        if (wantBigintFsStats) {
          this._stat = (path7) => statMethod(path7, { bigint: true });
        } else {
          this._stat = statMethod;
        }
        this._maxDepth = opts.depth ?? defaultOptions.depth;
        this._wantsDir = type ? DIR_TYPES.has(type) : false;
        this._wantsFile = type ? FILE_TYPES.has(type) : false;
        this._wantsEverything = type === EntryTypes.EVERYTHING_TYPE;
        this._root = (0, import_node_path.resolve)(root);
        this._isDirent = !opts.alwaysStat;
        this._statsProp = this._isDirent ? "dirent" : "stats";
        this._rdOptions = { encoding: "utf8", withFileTypes: this._isDirent };
        this.parents = [this._exploreDir(root, 1)];
        this.reading = false;
        this.parent = void 0;
      }
      async _read(batch) {
        if (this.reading)
          return;
        this.reading = true;
        try {
          while (!this.destroyed && batch > 0) {
            const par = this.parent;
            const fil = par && par.files;
            if (fil && fil.length > 0) {
              const { path: path7, depth } = par;
              const slice = fil.splice(0, batch).map((dirent) => this._formatEntry(dirent, path7));
              const awaited = await Promise.all(slice);
              for (const entry of awaited) {
                if (!entry)
                  continue;
                if (this.destroyed)
                  return;
                const entryType = await this._getEntryType(entry);
                if (entryType === "directory" && this._directoryFilter(entry)) {
                  if (depth <= this._maxDepth) {
                    this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
                  }
                  if (this._wantsDir) {
                    this.push(entry);
                    batch--;
                  }
                } else if ((entryType === "file" || this._includeAsFile(entry)) && this._fileFilter(entry)) {
                  if (this._wantsFile) {
                    this.push(entry);
                    batch--;
                  }
                }
              }
            } else {
              const parent = this.parents.pop();
              if (!parent) {
                this.push(null);
                break;
              }
              this.parent = await parent;
              if (this.destroyed)
                return;
            }
          }
        } catch (error) {
          this.destroy(error);
        } finally {
          this.reading = false;
        }
      }
      async _exploreDir(path7, depth) {
        let files;
        try {
          files = await (0, import_promises2.readdir)(path7, this._rdOptions);
        } catch (error) {
          this._onError(error);
        }
        return { files, depth, path: path7 };
      }
      async _formatEntry(dirent, path7) {
        let entry;
        const basename3 = this._isDirent ? dirent.name : dirent;
        try {
          const fullPath = (0, import_node_path.resolve)((0, import_node_path.join)(path7, basename3));
          entry = { path: (0, import_node_path.relative)(this._root, fullPath), fullPath, basename: basename3 };
          entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
        } catch (err) {
          this._onError(err);
          return;
        }
        return entry;
      }
      _onError(err) {
        if (isNormalFlowError(err) && !this.destroyed) {
          this.emit("warn", err);
        } else {
          this.destroy(err);
        }
      }
      async _getEntryType(entry) {
        if (!entry && this._statsProp in entry) {
          return "";
        }
        const stats = entry[this._statsProp];
        if (stats.isFile())
          return "file";
        if (stats.isDirectory())
          return "directory";
        if (stats && stats.isSymbolicLink()) {
          const full = entry.fullPath;
          try {
            const entryRealPath = await (0, import_promises2.realpath)(full);
            const entryRealPathStats = await (0, import_promises2.lstat)(entryRealPath);
            if (entryRealPathStats.isFile()) {
              return "file";
            }
            if (entryRealPathStats.isDirectory()) {
              const len = entryRealPath.length;
              if (full.startsWith(entryRealPath) && full.substr(len, 1) === import_node_path.sep) {
                const recursiveError = new Error(`Circular symlink detected: "${full}" points to "${entryRealPath}"`);
                recursiveError.code = RECURSIVE_ERROR_CODE;
                return this._onError(recursiveError);
              }
              return "directory";
            }
          } catch (error) {
            this._onError(error);
            return "";
          }
        }
      }
      _includeAsFile(entry) {
        const stats = entry && entry[this._statsProp];
        return stats && this._wantsEverything && !stats.isDirectory();
      }
    };
  }
});

// node_modules/chokidar/esm/handler.js
function createFsWatchInstance(path7, options, listener, errHandler, emitRaw) {
  const handleEvent = (rawEvent, evPath) => {
    listener(path7);
    emitRaw(rawEvent, evPath, { watchedPath: path7 });
    if (evPath && path7 !== evPath) {
      fsWatchBroadcast(sysPath.resolve(path7, evPath), KEY_LISTENERS, sysPath.join(path7, evPath));
    }
  };
  try {
    return (0, import_fs5.watch)(path7, {
      persistent: options.persistent
    }, handleEvent);
  } catch (error) {
    errHandler(error);
    return void 0;
  }
}
var import_fs5, import_promises3, sysPath, import_os, STR_DATA, STR_END, STR_CLOSE, EMPTY_FN, pl, isWindows, isMacos, isLinux, isFreeBSD, isIBMi, EVENTS, EV, THROTTLE_MODE_WATCH, statMethods, KEY_LISTENERS, KEY_ERR, KEY_RAW, HANDLER_KEYS, binaryExtensions, isBinaryPath, foreach, addAndConvert, clearItem, delFromSet, isEmptySet, FsWatchInstances, fsWatchBroadcast, setFsWatchListener, FsWatchFileInstances, setFsWatchFileListener, NodeFsHandler;
var init_handler = __esm({
  "node_modules/chokidar/esm/handler.js"() {
    "use strict";
    import_fs5 = require("fs");
    import_promises3 = require("fs/promises");
    sysPath = __toESM(require("path"), 1);
    import_os = require("os");
    STR_DATA = "data";
    STR_END = "end";
    STR_CLOSE = "close";
    EMPTY_FN = () => {
    };
    pl = process.platform;
    isWindows = pl === "win32";
    isMacos = pl === "darwin";
    isLinux = pl === "linux";
    isFreeBSD = pl === "freebsd";
    isIBMi = (0, import_os.type)() === "OS400";
    EVENTS = {
      ALL: "all",
      READY: "ready",
      ADD: "add",
      CHANGE: "change",
      ADD_DIR: "addDir",
      UNLINK: "unlink",
      UNLINK_DIR: "unlinkDir",
      RAW: "raw",
      ERROR: "error"
    };
    EV = EVENTS;
    THROTTLE_MODE_WATCH = "watch";
    statMethods = { lstat: import_promises3.lstat, stat: import_promises3.stat };
    KEY_LISTENERS = "listeners";
    KEY_ERR = "errHandlers";
    KEY_RAW = "rawEmitters";
    HANDLER_KEYS = [KEY_LISTENERS, KEY_ERR, KEY_RAW];
    binaryExtensions = /* @__PURE__ */ new Set([
      "3dm",
      "3ds",
      "3g2",
      "3gp",
      "7z",
      "a",
      "aac",
      "adp",
      "afdesign",
      "afphoto",
      "afpub",
      "ai",
      "aif",
      "aiff",
      "alz",
      "ape",
      "apk",
      "appimage",
      "ar",
      "arj",
      "asf",
      "au",
      "avi",
      "bak",
      "baml",
      "bh",
      "bin",
      "bk",
      "bmp",
      "btif",
      "bz2",
      "bzip2",
      "cab",
      "caf",
      "cgm",
      "class",
      "cmx",
      "cpio",
      "cr2",
      "cur",
      "dat",
      "dcm",
      "deb",
      "dex",
      "djvu",
      "dll",
      "dmg",
      "dng",
      "doc",
      "docm",
      "docx",
      "dot",
      "dotm",
      "dra",
      "DS_Store",
      "dsk",
      "dts",
      "dtshd",
      "dvb",
      "dwg",
      "dxf",
      "ecelp4800",
      "ecelp7470",
      "ecelp9600",
      "egg",
      "eol",
      "eot",
      "epub",
      "exe",
      "f4v",
      "fbs",
      "fh",
      "fla",
      "flac",
      "flatpak",
      "fli",
      "flv",
      "fpx",
      "fst",
      "fvt",
      "g3",
      "gh",
      "gif",
      "graffle",
      "gz",
      "gzip",
      "h261",
      "h263",
      "h264",
      "icns",
      "ico",
      "ief",
      "img",
      "ipa",
      "iso",
      "jar",
      "jpeg",
      "jpg",
      "jpgv",
      "jpm",
      "jxr",
      "key",
      "ktx",
      "lha",
      "lib",
      "lvp",
      "lz",
      "lzh",
      "lzma",
      "lzo",
      "m3u",
      "m4a",
      "m4v",
      "mar",
      "mdi",
      "mht",
      "mid",
      "midi",
      "mj2",
      "mka",
      "mkv",
      "mmr",
      "mng",
      "mobi",
      "mov",
      "movie",
      "mp3",
      "mp4",
      "mp4a",
      "mpeg",
      "mpg",
      "mpga",
      "mxu",
      "nef",
      "npx",
      "numbers",
      "nupkg",
      "o",
      "odp",
      "ods",
      "odt",
      "oga",
      "ogg",
      "ogv",
      "otf",
      "ott",
      "pages",
      "pbm",
      "pcx",
      "pdb",
      "pdf",
      "pea",
      "pgm",
      "pic",
      "png",
      "pnm",
      "pot",
      "potm",
      "potx",
      "ppa",
      "ppam",
      "ppm",
      "pps",
      "ppsm",
      "ppsx",
      "ppt",
      "pptm",
      "pptx",
      "psd",
      "pya",
      "pyc",
      "pyo",
      "pyv",
      "qt",
      "rar",
      "ras",
      "raw",
      "resources",
      "rgb",
      "rip",
      "rlc",
      "rmf",
      "rmvb",
      "rpm",
      "rtf",
      "rz",
      "s3m",
      "s7z",
      "scpt",
      "sgi",
      "shar",
      "snap",
      "sil",
      "sketch",
      "slk",
      "smv",
      "snk",
      "so",
      "stl",
      "suo",
      "sub",
      "swf",
      "tar",
      "tbz",
      "tbz2",
      "tga",
      "tgz",
      "thmx",
      "tif",
      "tiff",
      "tlz",
      "ttc",
      "ttf",
      "txz",
      "udf",
      "uvh",
      "uvi",
      "uvm",
      "uvp",
      "uvs",
      "uvu",
      "viv",
      "vob",
      "war",
      "wav",
      "wax",
      "wbmp",
      "wdp",
      "weba",
      "webm",
      "webp",
      "whl",
      "wim",
      "wm",
      "wma",
      "wmv",
      "wmx",
      "woff",
      "woff2",
      "wrm",
      "wvx",
      "xbm",
      "xif",
      "xla",
      "xlam",
      "xls",
      "xlsb",
      "xlsm",
      "xlsx",
      "xlt",
      "xltm",
      "xltx",
      "xm",
      "xmind",
      "xpi",
      "xpm",
      "xwd",
      "xz",
      "z",
      "zip",
      "zipx"
    ]);
    isBinaryPath = (filePath) => binaryExtensions.has(sysPath.extname(filePath).slice(1).toLowerCase());
    foreach = (val, fn) => {
      if (val instanceof Set) {
        val.forEach(fn);
      } else {
        fn(val);
      }
    };
    addAndConvert = (main, prop, item) => {
      let container = main[prop];
      if (!(container instanceof Set)) {
        main[prop] = container = /* @__PURE__ */ new Set([container]);
      }
      container.add(item);
    };
    clearItem = (cont) => (key) => {
      const set = cont[key];
      if (set instanceof Set) {
        set.clear();
      } else {
        delete cont[key];
      }
    };
    delFromSet = (main, prop, item) => {
      const container = main[prop];
      if (container instanceof Set) {
        container.delete(item);
      } else if (container === item) {
        delete main[prop];
      }
    };
    isEmptySet = (val) => val instanceof Set ? val.size === 0 : !val;
    FsWatchInstances = /* @__PURE__ */ new Map();
    fsWatchBroadcast = (fullPath, listenerType, val1, val2, val3) => {
      const cont = FsWatchInstances.get(fullPath);
      if (!cont)
        return;
      foreach(cont[listenerType], (listener) => {
        listener(val1, val2, val3);
      });
    };
    setFsWatchListener = (path7, fullPath, options, handlers) => {
      const { listener, errHandler, rawEmitter } = handlers;
      let cont = FsWatchInstances.get(fullPath);
      let watcher;
      if (!options.persistent) {
        watcher = createFsWatchInstance(path7, options, listener, errHandler, rawEmitter);
        if (!watcher)
          return;
        return watcher.close.bind(watcher);
      }
      if (cont) {
        addAndConvert(cont, KEY_LISTENERS, listener);
        addAndConvert(cont, KEY_ERR, errHandler);
        addAndConvert(cont, KEY_RAW, rawEmitter);
      } else {
        watcher = createFsWatchInstance(
          path7,
          options,
          fsWatchBroadcast.bind(null, fullPath, KEY_LISTENERS),
          errHandler,
          // no need to use broadcast here
          fsWatchBroadcast.bind(null, fullPath, KEY_RAW)
        );
        if (!watcher)
          return;
        watcher.on(EV.ERROR, async (error) => {
          const broadcastErr = fsWatchBroadcast.bind(null, fullPath, KEY_ERR);
          if (cont)
            cont.watcherUnusable = true;
          if (isWindows && error.code === "EPERM") {
            try {
              const fd = await (0, import_promises3.open)(path7, "r");
              await fd.close();
              broadcastErr(error);
            } catch (err) {
            }
          } else {
            broadcastErr(error);
          }
        });
        cont = {
          listeners: listener,
          errHandlers: errHandler,
          rawEmitters: rawEmitter,
          watcher
        };
        FsWatchInstances.set(fullPath, cont);
      }
      return () => {
        delFromSet(cont, KEY_LISTENERS, listener);
        delFromSet(cont, KEY_ERR, errHandler);
        delFromSet(cont, KEY_RAW, rawEmitter);
        if (isEmptySet(cont.listeners)) {
          cont.watcher.close();
          FsWatchInstances.delete(fullPath);
          HANDLER_KEYS.forEach(clearItem(cont));
          cont.watcher = void 0;
          Object.freeze(cont);
        }
      };
    };
    FsWatchFileInstances = /* @__PURE__ */ new Map();
    setFsWatchFileListener = (path7, fullPath, options, handlers) => {
      const { listener, rawEmitter } = handlers;
      let cont = FsWatchFileInstances.get(fullPath);
      const copts = cont && cont.options;
      if (copts && (copts.persistent < options.persistent || copts.interval > options.interval)) {
        (0, import_fs5.unwatchFile)(fullPath);
        cont = void 0;
      }
      if (cont) {
        addAndConvert(cont, KEY_LISTENERS, listener);
        addAndConvert(cont, KEY_RAW, rawEmitter);
      } else {
        cont = {
          listeners: listener,
          rawEmitters: rawEmitter,
          options,
          watcher: (0, import_fs5.watchFile)(fullPath, options, (curr, prev) => {
            foreach(cont.rawEmitters, (rawEmitter2) => {
              rawEmitter2(EV.CHANGE, fullPath, { curr, prev });
            });
            const currmtime = curr.mtimeMs;
            if (curr.size !== prev.size || currmtime > prev.mtimeMs || currmtime === 0) {
              foreach(cont.listeners, (listener2) => listener2(path7, curr));
            }
          })
        };
        FsWatchFileInstances.set(fullPath, cont);
      }
      return () => {
        delFromSet(cont, KEY_LISTENERS, listener);
        delFromSet(cont, KEY_RAW, rawEmitter);
        if (isEmptySet(cont.listeners)) {
          FsWatchFileInstances.delete(fullPath);
          (0, import_fs5.unwatchFile)(fullPath);
          cont.options = cont.watcher = void 0;
          Object.freeze(cont);
        }
      };
    };
    NodeFsHandler = class {
      constructor(fsW) {
        this.fsw = fsW;
        this._boundHandleError = (error) => fsW._handleError(error);
      }
      /**
       * Watch file for changes with fs_watchFile or fs_watch.
       * @param path to file or dir
       * @param listener on fs change
       * @returns closer for the watcher instance
       */
      _watchWithNodeFs(path7, listener) {
        const opts = this.fsw.options;
        const directory = sysPath.dirname(path7);
        const basename3 = sysPath.basename(path7);
        const parent = this.fsw._getWatchedDir(directory);
        parent.add(basename3);
        const absolutePath = sysPath.resolve(path7);
        const options = {
          persistent: opts.persistent
        };
        if (!listener)
          listener = EMPTY_FN;
        let closer;
        if (opts.usePolling) {
          const enableBin = opts.interval !== opts.binaryInterval;
          options.interval = enableBin && isBinaryPath(basename3) ? opts.binaryInterval : opts.interval;
          closer = setFsWatchFileListener(path7, absolutePath, options, {
            listener,
            rawEmitter: this.fsw._emitRaw
          });
        } else {
          closer = setFsWatchListener(path7, absolutePath, options, {
            listener,
            errHandler: this._boundHandleError,
            rawEmitter: this.fsw._emitRaw
          });
        }
        return closer;
      }
      /**
       * Watch a file and emit add event if warranted.
       * @returns closer for the watcher instance
       */
      _handleFile(file, stats, initialAdd) {
        if (this.fsw.closed) {
          return;
        }
        const dirname3 = sysPath.dirname(file);
        const basename3 = sysPath.basename(file);
        const parent = this.fsw._getWatchedDir(dirname3);
        let prevStats = stats;
        if (parent.has(basename3))
          return;
        const listener = async (path7, newStats) => {
          if (!this.fsw._throttle(THROTTLE_MODE_WATCH, file, 5))
            return;
          if (!newStats || newStats.mtimeMs === 0) {
            try {
              const newStats2 = await (0, import_promises3.stat)(file);
              if (this.fsw.closed)
                return;
              const at = newStats2.atimeMs;
              const mt = newStats2.mtimeMs;
              if (!at || at <= mt || mt !== prevStats.mtimeMs) {
                this.fsw._emit(EV.CHANGE, file, newStats2);
              }
              if ((isMacos || isLinux || isFreeBSD) && prevStats.ino !== newStats2.ino) {
                this.fsw._closeFile(path7);
                prevStats = newStats2;
                const closer2 = this._watchWithNodeFs(file, listener);
                if (closer2)
                  this.fsw._addPathCloser(path7, closer2);
              } else {
                prevStats = newStats2;
              }
            } catch (error) {
              this.fsw._remove(dirname3, basename3);
            }
          } else if (parent.has(basename3)) {
            const at = newStats.atimeMs;
            const mt = newStats.mtimeMs;
            if (!at || at <= mt || mt !== prevStats.mtimeMs) {
              this.fsw._emit(EV.CHANGE, file, newStats);
            }
            prevStats = newStats;
          }
        };
        const closer = this._watchWithNodeFs(file, listener);
        if (!(initialAdd && this.fsw.options.ignoreInitial) && this.fsw._isntIgnored(file)) {
          if (!this.fsw._throttle(EV.ADD, file, 0))
            return;
          this.fsw._emit(EV.ADD, file, stats);
        }
        return closer;
      }
      /**
       * Handle symlinks encountered while reading a dir.
       * @param entry returned by readdirp
       * @param directory path of dir being read
       * @param path of this item
       * @param item basename of this item
       * @returns true if no more processing is needed for this entry.
       */
      async _handleSymlink(entry, directory, path7, item) {
        if (this.fsw.closed) {
          return;
        }
        const full = entry.fullPath;
        const dir = this.fsw._getWatchedDir(directory);
        if (!this.fsw.options.followSymlinks) {
          this.fsw._incrReadyCount();
          let linkPath;
          try {
            linkPath = await (0, import_promises3.realpath)(path7);
          } catch (e) {
            this.fsw._emitReady();
            return true;
          }
          if (this.fsw.closed)
            return;
          if (dir.has(item)) {
            if (this.fsw._symlinkPaths.get(full) !== linkPath) {
              this.fsw._symlinkPaths.set(full, linkPath);
              this.fsw._emit(EV.CHANGE, path7, entry.stats);
            }
          } else {
            dir.add(item);
            this.fsw._symlinkPaths.set(full, linkPath);
            this.fsw._emit(EV.ADD, path7, entry.stats);
          }
          this.fsw._emitReady();
          return true;
        }
        if (this.fsw._symlinkPaths.has(full)) {
          return true;
        }
        this.fsw._symlinkPaths.set(full, true);
      }
      _handleRead(directory, initialAdd, wh, target, dir, depth, throttler) {
        directory = sysPath.join(directory, "");
        throttler = this.fsw._throttle("readdir", directory, 1e3);
        if (!throttler)
          return;
        const previous = this.fsw._getWatchedDir(wh.path);
        const current = /* @__PURE__ */ new Set();
        let stream = this.fsw._readdirp(directory, {
          fileFilter: (entry) => wh.filterPath(entry),
          directoryFilter: (entry) => wh.filterDir(entry)
        });
        if (!stream)
          return;
        stream.on(STR_DATA, async (entry) => {
          if (this.fsw.closed) {
            stream = void 0;
            return;
          }
          const item = entry.path;
          let path7 = sysPath.join(directory, item);
          current.add(item);
          if (entry.stats.isSymbolicLink() && await this._handleSymlink(entry, directory, path7, item)) {
            return;
          }
          if (this.fsw.closed) {
            stream = void 0;
            return;
          }
          if (item === target || !target && !previous.has(item)) {
            this.fsw._incrReadyCount();
            path7 = sysPath.join(dir, sysPath.relative(dir, path7));
            this._addToNodeFs(path7, initialAdd, wh, depth + 1);
          }
        }).on(EV.ERROR, this._boundHandleError);
        return new Promise((resolve3, reject) => {
          if (!stream)
            return reject();
          stream.once(STR_END, () => {
            if (this.fsw.closed) {
              stream = void 0;
              return;
            }
            const wasThrottled = throttler ? throttler.clear() : false;
            resolve3(void 0);
            previous.getChildren().filter((item) => {
              return item !== directory && !current.has(item);
            }).forEach((item) => {
              this.fsw._remove(directory, item);
            });
            stream = void 0;
            if (wasThrottled)
              this._handleRead(directory, false, wh, target, dir, depth, throttler);
          });
        });
      }
      /**
       * Read directory to add / remove files from `@watched` list and re-read it on change.
       * @param dir fs path
       * @param stats
       * @param initialAdd
       * @param depth relative to user-supplied path
       * @param target child path targeted for watch
       * @param wh Common watch helpers for this path
       * @param realpath
       * @returns closer for the watcher instance.
       */
      async _handleDir(dir, stats, initialAdd, depth, target, wh, realpath2) {
        const parentDir = this.fsw._getWatchedDir(sysPath.dirname(dir));
        const tracked = parentDir.has(sysPath.basename(dir));
        if (!(initialAdd && this.fsw.options.ignoreInitial) && !target && !tracked) {
          this.fsw._emit(EV.ADD_DIR, dir, stats);
        }
        parentDir.add(sysPath.basename(dir));
        this.fsw._getWatchedDir(dir);
        let throttler;
        let closer;
        const oDepth = this.fsw.options.depth;
        if ((oDepth == null || depth <= oDepth) && !this.fsw._symlinkPaths.has(realpath2)) {
          if (!target) {
            await this._handleRead(dir, initialAdd, wh, target, dir, depth, throttler);
            if (this.fsw.closed)
              return;
          }
          closer = this._watchWithNodeFs(dir, (dirPath, stats2) => {
            if (stats2 && stats2.mtimeMs === 0)
              return;
            this._handleRead(dirPath, false, wh, target, dir, depth, throttler);
          });
        }
        return closer;
      }
      /**
       * Handle added file, directory, or glob pattern.
       * Delegates call to _handleFile / _handleDir after checks.
       * @param path to file or ir
       * @param initialAdd was the file added at watch instantiation?
       * @param priorWh depth relative to user-supplied path
       * @param depth Child path actually targeted for watch
       * @param target Child path actually targeted for watch
       */
      async _addToNodeFs(path7, initialAdd, priorWh, depth, target) {
        const ready = this.fsw._emitReady;
        if (this.fsw._isIgnored(path7) || this.fsw.closed) {
          ready();
          return false;
        }
        const wh = this.fsw._getWatchHelpers(path7);
        if (priorWh) {
          wh.filterPath = (entry) => priorWh.filterPath(entry);
          wh.filterDir = (entry) => priorWh.filterDir(entry);
        }
        try {
          const stats = await statMethods[wh.statMethod](wh.watchPath);
          if (this.fsw.closed)
            return;
          if (this.fsw._isIgnored(wh.watchPath, stats)) {
            ready();
            return false;
          }
          const follow = this.fsw.options.followSymlinks;
          let closer;
          if (stats.isDirectory()) {
            const absPath = sysPath.resolve(path7);
            const targetPath = follow ? await (0, import_promises3.realpath)(path7) : path7;
            if (this.fsw.closed)
              return;
            closer = await this._handleDir(wh.watchPath, stats, initialAdd, depth, target, wh, targetPath);
            if (this.fsw.closed)
              return;
            if (absPath !== targetPath && targetPath !== void 0) {
              this.fsw._symlinkPaths.set(absPath, targetPath);
            }
          } else if (stats.isSymbolicLink()) {
            const targetPath = follow ? await (0, import_promises3.realpath)(path7) : path7;
            if (this.fsw.closed)
              return;
            const parent = sysPath.dirname(wh.watchPath);
            this.fsw._getWatchedDir(parent).add(wh.watchPath);
            this.fsw._emit(EV.ADD, wh.watchPath, stats);
            closer = await this._handleDir(parent, stats, initialAdd, depth, path7, wh, targetPath);
            if (this.fsw.closed)
              return;
            if (targetPath !== void 0) {
              this.fsw._symlinkPaths.set(sysPath.resolve(path7), targetPath);
            }
          } else {
            closer = this._handleFile(wh.watchPath, stats, initialAdd);
          }
          ready();
          if (closer)
            this.fsw._addPathCloser(path7, closer);
          return false;
        } catch (error) {
          if (this.fsw._handleError(error)) {
            ready();
            return path7;
          }
        }
      }
    };
  }
});

// node_modules/chokidar/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  FSWatcher: () => FSWatcher,
  WatchHelper: () => WatchHelper,
  default: () => esm_default,
  watch: () => watch
});
function arrify(item) {
  return Array.isArray(item) ? item : [item];
}
function createPattern(matcher) {
  if (typeof matcher === "function")
    return matcher;
  if (typeof matcher === "string")
    return (string) => matcher === string;
  if (matcher instanceof RegExp)
    return (string) => matcher.test(string);
  if (typeof matcher === "object" && matcher !== null) {
    return (string) => {
      if (matcher.path === string)
        return true;
      if (matcher.recursive) {
        const relative3 = sysPath2.relative(matcher.path, string);
        if (!relative3) {
          return false;
        }
        return !relative3.startsWith("..") && !sysPath2.isAbsolute(relative3);
      }
      return false;
    };
  }
  return () => false;
}
function normalizePath(path7) {
  if (typeof path7 !== "string")
    throw new Error("string expected");
  path7 = sysPath2.normalize(path7);
  path7 = path7.replace(/\\/g, "/");
  let prepend = false;
  if (path7.startsWith("//"))
    prepend = true;
  const DOUBLE_SLASH_RE2 = /\/\//;
  while (path7.match(DOUBLE_SLASH_RE2))
    path7 = path7.replace(DOUBLE_SLASH_RE2, "/");
  if (prepend)
    path7 = "/" + path7;
  return path7;
}
function matchPatterns(patterns, testString, stats) {
  const path7 = normalizePath(testString);
  for (let index = 0; index < patterns.length; index++) {
    const pattern = patterns[index];
    if (pattern(path7, stats)) {
      return true;
    }
  }
  return false;
}
function anymatch(matchers, testString) {
  if (matchers == null) {
    throw new TypeError("anymatch: specify first argument");
  }
  const matchersArray = arrify(matchers);
  const patterns = matchersArray.map((matcher) => createPattern(matcher));
  if (testString == null) {
    return (testString2, stats) => {
      return matchPatterns(patterns, testString2, stats);
    };
  }
  return matchPatterns(patterns, testString);
}
function watch(paths, options = {}) {
  const watcher = new FSWatcher(options);
  watcher.add(paths);
  return watcher;
}
var import_fs6, import_promises4, import_events, sysPath2, SLASH, SLASH_SLASH, ONE_DOT, TWO_DOTS, STRING_TYPE, BACK_SLASH_RE, DOUBLE_SLASH_RE, DOT_RE, REPLACER_RE, isMatcherObject, unifyPaths, toUnix, normalizePathToUnix, normalizeIgnored, getAbsolutePath, EMPTY_SET, DirEntry, STAT_METHOD_F, STAT_METHOD_L, WatchHelper, FSWatcher, esm_default;
var init_esm2 = __esm({
  "node_modules/chokidar/esm/index.js"() {
    "use strict";
    import_fs6 = require("fs");
    import_promises4 = require("fs/promises");
    import_events = require("events");
    sysPath2 = __toESM(require("path"), 1);
    init_esm();
    init_handler();
    SLASH = "/";
    SLASH_SLASH = "//";
    ONE_DOT = ".";
    TWO_DOTS = "..";
    STRING_TYPE = "string";
    BACK_SLASH_RE = /\\/g;
    DOUBLE_SLASH_RE = /\/\//;
    DOT_RE = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/;
    REPLACER_RE = /^\.[/\\]/;
    isMatcherObject = (matcher) => typeof matcher === "object" && matcher !== null && !(matcher instanceof RegExp);
    unifyPaths = (paths_) => {
      const paths = arrify(paths_).flat();
      if (!paths.every((p) => typeof p === STRING_TYPE)) {
        throw new TypeError(`Non-string provided as watch path: ${paths}`);
      }
      return paths.map(normalizePathToUnix);
    };
    toUnix = (string) => {
      let str = string.replace(BACK_SLASH_RE, SLASH);
      let prepend = false;
      if (str.startsWith(SLASH_SLASH)) {
        prepend = true;
      }
      while (str.match(DOUBLE_SLASH_RE)) {
        str = str.replace(DOUBLE_SLASH_RE, SLASH);
      }
      if (prepend) {
        str = SLASH + str;
      }
      return str;
    };
    normalizePathToUnix = (path7) => toUnix(sysPath2.normalize(toUnix(path7)));
    normalizeIgnored = (cwd = "") => (path7) => {
      if (typeof path7 === "string") {
        return normalizePathToUnix(sysPath2.isAbsolute(path7) ? path7 : sysPath2.join(cwd, path7));
      } else {
        return path7;
      }
    };
    getAbsolutePath = (path7, cwd) => {
      if (sysPath2.isAbsolute(path7)) {
        return path7;
      }
      return sysPath2.join(cwd, path7);
    };
    EMPTY_SET = Object.freeze(/* @__PURE__ */ new Set());
    DirEntry = class {
      constructor(dir, removeWatcher) {
        this.path = dir;
        this._removeWatcher = removeWatcher;
        this.items = /* @__PURE__ */ new Set();
      }
      add(item) {
        const { items } = this;
        if (!items)
          return;
        if (item !== ONE_DOT && item !== TWO_DOTS)
          items.add(item);
      }
      async remove(item) {
        const { items } = this;
        if (!items)
          return;
        items.delete(item);
        if (items.size > 0)
          return;
        const dir = this.path;
        try {
          await (0, import_promises4.readdir)(dir);
        } catch (err) {
          if (this._removeWatcher) {
            this._removeWatcher(sysPath2.dirname(dir), sysPath2.basename(dir));
          }
        }
      }
      has(item) {
        const { items } = this;
        if (!items)
          return;
        return items.has(item);
      }
      getChildren() {
        const { items } = this;
        if (!items)
          return [];
        return [...items.values()];
      }
      dispose() {
        this.items.clear();
        this.path = "";
        this._removeWatcher = EMPTY_FN;
        this.items = EMPTY_SET;
        Object.freeze(this);
      }
    };
    STAT_METHOD_F = "stat";
    STAT_METHOD_L = "lstat";
    WatchHelper = class {
      constructor(path7, follow, fsw) {
        this.fsw = fsw;
        const watchPath = path7;
        this.path = path7 = path7.replace(REPLACER_RE, "");
        this.watchPath = watchPath;
        this.fullWatchPath = sysPath2.resolve(watchPath);
        this.dirParts = [];
        this.dirParts.forEach((parts) => {
          if (parts.length > 1)
            parts.pop();
        });
        this.followSymlinks = follow;
        this.statMethod = follow ? STAT_METHOD_F : STAT_METHOD_L;
      }
      entryPath(entry) {
        return sysPath2.join(this.watchPath, sysPath2.relative(this.watchPath, entry.fullPath));
      }
      filterPath(entry) {
        const { stats } = entry;
        if (stats && stats.isSymbolicLink())
          return this.filterDir(entry);
        const resolvedPath = this.entryPath(entry);
        return this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
      }
      filterDir(entry) {
        return this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
      }
    };
    FSWatcher = class extends import_events.EventEmitter {
      // Not indenting methods for history sake; for now.
      constructor(_opts = {}) {
        super();
        this.closed = false;
        this._closers = /* @__PURE__ */ new Map();
        this._ignoredPaths = /* @__PURE__ */ new Set();
        this._throttled = /* @__PURE__ */ new Map();
        this._streams = /* @__PURE__ */ new Set();
        this._symlinkPaths = /* @__PURE__ */ new Map();
        this._watched = /* @__PURE__ */ new Map();
        this._pendingWrites = /* @__PURE__ */ new Map();
        this._pendingUnlinks = /* @__PURE__ */ new Map();
        this._readyCount = 0;
        this._readyEmitted = false;
        const awf = _opts.awaitWriteFinish;
        const DEF_AWF = { stabilityThreshold: 2e3, pollInterval: 100 };
        const opts = {
          // Defaults
          persistent: true,
          ignoreInitial: false,
          ignorePermissionErrors: false,
          interval: 100,
          binaryInterval: 300,
          followSymlinks: true,
          usePolling: false,
          // useAsync: false,
          atomic: true,
          // NOTE: overwritten later (depends on usePolling)
          ..._opts,
          // Change format
          ignored: _opts.ignored ? arrify(_opts.ignored) : arrify([]),
          awaitWriteFinish: awf === true ? DEF_AWF : typeof awf === "object" ? { ...DEF_AWF, ...awf } : false
        };
        if (isIBMi)
          opts.usePolling = true;
        if (opts.atomic === void 0)
          opts.atomic = !opts.usePolling;
        const envPoll = process.env.CHOKIDAR_USEPOLLING;
        if (envPoll !== void 0) {
          const envLower = envPoll.toLowerCase();
          if (envLower === "false" || envLower === "0")
            opts.usePolling = false;
          else if (envLower === "true" || envLower === "1")
            opts.usePolling = true;
          else
            opts.usePolling = !!envLower;
        }
        const envInterval = process.env.CHOKIDAR_INTERVAL;
        if (envInterval)
          opts.interval = Number.parseInt(envInterval, 10);
        let readyCalls = 0;
        this._emitReady = () => {
          readyCalls++;
          if (readyCalls >= this._readyCount) {
            this._emitReady = EMPTY_FN;
            this._readyEmitted = true;
            process.nextTick(() => this.emit(EVENTS.READY));
          }
        };
        this._emitRaw = (...args) => this.emit(EVENTS.RAW, ...args);
        this._boundRemove = this._remove.bind(this);
        this.options = opts;
        this._nodeFsHandler = new NodeFsHandler(this);
        Object.freeze(opts);
      }
      _addIgnoredPath(matcher) {
        if (isMatcherObject(matcher)) {
          for (const ignored of this._ignoredPaths) {
            if (isMatcherObject(ignored) && ignored.path === matcher.path && ignored.recursive === matcher.recursive) {
              return;
            }
          }
        }
        this._ignoredPaths.add(matcher);
      }
      _removeIgnoredPath(matcher) {
        this._ignoredPaths.delete(matcher);
        if (typeof matcher === "string") {
          for (const ignored of this._ignoredPaths) {
            if (isMatcherObject(ignored) && ignored.path === matcher) {
              this._ignoredPaths.delete(ignored);
            }
          }
        }
      }
      // Public methods
      /**
       * Adds paths to be watched on an existing FSWatcher instance.
       * @param paths_ file or file list. Other arguments are unused
       */
      add(paths_, _origAdd, _internal) {
        const { cwd } = this.options;
        this.closed = false;
        this._closePromise = void 0;
        let paths = unifyPaths(paths_);
        if (cwd) {
          paths = paths.map((path7) => {
            const absPath = getAbsolutePath(path7, cwd);
            return absPath;
          });
        }
        paths.forEach((path7) => {
          this._removeIgnoredPath(path7);
        });
        this._userIgnored = void 0;
        if (!this._readyCount)
          this._readyCount = 0;
        this._readyCount += paths.length;
        Promise.all(paths.map(async (path7) => {
          const res = await this._nodeFsHandler._addToNodeFs(path7, !_internal, void 0, 0, _origAdd);
          if (res)
            this._emitReady();
          return res;
        })).then((results) => {
          if (this.closed)
            return;
          results.forEach((item) => {
            if (item)
              this.add(sysPath2.dirname(item), sysPath2.basename(_origAdd || item));
          });
        });
        return this;
      }
      /**
       * Close watchers or start ignoring events from specified paths.
       */
      unwatch(paths_) {
        if (this.closed)
          return this;
        const paths = unifyPaths(paths_);
        const { cwd } = this.options;
        paths.forEach((path7) => {
          if (!sysPath2.isAbsolute(path7) && !this._closers.has(path7)) {
            if (cwd)
              path7 = sysPath2.join(cwd, path7);
            path7 = sysPath2.resolve(path7);
          }
          this._closePath(path7);
          this._addIgnoredPath(path7);
          if (this._watched.has(path7)) {
            this._addIgnoredPath({
              path: path7,
              recursive: true
            });
          }
          this._userIgnored = void 0;
        });
        return this;
      }
      /**
       * Close watchers and remove all listeners from watched paths.
       */
      close() {
        if (this._closePromise) {
          return this._closePromise;
        }
        this.closed = true;
        this.removeAllListeners();
        const closers = [];
        this._closers.forEach((closerList) => closerList.forEach((closer) => {
          const promise = closer();
          if (promise instanceof Promise)
            closers.push(promise);
        }));
        this._streams.forEach((stream) => stream.destroy());
        this._userIgnored = void 0;
        this._readyCount = 0;
        this._readyEmitted = false;
        this._watched.forEach((dirent) => dirent.dispose());
        this._closers.clear();
        this._watched.clear();
        this._streams.clear();
        this._symlinkPaths.clear();
        this._throttled.clear();
        this._closePromise = closers.length ? Promise.all(closers).then(() => void 0) : Promise.resolve();
        return this._closePromise;
      }
      /**
       * Expose list of watched paths
       * @returns for chaining
       */
      getWatched() {
        const watchList = {};
        this._watched.forEach((entry, dir) => {
          const key = this.options.cwd ? sysPath2.relative(this.options.cwd, dir) : dir;
          const index = key || ONE_DOT;
          watchList[index] = entry.getChildren().sort();
        });
        return watchList;
      }
      emitWithAll(event, args) {
        this.emit(event, ...args);
        if (event !== EVENTS.ERROR)
          this.emit(EVENTS.ALL, event, ...args);
      }
      // Common helpers
      // --------------
      /**
       * Normalize and emit events.
       * Calling _emit DOES NOT MEAN emit() would be called!
       * @param event Type of event
       * @param path File or directory path
       * @param stats arguments to be passed with event
       * @returns the error if defined, otherwise the value of the FSWatcher instance's `closed` flag
       */
      async _emit(event, path7, stats) {
        if (this.closed)
          return;
        const opts = this.options;
        if (isWindows)
          path7 = sysPath2.normalize(path7);
        if (opts.cwd)
          path7 = sysPath2.relative(opts.cwd, path7);
        const args = [path7];
        if (stats != null)
          args.push(stats);
        const awf = opts.awaitWriteFinish;
        let pw;
        if (awf && (pw = this._pendingWrites.get(path7))) {
          pw.lastChange = /* @__PURE__ */ new Date();
          return this;
        }
        if (opts.atomic) {
          if (event === EVENTS.UNLINK) {
            this._pendingUnlinks.set(path7, [event, ...args]);
            setTimeout(() => {
              this._pendingUnlinks.forEach((entry, path8) => {
                this.emit(...entry);
                this.emit(EVENTS.ALL, ...entry);
                this._pendingUnlinks.delete(path8);
              });
            }, typeof opts.atomic === "number" ? opts.atomic : 100);
            return this;
          }
          if (event === EVENTS.ADD && this._pendingUnlinks.has(path7)) {
            event = EVENTS.CHANGE;
            this._pendingUnlinks.delete(path7);
          }
        }
        if (awf && (event === EVENTS.ADD || event === EVENTS.CHANGE) && this._readyEmitted) {
          const awfEmit = (err, stats2) => {
            if (err) {
              event = EVENTS.ERROR;
              args[0] = err;
              this.emitWithAll(event, args);
            } else if (stats2) {
              if (args.length > 1) {
                args[1] = stats2;
              } else {
                args.push(stats2);
              }
              this.emitWithAll(event, args);
            }
          };
          this._awaitWriteFinish(path7, awf.stabilityThreshold, event, awfEmit);
          return this;
        }
        if (event === EVENTS.CHANGE) {
          const isThrottled = !this._throttle(EVENTS.CHANGE, path7, 50);
          if (isThrottled)
            return this;
        }
        if (opts.alwaysStat && stats === void 0 && (event === EVENTS.ADD || event === EVENTS.ADD_DIR || event === EVENTS.CHANGE)) {
          const fullPath = opts.cwd ? sysPath2.join(opts.cwd, path7) : path7;
          let stats2;
          try {
            stats2 = await (0, import_promises4.stat)(fullPath);
          } catch (err) {
          }
          if (!stats2 || this.closed)
            return;
          args.push(stats2);
        }
        this.emitWithAll(event, args);
        return this;
      }
      /**
       * Common handler for errors
       * @returns The error if defined, otherwise the value of the FSWatcher instance's `closed` flag
       */
      _handleError(error) {
        const code = error && error.code;
        if (error && code !== "ENOENT" && code !== "ENOTDIR" && (!this.options.ignorePermissionErrors || code !== "EPERM" && code !== "EACCES")) {
          this.emit(EVENTS.ERROR, error);
        }
        return error || this.closed;
      }
      /**
       * Helper utility for throttling
       * @param actionType type being throttled
       * @param path being acted upon
       * @param timeout duration of time to suppress duplicate actions
       * @returns tracking object or false if action should be suppressed
       */
      _throttle(actionType, path7, timeout) {
        if (!this._throttled.has(actionType)) {
          this._throttled.set(actionType, /* @__PURE__ */ new Map());
        }
        const action = this._throttled.get(actionType);
        if (!action)
          throw new Error("invalid throttle");
        const actionPath = action.get(path7);
        if (actionPath) {
          actionPath.count++;
          return false;
        }
        let timeoutObject;
        const clear = () => {
          const item = action.get(path7);
          const count = item ? item.count : 0;
          action.delete(path7);
          clearTimeout(timeoutObject);
          if (item)
            clearTimeout(item.timeoutObject);
          return count;
        };
        timeoutObject = setTimeout(clear, timeout);
        const thr = { timeoutObject, clear, count: 0 };
        action.set(path7, thr);
        return thr;
      }
      _incrReadyCount() {
        return this._readyCount++;
      }
      /**
       * Awaits write operation to finish.
       * Polls a newly created file for size variations. When files size does not change for 'threshold' milliseconds calls callback.
       * @param path being acted upon
       * @param threshold Time in milliseconds a file size must be fixed before acknowledging write OP is finished
       * @param event
       * @param awfEmit Callback to be called when ready for event to be emitted.
       */
      _awaitWriteFinish(path7, threshold, event, awfEmit) {
        const awf = this.options.awaitWriteFinish;
        if (typeof awf !== "object")
          return;
        const pollInterval = awf.pollInterval;
        let timeoutHandler;
        let fullPath = path7;
        if (this.options.cwd && !sysPath2.isAbsolute(path7)) {
          fullPath = sysPath2.join(this.options.cwd, path7);
        }
        const now = /* @__PURE__ */ new Date();
        const writes = this._pendingWrites;
        function awaitWriteFinishFn(prevStat) {
          (0, import_fs6.stat)(fullPath, (err, curStat) => {
            if (err || !writes.has(path7)) {
              if (err && err.code !== "ENOENT")
                awfEmit(err);
              return;
            }
            const now2 = Number(/* @__PURE__ */ new Date());
            if (prevStat && curStat.size !== prevStat.size) {
              writes.get(path7).lastChange = now2;
            }
            const pw = writes.get(path7);
            const df = now2 - pw.lastChange;
            if (df >= threshold) {
              writes.delete(path7);
              awfEmit(void 0, curStat);
            } else {
              timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval, curStat);
            }
          });
        }
        if (!writes.has(path7)) {
          writes.set(path7, {
            lastChange: now,
            cancelWait: () => {
              writes.delete(path7);
              clearTimeout(timeoutHandler);
              return event;
            }
          });
          timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval);
        }
      }
      /**
       * Determines whether user has asked to ignore this path.
       */
      _isIgnored(path7, stats) {
        if (this.options.atomic && DOT_RE.test(path7))
          return true;
        if (!this._userIgnored) {
          const { cwd } = this.options;
          const ign = this.options.ignored;
          const ignored = (ign || []).map(normalizeIgnored(cwd));
          const ignoredPaths = [...this._ignoredPaths];
          const list = [...ignoredPaths.map(normalizeIgnored(cwd)), ...ignored];
          this._userIgnored = anymatch(list, void 0);
        }
        return this._userIgnored(path7, stats);
      }
      _isntIgnored(path7, stat4) {
        return !this._isIgnored(path7, stat4);
      }
      /**
       * Provides a set of common helpers and properties relating to symlink handling.
       * @param path file or directory pattern being watched
       */
      _getWatchHelpers(path7) {
        return new WatchHelper(path7, this.options.followSymlinks, this);
      }
      // Directory helpers
      // -----------------
      /**
       * Provides directory tracking objects
       * @param directory path of the directory
       */
      _getWatchedDir(directory) {
        const dir = sysPath2.resolve(directory);
        if (!this._watched.has(dir))
          this._watched.set(dir, new DirEntry(dir, this._boundRemove));
        return this._watched.get(dir);
      }
      // File helpers
      // ------------
      /**
       * Check for read permissions: https://stackoverflow.com/a/11781404/1358405
       */
      _hasReadPermissions(stats) {
        if (this.options.ignorePermissionErrors)
          return true;
        return Boolean(Number(stats.mode) & 256);
      }
      /**
       * Handles emitting unlink events for
       * files and directories, and via recursion, for
       * files and directories within directories that are unlinked
       * @param directory within which the following item is located
       * @param item      base path of item/directory
       */
      _remove(directory, item, isDirectory) {
        const path7 = sysPath2.join(directory, item);
        const fullPath = sysPath2.resolve(path7);
        isDirectory = isDirectory != null ? isDirectory : this._watched.has(path7) || this._watched.has(fullPath);
        if (!this._throttle("remove", path7, 100))
          return;
        if (!isDirectory && this._watched.size === 1) {
          this.add(directory, item, true);
        }
        const wp = this._getWatchedDir(path7);
        const nestedDirectoryChildren = wp.getChildren();
        nestedDirectoryChildren.forEach((nested) => this._remove(path7, nested));
        const parent = this._getWatchedDir(directory);
        const wasTracked = parent.has(item);
        parent.remove(item);
        if (this._symlinkPaths.has(fullPath)) {
          this._symlinkPaths.delete(fullPath);
        }
        let relPath = path7;
        if (this.options.cwd)
          relPath = sysPath2.relative(this.options.cwd, path7);
        if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
          const event = this._pendingWrites.get(relPath).cancelWait();
          if (event === EVENTS.ADD)
            return;
        }
        this._watched.delete(path7);
        this._watched.delete(fullPath);
        const eventName = isDirectory ? EVENTS.UNLINK_DIR : EVENTS.UNLINK;
        if (wasTracked && !this._isIgnored(path7))
          this._emit(eventName, path7);
        this._closePath(path7);
      }
      /**
       * Closes all watchers for a path
       */
      _closePath(path7) {
        this._closeFile(path7);
        const dir = sysPath2.dirname(path7);
        this._getWatchedDir(dir).remove(sysPath2.basename(path7));
      }
      /**
       * Closes only file-specific watchers
       */
      _closeFile(path7) {
        const closers = this._closers.get(path7);
        if (!closers)
          return;
        closers.forEach((closer) => closer());
        this._closers.delete(path7);
      }
      _addPathCloser(path7, closer) {
        if (!closer)
          return;
        let list = this._closers.get(path7);
        if (!list) {
          list = [];
          this._closers.set(path7, list);
        }
        list.push(closer);
      }
      _readdirp(root, opts) {
        if (this.closed)
          return;
        const options = { type: EVENTS.ALL, alwaysStat: true, lstat: true, ...opts, depth: 0 };
        let stream = readdirp(root, options);
        this._streams.add(stream);
        stream.once(STR_CLOSE, () => {
          stream = void 0;
        });
        stream.once(STR_END, () => {
          if (stream) {
            this._streams.delete(stream);
            stream = void 0;
          }
        });
        return stream;
      }
    };
    esm_default = { watch, FSWatcher };
  }
});

// src/index.ts
var import_commander = require("commander");

// src/core/dmmf-loader.ts
var import_internals = require("@prisma/internals");
var import_promises = __toESM(require("fs/promises"));
var import_path = __toESM(require("path"));
async function loadDMMF(schemaPath) {
  const resolvedPath = schemaPath || import_path.default.join(process.cwd(), "prisma/schema.prisma");
  const schema = await import_promises.default.readFile(resolvedPath, "utf-8");
  const dmmf = await (0, import_internals.getDMMF)({
    datamodel: schema
  });
  return dmmf;
}

// src/core/metadata-builder.ts
function mapPrismaType(field) {
  if (field.kind === "object") return "relation";
  if (field.kind === "enum") return "enum";
  switch (field.type) {
    case "String":
      return "string";
    case "Int":
    case "Float":
    case "Decimal":
      return "number";
    case "Boolean":
      return "boolean";
    case "DateTime":
      return "date";
    default:
      return "string";
  }
}
function buildMetadata(dmmf, config) {
  const models = dmmf.datamodel.models.map((model) => {
    const modelConfig = config.models?.[model.name];
    const fields = model.fields.map((field) => {
      const fieldConfig = modelConfig?.fields?.[field.name] || {};
      return {
        name: field.name,
        type: mapPrismaType(field),
        required: field.isRequired,
        isArray: field.isList,
        isId: field.isId,
        isUnique: field.isUnique,
        relation: field.kind === "object" ? { model: field.type } : void 0,
        enumName: field.kind === "enum" ? field.type : void 0,
        config: fieldConfig
      };
    });
    return {
      name: model.name,
      fields
    };
  });
  const enums = dmmf.datamodel.enums.map((e) => ({
    name: e.name,
    values: e.values.map((v) => v.name)
  }));
  return { models, enums };
}

// src/core/config-loader.ts
var import_path2 = __toESM(require("path"));
async function loadConfig() {
  const configPath = import_path2.default.join(process.cwd(), "nestjs-prisma.config.ts");
  try {
    const mod = await import(configPath);
    return mod.default || {};
  } catch {
    return {};
  }
}

// src/generators/enum.generator.ts
var import_ts_morph = require("ts-morph");
var import_path3 = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
function generateEnums(enums, outputDir) {
  const project = new import_ts_morph.Project();
  const enumDir = import_path3.default.join(outputDir, "enums");
  import_fs.default.mkdirSync(enumDir, { recursive: true });
  enums.forEach((e) => {
    const filePath = import_path3.default.join(enumDir, `${e.name}.enum.ts`);
    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true
    });
    sourceFile.addEnum({
      name: e.name,
      isExported: true,
      members: e.values.map((v) => ({
        name: v,
        value: v
      }))
    });
  });
  project.saveSync();
}

// src/generators/create-dto.generator.ts
var import_ts_morph2 = require("ts-morph");
var import_path4 = __toESM(require("path"));
var import_fs2 = __toESM(require("fs"));

// src/utils/map-ts-type.util.ts
function mapTsType(field) {
  if (field.type === "enum") {
    return field.enumName;
  }
  switch (field.type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "date":
      return "Date";
    default:
      return "any";
  }
}

// src/utils/build-decorator.util.ts
function buildDecorators(field) {
  const decorators = [];
  if (field.type === "enum") {
    decorators.push({
      name: field.required ? "ApiProperty" : "ApiPropertyOptional",
      arguments: [`{ enum: ${field.enumName} }`]
    });
  } else {
    decorators.push({
      name: field.required ? "ApiProperty" : "ApiPropertyOptional",
      arguments: []
    });
  }
  if (field.type === "enum") {
    decorators.push({
      name: "IsEnum",
      arguments: [field.enumName]
    });
  } else {
    switch (field.type) {
      case "string":
        decorators.push({ name: "IsString", arguments: [] });
        break;
      case "number":
        decorators.push({ name: "IsInt", arguments: [] });
        break;
      case "boolean":
        decorators.push({ name: "IsBoolean", arguments: [] });
        break;
      case "date":
        decorators.push({ name: "IsDate", arguments: [] });
        break;
    }
  }
  if (!field.required) {
    decorators.push({ name: "IsOptional", arguments: [] });
  }
  return decorators;
}

// src/generators/create-dto.generator.ts
function generateCreateDTO(models, outputDir) {
  const project = new import_ts_morph2.Project({
    manipulationSettings: {
      quoteKind: import_ts_morph2.QuoteKind.Double
    }
  });
  models.forEach((model) => {
    const filePath = import_path4.default.join(
      outputDir,
      model.name.toLowerCase(),
      `create-${model.name.toLowerCase()}.dto.ts`
    );
    import_fs2.default.mkdirSync(import_path4.default.dirname(filePath), { recursive: true });
    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true
    });
    const enumImports = /* @__PURE__ */ new Set();
    model.fields.forEach((f) => {
      if (f.type === "enum" && f.enumName) {
        enumImports.add(f.enumName);
      }
    });
    if (enumImports.size > 0) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: `../enums`,
        namedImports: Array.from(enumImports)
      });
    }
    const validatorImports = /* @__PURE__ */ new Set([
      "IsString",
      "IsInt",
      "IsBoolean",
      "IsDate",
      "IsOptional",
      "IsEnum"
    ]);
    sourceFile.addImportDeclarations([
      {
        moduleSpecifier: "@nestjs/swagger",
        namedImports: ["ApiProperty", "ApiPropertyOptional"]
      },
      {
        moduleSpecifier: "class-validator",
        namedImports: Array.from(validatorImports)
      }
    ]);
    sourceFile.addClass({
      name: `Create${model.name}Dto`,
      isExported: true,
      properties: model.fields.filter((f) => !f.isId && f.type !== "relation").map((field) => ({
        kind: import_ts_morph2.StructureKind.Property,
        name: field.name,
        hasQuestionToken: !field.required,
        type: mapTsType(field.type),
        decorators: buildDecorators(field)
      }))
    });
  });
  project.saveSync();
}

// src/generators/update-dto.generator.ts
var import_ts_morph3 = require("ts-morph");
var import_path5 = __toESM(require("path"));
var import_fs3 = __toESM(require("fs"));
function generateUpdateDTO(models, outputDir) {
  const project = new import_ts_morph3.Project({
    manipulationSettings: {
      quoteKind: import_ts_morph3.QuoteKind.Double
    }
  });
  models.forEach((model) => {
    const folder = import_path5.default.join(outputDir, model.name.toLowerCase());
    const filePath = import_path5.default.join(
      folder,
      `update-${model.name.toLowerCase()}.dto.ts`
    );
    import_fs3.default.mkdirSync(folder, { recursive: true });
    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true
    });
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@nestjs/mapped-types",
      namedImports: ["PartialType"]
    });
    sourceFile.addImportDeclaration({
      moduleSpecifier: `./create-${model.name.toLowerCase()}.dto`,
      namedImports: [`Create${model.name}Dto`]
    });
    sourceFile.addClass({
      name: `Update${model.name}Dto`,
      isExported: true,
      extends: `PartialType(Create${model.name}Dto)`
    });
  });
  project.saveSync();
}

// src/generators/response-dto.generator.ts
var import_ts_morph4 = require("ts-morph");
var import_path6 = __toESM(require("path"));
var import_fs4 = __toESM(require("fs"));

// src/utils/build-swagger-decorator.util.ts
function buildSwaggerDecorator(field) {
  if (field.type === "enum") {
    return [
      {
        name: field.required ? "ApiProperty" : "ApiPropertyOptional",
        arguments: [`{ enum: ${field.enumName} }`]
      }
    ];
  }
  return [
    {
      name: field.required ? "ApiProperty" : "ApiPropertyOptional",
      arguments: []
    }
  ];
}

// src/generators/response-dto.generator.ts
function generateResponseDTO(models, outputDir) {
  const project = new import_ts_morph4.Project();
  models.forEach((model) => {
    const folder = import_path6.default.join(outputDir, model.name.toLowerCase());
    const filePath = import_path6.default.join(
      folder,
      `${model.name.toLowerCase()}.response.dto.ts`
    );
    import_fs4.default.mkdirSync(folder, { recursive: true });
    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true
    });
    sourceFile.addImportDeclarations([
      {
        moduleSpecifier: "@nestjs/swagger",
        namedImports: ["ApiProperty", "ApiPropertyOptional"]
      },
      {
        moduleSpecifier: "class-transformer",
        namedImports: ["Expose"]
      }
    ]);
    const enumImports = /* @__PURE__ */ new Set();
    model.fields.forEach((f) => {
      if (f.type === "enum" && f.enumName) {
        enumImports.add(f.enumName);
      }
    });
    if (enumImports.size > 0) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: `../enums`,
        namedImports: Array.from(enumImports)
      });
    }
    sourceFile.addClass({
      name: `${model.name}ResponseDto`,
      isExported: true,
      decorators: [
        {
          name: "Exclude",
          arguments: []
        }
      ],
      properties: model.fields.filter((f) => f.type !== "relation").map((field) => ({
        kind: import_ts_morph4.StructureKind.Property,
        name: field.name,
        hasQuestionToken: !field.required,
        type: mapTsType(field),
        decorators: [
          {
            name: "Expose",
            arguments: []
          },
          ...buildSwaggerDecorator(field)
        ]
      }))
    });
  });
  project.saveSync();
}

// src/index.ts
var program = new import_commander.Command();
program.name("nestjs-prisma-gen").description("Generate DTOs from Prisma schema").version("0.1.0");
program.command("generate").option("-o, --output <path>", "Output directory", "src/generated").option("-m, --models <models>", "Comma separated model names").option("-w, --watch", "Watch schema and regenerate").action(async (options) => {
  const run = async () => {
    const dmmf = await loadDMMF();
    const config = await loadConfig();
    const meta = buildMetadata(dmmf, config);
    let models = meta.models;
    if (options.models) {
      const selected = options.models.split(",").map((m) => m.trim());
      models = models.filter((m) => selected.includes(m.name));
    }
    console.log(
      `Generating DTOs for: ${models.map((m) => m.name).join(", ")}`
    );
    generateEnums(meta.enums, options.output);
    generateCreateDTO(models, options.output);
    generateUpdateDTO(models, options.output);
    generateResponseDTO(models, options.output);
    console.log("\u2705 Generation complete");
  };
  await run();
  if (options.watch) {
    console.log("\u{1F440} Watching for changes...");
    const chokidar = await Promise.resolve().then(() => (init_esm2(), esm_exports));
    const watcher = chokidar.watch("prisma/schema.prisma", {
      ignoreInitial: true
    });
    watcher.on("change", async () => {
      console.log("\u{1F504} Schema changed. Regenerating...");
      await run();
    });
  }
});
program.parse();
/*! Bundled license information:

chokidar/esm/index.js:
  (*! chokidar - MIT License (c) 2012 Paul Miller (paulmillr.com) *)
*/
