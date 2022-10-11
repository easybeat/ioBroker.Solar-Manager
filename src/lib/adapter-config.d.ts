// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
	namespace ioBroker {
		interface AdapterConfig {
			api_url: string;
			solarManagerId: string;
			username: string;
			password: string;
			pollTime: number;
		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
