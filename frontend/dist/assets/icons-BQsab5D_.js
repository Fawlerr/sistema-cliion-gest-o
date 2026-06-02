var Ie=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function te(c){return c&&c.__esModule&&Object.prototype.hasOwnProperty.call(c,"default")?c.default:c}var L={exports:{}},r={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var W;function re(){if(W)return r;W=1;var c=Symbol.for("react.element"),d=Symbol.for("react.portal"),p=Symbol.for("react.fragment"),k=Symbol.for("react.strict_mode"),M=Symbol.for("react.profiler"),_=Symbol.for("react.provider"),$=Symbol.for("react.context"),w=Symbol.for("react.forward_ref"),C=Symbol.for("react.suspense"),j=Symbol.for("react.memo"),N=Symbol.for("react.lazy"),P=Symbol.iterator;function X(e){return e===null||typeof e!="object"?null:(e=P&&e[P]||e["@@iterator"],typeof e=="function"?e:null)}var z={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},V=Object.assign,H={};function v(e,t,o){this.props=e,this.context=t,this.refs=H,this.updater=o||z}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function O(){}O.prototype=v.prototype;function S(e,t,o){this.props=e,this.context=t,this.refs=H,this.updater=o||z}var R=S.prototype=new O;R.constructor=S,V(R,v.prototype),R.isPureReactComponent=!0;var I=Array.isArray,D=Object.prototype.hasOwnProperty,E={current:null},T={key:!0,ref:!0,__self:!0,__source:!0};function U(e,t,o){var s,a={},i=null,y=null;if(t!=null)for(s in t.ref!==void 0&&(y=t.ref),t.key!==void 0&&(i=""+t.key),t)D.call(t,s)&&!T.hasOwnProperty(s)&&(a[s]=t[s]);var l=arguments.length-2;if(l===1)a.children=o;else if(1<l){for(var u=Array(l),f=0;f<l;f++)u[f]=arguments[f+2];a.children=u}if(e&&e.defaultProps)for(s in l=e.defaultProps,l)a[s]===void 0&&(a[s]=l[s]);return{$$typeof:c,type:e,key:i,ref:y,props:a,_owner:E.current}}function J(e,t){return{$$typeof:c,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function q(e){return typeof e=="object"&&e!==null&&e.$$typeof===c}function Q(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(o){return t[o]})}var F=/\/+/g;function A(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Q(""+e.key):t.toString(36)}function x(e,t,o,s,a){var i=typeof e;(i==="undefined"||i==="boolean")&&(e=null);var y=!1;if(e===null)y=!0;else switch(i){case"string":case"number":y=!0;break;case"object":switch(e.$$typeof){case c:case d:y=!0}}if(y)return y=e,a=a(y),e=s===""?"."+A(y,0):s,I(a)?(o="",e!=null&&(o=e.replace(F,"$&/")+"/"),x(a,t,o,"",function(f){return f})):a!=null&&(q(a)&&(a=J(a,o+(!a.key||y&&y.key===a.key?"":(""+a.key).replace(F,"$&/")+"/")+e)),t.push(a)),1;if(y=0,s=s===""?".":s+":",I(e))for(var l=0;l<e.length;l++){i=e[l];var u=s+A(i,l);y+=x(i,t,o,u,a)}else if(u=X(e),typeof u=="function")for(e=u.call(e),l=0;!(i=e.next()).done;)i=i.value,u=s+A(i,l++),y+=x(i,t,o,u,a);else if(i==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return y}function g(e,t,o){if(e==null)return e;var s=[],a=0;return x(e,s,"","",function(i){return t.call(o,i,a++)}),s}function Y(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(o){(e._status===0||e._status===-1)&&(e._status=1,e._result=o)},function(o){(e._status===0||e._status===-1)&&(e._status=2,e._result=o)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var h={current:null},b={transition:null},ee={ReactCurrentDispatcher:h,ReactCurrentBatchConfig:b,ReactCurrentOwner:E};function B(){throw Error("act(...) is not supported in production builds of React.")}return r.Children={map:g,forEach:function(e,t,o){g(e,function(){t.apply(this,arguments)},o)},count:function(e){var t=0;return g(e,function(){t++}),t},toArray:function(e){return g(e,function(t){return t})||[]},only:function(e){if(!q(e))throw Error("React.Children.only expected to receive a single React element child.");return e}},r.Component=v,r.Fragment=p,r.Profiler=M,r.PureComponent=S,r.StrictMode=k,r.Suspense=C,r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ee,r.act=B,r.cloneElement=function(e,t,o){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var s=V({},e.props),a=e.key,i=e.ref,y=e._owner;if(t!=null){if(t.ref!==void 0&&(i=t.ref,y=E.current),t.key!==void 0&&(a=""+t.key),e.type&&e.type.defaultProps)var l=e.type.defaultProps;for(u in t)D.call(t,u)&&!T.hasOwnProperty(u)&&(s[u]=t[u]===void 0&&l!==void 0?l[u]:t[u])}var u=arguments.length-2;if(u===1)s.children=o;else if(1<u){l=Array(u);for(var f=0;f<u;f++)l[f]=arguments[f+2];s.children=l}return{$$typeof:c,type:e.type,key:a,ref:i,props:s,_owner:y}},r.createContext=function(e){return e={$$typeof:$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:_,_context:e},e.Consumer=e},r.createElement=U,r.createFactory=function(e){var t=U.bind(null,e);return t.type=e,t},r.createRef=function(){return{current:null}},r.forwardRef=function(e){return{$$typeof:w,render:e}},r.isValidElement=q,r.lazy=function(e){return{$$typeof:N,_payload:{_status:-1,_result:e},_init:Y}},r.memo=function(e,t){return{$$typeof:j,type:e,compare:t===void 0?null:t}},r.startTransition=function(e){var t=b.transition;b.transition={};try{e()}finally{b.transition=t}},r.unstable_act=B,r.useCallback=function(e,t){return h.current.useCallback(e,t)},r.useContext=function(e){return h.current.useContext(e)},r.useDebugValue=function(){},r.useDeferredValue=function(e){return h.current.useDeferredValue(e)},r.useEffect=function(e,t){return h.current.useEffect(e,t)},r.useId=function(){return h.current.useId()},r.useImperativeHandle=function(e,t,o){return h.current.useImperativeHandle(e,t,o)},r.useInsertionEffect=function(e,t){return h.current.useInsertionEffect(e,t)},r.useLayoutEffect=function(e,t){return h.current.useLayoutEffect(e,t)},r.useMemo=function(e,t){return h.current.useMemo(e,t)},r.useReducer=function(e,t,o){return h.current.useReducer(e,t,o)},r.useRef=function(e){return h.current.useRef(e)},r.useState=function(e){return h.current.useState(e)},r.useSyncExternalStore=function(e,t,o){return h.current.useSyncExternalStore(e,t,o)},r.useTransition=function(){return h.current.useTransition()},r.version="18.3.1",r}var K;function ne(){return K||(K=1,L.exports=re()),L.exports}var m=ne();const De=te(m);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe=c=>c.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),ce=c=>c.replace(/^([A-Z])|[\s-_]+(\w)/g,(d,p,k)=>k?k.toUpperCase():p.toLowerCase()),Z=c=>{const d=ce(c);return d.charAt(0).toUpperCase()+d.slice(1)},G=(...c)=>c.filter((d,p,k)=>!!d&&d.trim()!==""&&k.indexOf(d)===p).join(" ").trim(),ae=c=>{for(const d in c)if(d.startsWith("aria-")||d==="role"||d==="title")return!0};/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var se={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=m.forwardRef(({color:c="currentColor",size:d=24,strokeWidth:p=2,absoluteStrokeWidth:k,className:M="",children:_,iconNode:$,...w},C)=>m.createElement("svg",{ref:C,...se,width:d,height:d,stroke:c,strokeWidth:k?Number(p)*24/Number(d):p,className:G("lucide",M),...!_&&!ae(w)&&{"aria-hidden":"true"},...w},[...$.map(([j,N])=>m.createElement(j,N)),...Array.isArray(_)?_:[_]]));/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=(c,d)=>{const p=m.forwardRef(({className:k,...M},_)=>m.createElement(ue,{ref:_,iconNode:d,className:G(`lucide-${oe(Z(c))}`,`lucide-${c}`,k),...M}));return p.displayName=Z(c),p};/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],Te=n("arrow-left",ie);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],Ue=n("arrow-right",le);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]],Fe=n("bell",de);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ye=[["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5",key:"1osxxc"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M3 10h5",key:"r794hk"}],["path",{d:"M17.5 17.5 16 16.3V14",key:"akvzfd"}],["circle",{cx:"16",cy:"16",r:"6",key:"qoo3c4"}]],Be=n("calendar-clock",ye);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const he=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]],We=n("calendar-days",he);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],Ke=n("chevron-left",pe);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],Ze=n("chevron-right",fe);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],Ge=n("circle-check",ke);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 12h8",key:"1wcyev"}],["path",{d:"M12 8v8",key:"napkw2"}]],Xe=n("circle-plus",_e);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]],Je=n("clipboard-list",ve);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16.5 12",key:"1aq6pp"}]],Qe=n("clock-3",me);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Me=[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]],Ye=n("credit-card",Me);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],et=n("download",we);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],tt=n("eye",xe);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=[["path",{d:"M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4",key:"1pf5j1"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M3 15h6",key:"4e2qda"}],["path",{d:"M6 12v6",key:"1u72j0"}]],rt=n("file-plus-2",ge);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],nt=n("file-text",be);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],ot=n("layout-dashboard",$e);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]],ct=n("link-2",Ce);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["circle",{cx:"12",cy:"16",r:"1",key:"1au0dj"}],["rect",{x:"3",y:"10",width:"18",height:"12",rx:"2",key:"6s8ecr"}],["path",{d:"M7 10V7a5 5 0 0 1 10 0v3",key:"1pqi11"}]],at=n("lock-keyhole",je);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=[["path",{d:"m10 17 5-5-5-5",key:"1bsop3"}],["path",{d:"M15 12H3",key:"6jk70r"}],["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}]],st=n("log-in",Ne);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=[["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 18h16",key:"19g7jn"}],["path",{d:"M4 6h16",key:"1o0s65"}]],ut=n("menu",Se);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=[["path",{d:"M2 6h4",key:"aawbzj"}],["path",{d:"M2 10h4",key:"l0bgd4"}],["path",{d:"M2 14h4",key:"1gsvsf"}],["path",{d:"M2 18h4",key:"1bu2t1"}],["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["path",{d:"M15 2v20",key:"dcj49h"}],["path",{d:"M15 7h5",key:"1xj5lc"}],["path",{d:"M15 12h5",key:"w5shd9"}],["path",{d:"M15 17h5",key:"1qaofu"}]],it=n("notebook-tabs",Re);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=[["path",{d:"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",key:"1a0edw"}],["path",{d:"M12 22V12",key:"d0xqtd"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}]],lt=n("package",Ee);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],dt=n("pencil",qe);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],yt=n("search",Ae);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]],ht=n("shield-alert",Le);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],pt=n("sparkles",Pe);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=[["path",{d:"M11 2v2",key:"1539x4"}],["path",{d:"M5 2v2",key:"1yf1q8"}],["path",{d:"M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1",key:"rb5t3r"}],["path",{d:"M8 15a6 6 0 0 0 12 0v-3",key:"x18d4x"}],["circle",{cx:"20",cy:"10",r:"2",key:"ts1r5v"}]],ft=n("stethoscope",ze);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=[["circle",{cx:"12",cy:"8",r:"5",key:"1hypcn"}],["path",{d:"M20 21a8 8 0 0 0-16 0",key:"rfgkzh"}]],kt=n("user-round",Ve);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],_t=n("users",He);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],vt=n("x",Oe);export{Te as A,Fe as B,Qe as C,et as D,tt as E,rt as F,ct as L,ut as M,it as N,dt as P,De as R,yt as S,kt as U,vt as X,m as a,Ke as b,Ie as c,We as d,Ze as e,Xe as f,te as g,nt as h,Je as i,Ye as j,ot as k,_t as l,Be as m,lt as n,at as o,st as p,ht as q,ne as r,Ge as s,Ue as t,pt as u,ft as v};
