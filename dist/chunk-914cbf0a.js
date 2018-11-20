"use strict";function _interopDefault(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var crypto=_interopDefault(require("crypto")),gotBase=_interopDefault(require("got")),mime=_interopDefault(require("mime-types")),jsdom=require("jsdom");const hash=e=>{return crypto.createHash("sha256").update(e,"utf8").digest("base64")},replaceImages=(e,t)=>{let r=[];for(const a of e.querySelectorAll(t)){let t=e.createTextNode(`![](${a.src})`);a.parentNode.replaceChild(t,a),r.push(a.src)}return r},getExternal=async(e={})=>{const{prefix:t,oldFiles:r,files:a,urls:n}=e,i=a.length,o=e.got||gotBase;let s=n.map(async(e,a)=>{const n=async()=>{let{body:r,headers:n}=await o(e,{encoding:null});return{content:r,fname:`${t} image ${String(a+1).padStart(2,"0")}.${mime.extension(n["content-type"])||"jpg"}`}};let s=r&&r[a+i];if(s&&s.fname&&s.integrity&&s.integrity===e)return{fname:s.fname,integrity:e,buffer:async()=>(await n()).content};let{fname:l,content:f}=await n();return{fname:l,integrity:e,buffer:f}}),l=await Promise.all(s);for(const e of l)a.push(e)};var toFiles=async(e,t)=>{const r=e.got||gotBase,a=e.files;if(e.buffer&&!e.doc)return[{fname:`${e.prefix} ${e.title}.txt`,integity:void 0,buffer:e.buffer}];let n=e.doc;if(!n){if(!e.sourceURL)return;n=await(async()=>{let{window:{document:t}}=new jsdom.JSDOM((await r(e.sourceURL)).body,{url:e.sourceURL});return t})()}let[i,o]=await t(n,{getImages:replaceImages.bind(null,n)});return await getExternal({prefix:e.prefix,oldFiles:a,files:i,urls:o,got:r}),i};exports.hash=hash,exports.toFiles=toFiles;
//# sourceMappingURL=chunk-914cbf0a.js.map
