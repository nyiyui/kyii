import{S as C,i as H,s as J,w as I,x as N,y,q as h,o as d,B as M,k as b,e as w,t as P,M as K,d as _,m as k,c as S,a as x,h as j,g as v,J as g,j as A,p as T,K as B,b as U,_ as Y,n as z}from"../chunks/index-471c5598.js";import{Y as D,g as F}from"../chunks/api2-564f7f8d.js";import{B as G}from"../chunks/Box-a27f9004.js";import{S as L}from"../chunks/Switcher-e6e2851d.js";import{p as O}from"../chunks/stores-08fbc986.js";import{g as Q}from"../chunks/util-92d9fe41.js";import"../chunks/index-0b2b7ad8.js";import"../chunks/store-669d404b.js";import"../chunks/singletons-d1fb5791.js";import"../chunks/Icon-b960e3f0.js";import"../chunks/Loading-28866ca5.js";import"../chunks/User-cc9f1c18.js";import"../chunks/BoxError-e4fbeeb7.js";function E(n){let t,o;return t=new G({props:{level:"info",$$slots:{default:[R]},$$scope:{ctx:n}}}),{c(){I(t.$$.fragment)},l(e){N(t.$$.fragment,e)},m(e,l){y(t,e,l),o=!0},p(e,l){const r={};l&19&&(r.$$scope={dirty:l,ctx:e}),t.$set(r)},i(e){o||(h(t.$$.fragment,e),o=!0)},o(e){d(t.$$.fragment,e),o=!1},d(e){M(t,e)}}}function R(n){let t=n[1]("closet.move")+"",o,e,l,r,u,f;return{c(){o=P(t),e=b(),l=w("input"),this.h()},l(s){o=j(s,t),e=k(s),l=S(s,"INPUT",{type:!0}),this.h()},h(){U(l,"type","button"),l.value=r=n[1]("closet.next")},m(s,c){v(s,o,c),v(s,e,c),v(s,l,c),u||(f=Y(l,"click",n[2]),u=!0)},p(s,c){c&2&&t!==(t=s[1]("closet.move")+"")&&A(o,t),c&2&&r!==(r=s[1]("closet.next"))&&(l.value=r)},d(s){s&&_(o),s&&_(e),s&&_(l),u=!1,f()}}}function V(n){let t,o;return t=new L({}),{c(){I(t.$$.fragment)},l(e){N(t.$$.fragment,e)},m(e,l){y(t,e,l),o=!0},i(e){o||(h(t.$$.fragment,e),o=!0)},o(e){d(t.$$.fragment,e),o=!1},d(e){M(t,e)}}}function W(n){let t,o,e,l,r=n[1]("closet.title")+"",u,f,s,c;document.title=t=n[1]("closet.title");let a=n[0]&&E(n),m=V();return{c(){o=b(),e=w("main"),l=w("h1"),u=P(r),f=b(),a&&a.c(),s=b(),m&&m.c()},l(i){K('[data-svelte="svelte-9kh6bo"]',document.head).forEach(_),o=k(i),e=S(i,"MAIN",{});var $=x(e);l=S($,"H1",{});var q=x(l);u=j(q,r),q.forEach(_),f=k($),a&&a.l($),s=k($),m&&m.l($),$.forEach(_)},m(i,p){v(i,o,p),v(i,e,p),g(e,l),g(l,u),g(e,f),a&&a.m(e,null),g(e,s),m&&m.m(e,null),c=!0},p(i,[p]){(!c||p&2)&&t!==(t=i[1]("closet.title"))&&(document.title=t),(!c||p&2)&&r!==(r=i[1]("closet.title")+"")&&A(u,r),i[0]?a?(a.p(i,p),p&1&&h(a,1)):(a=E(i),a.c(),h(a,1),a.m(e,s)):a&&(z(),d(a,1,1,()=>{a=null}),T())},i(i){c||(h(a),h(m),c=!0)},o(i){d(a),d(m),c=!1},d(i){i&&_(o),i&&_(e),a&&a.d(),m&&m.d()}}}function X(n,t,o){let e,l;B(n,O,f=>o(3,e=f)),B(n,D,f=>o(1,l=f));let r;return r=Q(e.url.searchParams),[r,l,()=>F(r)]}class ue extends C{constructor(t){super();H(this,t,X,W,J,{})}}export{ue as default};