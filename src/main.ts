/*
 * Created with @iobroker/create-adapter v2.3.0
 */

import axios, { AxiosRequestConfig } from 'axios';

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import { SolarManagerGatewayData } from './SolarManagerGatewayData';
import { SolarManagerGatewayInfo } from './SolarManagerGatewayInfo';

// Load your modules here, e.g.:
// import * as fs from "fs";

class SolarManager extends utils.Adapter {
	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'solar-manager',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info('config option1: ' + this.config.api_url);
		this.log.info('config option2: ' + this.config.password);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		await this.setObjectNotExistsAsync('currentPvGeneration', {
			type: 'state',
			common: {
				name: 'currentPvGeneration',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});

		await this.setObjectNotExistsAsync('currentPowerConsumption', {
			type: 'state',
			common: {
				name: 'Current Power Consumption',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		//this.subscribeStates('testVariable');
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates('lights.*');
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates('*');

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		//await this.setStateAsync('testVariable', true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		//await this.setStateAsync('testVariable', { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		//await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync('admin', 'iobroker');
		this.log.info('check user admin pw iobroker: ' + result);

		result = await this.checkGroupAsync('admin', 'admin');
		this.log.info('check group user admin group admin: ' + result);

		/*try {
			const gatewayInfo = await this.getGatewayData();

			this.log.debug('Result: ' + JSON.stringify(gatewayInfo.currentPvGeneration));

			await this.setStateAsync('currentPvGeneration', { val: gatewayInfo.currentPvGeneration, ack: true });
			//this.log.debug('Result: ' + JSON.stringify(gatewayInfo.data.currentPowerConsumption));
		} catch (error) {
			this.log.error('Fehler beim Aufruf');
		}*/

		this.pollGatewayData();

		this.setInterval(async () => {
			this.pollGatewayData();
		}, 5000);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Getting detailed information about the gateway.
	 * https://cloud.solar-manager.ch/
	 * @returns The gateway information.
	 */
	async getGatewayInfo(): Promise<SolarManagerGatewayInfo> {
		const url = `${this.config.api_url}/info/gateway/${this.config.solarManagerId}`;
		this.log.info(url + ' / ' + this.config.password);
		const result = await axios.get<SolarManagerGatewayInfo>(url, this.getRequestConfig());

		this.log.info(result.status.toString());
		this.log.info(result.statusText);

		this.log.info(result.data.name);

		return result.data;
	}

	async pollGatewayData(): Promise<void> {
		try {
			const gatewayInfo = await this.getGatewayData();

			this.log.debug('Result: ' + JSON.stringify(gatewayInfo.currentPvGeneration));

			await this.setStateAsync('currentPvGeneration', { val: gatewayInfo.currentPvGeneration, ack: true });

			await this.setStateAsync('currentPowerConsumption', {
				val: gatewayInfo.currentPowerConsumption,
				ack: true,
			});
		} catch (error) {
			console.log(error);
			this.log.error('Fehler beim Aufruf: ' + error);
		}
	}

	/**
	 * Getting detailed information about general values of production, consumption, and battery and array with the latest values of temperature, battery, and power for each device.
	 * @returns The gateway current data.
	 */
	async getGatewayData(): Promise<SolarManagerGatewayData> {
		const url = `${this.config.api_url}/stream/gateway/${this.config.solarManagerId}`;
		const result = await axios.get(url, this.getRequestConfig());

		if (result.status != 200) {
			this.log.error('getGatewayData failed with status: ' + result.status.toString() + '/' + result.statusText);
		}

		return result.data;
	}

	/**
	 * Getting detailed information about the sensors (devices).
	 * @returns The device information.
	 */
	async getDeviceInfo(): Promise<SolarManagerGatewayInfo[]> {
		const url = `${this.config.api_url}/info/sensors/${this.config.solarManagerId}`;
		const result = await axios.get<SolarManagerGatewayInfo[]>(url, this.getRequestConfig());
		return result.data;
	}

	/**
	 * Generate a request config containing the authentication information for
	 * Solar Manager.
	 * @returns The request config for axios.
	 */
	private getRequestConfig(): AxiosRequestConfig {
		return {
			auth: {
				username: this.config.username,
				password: this.config.password,
			},
		};
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  */
	// private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  */
	// private onMessage(obj: ioBroker.Message): void {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }
}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new SolarManager(options);
} else {
	// otherwise start the instance directly
	(() => new SolarManager())();
}
