"use strict";function _interopDefault(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var path=_interopDefault(require("path")),fs=_interopDefault(require("fs")),filenamify=_interopDefault(require("filenamify")),makeDir=_interopDefault(require("make-dir")),chalk=_interopDefault(require("chalk")),readline=_interopDefault(require("readline")),util=_interopDefault(require("util"));class Patch{constructor(e={}){e=Object.assign({},e),Object.defineProperties(this,{props:{writable:!0,value:e}})}async patch(e,t=!0){if("object"!=typeof e)return;let s=new this.constructor(Object.assign({},this.props,{last:this,patch:e}));return t&&await s.run(),s}async run(){const{props:e}=this,{last:t,patch:s}=e;delete e.last,delete e.patch,s&&(await this.shouldUpdate(t,s)?(await this.willUpdate(t,s),this.props=Object.assign({},this.props,s),await this.update(t),await this.didUpdate()):this.props=Object.assign({},this.props,s))}async isPending(){const{props:e}=this;return!(!e.patch||!await this.shouldUpdate(e.last,e.patch))}shouldUpdate(e,t){return!(!t||0===Object.getOwnPropertyNames(t).length)}willUpdate(e,t){}update(e){}didUpdate(){}}class FileInfo{constructor(e){const{chapter:t}=e;Object.defineProperties(this,{chapter:{value:t},integrity:{enumerable:!0,value:e.integrity},fname:{enumerable:!0,value:e.fname},buffer:{writable:!0,value:e.buffer}})}get relative(){return path.join(this.chapter.dirRelative,this.fname)}get absolute(){return path.join(this.chapter.dirAbsolute,this.fname)}exists(){try{return fs.accessSync(this.absolute),!0}catch(e){return!1}}async write(e=!1){this.buffer&&("function"==typeof this.buffer&&(this.buffer=await this.buffer()),fs.writeFileSync(this.absolute,await this.buffer,{flag:e?"w":"wx"}))}remove(e=!1){const{relative:t}=this;t.length>0&&"string"==typeof t&&fs.unlinkSync(this.absolute)}}class Chapter extends Patch{constructor(e){super(e),this.props.files=e.files&&e.files.map((e,t)=>new FileInfo(Object.assign({},e,{chapter:this}))),Object.defineProperties(this,{index:{get:()=>this.props.index},title:{enumerable:!0,get:()=>this.props.title},files:{enumerable:!0,get:()=>this.props.files},integrity:{enumerable:!0,get:()=>this.props.integrity},volume:{enumerable:!0,get:()=>{let e=this.props.volume&&this.props.volume.index;if(Number.isInteger(e))return e}}})}getName(e){return filenamify(`${this.prefix} ${e}`)}get prefix(){return`${this.props.index.toString().padStart(3,"0")}`}get dirRelative(){const{volume:e}=this.props;return e?e.relative:""}get dirAbsolute(){const{volume:e}=this.props;return e?e.absolute:this.props.base?this.props.base:process.cwd()}async shouldUpdate(e,t){{let e=Object.getOwnPropertyNames(t);if(1===e.length&&"files"===e[0])return!1}if(t.integrity&&t.integrity!==e.integrity)return!0;if(t.index&&t.index!==e.index)return!0;if(e.files){for(const t of e.files)if(!await t.exists())return!0;if(t.files)for(const[s,r]of e.files.entries()){const e=t.files[r];if(s.integrity!==e.integrity)return!0;if(s.fname!==e.fname)return!0}}return!1}async willUpdate(e,t){super.willUpdate(...arguments);const s=this.props.files;makeDir.sync(this.dirAbsolute),s&&await Promise.all(s.map(e=>{try{e.remove()}catch(e){}}))}update(){const{props:e}=this,t=[{fname:this.getName(`${e.title}.txt`),integrity:void 0}];e.files=t}async didUpdate(){const{props:e}=this;if(!e.files)return;e.files=e.files.map(e=>new FileInfo(Object.assign({},e,{chapter:this},e)));const{files:t}=e;return makeDir.sync(this.dirAbsolute),Promise.all(t.map(t=>{if(t.buffer)return t.write(e.overwrite)}))}printInfo(){const{props:e}=this,{files:t}=e;console.log(chalk`  {gray ${this.prefix}} ${e.title}{green ${t.length>1?" +"+(t.length-1):""}}`)}}class Volume extends Patch{constructor(e){super(e),Object.defineProperties(this,{index:{get:()=>this.props.index},title:{enumerable:!0,get:()=>this.props.title}})}get base(){const{props:e}=this;return e.base?path.resolve(e.base):process.cwd()}get filename(){const{props:e}=this;return filenamify(`${e.index.toString().padStart(2,"0")} ${e.title}`)}get relative(){return this.filename}get absolute(){return path.resolve(this.base,this.relative)}}const clearLine=()=>{readline.clearLine(process.stdout,0),readline.cursorTo(process.stdout,0)},print=(...e)=>{process.stdout.write(util.format(...e))},log=(...e)=>console.log(...e);class Series extends Patch{constructor(e,t=!1){if(super((t=t||e.last&&e.patch)?e:Series.parseMeta(e)),(e=this.props).volumes){const{Volume:t}=this;e.volumes=e.volumes.map((e,s)=>new t(Object.assign({},e,{index:s,base:this.targetDir})))}else e.volumes=[];if(e.chapters){const{Chapter:t}=this;e.chapters=e.chapters.map((s,r)=>{let i=Number.isInteger(s.volume)&&e.volumes[s.volume];return new t(Object.assign({},s,{index:r,volume:i}))})}else e.chapters=[];Object.defineProperties(this,{sourceURL:{enumerable:!0,get:()=>this.props.sourceURL},volumes:{enumerable:!0,get:()=>this.props.volumes.length&&this.props.volumes||void 0},chapters:{enumerable:!0,get:()=>this.props.chapters.length&&this.props.chapters||void 0}})}get Chapter(){return Chapter}get Volume(){return Volume}get targetDir(){return path.resolve(this.props.targetDir)}shouldLog(e){return this.props.verbose&&this.props.verbose>=e}static parseMeta(e){let t={verbose:e.verbose&&(parseInt(e.verbose)||1),overwrite:e.overwrite,last:e.last,patch:e.patch};try{let s=new URL(e.source),r=e.name||filenamify(`${s.host}${s.pathname}`),i=path.resolve(e.chdir||"",r),a={};try{let e=path.join(i,"index.json"),t=JSON.parse(fs.readFileSync(e,"utf8"));Object.assign(a,t)}catch(e){}return Object.assign(a,{sourceURL:s,targetDir:i},t)}catch(s){try{let s=path.resolve(path.join(e.source,"index.json")),r=JSON.parse(fs.readFileSync(s,"utf8")),i=path.dirname(s);return r.sourceURL=new URL(r.sourceURL),Object.assign(r,{targetDir:i},t)}catch(e){throw e}}}shouldUpdate(){return!0}async willUpdate(e,t){const{props:s,Volume:r,Chapter:i}=this,{volumes:a,chapters:n}=t;if(a&&(t.volumes=await Promise.all(a.map(async(e,t)=>{let i=s.volumes[t]&&s.volumes[t].props||{},a=new r(Object.assign(i,{index:t,base:this.targetDir}));return a=await a.patch(Object.assign({},e,{index:t}))}))),n){const e=[];t.chapters=await Promise.all(n.map(async(r,a)=>{let n=Number.isInteger(r.volume)&&t.volumes[r.volume],o=s.chapters[a]&&s.chapters[a].props||{},l=new i(Object.assign(o,{index:a,volume:n,base:this.targetDir,overwrite:s.overwrite}));return l=await l.patch(Object.assign({},r,{index:a,volume:n,base:this.targetDir}),!1),await l.isPending()?e.push([l,()=>l.run()]):await l.run(),l})),t.defers=e,t.delta=n.length-(s.chapters&&s.chapters.length||0)}return super.willUpdate(e,t)}async saveIndex(){const e=path.join(this.props.targetDir,"index.json");fs.writeFileSync(e,JSON.stringify(this,null,1),"utf8")}async update(){const{props:e}=this,t=path.join(e.targetDir,"index.json");if(await makeDir(e.targetDir),fs.writeFileSync(t,JSON.stringify(this,null,1),"utf8"),e.defers&&e.defers.length){const t=this.shouldLog(1),s=e.defers.length,r=e.defers.length>16;if(t&&(print(chalk`  {green [${e.chapters.length}]} {green =>} `),e.delta&&print(chalk`{green New ${e.delta}}{gray ,} `),log(chalk`{red Updated ${e.defers.length}}`)),r){for(const[r,[,i]]of e.defers.entries())await i(),await this.saveIndex(),t&&(clearLine(),print(chalk`  {green =>} {gray [${r+1}/${s}]}`));t&&(clearLine(),log(chalk`  {gray [${s}/${s}]}`))}else for(const[s,[r,i]]of e.defers.entries())await i(),t&&await r.printInfo(),await this.saveIndex();this.saveIndex(),t&&log(chalk`  {green Completed}`),delete e.defers,delete e.delta}}async refresh(){if(this.shouldLog(1)){const e=process.stdout.columns;let t=path.relative(".",this.targetDir),s=6+String(this.sourceURL).length+t.length;print(chalk`{gray #} {blue ${this.sourceURL}}`),s>e?log():print(" "),log(chalk`{green =>} ${t}`)}return this.fetch()}async fetch(){return this.patch({})}}exports.Series=Series,exports.Chapter=Chapter,exports.FileInfo=FileInfo,exports.Volume=Volume;
//# sourceMappingURL=chunk-2618d45d.js.map
