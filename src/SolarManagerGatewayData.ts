/**
 * Detailed Data from a gateway.
 */
export type SolarManagerGatewayData = {
	TimeStamp: string;
	currentBatteryChargeDischarge: string;
	currentPowerConsumption: string;
	currentPvGeneration: string;
	devices: [
		{
			_id: string;
			currentWaterTemp: number;
		},
	];
	status: any;
	soc: string;
};
