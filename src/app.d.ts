declare global {
	namespace App {
		interface Locals {
			user?: {
				uuid: string;
				username: string;
				skinUrl?: string;
				capeUrl?: string;
				skinVariant?: string;
				minecraftToken: string;
				sessionId: string;
			};
		}
		interface PageData {
			user?: {
				uuid: string;
				username: string;
				skinUrl?: string;
				capeUrl?: string;
				skinVariant?: string;
			} | null;
			isAdmin?: boolean;
			profile?: import('./routes/profil/+page.server').PlayerProfile | null;
		}
	}
}

export {};
