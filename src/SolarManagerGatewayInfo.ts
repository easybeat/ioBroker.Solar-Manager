/**
 * Detailed information about a gateway.
 */
export class SolarManagerGatewayInfo {
	public _id: string | undefined;
	public signal: string | undefined;
	public name!: string;
	public sm_id: string | undefined;
	public owner: string | undefined;
	public firmware: string | undefined;
	public lastErrorDate: string | undefined;
	public mac: string | undefined;
	public ip: string | undefined;
}
