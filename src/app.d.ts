// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	interface RGB {
		r: number;
		g: number;
		b: number;
	}
	interface Color {
		hex: string;
		rgb: RGB;
		h: number;
		s: number;
		v: number;
	}
}

export {};
