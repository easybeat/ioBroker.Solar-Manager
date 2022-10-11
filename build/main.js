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
    await this.setObjectNotExistsAsync("currentPvGeneration", {
      type: "state",
      common: {
        name: "currentPvGeneration",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("currentPowerConsumption", {
      type: "state",
      common: {
        name: "Current Power Consumption",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    let result = await this.checkPasswordAsync("admin", "iobroker");
    this.log.info("check user admin pw iobroker: " + result);
    result = await this.checkGroupAsync("admin", "admin");
    this.log.info("check group user admin group admin: " + result);
    this.pollGatewayData();
    this.setInterval(async () => {
      this.pollGatewayData();
    }, 5e3);
  }
  onUnload(callback) {
    try {
      callback();
    } catch (e) {
      callback();
    }
  }
  async getGatewayInfo() {
    const url = `${this.config.api_url}/info/gateway/${this.config.solarManagerId}`;
    this.log.info(url + " / " + this.config.password);
    const result = await import_axios.default.get(url, this.getRequestConfig());
    this.log.info(result.status.toString());
    this.log.info(result.statusText);
    this.log.info(result.data.name);
    return result.data;
  }
  async pollGatewayData() {
    try {
      const gatewayInfo = await this.getGatewayData();
      this.log.debug("Result: " + JSON.stringify(gatewayInfo.currentPvGeneration));
      await this.setStateAsync("currentPvGeneration", { val: gatewayInfo.currentPvGeneration, ack: true });
      await this.setStateAsync("currentPowerConsumption", {
        val: gatewayInfo.currentPowerConsumption,
        ack: true
      });
    } catch (error) {
      console.log(error);
      this.log.error("Fehler beim Aufruf: " + error);
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
