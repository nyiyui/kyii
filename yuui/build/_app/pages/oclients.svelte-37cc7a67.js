var Gi=Object.defineProperty,Ki=Object.defineProperties;var zi=Object.getOwnPropertyDescriptors;var Ei=Object.getOwnPropertySymbols;var Fi=Object.prototype.hasOwnProperty,Qi=Object.prototype.propertyIsEnumerable;var wi=(t,l,e)=>l in t?Gi(t,l,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[l]=e,$i=(t,l)=>{for(var e in l||(l={}))Fi.call(l,e)&&wi(t,e,l[e]);if(Ei)for(var e of Ei(l))Qi.call(l,e)&&wi(t,e,l[e]);return t},Li=(t,l)=>Ki(t,zi(l));import{S as Rl,i as Jl,s as ql,e as _,w as J,k as o,t as D,c as f,a as I,x as q,m as a,h as A,d as b,b as $,g as ee,y as H,J as n,j as V,q as j,o as S,B as M,K as Et,a1 as G,_ as K,G as ui,a2 as Cl,l as Sl,n as Hl,p as Ml,Y as Wi,v as Ci,a3 as tl,H as Xi,a4 as Vl,a5 as Zi,a6 as jl,E as Si,M as xi}from"../chunks/index-471c5598.js";import{Y as Yl,c as es,u as ts,a as Ol,f as ls}from"../chunks/api2-564f7f8d.js";import{L as Ri}from"../chunks/Loading-28866ca5.js";import{O as ns}from"../chunks/OClientView-8fe9943b.js";import{S as is}from"../chunks/Select-4d017f13.js";import{I as ss}from"../chunks/Icon-b960e3f0.js";import{B as ri}from"../chunks/Box-a27f9004.js";import{B as Ji}from"../chunks/BoxError-e4fbeeb7.js";import{U as rs}from"../chunks/UnsavedChanges-a25429c7.js";import"../chunks/index-0b2b7ad8.js";import"../chunks/store-669d404b.js";import"../chunks/singletons-d1fb5791.js";function us(t){let l,e,i,r=t[0]("public.title")+"",p,g;return e=new ss({props:{icon:"mdi:earth"}}),{c(){l=_("span"),J(e.$$.fragment),i=o(),p=D(r),this.h()},l(c){l=f(c,"SPAN",{class:!0});var u=I(l);q(e.$$.fragment,u),i=a(u),p=A(u,r),u.forEach(b),this.h()},h(){$(l,"class","tag warn")},m(c,u){ee(c,l,u),H(e,l,null),n(l,i),n(l,p),g=!0},p(c,[u]){(!g||u&1)&&r!==(r=c[0]("public.title")+"")&&V(p,r)},i(c){g||(j(e.$$.fragment,c),g=!0)},o(c){S(e.$$.fragment,c),g=!1},d(c){c&&b(l),M(e)}}}function os(t,l,e){let i;return Et(t,Yl,r=>e(0,i=r)),[i]}class kt extends Rl{constructor(l){super();Jl(this,l,os,us,ql,{})}}function Ii(t,l,e){const i=t.slice();return i[5]=l[e],i[6]=l,i[7]=e,i}function Ni(t){let l,e,i,r,p,g,c;function u(){t[2].call(e,t[5])}function d(){return t[3](t[5])}return{c(){l=_("div"),e=_("input"),i=o(),r=_("input"),this.h()},l(v){l=f(v,"DIV",{class:!0});var E=I(l);e=f(E,"INPUT",{type:!0}),i=a(E),r=f(E,"INPUT",{class:!0,type:!0}),E.forEach(b),this.h()},h(){$(e,"type","text"),$(r,"class","delete"),$(r,"type","button"),r.value=p=t[1]("list_input.delete"),$(l,"class","flex-in")},m(v,E){ee(v,l,E),n(l,e),G(e,t[0][t[5]]),n(l,i),n(l,r),g||(c=[K(e,"input",u),K(r,"click",d)],g=!0)},p(v,E){t=v,E&1&&e.value!==t[0][t[5]]&&G(e,t[0][t[5]]),E&2&&p!==(p=t[1]("list_input.delete"))&&(r.value=p)},d(v){v&&b(l),g=!1,ui(c)}}}function as(t){let l=JSON.stringify(t[0])+"",e;return{c(){e=D(l)},l(i){e=A(i,l)},m(i,r){ee(i,e,r)},p(i,r){r&1&&l!==(l=JSON.stringify(i[0])+"")&&V(e,l)},d(i){i&&b(e)}}}function _s(t){let l,e,i,r,p,g,c,u,d,v,E,h=[...t[0].entries()].map(yi),k=[];for(let w=0;w<h.length;w+=1)k[w]=Ni(Ii(t,h,w));return u=new ri({props:{level:"debug",$$slots:{default:[as]},$$scope:{ctx:t}}}),{c(){l=_("div");for(let w=0;w<k.length;w+=1)k[w].c();e=o(),i=_("div"),r=_("input"),c=o(),J(u.$$.fragment),this.h()},l(w){l=f(w,"DIV",{class:!0});var T=I(l);for(let y=0;y<k.length;y+=1)k[y].l(T);e=a(T),i=f(T,"DIV",{class:!0});var Q=I(i);r=f(Q,"INPUT",{class:!0,type:!0}),Q.forEach(b),c=a(T),q(u.$$.fragment,T),T.forEach(b),this.h()},h(){$(r,"class","new"),$(r,"type","button"),r.value=p=t[1]("list_input.new"),r.disabled=g=t[0][t[0].length-1]==="",$(i,"class","flex-in"),$(l,"class","list-input outline flex svelte-1ep4x0u")},m(w,T){ee(w,l,T);for(let Q=0;Q<k.length;Q+=1)k[Q].m(l,null);n(l,e),n(l,i),n(i,r),n(l,c),H(u,l,null),d=!0,v||(E=K(r,"click",t[4]),v=!0)},p(w,[T]){if(T&3){h=[...w[0].entries()].map(yi);let y;for(y=0;y<h.length;y+=1){const O=Ii(w,h,y);k[y]?k[y].p(O,T):(k[y]=Ni(O),k[y].c(),k[y].m(l,e))}for(;y<k.length;y+=1)k[y].d(1);k.length=h.length}(!d||T&2&&p!==(p=w[1]("list_input.new")))&&(r.value=p),(!d||T&1&&g!==(g=w[0][w[0].length-1]===""))&&(r.disabled=g);const Q={};T&257&&(Q.$$scope={dirty:T,ctx:w}),u.$set(Q)},i(w){d||(j(u.$$.fragment,w),d=!0)},o(w){S(u.$$.fragment,w),d=!1},d(w){w&&b(l),Cl(k,w),M(u),v=!1,E()}}}const yi=t=>t[0];function fs(t,l,e){let i;Et(t,Yl,u=>e(1,i=u));let{list:r}=l;function p(u){r[u]=this.value,e(0,r)}const g=u=>{r.splice(u,u),e(0,r)},c=()=>{r.push(""),e(0,r)};return t.$$set=u=>{"list"in u&&e(0,r=u.list)},[r,i,p,g,c]}class si extends Rl{constructor(l){super();Jl(this,l,fs,_s,ql,{list:0})}}function Bi(t,l,e){const i=t.slice();return i[34]=l[e],i[35]=l,i[36]=e,i}function Ui(t,l,e){const i=t.slice();return i[37]=l[e],i[38]=l,i[39]=e,i}function cs(t){let l,e,i,r,p,g,c,u,d,v,E,h,k,w,T,Q,y,O,ie,U=t[10]("oclient.meta")+"",z,W,_e,qe=t[10]("oclient.id")+"",rt,wt,se,He,$t,fe,Me=t[10]("oclient.client_id")+"",ut,Lt,re,Ye,It,L,Nt=t[10]("oclient.client_id_issued_at")+"",ll,Gl,Le,yt,Kl,Ge,Bt=t[10]("oclient.client_secret")+"",nl,zl,Ie,Ut,Fl,Ke,Pt=t[10]("oclient.client_secret_expires_at")+"",il,Ql,Ne,Tt,Wl,R,Dt,At=t[10]("oclient.oauth")+"",sl,Xl,Vt=t[10]("oclient.redirect_uris")+"",rl,Zl,ce,xl,en,ye,ot,jt=t[10]("oclient.token_endpoint_auth_method")+"",ul,tn,pe,ln,nn,at,he,_t,Ot=t[10]("oclient.grant_types")+"",ol,sn,rn,de,ft,Ct=t[10]("oclient.response_types")+"",al,un,on,ze,St=t[10]("oclient.scope")+"",_l,an,Be,_n,Fe,Rt=t[10]("oclient.jwks_uri")+"",fl,fn,Ue,cn,Jt=t[10]("oclient.jwks")+"",cl,pn,me,hn,dn,N,qt,Ht=t[10]("oclient.identity")+"",pl,mn,ge,Mt=t[10]("oclient.client_name")+"",hl,gn,Qe,vn,Pe,bn,kn,En,ve,Yt=t[10]("oclient.client_uri")+"",dl,wn,We,$n,Te,Ln,In,Nn,be,Gt=t[10]("oclient.logo_uri")+"",ml,yn,Xe,Bn,De,Un,Pn,Tn,Kt=t[10]("oclient.contacts")+"",gl,Dn,Ze,An,ke,Vn,jn,On,Cn,Ee,zt=t[10]("oclient.tos_uri")+"",vl,Sn,xe,Rn,Ae,Jn,qn,Hn,we,Ft=t[10]("oclient.policy_uri")+"",bl,Mn,et,Yn,Ve,Gn,Kn,zn,tt,Qt=t[10]("oclient.software_id")+"",kl,Fn,je,Qn,Wn,Xn,lt,Wt=t[10]("oclient.software_version")+"",El,Zn,Oe,xn,Ce,ei,Se,ti,ue,Xt,Zt=t[10]("oclient.public_preview")+"",wl,li,nt,xt=t[10]("oclient.public_link")+"",$l,Ll,ni,Re,Il,B,ii,oi,X=!t[1]&&Pi(t),F=t[5]&&Ti();T=new Ji({props:{msg:t[7],passive:!0}});function qi(s){t[16](s)}let ai={};t[0].redirect_uris!==void 0&&(ai.list=t[0].redirect_uris),ce=new si({props:ai}),tl.push(()=>Vl(ce,"list",qi));function Hi(s){t[17](s)}let _i={items:t[9].token_endpoint_auth_methods_supported.map(Vi)};t[2]!==void 0&&(_i.value=t[2]),pe=new is({props:_i}),tl.push(()=>Vl(pe,"value",Hi));let ct=t[9].grant_types_supported,Z=[];for(let s=0;s<ct.length;s+=1)Z[s]=Di(Ui(t,ct,s));let pt=t[9].response_types_supported,x=[];for(let s=0;s<pt.length;s+=1)x[s]=Ai(Bi(t,pt,s));function Mi(s){t[22](s)}let fi={};t[0].jwks!==void 0&&(fi.list=t[0].jwks),me=new si({props:fi}),tl.push(()=>Vl(me,"list",Mi)),Qe=new kt({}),We=new kt({}),Xe=new kt({}),Ze=new kt({});function Yi(s){t[26](s)}let ci={};return t[0].contacts!==void 0&&(ci.list=t[0].contacts),ke=new si({props:ci}),tl.push(()=>Vl(ke,"list",Yi)),xe=new kt({}),et=new kt({}),Ce=new ri({props:{level:"debug",$$slots:{default:[hs]},$$scope:{ctx:t}}}),Se=new ri({props:{level:"debug",$$slots:{default:[ds]},$$scope:{ctx:t}}}),Re=new ns({props:{ocl:t[0],name:t[1],userId:t[11].uid,userName:t[11].name}}),{c(){l=_("section"),e=_("div"),i=_("h2"),r=_("span"),p=o(),X&&X.c(),g=o(),F&&F.c(),c=o(),u=_("div"),d=_("input"),E=o(),h=_("input"),w=o(),J(T.$$.fragment),Q=o(),y=_("div"),O=_("div"),ie=_("h3"),z=D(U),W=o(),_e=_("label"),rt=D(qe),wt=o(),se=_("input"),$t=o(),fe=_("label"),ut=D(Me),Lt=o(),re=_("input"),It=o(),L=_("label"),ll=D(Nt),Gl=o(),Le=_("input"),Kl=o(),Ge=_("label"),nl=D(Bt),zl=o(),Ie=_("input"),Fl=o(),Ke=_("label"),il=D(Pt),Ql=o(),Ne=_("input"),Wl=o(),R=_("div"),Dt=_("h3"),sl=D(At),Xl=o(),rl=D(Vt),Zl=o(),J(ce.$$.fragment),en=o(),ye=_("div"),ot=_("div"),ul=D(jt),tn=o(),J(pe.$$.fragment),nn=o(),at=_("div"),he=_("div"),_t=_("div"),ol=D(Ot),sn=o();for(let s=0;s<Z.length;s+=1)Z[s].c();rn=o(),de=_("div"),ft=_("div"),al=D(Ct),un=o();for(let s=0;s<x.length;s+=1)x[s].c();on=o(),ze=_("label"),_l=D(St),an=o(),Be=_("input"),_n=o(),Fe=_("label"),fl=D(Rt),fn=o(),Ue=_("input"),cn=o(),cl=D(Jt),pn=o(),J(me.$$.fragment),dn=o(),N=_("div"),qt=_("h3"),pl=D(Ht),mn=o(),ge=_("label"),hl=D(Mt),gn=o(),J(Qe.$$.fragment),vn=o(),Pe=_("input"),bn=o(),kn=_("br"),En=o(),ve=_("label"),dl=D(Yt),wn=o(),J(We.$$.fragment),$n=o(),Te=_("input"),Ln=o(),In=_("br"),Nn=o(),be=_("label"),ml=D(Gt),yn=o(),J(Xe.$$.fragment),Bn=o(),De=_("input"),Un=o(),Pn=_("br"),Tn=o(),gl=D(Kt),Dn=o(),J(Ze.$$.fragment),An=o(),J(ke.$$.fragment),jn=o(),On=_("br"),Cn=o(),Ee=_("label"),vl=D(zt),Sn=o(),J(xe.$$.fragment),Rn=o(),Ae=_("input"),Jn=o(),qn=_("br"),Hn=o(),we=_("label"),bl=D(Ft),Mn=o(),J(et.$$.fragment),Yn=o(),Ve=_("input"),Gn=o(),Kn=_("br"),zn=o(),tt=_("label"),kl=D(Qt),Fn=o(),je=_("input"),Qn=o(),Wn=_("br"),Xn=o(),lt=_("label"),El=D(Wt),Zn=o(),Oe=_("input"),xn=o(),J(Ce.$$.fragment),ei=o(),J(Se.$$.fragment),ti=o(),ue=_("div"),Xt=_("h3"),wl=D(Zt),li=o(),nt=_("a"),$l=D(xt),ni=o(),J(Re.$$.fragment),this.h()},l(s){l=f(s,"SECTION",{class:!0,id:!0});var m=I(l);e=f(m,"DIV",{class:!0});var te=I(e);i=f(te,"H2",{class:!0});var $e=I(i);r=f($e,"SPAN",{contenteditable:!0}),I(r).forEach(b),p=a($e),X&&X.l($e),g=a($e),F&&F.l($e),$e.forEach(b),c=a(te),u=f(te,"DIV",{class:!0});var oe=I(u);d=f(oe,"INPUT",{class:!0,type:!0}),E=a(oe),h=f(oe,"INPUT",{class:!0,type:!0}),w=a(oe),q(T.$$.fragment,oe),oe.forEach(b),te.forEach(b),Q=a(m),y=f(m,"DIV",{class:!0});var ne=I(y);O=f(ne,"DIV",{class:!0});var le=I(O);ie=f(le,"H3",{});var el=I(ie);z=A(el,U),el.forEach(b),W=a(le),_e=f(le,"LABEL",{});var it=I(_e);rt=A(it,qe),wt=a(it),se=f(it,"INPUT",{type:!0}),it.forEach(b),$t=a(le),fe=f(le,"LABEL",{});var Je=I(fe);ut=A(Je,Me),Lt=a(Je),re=f(Je,"INPUT",{type:!0}),Je.forEach(b),It=a(le),L=f(le,"LABEL",{});var C=I(L);ll=A(C,Nt),Gl=a(C),Le=f(C,"INPUT",{type:!0}),C.forEach(b),Kl=a(le),Ge=f(le,"LABEL",{});var ae=I(Ge);nl=A(ae,Bt),zl=a(ae),Ie=f(ae,"INPUT",{type:!0}),ae.forEach(b),Fl=a(le),Ke=f(le,"LABEL",{});var Nl=I(Ke);il=A(Nl,Pt),Ql=a(Nl),Ne=f(Nl,"INPUT",{type:!0}),Nl.forEach(b),le.forEach(b),Wl=a(ne),R=f(ne,"DIV",{class:!0});var Y=I(R);Dt=f(Y,"H3",{});var pi=I(Dt);sl=A(pi,At),pi.forEach(b),Xl=a(Y),rl=A(Y,Vt),Zl=a(Y),q(ce.$$.fragment,Y),en=a(Y),ye=f(Y,"DIV",{class:!0});var yl=I(ye);ot=f(yl,"DIV",{class:!0});var hi=I(ot);ul=A(hi,jt),hi.forEach(b),tn=a(yl),q(pe.$$.fragment,yl),yl.forEach(b),nn=a(Y),at=f(Y,"DIV",{class:!0});var di=I(at);he=f(di,"DIV",{class:!0});var Bl=I(he);_t=f(Bl,"DIV",{class:!0});var mi=I(_t);ol=A(mi,Ot),mi.forEach(b),sn=a(Bl);for(let st=0;st<Z.length;st+=1)Z[st].l(Bl);Bl.forEach(b),di.forEach(b),rn=a(Y),de=f(Y,"DIV",{class:!0});var Ul=I(de);ft=f(Ul,"DIV",{class:!0});var gi=I(ft);al=A(gi,Ct),gi.forEach(b),un=a(Ul);for(let st=0;st<x.length;st+=1)x[st].l(Ul);Ul.forEach(b),on=a(Y),ze=f(Y,"LABEL",{});var Pl=I(ze);_l=A(Pl,St),an=a(Pl),Be=f(Pl,"INPUT",{type:!0}),Pl.forEach(b),_n=a(Y),Fe=f(Y,"LABEL",{});var Tl=I(Fe);fl=A(Tl,Rt),fn=a(Tl),Ue=f(Tl,"INPUT",{type:!0}),Tl.forEach(b),cn=a(Y),cl=A(Y,Jt),pn=a(Y),q(me.$$.fragment,Y),Y.forEach(b),dn=a(ne),N=f(ne,"DIV",{class:!0});var P=I(N);qt=f(P,"H3",{});var vi=I(qt);pl=A(vi,Ht),vi.forEach(b),mn=a(P),ge=f(P,"LABEL",{});var ht=I(ge);hl=A(ht,Mt),gn=a(ht),q(Qe.$$.fragment,ht),vn=a(ht),Pe=f(ht,"INPUT",{type:!0}),ht.forEach(b),bn=a(P),kn=f(P,"BR",{}),En=a(P),ve=f(P,"LABEL",{});var dt=I(ve);dl=A(dt,Yt),wn=a(dt),q(We.$$.fragment,dt),$n=a(dt),Te=f(dt,"INPUT",{type:!0}),dt.forEach(b),Ln=a(P),In=f(P,"BR",{}),Nn=a(P),be=f(P,"LABEL",{});var mt=I(be);ml=A(mt,Gt),yn=a(mt),q(Xe.$$.fragment,mt),Bn=a(mt),De=f(mt,"INPUT",{type:!0}),mt.forEach(b),Un=a(P),Pn=f(P,"BR",{}),Tn=a(P),gl=A(P,Kt),Dn=a(P),q(Ze.$$.fragment,P),An=a(P),q(ke.$$.fragment,P),jn=a(P),On=f(P,"BR",{}),Cn=a(P),Ee=f(P,"LABEL",{});var gt=I(Ee);vl=A(gt,zt),Sn=a(gt),q(xe.$$.fragment,gt),Rn=a(gt),Ae=f(gt,"INPUT",{type:!0}),gt.forEach(b),Jn=a(P),qn=f(P,"BR",{}),Hn=a(P),we=f(P,"LABEL",{});var vt=I(we);bl=A(vt,Ft),Mn=a(vt),q(et.$$.fragment,vt),Yn=a(vt),Ve=f(vt,"INPUT",{type:!0}),vt.forEach(b),Gn=a(P),Kn=f(P,"BR",{}),zn=a(P),tt=f(P,"LABEL",{});var Dl=I(tt);kl=A(Dl,Qt),Fn=a(Dl),je=f(Dl,"INPUT",{type:!0}),Dl.forEach(b),Qn=a(P),Wn=f(P,"BR",{}),Xn=a(P),lt=f(P,"LABEL",{});var Al=I(lt);El=A(Al,Wt),Zn=a(Al),Oe=f(Al,"INPUT",{type:!0}),Al.forEach(b),P.forEach(b),xn=a(ne),q(Ce.$$.fragment,ne),ei=a(ne),q(Se.$$.fragment,ne),ne.forEach(b),ti=a(m),ue=f(m,"DIV",{class:!0});var bt=I(ue);Xt=f(bt,"H3",{});var bi=I(Xt);wl=A(bi,Zt),bi.forEach(b),li=a(bt),nt=f(bt,"A",{href:!0});var ki=I(nt);$l=A(ki,xt),ki.forEach(b),ni=a(bt),q(Re.$$.fragment,bt),bt.forEach(b),m.forEach(b),this.h()},h(){$(r,"contenteditable","true"),t[1]===void 0&&Zi(()=>t[14].call(r)),$(i,"class","svelte-1e3d45k"),$(d,"class","delete"),$(d,"type","button"),d.value=v=t[10]("oclient.delete"),$(h,"class","update"),$(h,"type","button"),h.value=k=t[10]("oclient.update"),$(u,"class","action svelte-1e3d45k"),$(e,"class","meta flex flex-row svelte-1e3d45k"),$(se,"type","text"),se.value=He=t[0].id,se.disabled=!0,$(re,"type","text"),re.value=Ye=t[0].client_id,re.disabled=!0,$(Le,"type","text"),Le.value=yt=t[0].client_id_issued_at,Le.disabled=!0,$(Ie,"type","text"),Ie.value=Ut=t[0].client_secret,Ie.disabled=!0,$(Ne,"type","text"),Ne.value=Tt=t[0].client_secret_expires_at,Ne.disabled=!0,$(O,"class","oclmeta padded flex-in svelte-1e3d45k"),$(ot,"class","label svelte-1e3d45k"),$(ye,"class","prop svelte-1e3d45k"),$(_t,"class","label svelte-1e3d45k"),$(he,"class","prop svelte-1e3d45k"),$(at,"class","prop svelte-1e3d45k"),$(ft,"class","label svelte-1e3d45k"),$(de,"class","prop svelte-1e3d45k"),$(Be,"type","text"),$(Ue,"type","text"),$(R,"class","ocloauth padded flex-in svelte-1e3d45k"),$(Pe,"type","text"),$(Te,"type","text"),$(De,"type","text"),$(Ae,"type","text"),$(Ve,"type","text"),$(je,"type","text"),$(Oe,"type","text"),$(N,"class","oclidentity padded flex-in svelte-1e3d45k"),$(y,"class","ocl content flex svelte-1e3d45k"),$(nt,"href",Ll="/oclient?oclid="+t[0].client_id),$(ue,"class","oclpp padded flex-in"),$(l,"class","oclient panel flex flex-column"),$(l,"id",Il=t[0].id)},m(s,m){ee(s,l,m),n(l,e),n(e,i),n(i,r),t[1]!==void 0&&(r.textContent=t[1]),t[15](r),n(i,p),X&&X.m(i,null),n(i,g),F&&F.m(i,null),n(e,c),n(e,u),n(u,d),n(u,E),n(u,h),n(u,w),H(T,u,null),n(l,Q),n(l,y),n(y,O),n(O,ie),n(ie,z),n(O,W),n(O,_e),n(_e,rt),n(_e,wt),n(_e,se),n(O,$t),n(O,fe),n(fe,ut),n(fe,Lt),n(fe,re),n(O,It),n(O,L),n(L,ll),n(L,Gl),n(L,Le),n(O,Kl),n(O,Ge),n(Ge,nl),n(Ge,zl),n(Ge,Ie),n(O,Fl),n(O,Ke),n(Ke,il),n(Ke,Ql),n(Ke,Ne),n(y,Wl),n(y,R),n(R,Dt),n(Dt,sl),n(R,Xl),n(R,rl),n(R,Zl),H(ce,R,null),n(R,en),n(R,ye),n(ye,ot),n(ot,ul),n(ye,tn),H(pe,ye,null),n(R,nn),n(R,at),n(at,he),n(he,_t),n(_t,ol),n(he,sn);for(let te=0;te<Z.length;te+=1)Z[te].m(he,null);n(R,rn),n(R,de),n(de,ft),n(ft,al),n(de,un);for(let te=0;te<x.length;te+=1)x[te].m(de,null);n(R,on),n(R,ze),n(ze,_l),n(ze,an),n(ze,Be),G(Be,t[0].scope),n(R,_n),n(R,Fe),n(Fe,fl),n(Fe,fn),n(Fe,Ue),G(Ue,t[0].jwks_uri),n(R,cn),n(R,cl),n(R,pn),H(me,R,null),n(y,dn),n(y,N),n(N,qt),n(qt,pl),n(N,mn),n(N,ge),n(ge,hl),n(ge,gn),H(Qe,ge,null),n(ge,vn),n(ge,Pe),G(Pe,t[1]),n(N,bn),n(N,kn),n(N,En),n(N,ve),n(ve,dl),n(ve,wn),H(We,ve,null),n(ve,$n),n(ve,Te),G(Te,t[0].client_uri),n(N,Ln),n(N,In),n(N,Nn),n(N,be),n(be,ml),n(be,yn),H(Xe,be,null),n(be,Bn),n(be,De),G(De,t[0].logo_uri),n(N,Un),n(N,Pn),n(N,Tn),n(N,gl),n(N,Dn),H(Ze,N,null),n(N,An),H(ke,N,null),n(N,jn),n(N,On),n(N,Cn),n(N,Ee),n(Ee,vl),n(Ee,Sn),H(xe,Ee,null),n(Ee,Rn),n(Ee,Ae),G(Ae,t[0].tos_uri),n(N,Jn),n(N,qn),n(N,Hn),n(N,we),n(we,bl),n(we,Mn),H(et,we,null),n(we,Yn),n(we,Ve),G(Ve,t[0].policy_uri),n(N,Gn),n(N,Kn),n(N,zn),n(N,tt),n(tt,kl),n(tt,Fn),n(tt,je),G(je,t[0].software_id),n(N,Qn),n(N,Wn),n(N,Xn),n(N,lt),n(lt,El),n(lt,Zn),n(lt,Oe),G(Oe,t[0].software_version),n(y,xn),H(Ce,y,null),n(y,ei),H(Se,y,null),n(l,ti),n(l,ue),n(ue,Xt),n(Xt,wl),n(ue,li),n(ue,nt),n(nt,$l),n(ue,ni),H(Re,ue,null),B=!0,ii||(oi=[K(r,"input",t[14]),K(d,"click",t[12]),K(h,"click",t[13]),K(Be,"input",t[20]),K(Ue,"input",t[21]),K(Pe,"input",t[23]),K(Te,"input",t[24]),K(De,"input",t[25]),K(Ae,"input",t[27]),K(Ve,"input",t[28]),K(je,"input",t[29]),K(Oe,"input",t[30])],ii=!0)},p(s,m){m[0]&2&&s[1]!==r.textContent&&(r.textContent=s[1]),s[1]?X&&(X.d(1),X=null):X?X.p(s,m):(X=Pi(s),X.c(),X.m(i,g)),s[5]?F?m[0]&32&&j(F,1):(F=Ti(),F.c(),j(F,1),F.m(i,null)):F&&(Hl(),S(F,1,1,()=>{F=null}),Ml()),(!B||m[0]&1024&&v!==(v=s[10]("oclient.delete")))&&(d.value=v),(!B||m[0]&1024&&k!==(k=s[10]("oclient.update")))&&(h.value=k);const te={};m[0]&128&&(te.msg=s[7]),T.$set(te),(!B||m[0]&1024)&&U!==(U=s[10]("oclient.meta")+"")&&V(z,U),(!B||m[0]&1024)&&qe!==(qe=s[10]("oclient.id")+"")&&V(rt,qe),(!B||m[0]&1&&He!==(He=s[0].id)&&se.value!==He)&&(se.value=He),(!B||m[0]&1024)&&Me!==(Me=s[10]("oclient.client_id")+"")&&V(ut,Me),(!B||m[0]&1&&Ye!==(Ye=s[0].client_id)&&re.value!==Ye)&&(re.value=Ye),(!B||m[0]&1024)&&Nt!==(Nt=s[10]("oclient.client_id_issued_at")+"")&&V(ll,Nt),(!B||m[0]&1&&yt!==(yt=s[0].client_id_issued_at)&&Le.value!==yt)&&(Le.value=yt),(!B||m[0]&1024)&&Bt!==(Bt=s[10]("oclient.client_secret")+"")&&V(nl,Bt),(!B||m[0]&1&&Ut!==(Ut=s[0].client_secret)&&Ie.value!==Ut)&&(Ie.value=Ut),(!B||m[0]&1024)&&Pt!==(Pt=s[10]("oclient.client_secret_expires_at")+"")&&V(il,Pt),(!B||m[0]&1&&Tt!==(Tt=s[0].client_secret_expires_at)&&Ne.value!==Tt)&&(Ne.value=Tt),(!B||m[0]&1024)&&At!==(At=s[10]("oclient.oauth")+"")&&V(sl,At),(!B||m[0]&1024)&&Vt!==(Vt=s[10]("oclient.redirect_uris")+"")&&V(rl,Vt);const $e={};!xl&&m[0]&1&&(xl=!0,$e.list=s[0].redirect_uris,jl(()=>xl=!1)),ce.$set($e),(!B||m[0]&1024)&&jt!==(jt=s[10]("oclient.token_endpoint_auth_method")+"")&&V(ul,jt);const oe={};if(m[0]&512&&(oe.items=s[9].token_endpoint_auth_methods_supported.map(Vi)),!ln&&m[0]&4&&(ln=!0,oe.value=s[2],jl(()=>ln=!1)),pe.$set(oe),(!B||m[0]&1024)&&Ot!==(Ot=s[10]("oclient.grant_types")+"")&&V(ol,Ot),m[0]&528){ct=s[9].grant_types_supported;let C;for(C=0;C<ct.length;C+=1){const ae=Ui(s,ct,C);Z[C]?Z[C].p(ae,m):(Z[C]=Di(ae),Z[C].c(),Z[C].m(he,null))}for(;C<Z.length;C+=1)Z[C].d(1);Z.length=ct.length}if((!B||m[0]&1024)&&Ct!==(Ct=s[10]("oclient.response_types")+"")&&V(al,Ct),m[0]&520){pt=s[9].response_types_supported;let C;for(C=0;C<pt.length;C+=1){const ae=Bi(s,pt,C);x[C]?x[C].p(ae,m):(x[C]=Ai(ae),x[C].c(),x[C].m(de,null))}for(;C<x.length;C+=1)x[C].d(1);x.length=pt.length}(!B||m[0]&1024)&&St!==(St=s[10]("oclient.scope")+"")&&V(_l,St),m[0]&1&&Be.value!==s[0].scope&&G(Be,s[0].scope),(!B||m[0]&1024)&&Rt!==(Rt=s[10]("oclient.jwks_uri")+"")&&V(fl,Rt),m[0]&1&&Ue.value!==s[0].jwks_uri&&G(Ue,s[0].jwks_uri),(!B||m[0]&1024)&&Jt!==(Jt=s[10]("oclient.jwks")+"")&&V(cl,Jt);const ne={};!hn&&m[0]&1&&(hn=!0,ne.list=s[0].jwks,jl(()=>hn=!1)),me.$set(ne),(!B||m[0]&1024)&&Ht!==(Ht=s[10]("oclient.identity")+"")&&V(pl,Ht),(!B||m[0]&1024)&&Mt!==(Mt=s[10]("oclient.client_name")+"")&&V(hl,Mt),m[0]&2&&Pe.value!==s[1]&&G(Pe,s[1]),(!B||m[0]&1024)&&Yt!==(Yt=s[10]("oclient.client_uri")+"")&&V(dl,Yt),m[0]&1&&Te.value!==s[0].client_uri&&G(Te,s[0].client_uri),(!B||m[0]&1024)&&Gt!==(Gt=s[10]("oclient.logo_uri")+"")&&V(ml,Gt),m[0]&1&&De.value!==s[0].logo_uri&&G(De,s[0].logo_uri),(!B||m[0]&1024)&&Kt!==(Kt=s[10]("oclient.contacts")+"")&&V(gl,Kt);const le={};!Vn&&m[0]&1&&(Vn=!0,le.list=s[0].contacts,jl(()=>Vn=!1)),ke.$set(le),(!B||m[0]&1024)&&zt!==(zt=s[10]("oclient.tos_uri")+"")&&V(vl,zt),m[0]&1&&Ae.value!==s[0].tos_uri&&G(Ae,s[0].tos_uri),(!B||m[0]&1024)&&Ft!==(Ft=s[10]("oclient.policy_uri")+"")&&V(bl,Ft),m[0]&1&&Ve.value!==s[0].policy_uri&&G(Ve,s[0].policy_uri),(!B||m[0]&1024)&&Qt!==(Qt=s[10]("oclient.software_id")+"")&&V(kl,Qt),m[0]&1&&je.value!==s[0].software_id&&G(je,s[0].software_id),(!B||m[0]&1024)&&Wt!==(Wt=s[10]("oclient.software_version")+"")&&V(El,Wt),m[0]&1&&Oe.value!==s[0].software_version&&G(Oe,s[0].software_version);const el={};m[0]&1|m[1]&512&&(el.$$scope={dirty:m,ctx:s}),Ce.$set(el);const it={};m[0]&256|m[1]&512&&(it.$$scope={dirty:m,ctx:s}),Se.$set(it),(!B||m[0]&1024)&&Zt!==(Zt=s[10]("oclient.public_preview")+"")&&V(wl,Zt),(!B||m[0]&1024)&&xt!==(xt=s[10]("oclient.public_link")+"")&&V($l,xt),(!B||m[0]&1&&Ll!==(Ll="/oclient?oclid="+s[0].client_id))&&$(nt,"href",Ll);const Je={};m[0]&1&&(Je.ocl=s[0]),m[0]&2&&(Je.name=s[1]),Re.$set(Je),(!B||m[0]&1&&Il!==(Il=s[0].id))&&$(l,"id",Il)},i(s){B||(j(F),j(T.$$.fragment,s),j(ce.$$.fragment,s),j(pe.$$.fragment,s),j(me.$$.fragment,s),j(Qe.$$.fragment,s),j(We.$$.fragment,s),j(Xe.$$.fragment,s),j(Ze.$$.fragment,s),j(ke.$$.fragment,s),j(xe.$$.fragment,s),j(et.$$.fragment,s),j(Ce.$$.fragment,s),j(Se.$$.fragment,s),j(Re.$$.fragment,s),B=!0)},o(s){S(F),S(T.$$.fragment,s),S(ce.$$.fragment,s),S(pe.$$.fragment,s),S(me.$$.fragment,s),S(Qe.$$.fragment,s),S(We.$$.fragment,s),S(Xe.$$.fragment,s),S(Ze.$$.fragment,s),S(ke.$$.fragment,s),S(xe.$$.fragment,s),S(et.$$.fragment,s),S(Ce.$$.fragment,s),S(Se.$$.fragment,s),S(Re.$$.fragment,s),B=!1},d(s){s&&b(l),t[15](null),X&&X.d(),F&&F.d(),M(T),M(ce),M(pe),Cl(Z,s),Cl(x,s),M(me),M(Qe),M(We),M(Xe),M(Ze),M(ke),M(xe),M(et),M(Ce),M(Se),M(Re),ii=!1,ui(oi)}}}function ps(t){let l,e;return l=new Ri({}),{c(){J(l.$$.fragment)},l(i){q(l.$$.fragment,i)},m(i,r){H(l,i,r),e=!0},p:Si,i(i){e||(j(l.$$.fragment,i),e=!0)},o(i){S(l.$$.fragment,i),e=!1},d(i){M(l,i)}}}function Pi(t){let l,e=t[10]("untitled")+"",i,r,p;return{c(){l=_("em"),i=D(e)},l(g){l=f(g,"EM",{});var c=I(l);i=A(c,e),c.forEach(b)},m(g,c){ee(g,l,c),n(l,i),r||(p=K(l,"click",function(){Xi(t[6].focus())&&t[6].focus().apply(this,arguments)}),r=!0)},p(g,c){t=g,c[0]&1024&&e!==(e=t[10]("untitled")+"")&&V(i,e)},d(g){g&&b(l),r=!1,p()}}}function Ti(t){let l,e;return l=new rs({}),{c(){J(l.$$.fragment)},l(i){q(l.$$.fragment,i)},m(i,r){H(l,i,r),e=!0},i(i){e||(j(l.$$.fragment,i),e=!0)},o(i){S(l.$$.fragment,i),e=!1},d(i){M(l,i)}}}function Di(t){let l,e,i,r,p=t[37]+"",g,c,u,d;function v(){t[18].call(e,t[37])}return{c(){l=_("label"),e=_("input"),i=o(),r=_("code"),g=D(p),c=o(),this.h()},l(E){l=f(E,"LABEL",{});var h=I(l);e=f(h,"INPUT",{type:!0}),i=a(h),r=f(h,"CODE",{});var k=I(r);g=A(k,p),k.forEach(b),c=a(h),h.forEach(b),this.h()},h(){$(e,"type","checkbox")},m(E,h){ee(E,l,h),n(l,e),e.checked=t[4][t[37]],n(l,i),n(l,r),n(r,g),n(l,c),u||(d=K(e,"change",v),u=!0)},p(E,h){t=E,h[0]&528&&(e.checked=t[4][t[37]]),h[0]&512&&p!==(p=t[37]+"")&&V(g,p)},d(E){E&&b(l),u=!1,d()}}}function Ai(t){let l,e,i,r,p=t[34]+"",g,c,u,d;function v(){t[19].call(e,t[34])}return{c(){l=_("label"),e=_("input"),i=o(),r=_("code"),g=D(p),c=o(),this.h()},l(E){l=f(E,"LABEL",{});var h=I(l);e=f(h,"INPUT",{type:!0}),i=a(h),r=f(h,"CODE",{});var k=I(r);g=A(k,p),k.forEach(b),c=a(h),h.forEach(b),this.h()},h(){$(e,"type","checkbox")},m(E,h){ee(E,l,h),n(l,e),e.checked=t[3][t[34]],n(l,i),n(l,r),n(r,g),n(l,c),u||(d=K(e,"change",v),u=!0)},p(E,h){t=E,h[0]&520&&(e.checked=t[3][t[34]]),h[0]&512&&p!==(p=t[34]+"")&&V(g,p)},d(E){E&&b(l),u=!1,d()}}}function hs(t){let l,e=JSON.stringify(t[0],null,2)+"",i;return{c(){l=_("pre"),i=D(e)},l(r){l=f(r,"PRE",{});var p=I(l);i=A(p,e),p.forEach(b)},m(r,p){ee(r,l,p),n(l,i)},p(r,p){p[0]&1&&e!==(e=JSON.stringify(r[0],null,2)+"")&&V(i,e)},d(r){r&&b(l)}}}function ds(t){let l,e=JSON.stringify(t[8],null,2)+"",i;return{c(){l=_("pre"),i=D(e)},l(r){l=f(r,"PRE",{});var p=I(l);i=A(p,e),p.forEach(b)},m(r,p){ee(r,l,p),n(l,i)},p(r,p){p[0]&256&&e!==(e=JSON.stringify(r[8],null,2)+"")&&V(i,e)},d(r){r&&b(l)}}}function ms(t){let l,e,i,r;const p=[ps,cs],g=[];function c(u,d){return u[9]?1:0}return l=c(t),e=g[l]=p[l](t),{c(){e.c(),i=Sl()},l(u){e.l(u),i=Sl()},m(u,d){g[l].m(u,d),ee(u,i,d),r=!0},p(u,d){let v=l;l=c(u),l===v?g[l].p(u,d):(Hl(),S(g[v],1,1,()=>{g[v]=null}),Ml(),e=g[l],e?e.p(u,d):(e=g[l]=p[l](u),e.c()),j(e,1),e.m(i.parentNode,i))},i(u){r||(j(e),r=!0)},o(u){S(e),r=!1},d(u){g[l].d(u),u&&b(i)}}}const Vi=t=>({value:t,label:t});function gs(t,l,e){let i,r,p;Et(t,es,L=>e(31,i=L)),Et(t,ts,L=>e(32,r=L)),Et(t,Yl,L=>e(10,p=L));let g=r.get(i);const c=Wi();let{oclient:u}=l,d=!1,v=u.client_name||null,E,h={value:u.token_endpoint_auth_method,label:u.token_endpoint_auth_method},k={};for(const L of u.response_types)k[L]=!0;let w={};for(const L of u.grant_types)w[L]=!0;let T;async function Q(){try{await Ol.oclientDelete(u.id),c("reload")}catch(L){e(7,T=L)}}let y;async function O(){try{await Ol.oclientEdit(u.id,y),e(7,T="")}catch(L){e(7,T=L.toString())}e(0,u),e(2,h),e(3,k),e(4,w)}let ie;Ci(async()=>{const L=new URL(".well-known/openid-configuration",Ol.baseUrl);e(9,ie=await(await fetch(L.toString())).json())});function U(){v=this.textContent,e(1,v)}function z(L){tl[L?"unshift":"push"](()=>{E=L,e(6,E)})}function W(L){t.$$.not_equal(u.redirect_uris,L)&&(u.redirect_uris=L,e(0,u),e(2,h),e(3,k),e(4,w))}function _e(L){h=L,e(2,h)}function qe(L){w[L]=this.checked,e(4,w)}function rt(L){k[L]=this.checked,e(3,k)}function wt(){u.scope=this.value,e(0,u),e(2,h),e(3,k),e(4,w)}function se(){u.jwks_uri=this.value,e(0,u),e(2,h),e(3,k),e(4,w)}function He(L){t.$$.not_equal(u.jwks,L)&&(u.jwks=L,e(0,u),e(2,h),e(3,k),e(4,w))}function $t(){v=this.value,e(1,v)}function fe(){u.client_uri=this.value,e(0,u),e(2,h),e(3,k),e(4,w)}function Me(){u.logo_uri=this.value,e(0,u),e(2,h),e(3,k),e(4,w)}function ut(L){t.$$.not_equal(u.contacts,L)&&(u.contacts=L,e(0,u),e(2,h),e(3,k),e(4,w))}function Lt(){u.tos_uri=this.value,e(0,u),e(2,h),e(3,k),e(4,w)}function re(){u.policy_uri=this.value,e(0,u),e(2,h),e(3,k),e(4,w)}function Ye(){u.software_id=this.value,e(0,u),e(2,h),e(3,k),e(4,w)}function It(){u.software_version=this.value,e(0,u),e(2,h),e(3,k),e(4,w)}return t.$$set=L=>{"oclient"in L&&e(0,u=L.oclient)},t.$$.update=()=>{t.$$.dirty[0]&4&&e(0,u.token_endpoint_auth_method=h.value,u),t.$$.dirty[0]&8&&e(0,u.response_types=Object.entries(k).map(L=>L[0]),u),t.$$.dirty[0]&16&&e(0,u.grant_types=Object.entries(w).map(L=>L[0]),u),t.$$.dirty[0]&3&&e(5,d=(u.client_name||"")!==(v||"")),t.$$.dirty[0]&3&&e(8,y=Li($i({},u),{client_name:v}))},[u,v,h,k,w,d,E,T,y,ie,p,g,Q,O,U,z,W,_e,qe,rt,wt,se,He,$t,fe,Me,ut,Lt,re,Ye,It]}class vs extends Rl{constructor(l){super();Jl(this,l,gs,ms,ql,{oclient:0},null,[-1,-1])}}function ji(t,l,e){const i=t.slice();return i[7]=l[e],i}function bs(t){let l=t[4]("oclients.count",{values:{count:t[0].length}})+"",e,i,r,p,g=t[0],c=[];for(let d=0;d<g.length;d+=1)c[d]=Oi(ji(t,g,d));const u=d=>S(c[d],1,1,()=>{c[d]=null});return{c(){e=D(l),i=o();for(let d=0;d<c.length;d+=1)c[d].c();r=Sl()},l(d){e=A(d,l),i=a(d);for(let v=0;v<c.length;v+=1)c[v].l(d);r=Sl()},m(d,v){ee(d,e,v),ee(d,i,v);for(let E=0;E<c.length;E+=1)c[E].m(d,v);ee(d,r,v),p=!0},p(d,v){if((!p||v&17)&&l!==(l=d[4]("oclients.count",{values:{count:d[0].length}})+"")&&V(e,l),v&33){g=d[0];let E;for(E=0;E<g.length;E+=1){const h=ji(d,g,E);c[E]?(c[E].p(h,v),j(c[E],1)):(c[E]=Oi(h),c[E].c(),j(c[E],1),c[E].m(r.parentNode,r))}for(Hl(),E=g.length;E<c.length;E+=1)u(E);Ml()}},i(d){if(!p){for(let v=0;v<g.length;v+=1)j(c[v]);p=!0}},o(d){c=c.filter(Boolean);for(let v=0;v<c.length;v+=1)S(c[v]);p=!1},d(d){d&&b(e),d&&b(i),Cl(c,d),d&&b(r)}}}function ks(t){let l,e;return l=new Ji({props:{msg:t[1],passive:!0}}),{c(){J(l.$$.fragment)},l(i){q(l.$$.fragment,i)},m(i,r){H(l,i,r),e=!0},p(i,r){const p={};r&2&&(p.msg=i[1]),l.$set(p)},i(i){e||(j(l.$$.fragment,i),e=!0)},o(i){S(l.$$.fragment,i),e=!1},d(i){M(l,i)}}}function Es(t){let l,e;return l=new Ri({}),{c(){J(l.$$.fragment)},l(i){q(l.$$.fragment,i)},m(i,r){H(l,i,r),e=!0},p:Si,i(i){e||(j(l.$$.fragment,i),e=!0)},o(i){S(l.$$.fragment,i),e=!1},d(i){M(l,i)}}}function Oi(t){let l,e;return l=new vs({props:{oclient:t[7]}}),l.$on("reload",t[5]),{c(){J(l.$$.fragment)},l(i){q(l.$$.fragment,i)},m(i,r){H(l,i,r),e=!0},p(i,r){const p={};r&1&&(p.oclient=i[7]),l.$set(p)},i(i){e||(j(l.$$.fragment,i),e=!0)},o(i){S(l.$$.fragment,i),e=!1},d(i){M(l,i)}}}function ws(t){let l,e,i,r,p,g,c,u,d,v,E,h,k,w,T,Q;document.title=l=t[4]("header.oclients");const y=[Es,ks,bs],O=[];function ie(U,z){return U[3]===U[2].Loading?0:U[3]===U[2].LoadingError?1:U[3]===U[2].Loaded?2:-1}return~(h=ie(t))&&(k=O[h]=y[h](t)),{c(){e=o(),i=_("main"),r=_("input"),c=o(),u=_("input"),E=o(),k&&k.c(),this.h()},l(U){xi('[data-svelte="svelte-1790tyg"]',document.head).forEach(b),e=a(U),i=f(U,"MAIN",{class:!0});var W=I(i);r=f(W,"INPUT",{type:!0}),c=a(W),u=f(W,"INPUT",{class:!0,type:!0}),E=a(W),k&&k.l(W),W.forEach(b),this.h()},h(){$(r,"type","button"),r.value=p=t[4]("oclients.reload"),r.disabled=g=t[3]===t[2].Loading,$(u,"class","new"),$(u,"type","button"),u.value=d=t[4]("oclients.new"),u.disabled=v=t[3]===t[2].Loading,$(i,"class","oclients")},m(U,z){ee(U,e,z),ee(U,i,z),n(i,r),n(i,c),n(i,u),n(i,E),~h&&O[h].m(i,null),w=!0,T||(Q=[K(r,"click",t[5]),K(u,"click",t[6])],T=!0)},p(U,[z]){(!w||z&16)&&l!==(l=U[4]("header.oclients"))&&(document.title=l),(!w||z&16&&p!==(p=U[4]("oclients.reload")))&&(r.value=p),(!w||z&12&&g!==(g=U[3]===U[2].Loading))&&(r.disabled=g),(!w||z&16&&d!==(d=U[4]("oclients.new")))&&(u.value=d),(!w||z&12&&v!==(v=U[3]===U[2].Loading))&&(u.disabled=v);let W=h;h=ie(U),h===W?~h&&O[h].p(U,z):(k&&(Hl(),S(O[W],1,1,()=>{O[W]=null}),Ml()),~h?(k=O[h],k?k.p(U,z):(k=O[h]=y[h](U),k.c()),j(k,1),k.m(i,null)):k=null)},i(U){w||(j(k),w=!0)},o(U){S(k),w=!1},d(U){U&&b(e),U&&b(i),~h&&O[h].d(),T=!1,ui(Q)}}}function $s(t,l,e){let i;Et(t,Yl,v=>e(4,i=v));let r,p="";var g;(function(v){v[v.Loading=0]="Loading",v[v.LoadingError=1]="LoadingError",v[v.Loaded=2]="Loaded"})(g||(g={}));let c;Ci(async()=>{await ls(),u()});async function u(){console.log("reload"),e(3,c=g.Loading);try{e(0,r=await Ol.oclientsList()),e(3,c=g.Loaded)}catch(v){e(1,p=v.message),e(3,c=g.LoadingError)}}function d(){r.push({id:null,name:"",uri:"",grant_types:[],redirect_uris:[],response_types:[],scioe:"",token_endpoint_auth_method:"",client_id:"",client_secret:"",client_id_issued_at:"",client_secret_expires_at:""}),e(0,r)}return[r,p,g,c,i,u,d]}class Cs extends Rl{constructor(l){super();Jl(this,l,$s,ws,ql,{})}}export{Cs as default};
