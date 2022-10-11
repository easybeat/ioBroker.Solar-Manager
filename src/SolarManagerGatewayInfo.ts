/**
 * Detailed information about a gateway.
 */
export type SolarManagerGatewayInfo = {
	gateway: {
		_id: string;
		signal: string;
		name: string;
		sm_id: string;
		owner: string;
		firmware: string;
		lastErrorDate: string;
		mac: string;
		ip: string;
	};
};
