import{S as ce,i as he,s as $e,k as U,e as E,t as N,M as ve,d as f,m as y,c as I,a as J,h as R,g as $,J as h,j as O,o as B,p as _e,q as T,K as ae,v as de,n as pe,w as Q,x as V,y as W,B as X,b as g,a2 as be,E as ge,_ as ze}from"../chunks/index-471c5598.js";import{a as D,g as ke,c as we,u as Ue,Y as ye}from"../chunks/api2-564f7f8d.js";import{p as Ee}from"../chunks/stores-08fbc986.js";import{L as Ie}from"../chunks/Loading-28866ca5.js";import{S as Pe}from"../chunks/Scope-e19db83e.js";import{B as se}from"../chunks/Box-a27f9004.js";import"../chunks/index-0b2b7ad8.js";import"../chunks/store-669d404b.js";import"../chunks/singletons-d1fb5791.js";import"../chunks/Icon-b960e3f0.js";function ie(o,e,a){const t=o.slice();return t[8]=e[a],t}function Se(o){let e,a=o[2]({id:"authz.prompt",values:{user_name:o[3].name}})+"",t,r,n,i,v=o[2]("authz.client_lhs")+"",_,s,m,d=o[1].client.name+"",P,G,p,z=o[2]("authz.then")+"",w,j,F,Z,A,x,k,H,ne,Y,re,C,ee,oe,M,te,le,S,K=o[1].request.scope.split(" "),c=[];for(let l=0;l<K.length;l+=1)c[l]=fe(ie(o,K,l));const me=l=>B(c[l],1,1,()=>{c[l]=null});return A=new se({props:{level:"debug",$$slots:{default:[Re]},$$scope:{ctx:o}}}),{c(){e=E("p"),t=N(a),r=U(),n=E("br"),i=U(),_=N(v),s=U(),m=E("a"),P=N(d),p=U(),w=N(z),j=U(),F=E("ul");for(let l=0;l<c.length;l+=1)c[l].c();Z=U(),Q(A.$$.fragment),x=U(),k=E("form"),H=E("input"),ne=U(),Y=E("input"),re=U(),C=E("input"),oe=U(),M=E("input"),this.h()},l(l){e=I(l,"P",{});var u=J(e);t=R(u,a),r=y(u),n=I(u,"BR",{}),i=y(u),_=R(u,v),s=y(u),m=I(u,"A",{href:!0});var L=J(m);P=R(L,d),L.forEach(f),u.forEach(f),p=y(l),w=R(l,z),j=y(l),F=I(l,"UL",{});var b=J(F);for(let ue=0;ue<c.length;ue+=1)c[ue].l(b);b.forEach(f),Z=y(l),V(A.$$.fragment,l),x=y(l),k=I(l,"FORM",{action:!0,method:!0});var q=J(k);H=I(q,"INPUT",{type:!0,name:!0}),ne=y(q),Y=I(q,"INPUT",{type:!0,name:!0}),re=y(q),C=I(q,"INPUT",{class:!0,type:!0,name:!0}),oe=y(q),M=I(q,"INPUT",{class:!0,type:!0,name:!0}),q.forEach(f),this.h()},h(){g(m,"href",G="/oclient?oclid="+o[1].args.client_id),g(H,"type","hidden"),g(H,"name","_csrf_token"),H.value=o[0],g(Y,"type","hidden"),g(Y,"name","_airy_token"),Y.value=o[3].token,g(C,"class","update"),g(C,"type","submit"),g(C,"name","action_allow"),C.value=ee=o[2]("authz.allow"),g(M,"class","delete"),g(M,"type","submit"),g(M,"name","action_deny"),M.value=te=o[2]("authz.deny"),g(k,"action",le=D.baseUrl+"/oauth/authorize?"+new URLSearchParams(o[1].args).toString()),g(k,"method","post")},m(l,u){$(l,e,u),h(e,t),h(e,r),h(e,n),h(e,i),h(e,_),h(e,s),h(e,m),h(m,P),$(l,p,u),$(l,w,u),$(l,j,u),$(l,F,u);for(let L=0;L<c.length;L+=1)c[L].m(F,null);$(l,Z,u),W(A,l,u),$(l,x,u),$(l,k,u),h(k,H),h(k,ne),h(k,Y),h(k,re),h(k,C),h(k,oe),h(k,M),S=!0},p(l,u){if((!S||u&4)&&a!==(a=l[2]({id:"authz.prompt",values:{user_name:l[3].name}})+"")&&O(t,a),(!S||u&4)&&v!==(v=l[2]("authz.client_lhs")+"")&&O(_,v),(!S||u&2)&&d!==(d=l[1].client.name+"")&&O(P,d),(!S||u&2&&G!==(G="/oclient?oclid="+l[1].args.client_id))&&g(m,"href",G),(!S||u&4)&&z!==(z=l[2]("authz.then")+"")&&O(w,z),u&2){K=l[1].request.scope.split(" ");let b;for(b=0;b<K.length;b+=1){const q=ie(l,K,b);c[b]?(c[b].p(q,u),T(c[b],1)):(c[b]=fe(q),c[b].c(),T(c[b],1),c[b].m(F,null))}for(pe(),b=K.length;b<c.length;b+=1)me(b);_e()}const L={};u&2050&&(L.$$scope={dirty:u,ctx:l}),A.$set(L),(!S||u&1)&&(H.value=l[0]),(!S||u&4&&ee!==(ee=l[2]("authz.allow")))&&(C.value=ee),(!S||u&4&&te!==(te=l[2]("authz.deny")))&&(M.value=te),(!S||u&2&&le!==(le=D.baseUrl+"/oauth/authorize?"+new URLSearchParams(l[1].args).toString()))&&g(k,"action",le)},i(l){if(!S){for(let u=0;u<K.length;u+=1)T(c[u]);T(A.$$.fragment,l),S=!0}},o(l){c=c.filter(Boolean);for(let u=0;u<c.length;u+=1)B(c[u]);B(A.$$.fragment,l),S=!1},d(l){l&&f(e),l&&f(p),l&&f(w),l&&f(j),l&&f(F),be(c,l),l&&f(Z),X(A,l),l&&f(x),l&&f(k)}}}function qe(o){let e,a,t,r;return e=new se({props:{level:"error",$$slots:{default:[Te]},$$scope:{ctx:o}}}),t=new se({props:{level:"info",$$slots:{default:[Le]},$$scope:{ctx:o}}}),{c(){Q(e.$$.fragment),a=U(),Q(t.$$.fragment)},l(n){V(e.$$.fragment,n),a=y(n),V(t.$$.fragment,n)},m(n,i){W(e,n,i),$(n,a,i),W(t,n,i),r=!0},p(n,i){const v={};i&2052&&(v.$$scope={dirty:i,ctx:n}),e.$set(v);const _={};i&2052&&(_.$$scope={dirty:i,ctx:n}),t.$set(_)},i(n){r||(T(e.$$.fragment,n),T(t.$$.fragment,n),r=!0)},o(n){B(e.$$.fragment,n),B(t.$$.fragment,n),r=!1},d(n){X(e,n),n&&f(a),X(t,n)}}}function Ne(o){let e,a;return e=new Ie({}),{c(){Q(e.$$.fragment)},l(t){V(e.$$.fragment,t)},m(t,r){W(e,t,r),a=!0},p:ge,i(t){a||(T(e.$$.fragment,t),a=!0)},o(t){B(e.$$.fragment,t),a=!1},d(t){X(e,t)}}}function fe(o){let e,a,t;return a=new Pe({props:{name:o[8]}}),{c(){e=E("li"),Q(a.$$.fragment)},l(r){e=I(r,"LI",{});var n=J(e);V(a.$$.fragment,n),n.forEach(f)},m(r,n){$(r,e,n),W(a,e,null),t=!0},p(r,n){const i={};n&2&&(i.name=r[8]),a.$set(i)},i(r){t||(T(a.$$.fragment,r),t=!0)},o(r){B(a.$$.fragment,r),t=!1},d(r){r&&f(e),X(a)}}}function Re(o){let e,a,t=JSON.stringify(o[1],null,2)+"",r;return{c(){e=N("Grant: "),a=E("pre"),r=N(t)},l(n){e=R(n,"Grant: "),a=I(n,"PRE",{});var i=J(a);r=R(i,t),i.forEach(f)},m(n,i){$(n,e,i),$(n,a,i),h(a,r)},p(n,i){i&2&&t!==(t=JSON.stringify(n[1],null,2)+"")&&O(r,t)},d(n){n&&f(e),n&&f(a)}}}function Te(o){let e=o[2]("authz.already_used")+"",a;return{c(){a=N(e)},l(t){a=R(t,e)},m(t,r){$(t,a,r)},p(t,r){r&4&&e!==(e=t[2]("authz.already_used")+"")&&O(a,e)},d(t){t&&f(a)}}}function Le(o){let e=o[2]("authz.retry")+"",a,t,r,n,i,v,_;return{c(){a=N(e),t=U(),r=E("input"),i=N("."),this.h()},l(s){a=R(s,e),t=y(s),r=I(s,"INPUT",{type:!0}),i=R(s,"."),this.h()},h(){g(r,"type","button"),r.value=n=o[2]("authz.go_back")},m(s,m){$(s,a,m),$(s,t,m),$(s,r,m),$(s,i,m),v||(_=ze(r,"click",o[4]),v=!0)},p(s,m){m&4&&e!==(e=s[2]("authz.retry")+"")&&O(a,e),m&4&&n!==(n=s[2]("authz.go_back"))&&(r.value=n)},d(s){s&&f(a),s&&f(t),s&&f(r),s&&f(i),v=!1,_()}}}function Be(o){let e,a,t,r,n=o[2]("authz.title")+"",i,v,_,s,m;document.title=e=o[2]("authz.title");const d=[Ne,qe,Se],P=[];function G(p,z){return p[1]===void 0?0:p[1]===null?1:2}return _=G(o),s=P[_]=d[_](o),{c(){a=U(),t=E("main"),r=E("h1"),i=N(n),v=U(),s.c()},l(p){ve('[data-svelte="svelte-1w58p46"]',document.head).forEach(f),a=y(p),t=I(p,"MAIN",{});var w=J(t);r=I(w,"H1",{});var j=J(r);i=R(j,n),j.forEach(f),v=y(w),s.l(w),w.forEach(f)},m(p,z){$(p,a,z),$(p,t,z),h(t,r),h(r,i),h(t,v),P[_].m(t,null),m=!0},p(p,[z]){(!m||z&4)&&e!==(e=p[2]("authz.title"))&&(document.title=e),(!m||z&4)&&n!==(n=p[2]("authz.title")+"")&&O(i,n);let w=_;_=G(p),_===w?P[_].p(p,z):(pe(),B(P[w],1,1,()=>{P[w]=null}),_e(),s=P[_],s?s.p(p,z):(s=P[_]=d[_](p),s.c()),T(s,1),s.m(t,null))},i(p){m||(T(s),m=!0)},o(p){B(s),m=!1},d(p){p&&f(a),p&&f(t),P[_].d()}}}function Ae(o,e,a){let t,r,n,i;ae(o,Ee,d=>a(5,t=d)),ae(o,we,d=>a(6,r=d)),ae(o,Ue,d=>a(7,n=d)),ae(o,ye,d=>a(2,i=d));let v=n.get(r),_,s;return de(async()=>{await D.loggedIn()||ke(`/iori?selfnext=${encodeURIComponent(window.location.pathname)}&selfargs=${encodeURIComponent(window.location.search.slice(1))}`),a(0,_=await D.getCsrfToken());const d=t.url.searchParams.get("azrqid");a(1,s=await D.stepAzrq(d))}),[_,s,i,v,()=>history.back()]}class De extends ce{constructor(e){super();he(this,e,Ae,Be,$e,{})}}export{De as default};
