function W(){}function at(t,e){for(const n in e)t[n]=e[n];return t}function ft(t){return t&&typeof t=="object"&&typeof t.then=="function"}function tt(t){return t()}function Q(){return Object.create(null)}function k(t){t.forEach(tt)}function dt(t){return typeof t=="function"}function Ht(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}let S;function Lt(t,e){return S||(S=document.createElement("a")),S.href=e,t===S.href}function _t(t){return Object.keys(t).length===0}function et(t,...e){if(t==null)return W;const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function qt(t){let e;return et(t,n=>e=n)(),e}function Dt(t,e,n){t.$$.on_destroy.push(et(e,n))}function zt(t,e,n,i){if(t){const s=nt(t,e,n,i);return t[0](s)}}function nt(t,e,n,i){return t[1]&&i?at(n.ctx.slice(),t[1](i(e))):n.ctx}function Ot(t,e,n,i){if(t[2]&&i){const s=t[2](i(n));if(e.dirty===void 0)return s;if(typeof s=="object"){const l=[],r=Math.max(e.dirty.length,s.length);for(let o=0;o<r;o+=1)l[o]=e.dirty[o]|s[o];return l}return e.dirty|s}return e.dirty}function Pt(t,e,n,i,s,l){if(s){const r=nt(e,n,i,l);t.p(r,s)}}function Bt(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let i=0;i<n;i++)e[i]=-1;return e}return-1}function Wt(t){const e={};for(const n in t)n[0]!=="$"&&(e[n]=t[n]);return e}function It(t,e,n){return t.set(n),e}let M=!1;function ht(){M=!0}function mt(){M=!1}function pt(t,e,n,i){for(;t<e;){const s=t+(e-t>>1);n(s)<=i?t=s+1:e=s}return t}function yt(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const c=[];for(let u=0;u<e.length;u++){const d=e[u];d.claim_order!==void 0&&c.push(d)}e=c}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let s=0;for(let c=0;c<e.length;c++){const u=e[c].claim_order,d=(s>0&&e[n[s]].claim_order<=u?s+1:pt(1,s,a=>e[n[a]].claim_order,u))-1;i[c]=n[d]+1;const _=d+1;n[_]=c,s=Math.max(_,s)}const l=[],r=[];let o=e.length-1;for(let c=n[s]+1;c!=0;c=i[c-1]){for(l.push(e[c-1]);o>=c;o--)r.push(e[o]);o--}for(;o>=0;o--)r.push(e[o]);l.reverse(),r.sort((c,u)=>c.claim_order-u.claim_order);for(let c=0,u=0;c<r.length;c++){for(;u<l.length&&r[c].claim_order>=l[u].claim_order;)u++;const d=u<l.length?l[u]:null;t.insertBefore(r[c],d)}}function gt(t,e){t.appendChild(e)}function bt(t,e){if(M){for(yt(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function xt(t,e,n){t.insertBefore(e,n||null)}function wt(t,e,n){M&&!n?bt(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function v(t){t.parentNode.removeChild(t)}function Gt(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function I(t){return document.createElement(t)}function it(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function G(t){return document.createTextNode(t)}function Ft(){return G(" ")}function Rt(){return G("")}function V(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function Ut(t){return function(e){return e.preventDefault(),t.call(this,e)}}function F(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function Jt(t,e){const n=Object.getOwnPropertyDescriptors(t.__proto__);for(const i in e)e[i]==null?t.removeAttribute(i):i==="style"?t.style.cssText=e[i]:i==="__value"?t.value=t[i]=e[i]:n[i]&&n[i].set?t[i]=e[i]:F(t,i,e[i])}function Kt(t,e){for(const n in e)F(t,n,e[n])}function Qt(t,e,n){e in t?t[e]=typeof t[e]=="boolean"&&n===""?!0:n:F(t,e,n)}function Vt(t){return t===""?null:+t}function vt(t){return Array.from(t.childNodes)}function st(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function rt(t,e,n,i,s=!1){st(t);const l=(()=>{for(let r=t.claim_info.last_index;r<t.length;r++){const o=t[r];if(e(o)){const c=n(o);return c===void 0?t.splice(r,1):t[r]=c,s||(t.claim_info.last_index=r),o}}for(let r=t.claim_info.last_index-1;r>=0;r--){const o=t[r];if(e(o)){const c=n(o);return c===void 0?t.splice(r,1):t[r]=c,s?c===void 0&&t.claim_info.last_index--:t.claim_info.last_index=r,o}}return i()})();return l.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,l}function ct(t,e,n,i){return rt(t,s=>s.nodeName===e,s=>{const l=[];for(let r=0;r<s.attributes.length;r++){const o=s.attributes[r];n[o.name]||l.push(o.name)}l.forEach(r=>s.removeAttribute(r))},()=>i(e))}function Xt(t,e,n){return ct(t,e,n,I)}function Yt(t,e,n){return ct(t,e,n,it)}function $t(t,e){return rt(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>G(e),!0)}function Zt(t){return $t(t," ")}function X(t,e,n){for(let i=n;i<t.length;i+=1){const s=t[i];if(s.nodeType===8&&s.textContent.trim()===e)return i}return t.length}function te(t,e){const n=X(t,"HTML_TAG_START",0),i=X(t,"HTML_TAG_END",n);if(n===i)return new Y(void 0,e);st(t);const s=t.splice(n,i-n+1);v(s[0]),v(s[s.length-1]);const l=s.slice(1,s.length-1);for(const r of l)r.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1;return new Y(l,e)}function ee(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function ne(t,e){t.value=e==null?"":e}function ie(t,e,n,i){n===null?t.style.removeProperty(e):t.style.setProperty(e,n,i?"important":"")}function se(t,e){for(let n=0;n<t.options.length;n+=1){const i=t.options[n];if(i.__value===e){i.selected=!0;return}}t.selectedIndex=-1}function re(t){const e=t.querySelector(":checked")||t.options[0];return e&&e.__value}let T;function kt(){if(T===void 0){T=!1;try{typeof window!="undefined"&&window.parent&&window.parent.document}catch{T=!0}}return T}function ce(t,e){getComputedStyle(t).position==="static"&&(t.style.position="relative");const i=I("iframe");i.setAttribute("style","display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;"),i.setAttribute("aria-hidden","true"),i.tabIndex=-1;const s=kt();let l;return s?(i.src="data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}<\/script>",l=V(window,"message",r=>{r.source===i.contentWindow&&e()})):(i.src="about:blank",i.onload=()=>{l=V(i.contentWindow,"resize",e)}),gt(t,i),()=>{(s||l&&i.contentWindow)&&l(),v(i)}}function le(t,e,n){t.classList[n?"add":"remove"](e)}function Et(t,e,{bubbles:n=!1,cancelable:i=!1}={}){const s=document.createEvent("CustomEvent");return s.initCustomEvent(t,n,i,e),s}function oe(t,e=document.body){return Array.from(e.querySelectorAll(t))}class At{constructor(e=!1){this.is_svg=!1,this.is_svg=e,this.e=this.n=null}c(e){this.h(e)}m(e,n,i=null){this.e||(this.is_svg?this.e=it(n.nodeName):this.e=I(n.nodeName),this.t=n,this.c(e)),this.i(i)}h(e){this.e.innerHTML=e,this.n=Array.from(this.e.childNodes)}i(e){for(let n=0;n<this.n.length;n+=1)xt(this.t,this.n[n],e)}p(e){this.d(),this.h(e),this.i(this.a)}d(){this.n.forEach(v)}}class Y extends At{constructor(e,n=!1){super(n);this.e=this.n=null,this.l=e}c(e){this.l?this.n=this.l:super.c(e)}i(e){for(let n=0;n<this.n.length;n+=1)wt(this.t,this.n[n],e)}}let $;function g(t){$=t}function b(){if(!$)throw new Error("Function called outside component initialization");return $}function ue(t){b().$$.before_update.push(t)}function ae(t){b().$$.on_mount.push(t)}function fe(t){b().$$.after_update.push(t)}function de(t){b().$$.on_destroy.push(t)}function _e(){const t=b();return(e,n,{cancelable:i=!1}={})=>{const s=t.$$.callbacks[e];if(s){const l=Et(e,n,{cancelable:i});return s.slice().forEach(r=>{r.call(t,l)}),!l.defaultPrevented}return!0}}function he(t,e){return b().$$.context.set(t,e),e}function me(t){return b().$$.context.get(t)}const w=[],Z=[],C=[],O=[],lt=Promise.resolve();let P=!1;function ot(){P||(P=!0,lt.then(R))}function pe(){return ot(),lt}function B(t){C.push(t)}function ye(t){O.push(t)}const z=new Set;let N=0;function R(){const t=$;do{for(;N<w.length;){const e=w[N];N++,g(e),St(e.$$)}for(g(null),w.length=0,N=0;Z.length;)Z.pop()();for(let e=0;e<C.length;e+=1){const n=C[e];z.has(n)||(z.add(n),n())}C.length=0}while(w.length);for(;O.length;)O.pop()();P=!1,z.clear(),g(t)}function St(t){if(t.fragment!==null){t.update(),k(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(B)}}const j=new Set;let x;function Tt(){x={r:0,c:[],p:x}}function Nt(){x.r||k(x.c),x=x.p}function U(t,e){t&&t.i&&(j.delete(t),t.i(e))}function ut(t,e,n,i){if(t&&t.o){if(j.has(t))return;j.add(t),x.c.push(()=>{j.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}else i&&i()}function ge(t,e){const n=e.token={};function i(s,l,r,o){if(e.token!==n)return;e.resolved=o;let c=e.ctx;r!==void 0&&(c=c.slice(),c[r]=o);const u=s&&(e.current=s)(c);let d=!1;e.block&&(e.blocks?e.blocks.forEach((_,a)=>{a!==l&&_&&(Tt(),ut(_,1,1,()=>{e.blocks[a]===_&&(e.blocks[a]=null)}),Nt())}):e.block.d(1),u.c(),U(u,1),u.m(e.mount(),e.anchor),d=!0),e.block=u,e.blocks&&(e.blocks[l]=u),d&&R()}if(ft(t)){const s=b();if(t.then(l=>{g(s),i(e.then,1,e.value,l),g(null)},l=>{if(g(s),i(e.catch,2,e.error,l),g(null),!e.hasCatch)throw l}),e.current!==e.pending)return i(e.pending,0),!0}else{if(e.current!==e.then)return i(e.then,1,e.value,t),!0;e.resolved=t}}function be(t,e,n){const i=e.slice(),{resolved:s}=t;t.current===t.then&&(i[t.value]=s),t.current===t.catch&&(i[t.error]=s),t.block.p(i,n)}function xe(t,e){ut(t,1,1,()=>{e.delete(t.key)})}function we(t,e,n,i,s,l,r,o,c,u,d,_){let a=t.length,m=l.length,h=a;const H={};for(;h--;)H[t[h].key]=h;const E=[],L=new Map,q=new Map;for(h=m;h--;){const f=_(s,l,h),p=n(f);let y=r.get(p);y?i&&y.p(f,e):(y=u(p,f),y.c()),L.set(p,E[h]=y),p in H&&q.set(p,Math.abs(h-H[p]))}const J=new Set,K=new Set;function D(f){U(f,1),f.m(o,d),r.set(f.key,f),d=f.first,m--}for(;a&&m;){const f=E[m-1],p=t[a-1],y=f.key,A=p.key;f===p?(d=f.first,a--,m--):L.has(A)?!r.has(y)||J.has(y)?D(f):K.has(A)?a--:q.get(y)>q.get(A)?(K.add(y),D(f)):(J.add(A),a--):(c(p,r),a--)}for(;a--;){const f=t[a];L.has(f.key)||c(f,r)}for(;m;)D(E[m-1]);return E}function ve(t,e){const n={},i={},s={$$scope:1};let l=t.length;for(;l--;){const r=t[l],o=e[l];if(o){for(const c in r)c in o||(i[c]=1);for(const c in o)s[c]||(n[c]=o[c],s[c]=1);t[l]=o}else for(const c in r)s[c]=1}for(const r in i)r in n||(n[r]=void 0);return n}function $e(t){return typeof t=="object"&&t!==null?t:{}}function ke(t,e,n){const i=t.$$.props[e];i!==void 0&&(t.$$.bound[i]=n,n(t.$$.ctx[i]))}function Ee(t){t&&t.c()}function Ae(t,e){t&&t.l(e)}function Ct(t,e,n,i){const{fragment:s,on_mount:l,on_destroy:r,after_update:o}=t.$$;s&&s.m(e,n),i||B(()=>{const c=l.map(tt).filter(dt);r?r.push(...c):k(c),t.$$.on_mount=[]}),o.forEach(B)}function jt(t,e){const n=t.$$;n.fragment!==null&&(k(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Mt(t,e){t.$$.dirty[0]===-1&&(w.push(t),ot(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function Se(t,e,n,i,s,l,r,o=[-1]){const c=$;g(t);const u=t.$$={fragment:null,ctx:null,props:l,update:W,not_equal:s,bound:Q(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(c?c.$$.context:[])),callbacks:Q(),dirty:o,skip_bound:!1,root:e.target||c.$$.root};r&&r(u.root);let d=!1;if(u.ctx=n?n(t,e.props||{},(_,a,...m)=>{const h=m.length?m[0]:a;return u.ctx&&s(u.ctx[_],u.ctx[_]=h)&&(!u.skip_bound&&u.bound[_]&&u.bound[_](h),d&&Mt(t,_)),a}):[],u.update(),d=!0,k(u.before_update),u.fragment=i?i(u.ctx):!1,e.target){if(e.hydrate){ht();const _=vt(e.target);u.fragment&&u.fragment.l(_),_.forEach(v)}else u.fragment&&u.fragment.c();e.intro&&U(t.$$.fragment),Ct(t,e.target,e.anchor,e.customElement),mt(),R()}g(c)}class Te{$destroy(){jt(this,1),this.$destroy=W}$on(e,n){const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const s=i.indexOf(n);s!==-1&&i.splice(s,1)}}$set(e){this.$$set&&!_t(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}export{Y as $,$e as A,jt as B,at as C,pe as D,W as E,et as F,k as G,dt as H,Lt as I,bt as J,Dt as K,le as L,oe as M,zt as N,Pt as O,Bt as P,Ot as Q,qt as R,Te as S,it as T,Yt as U,Kt as V,de as W,Wt as X,_e as Y,me as Z,V as _,vt as a,te as a0,ne as a1,Gt as a2,Z as a3,ke as a4,B as a5,ye as a6,ue as a7,Qt as a8,ce as a9,we as aa,xe as ab,Ut as ac,Jt as ad,It as ae,Vt as af,re as ag,se as ah,ge as ai,be as aj,F as b,Xt as c,v as d,I as e,ie as f,wt as g,$t as h,Se as i,ee as j,Ft as k,Rt as l,Zt as m,Tt as n,ut as o,Nt as p,U as q,he as r,Ht as s,G as t,fe as u,ae as v,Ee as w,Ae as x,Ct as y,ve as z};
