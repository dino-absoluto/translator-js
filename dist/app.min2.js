"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var __chunk_1=require("./chunk-2618d45d.js");require("path"),require("fs"),require("filenamify"),require("make-dir"),require("chalk"),require("readline"),require("util");const engines=Promise.all([Promise.resolve(require("./app.min3.js")),Promise.resolve(require("./app.min4.js"))].map(e=>e.then(e=>e.default)));var index=async e=>{const r=__chunk_1.Series.parseMeta(e),i=(async()=>{for(const e of await engines)if(e.test(r.sourceURL))return new e(r,!0)})();if(!i)throw new Error("Failed to find a matching engine");return i};exports.default=index;
//# sourceMappingURL=app.min2.js.map