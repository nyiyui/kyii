import{S as y,i as w,s as v,e as x,c as U,a as B,d as c,g as f,o as m,p as S,q as _,K as $,n as q,w as g,x as b,y as k,E,B as h,t as H,k as j,l as p,h as A,m as C,j as I,$ as K,a0 as M}from"../chunks/index-471c5598.js";import{c as N,u as R,Y as T}from"../chunks/api2-564f7f8d.js";import{B as Y}from"../chunks/Box-a27f9004.js";import{U as z}from"../chunks/User-cc9f1c18.js";import"../chunks/index-0b2b7ad8.js";import"../chunks/store-669d404b.js";import"../chunks/singletons-d1fb5791.js";import"../chunks/Icon-b960e3f0.js";function D(a){let t=a[1]("index.logged_in_as")+"",l,e,o,i,r=a[2]&&G(a);return{c(){l=H(t),e=j(),r&&r.c(),o=p()},l(n){l=A(n,t),e=C(n),r&&r.l(n),o=p()},m(n,s){f(n,l,s),f(n,e,s),r&&r.m(n,s),f(n,o,s),i=!0},p(n,s){(!i||s&2)&&t!==(t=n[1]("index.logged_in_as")+"")&&I(l,t),n[2]&&r.p(n,s)},i(n){i||(_(r),i=!0)},o(n){m(r),i=!1},d(n){n&&c(l),n&&c(e),r&&r.d(n),n&&c(o)}}}function F(a){let t,l;return t=new Y({props:{level:"info",$$slots:{default:[J]},$$scope:{ctx:a}}}),{c(){g(t.$$.fragment)},l(e){b(t.$$.fragment,e)},m(e,o){k(t,e,o),l=!0},p(e,o){const i={};o&18&&(i.$$scope={dirty:o,ctx:e}),t.$set(i)},i(e){l||(_(t.$$.fragment,e),l=!0)},o(e){m(t.$$.fragment,e),l=!1},d(e){h(t,e)}}}function G(a){let t,l;return t=new z({props:{uid:a[2].uid,name:a[2].name,slug:a[2].slug}}),{c(){g(t.$$.fragment)},l(e){b(t.$$.fragment,e)},m(e,o){k(t,e,o),l=!0},p:E,i(e){l||(_(t.$$.fragment,e),l=!0)},o(e){m(t.$$.fragment,e),l=!1},d(e){h(t,e)}}}function J(a){let t,l=a[1]("index.login_pls")+"",e;return{c(){t=new K(!1),e=p(),this.h()},l(o){t=M(o,!1),e=p(),this.h()},h(){t.a=e},m(o,i){t.m(l,o,i),f(o,e,i)},p(o,i){i&2&&l!==(l=o[1]("index.login_pls")+"")&&t.p(l)},d(o){o&&c(e),o&&t.d()}}}function L(a){let t,l,e,o;const i=[F,D],r=[];function n(s,u){return s[0]==="anonymous"?0:1}return l=n(a),e=r[l]=i[l](a),{c(){t=x("main"),e.c()},l(s){t=U(s,"MAIN",{});var u=B(t);e.l(u),u.forEach(c)},m(s,u){f(s,t,u),r[l].m(t,null),o=!0},p(s,[u]){let d=l;l=n(s),l===d?r[l].p(s,u):(q(),m(r[d],1,1,()=>{r[d]=null}),S(),e=r[l],e?e.p(s,u):(e=r[l]=i[l](s),e.c()),_(e,1),e.m(t,null))},i(s){o||(_(e),o=!0)},o(s){m(e),o=!1},d(s){s&&c(t),r[l].d()}}}function O(a,t,l){let e,o,i;$(a,N,n=>l(0,e=n)),$(a,R,n=>l(3,o=n)),$(a,T,n=>l(1,i=n));let r=o.get(e);return[e,i,r]}class le extends y{constructor(t){super();w(this,t,O,L,v,{})}}export{le as default};