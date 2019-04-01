"use strict";function _interopDefault(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var chalk=_interopDefault(require("chalk")),path=_interopDefault(require("path")),fs=_interopDefault(require("fs")),filenamify=_interopDefault(require("filenamify")),makeDir=_interopDefault(require("make-dir")),readline=_interopDefault(require("readline")),util=_interopDefault(require("util")),cliTrunctate=_interopDefault(require("cli-truncate")),gotBase=_interopDefault(require("got")),cookie=_interopDefault(require("cookie")),jsdom=require("jsdom"),crypto=_interopDefault(require("crypto")),mime=_interopDefault(require("mime-types"));class Patch{constructor(e={}){e=Object.assign({},e),Object.defineProperties(this,{props:{writable:!0,value:e}})}async patch(e,t=!0){if("object"!=typeof e)return;let s=new this.constructor(Object.assign({},this.props,{last:this,patch:e}));return t&&await s.run(),s}async run(){const{props:e}=this,{last:t,patch:s}=e;delete e.last,delete e.patch,s&&(await this.shouldUpdate(t,s)?(await this.willUpdate(t,s),this.props=Object.assign({},this.props,s),await this.update(t),await this.didUpdate()):this.props=Object.assign({},this.props,s))}async isPending(){const{props:e}=this;return!(!e.patch||!await this.shouldUpdate(e.last,e.patch))}shouldUpdate(e,t){return!(!t||0===Object.getOwnPropertyNames(t).length)}willUpdate(e,t){}update(e){}didUpdate(){}}class FileInfo{constructor(e){const{chapter:t}=e;Object.defineProperties(this,{chapter:{value:t},integrity:{enumerable:!0,value:e.integrity},fname:{enumerable:!0,value:e.fname},buffer:{writable:!0,value:e.buffer}})}get relative(){return path.join(this.chapter.dirRelative,this.fname)}get absolute(){return path.join(this.chapter.dirAbsolute,this.fname)}exists(){try{return fs.accessSync(this.absolute),!0}catch(e){return!1}}async write(e=!1){this.buffer&&("function"==typeof this.buffer&&(this.buffer=await this.buffer()),fs.writeFileSync(this.absolute,await this.buffer,{flag:e?"w":"wx"}))}remove(e=!1){const{relative:t}=this;t.length>0&&"string"==typeof t&&fs.unlinkSync(this.absolute)}}class Chapter extends Patch{constructor(e){super(e),this.props.files=e.files&&e.files.map((e,t)=>new FileInfo(Object.assign({},e,{chapter:this}))),Object.defineProperties(this,{index:{get:()=>this.props.index},title:{enumerable:!0,get:()=>this.props.title},files:{enumerable:!0,get:()=>this.props.files},integrity:{enumerable:!0,get:()=>this.props.integrity},volume:{enumerable:!0,get:()=>{let e=this.props.volume&&this.props.volume.index;if(Number.isInteger(e))return e}}})}getName(e){return filenamify(`${this.prefix} ${e}`)}get prefix(){return`${this.props.index.toString().padStart(3,"0")}`}get dirRelative(){const{volume:e}=this.props;return e?e.relative:""}get dirAbsolute(){const{volume:e}=this.props;return e?e.absolute:this.props.base?this.props.base:process.cwd()}async shouldUpdate(e,t){{let e=Object.getOwnPropertyNames(t);if(1===e.length&&"files"===e[0])return!1}if(t.integrity&&t.integrity!==e.integrity)return!0;if(t.index&&t.index!==e.index)return!0;if(e.files){for(const t of e.files)if(!await t.exists())return!0;if(t.files)for(const[s,r]of e.files.entries()){const e=t.files[r];if(s.integrity!==e.integrity)return!0;if(s.fname!==e.fname)return!0}}return!1}async willUpdate(e,t){super.willUpdate(...arguments);const s=this.props.files;makeDir.sync(this.dirAbsolute),s&&await Promise.all(s.map(e=>{try{e.remove()}catch(e){}}))}updateFiles(){const{props:e}=this;return[{fname:this.getName(`${e.title}.txt`),integrity:void 0}]}async update(){const{props:e}=this;e.files=await this.updateFiles()}async didUpdate(){const{props:e}=this;if(!e.files)return;e.files=e.files.map(e=>new FileInfo(Object.assign({},e,{chapter:this},e)));const{files:t}=e;return makeDir.sync(this.dirAbsolute),Promise.all(t.map(t=>{if(t.buffer)return t.write(e.overwrite)}))}printInfo(){const{props:e}=this,{files:t}=e;console.log(chalk`  {gray ${this.prefix}} ${e.title}{green ${t.length>1?" +"+(t.length-1):""}}`)}}class Volume extends Patch{constructor(e){super(e),Object.defineProperties(this,{index:{get:()=>this.props.index},title:{enumerable:!0,get:()=>this.props.title}})}get base(){const{props:e}=this;return e.base?path.resolve(e.base):process.cwd()}get filename(){const{props:e}=this;return filenamify(`${e.index.toString().padStart(2,"0")} ${e.title}`)}get relative(){return this.filename}get absolute(){return path.resolve(this.base,this.relative)}}const clearLine=()=>{readline.clearLine(process.stdout,0),readline.cursorTo(process.stdout,0)},print=(...e)=>{process.stdout.write(util.format(...e))},log=(...e)=>console.log(...e);class Series extends Patch{constructor(e,t=!1){if(super((t=t||e.last&&e.patch)?e:Series.parseMeta(e)),(e=this.props).volumes){const{Volume:t}=this;e.volumes=e.volumes.map((e,s)=>new t(Object.assign({},e,{index:s,base:this.targetDir})))}else e.volumes=[];if(e.chapters){const{Chapter:t}=this;e.chapters=e.chapters.map((s,r)=>{let i=Number.isInteger(s.volume)&&e.volumes[s.volume];return new t(Object.assign({},s,{index:r,volume:i}))})}else e.chapters=[];Object.defineProperties(this,{sourceURL:{enumerable:!0,get:()=>this.props.sourceURL},volumes:{enumerable:!0,get:()=>this.props.volumes.length&&this.props.volumes||void 0},chapters:{enumerable:!0,get:()=>this.props.chapters.length&&this.props.chapters||void 0}})}get Chapter(){return Chapter}get Volume(){return Volume}get targetDir(){return path.resolve(this.props.targetDir)}shouldLog(e){return this.props.verbose&&this.props.verbose>=e}static parseMeta(e){let t={verbose:e.verbose&&(parseInt(e.verbose)||1),overwrite:e.overwrite,last:e.last,patch:e.patch};try{let s=new URL(e.source),r=e.name||filenamify(`${s.host}${s.pathname}`),i=path.resolve(e.chdir||"",r),n={};try{let e=path.join(i,"index.json"),t=JSON.parse(fs.readFileSync(e,"utf8"));Object.assign(n,t)}catch(e){}return Object.assign(n,{sourceURL:s,targetDir:i},t)}catch(s){try{let s=path.resolve(path.join(e.source,"index.json")),r=JSON.parse(fs.readFileSync(s,"utf8")),i=path.dirname(s);return r.sourceURL=new URL(r.sourceURL),Object.assign(r,{targetDir:i},t)}catch(e){throw e}}}shouldUpdate(){return!0}async willUpdate(e,t){const{props:s,Volume:r,Chapter:i}=this,{volumes:n,chapters:a}=t;if(n&&(t.volumes=await Promise.all(n.map(async(e,t)=>{let i=s.volumes[t]&&s.volumes[t].props||{},n=new r(Object.assign(i,{index:t,base:this.targetDir}));return n=await n.patch(Object.assign({},e,{index:t}))}))),a){const e=[];t.chapters=await Promise.all(a.map(async(r,n)=>{let a=Number.isInteger(r.volume)&&t.volumes[r.volume],o=s.chapters[n]&&s.chapters[n].props||{},l=new i(Object.assign(o,{index:n,volume:a,base:this.targetDir,overwrite:s.overwrite}));return l=await l.patch(Object.assign({},r,{index:n,volume:a,base:this.targetDir}),!1),await l.isPending()?e.push([l,()=>l.run()]):await l.run(),l})),t.defers=e,t.delta=a.length-(s.chapters&&s.chapters.length||0)}return super.willUpdate(e,t)}async saveIndex(){const e=path.join(this.props.targetDir,"index.json");fs.writeFileSync(e,JSON.stringify(this,null,1),"utf8")}async update(){const{props:e}=this,t=path.join(e.targetDir,"index.json");if(await makeDir(e.targetDir),fs.writeFileSync(t,JSON.stringify(this,null,1),"utf8"),e.defers&&e.defers.length){const t=this.shouldLog(1),s=e.defers.length,r=e.defers.length>16;if(t&&(log(),print(chalk`  {green [${e.chapters.length}]} {green =>} `),e.delta&&print(chalk`{green New ${e.delta}}{gray ,} `),log(chalk`{red Updated ${e.defers.length}}`)),r){for(const[r,[,i]]of e.defers.entries())await i(),await this.saveIndex(),t&&(clearLine(),print(chalk`  {green =>} {gray [${r+1}/${s}]}`));t&&(clearLine(),log(chalk`  {gray [${s}/${s}]}`))}else for(const[s,[r,i]]of e.defers.entries())await i(),t&&await r.printInfo(),await this.saveIndex();this.saveIndex(),t&&log(chalk`  {green Completed}`),delete e.defers,delete e.delta}else clearLine()}async refresh(){if(this.shouldLog(1)){const e=process.stdout.columns;let t=path.relative(".",this.targetDir),s=chalk`{gray #} {blue ${this.sourceURL}} {green =>} ${t}`;print(cliTrunctate(s,e))}else this.shouldLog(2);return this.fetch()}async fetch(){return this.patch({})}}const hash=e=>{return crypto.createHash("sha256").update(e,"utf8").digest("base64")},replaceImages=(e,t)=>{let s=[];for(const r of e.querySelectorAll(t)){let t=e.createTextNode(`![](${r.src})`);r.parentNode.replaceChild(t,r),s.push(r.src)}return s},getExternal=async(e={})=>{const{prefix:t,oldFiles:s,files:r,urls:i}=e,n=r.length,a=e.got||gotBase;let o=i.map(async(e,r)=>{const i=async()=>{let{body:s,headers:i}=await a(e,{encoding:null});return{content:s,fname:`${t} image ${String(r+1).padStart(2,"0")}.${mime.extension(i["content-type"])||"jpg"}`}};let o=s&&s[r+n];if(o&&o.fname&&o.integrity&&o.integrity===e)return{fname:o.fname,integrity:e,buffer:async()=>(await i()).content};let{fname:l,content:c}=await i();return{fname:l,integrity:e,buffer:c}}),l=await Promise.all(o);for(const e of l)r.push(e)};var toFiles=async(e,t)=>{const s=e.got||gotBase,r=e.files;if(e.buffer&&!e.doc)return[{fname:`${e.prefix} ${e.title}.txt`,integity:void 0,buffer:e.buffer}];let i=e.doc;if(!i){if(!e.sourceURL)return;i=await(async()=>{let{window:{document:t}}=new jsdom.JSDOM((await s(e.sourceURL)).body,{url:e.sourceURL});return t})()}let[n,a]=await t(i,{getImages:replaceImages.bind(null,i)});return await getExternal({prefix:e.prefix,oldFiles:r,files:n,urls:a,got:s}),n};const got=(e,t={})=>(e=new URL(e),t.headers=Object.assign({},t.headers),/^novel18./.test(e.hostname)&&(t.headers.cookie=cookie.serialize("over18","yes")),gotBase(e,t));class Chapter$1 extends Chapter{async updateFiles(){const{props:e}=this,t=Object.assign({},e,{prefix:this.prefix,got:got});return toFiles(t,async(t,s)=>{let r=[],i=await s.getImages("#novel_color img");{const s=await e.buffer;let i=s?"function"==typeof s?await s():s.toString():"";const n=[".novel_subtitle","#novel_p","#novel_honbun","#novel_a"];for(const e of n)for(const s of t.querySelectorAll(e))i+=s.textContent+"\n\n-----\n\n";r.push({fname:this.getName(`${e.title}.txt`),integity:void 0,buffer:i})}return[r,i]})}}class Volume$1 extends Volume{}class Series$1 extends Series{constructor(e,...t){if(super(e,...t),!Series$1.test(this.sourceURL))throw new Error("Invalid URL")}static test(e){return/^((http|https):\/\/|)(ncode|novel18).syosetu.com\/[^\/]+\/?$/.test(e)}get Chapter(){return Chapter$1}get Volume(){return Volume$1}async fetch(){const e=this.sourceURL;let{window:{document:t}}=new jsdom.JSDOM((await got(e)).body,{url:e}),s=[],r=[],i="";{const e=t.querySelector(".novel_title").textContent.trim(),s=t.querySelector(".novel_writername").textContent.trim().substr("作者：".length);i=`# ${e}\nAuthor: ${s}\n\n`;let n=!1;{let e=t.querySelector("#novel_ex");null!=e?i+=e.textContent:n=!0,i+="\n\n-----\n\n"}r.push({title:"Description",integrity:Date.now(),buffer:()=>i,doc:n?t:void 0})}let n=-1,a=t.querySelector(".index_box");if(null==a)return this.setProps({chapters:r});let o=[];for(const t of a.children)if(t.classList.contains("chapter_title")){let e=t.textContent.trim();s.push({title:e}),i+=`\n## ${e}\n`,++n}else if(t.classList.contains("novel_sublist2")){let s=Number(n);o.push((async()=>{let{textContent:r,href:n}=(()=>{let e=t.firstElementChild.firstElementChild;return"a"!==e.nodeName.toLowerCase()&&(e=t.querySelector("a")),e})();return r=r.trim(),i+=`${String(o.length+1).padStart(3,"0")} ${r}\n`,n.startsWith("//")?n=e.protocol+n:n.startsWith("/")&&(n=new URL(n,e.origin)),{volume:s,sourceURL:n,title:r,integrity:(()=>{let e=(()=>{let e=t.lastElementChild;return e.classList.contains("long_update")?e:t.querySelector(".long_update")})(),s=e.lastElementChild;return s?s.title.trim():e.innerHTML.trim()})()}})())}return r[0].integrity=hash(i),r=r.concat(await Promise.all(o)),this.patch({volumes:s,chapters:r})}}class Chapter$2 extends Chapter{async updateFiles(){const{props:e}=this,t=Object.assign({},e,{prefix:this.prefix,got:gotBase});return toFiles(t,async(t,s)=>{let r=[],i=s.getImages("#contentMain-inner img"),n=t.getElementById("contentMain-inner");{const t=await e.buffer;let s=t?"function"==typeof t?await t():t.toString():"";const i=["widget-episodeTitle","widget-episode"];for(const e of i)for(const t of n.getElementsByClassName(e))s+=t.textContent+"\n\n-----\n\n";r.push({fname:this.getName(`${e.title}.txt`),integity:void 0,buffer:s})}return[r,i]})}}class Volume$2 extends Volume{}class Series$2 extends Series{static test(e){return/^((http|https):\/\/|)kakuyomu.jp\/works\/[^\/]+\/?$/.test(e)}get Chapter(){return Chapter$2}get Volume(){return Volume$2}async fetch(){const e=this.sourceURL;let{window:{document:t}}=new jsdom.JSDOM((await gotBase(e)).body,{url:e}),s=[],r=[],i="";{let e="";e+=t.getElementById("workTitle").textContent+"\n",e+=`Author: ${t.getElementById("workAuthor-activityName").textContent}\n`,e+=`\n${t.getElementById("introduction").textContent}\n`,i+=e,e=void 0,r.push({title:"Description",integrity:Date.now(),buffer:()=>i})}let n=-1;for(const e of t.getElementsByClassName("widget-toc-items"))for(const t of e.children)if(t.classList.contains("widget-toc-chapter")){let e=t.textContent.trim();s.push({title:e}),i+=`\n## ${e}\n`,++n}else{let e=t.getElementsByClassName("widget-toc-episode-episodeTitle")[0],s=e.href,a=e.getElementsByClassName("widget-toc-episode-titleLabel")[0].textContent,o=e.getElementsByClassName("widget-toc-episode-datePublished")[0].getAttribute("datetime");i+=`${String(r.length).padStart(3,"0")} ${a}\n`,r.push({volume:n,sourceURL:s,title:a,integrity:o})}return r[0].integrity=hash(i),this.patch({volumes:s,chapters:r})}}const engines=[Series$1,Series$2];var index=async e=>{const t=Series.parseMeta(e),s=(async()=>{for(const e of engines)if(e.test(t.sourceURL))return new e(t,!0)})();if(!s)throw new Error("Failed to find a matching engine");return s};exports.default=index;
//# sourceMappingURL=chunk-8e140871.js.map