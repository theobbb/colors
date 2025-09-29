import { browser } from '$app/environment';
export const prerender = false;
export function load() {
	if (browser) {
		const palette = localStorage.getItem('palette');
		console.log(palette);

		return {
			palette
		};
	}
}
