export { matchers } from './client-matchers.js';

export const components = [
	() => import("../../src/routes/__layout.svelte"),
	() => import("../runtime/components/error.svelte"),
	() => import("../../src/routes/index.svelte"),
	() => import("../../src/routes/remote-decide.svelte"),
	() => import("../../src/routes/email-verify.svelte"),
	() => import("../../src/routes/oclients.svelte"),
	() => import("../../src/routes/oclient.svelte"),
	() => import("../../src/routes/closet.svelte"),
	() => import("../../src/routes/config.svelte"),
	() => import("../../src/routes/grants.svelte"),
	() => import("../../src/routes/logout.svelte"),
	() => import("../../src/routes/signup.svelte"),
	() => import("../../src/routes/authz.svelte"),
	() => import("../../src/routes/login.svelte"),
	() => import("../../src/routes/iori.svelte"),
	() => import("../../src/routes/user.svelte"),
	() => import("../../src/routes/les.svelte"),
	() => import("../../src/routes/uls.svelte"),
	() => import("../../src/routes/ui.svelte")
];

export const dictionary = {
	"": [[0, 2], [1]],
	"remote-decide": [[0, 3], [1]],
	"email-verify": [[0, 4], [1]],
	"oclients": [[0, 5], [1]],
	"oclient": [[0, 6], [1]],
	"closet": [[0, 7], [1]],
	"config": [[0, 8], [1]],
	"grants": [[0, 9], [1]],
	"logout": [[0, 10], [1]],
	"signup": [[0, 11], [1]],
	"authz": [[0, 12], [1]],
	"login": [[0, 13], [1]],
	"iori": [[0, 14], [1]],
	"user": [[0, 15], [1]],
	"les": [[0, 16], [1]],
	"uls": [[0, 17], [1]],
	"ui": [[0, 18], [1]]
};