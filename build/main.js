"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_axios = __toESM(require("axios"));
var utils = __toESM(require("@iobroker/adapter-core"));
class SolarManager extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "solar-manager"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    this.log.info("config option1: " + this.config.api_url);
    this.log.info("config option2: " + this.config.password);
    let result = await this.checkPasswordAsync("admin", "iobroker");
    this.log.info("check user admin pw iobroker: " + result);
    result = await this.checkGroupAsync("admin", "admin");
    this.log.info("check group user admin group admin: " + result);
    await this.setStateAsync("info.connection", { val: true, ack: true });
    this.startupGatewayDataPoll();
    await this.setGatewayInfoStates();
  }
  async startupGatewayDataPoll() {
    this.pollInterval = this.setInterval(async () => {
      this.pollGatewayData();
    }, this.config.pollTime);
  }
  onUnload(callback) {
    try {
      callback();
    } catch (e) {
      callback();
    }
  }
  async setGatewayInfoStates() {
    try {
      const gatewayInfo = await this.getGatewayInfo();
      this.log.debug("Result: " + JSON.stringify(gatewayInfo.gateway._id));
      await this.setStateAsync("deviceinfo._id", { val: gatewayInfo.gateway._id, ack: true });
      await this.setStateAsync("deviceinfo.signal", { val: gatewayInfo.gateway.signal, ack: true });
      await this.setStateAsync("deviceinfo.name", { val: gatewayInfo.gateway.name, ack: true });
      await this.setStateAsync("deviceinfo.sm_id", { val: gatewayInfo.gateway.sm_id, ack: true });
      await this.setStateAsync("deviceinfo.owner", { val: gatewayInfo.gateway.owner, ack: true });
      await this.setStateAsync("deviceinfo.firmware", { val: gatewayInfo.gateway.firmware, ack: true });
      await this.setStateAsync("deviceinfo.lastErrorDate", { val: gatewayInfo.gateway.lastErrorDate, ack: true });
      await this.setStateAsync("deviceinfo.mac", { val: gatewayInfo.gateway.mac, ack: true });
      await this.setStateAsync("deviceinfo.ip", { val: gatewayInfo.gateway.ip, ack: true });
    } catch (error) {
      console.log(error);
      this.log.error("Error getGatewayInfo: " + error);
    }
  }
  async getGatewayInfo() {
    const url = `${this.config.api_url}/info/gateway/${this.config.solarManagerId}`;
    const result = await import_axios.default.get(url, this.getRequestConfig());
    if (result.status != 200) {
      this.log.error("getGatewayInfo failed with status: " + result.status.toString() + "/" + result.statusText);
    }
    return result.data;
  }
  async pollGatewayData() {
    try {
      const gatewayData = await this.getGatewayData();
      this.log.debug("Result: " + JSON.stringify(gatewayData.currentPvGeneration));
      await this.setStateAsync("data.currentPvGeneration", { val: gatewayData.currentPvGeneration, ack: true });
      await this.setStateAsync("data.currentPowerConsumption", {
        val: gatewayData.currentPowerConsumption,
        ack: true
      });
      await this.setStateAsync("data.TimeStamp", { val: gatewayData.TimeStamp, ack: true });
      await this.setStateAsync("data.soc", { val: gatewayData.soc, ack: true });
      await this.setStateAsync("data.currentWaterTemp", { val: 0, ack: true });
    } catch (error) {
      console.log(error);
      this.log.error("Error pollGatewayData: " + error);
    }
  }
  async getGatewayData() {
    const url = `${this.config.api_url}/stream/gateway/${this.config.solarManagerId}`;
    const result = await import_axios.default.get(url, this.getRequestConfig());
    if (result.status != 200) {
      this.log.error("getGatewayData failed with status: " + result.status.toString() + "/" + result.statusText);
    }
    return result.data;
  }
  async getDeviceInfo() {
    const url = `${this.config.api_url}/info/sensors/${this.config.solarManagerId}`;
    const result = await import_axios.default.get(url, this.getRequestConfig());
    return result.data;
  }
  getRequestConfig() {
    return {
      auth: {
        username: this.config.username,
        password: this.config.password
      }
    };
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new SolarManager(options);
} else {
  (() => new SolarManager())();
}
//# sourceMappingURL=main.js.map
