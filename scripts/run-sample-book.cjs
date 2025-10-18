const Module = require("module");
const path = require("path");

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    const resolvedRequest = path.join(process.cwd(), ".generated", request.slice(2));
    return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require(path.join(process.cwd(), ".generated", "scripts", "generate-sample-book.js"));
