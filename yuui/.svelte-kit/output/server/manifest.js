export const manifest = {
	appDir: "_app",
	assets: new Set(["favicon.svg","robots.txt"]),
	mimeTypes: {".svg":"image/svg+xml",".txt":"text/plain"},
	_: {
		entry: {"file":"start-2818f694.js","js":["start-2818f694.js","chunks/index-471c5598.js","chunks/index-0b2b7ad8.js","chunks/preload-helper-e4860ae8.js","chunks/singletons-d1fb5791.js"],"css":[]},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js'),
			() => import('./nodes/3.js'),
			() => import('./nodes/4.js'),
			() => import('./nodes/5.js'),
			() => import('./nodes/6.js'),
			() => import('./nodes/7.js'),
			() => import('./nodes/8.js'),
			() => import('./nodes/9.js'),
			() => import('./nodes/10.js'),
			() => import('./nodes/11.js'),
			() => import('./nodes/12.js'),
			() => import('./nodes/13.js'),
			() => import('./nodes/14.js'),
			() => import('./nodes/15.js'),
			() => import('./nodes/16.js'),
			() => import('./nodes/17.js'),
			() => import('./nodes/18.js')
		],
		routes: [
			{
				type: 'page',
				id: "",
				pattern: /^\/$/,
				names: [],
				types: [],
				path: "/",
				shadow: null,
				a: [0,2],
				b: [1]
			},
			{
				type: 'page',
				id: "remote-decide",
				pattern: /^\/remote-decide\/?$/,
				names: [],
				types: [],
				path: "/remote-decide",
				shadow: null,
				a: [0,3],
				b: [1]
			},
			{
				type: 'page',
				id: "email-verify",
				pattern: /^\/email-verify\/?$/,
				names: [],
				types: [],
				path: "/email-verify",
				shadow: null,
				a: [0,4],
				b: [1]
			},
			{
				type: 'page',
				id: "oclients",
				pattern: /^\/oclients\/?$/,
				names: [],
				types: [],
				path: "/oclients",
				shadow: null,
				a: [0,5],
				b: [1]
			},
			{
				type: 'page',
				id: "oclient",
				pattern: /^\/oclient\/?$/,
				names: [],
				types: [],
				path: "/oclient",
				shadow: null,
				a: [0,6],
				b: [1]
			},
			{
				type: 'page',
				id: "closet",
				pattern: /^\/closet\/?$/,
				names: [],
				types: [],
				path: "/closet",
				shadow: null,
				a: [0,7],
				b: [1]
			},
			{
				type: 'page',
				id: "config",
				pattern: /^\/config\/?$/,
				names: [],
				types: [],
				path: "/config",
				shadow: null,
				a: [0,8],
				b: [1]
			},
			{
				type: 'page',
				id: "grants",
				pattern: /^\/grants\/?$/,
				names: [],
				types: [],
				path: "/grants",
				shadow: null,
				a: [0,9],
				b: [1]
			},
			{
				type: 'page',
				id: "logout",
				pattern: /^\/logout\/?$/,
				names: [],
				types: [],
				path: "/logout",
				shadow: null,
				a: [0,10],
				b: [1]
			},
			{
				type: 'page',
				id: "signup",
				pattern: /^\/signup\/?$/,
				names: [],
				types: [],
				path: "/signup",
				shadow: null,
				a: [0,11],
				b: [1]
			},
			{
				type: 'page',
				id: "authz",
				pattern: /^\/authz\/?$/,
				names: [],
				types: [],
				path: "/authz",
				shadow: null,
				a: [0,12],
				b: [1]
			},
			{
				type: 'page',
				id: "login",
				pattern: /^\/login\/?$/,
				names: [],
				types: [],
				path: "/login",
				shadow: null,
				a: [0,13],
				b: [1]
			},
			{
				type: 'page',
				id: "iori",
				pattern: /^\/iori\/?$/,
				names: [],
				types: [],
				path: "/iori",
				shadow: null,
				a: [0,14],
				b: [1]
			},
			{
				type: 'page',
				id: "user",
				pattern: /^\/user\/?$/,
				names: [],
				types: [],
				path: "/user",
				shadow: null,
				a: [0,15],
				b: [1]
			},
			{
				type: 'page',
				id: "les",
				pattern: /^\/les\/?$/,
				names: [],
				types: [],
				path: "/les",
				shadow: null,
				a: [0,16],
				b: [1]
			},
			{
				type: 'page',
				id: "uls",
				pattern: /^\/uls\/?$/,
				names: [],
				types: [],
				path: "/uls",
				shadow: null,
				a: [0,17],
				b: [1]
			},
			{
				type: 'page',
				id: "ui",
				pattern: /^\/ui\/?$/,
				names: [],
				types: [],
				path: "/ui",
				shadow: null,
				a: [0,18],
				b: [1]
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
