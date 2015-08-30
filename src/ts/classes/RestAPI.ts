import { CoreSettings, channelId } from 'cu-core';

declare const cuAPI: any;

// TODO: Define promise properly.  Can't use this as a return type 
// for methods returning a promise.
declare const Promise: any;

// TODO: I wanted this to extend CoreSettings but CoreSettings 
// won't allow super to access its memebers, or pass anything
// but a default CoreSettings object to its constructor, so
// you can't customise the settings at all (e.g. like define
// the api key or current channel)
class Settings {
	core: CoreSettings;
	url: string;
	port: number;
	apiKey: string;
	channelId: channelId;
	timeout: number;
	constructor(channel:channelId) {
		this.core = new CoreSettings();			// TODO: This class is a bit weird
		this.apiKey = cuAPI.loginToken;
		this.channelId = channel;
		this.timeout = 2000;					// default timeout
		switch(channel) {
			case channelId.HATCHERY:
				this.url = this.core.hatcheryApiUrl;
				this.port = this.core.hatcheryApiPort;
				break;
			case channelId.WYRMLING:
				this.url = this.core.wyrmlingApiUrl;
				this.port = this.core.wyrmlingApiPort;
				break;
		}
	}
}

export class Rest {

	private settings: Settings;

	constructor() {
	}

	selectServer(channel:channelId) {
		this.settings = new Settings(channel);
	}

	makeUrl(verb: string) {
		return this.settings.url + ":" + this.settings.port + "/api/" + verb
	}

	request(method: string, verb: string, params:any) {
		const XHR : XMLHttpRequest = new XMLHttpRequest();
		let key: string;
		let url: string;

		// construct request URL
		url = this.makeUrl(verb);

		// add params
		if (params.query) {
			let count: number = 0;
			for (key in params) {
				if (params.hasOwnProperty(key)) {
					count++;
					params[key] = encodeURIComponent(params[key])
				}
			}
			if (count) {
				url += "?" + params.join("&");
			}
		}

		function executor(resolve: (data: any) => void, reject: (status: string, errorThrown: string) => void) {
			// TODO: Implement progressive timeouts 
			XHR.open(method, url, true);
			XHR.timeout = params.timeout || this.api.settings.timeout;
			XHR.addEventListener("readystatechanged", (ev : UIEvent) => {
				if (XHR.readyState === 4 && XHR.status === 200) {
					resolve(XHR.responseText);
				}
			});
			XHR.addEventListener("timeout", (ev : UIEvent) => {
				reject("timeout", "timed out");
			});
			XHR.addEventListener("error", (ev : UIEvent) => {
				reject("error", "errored");
			});
		}

		return new Promise(executor);
	}

	GET(verb: string, params:any = {}) {
		return this.request("GET", verb, params);
	}
}

export class Game {
	private api: Rest;
	constructor(api: Rest) {
		this.api = api;
	}
	factions(query:any, timeout: number = 2000) {
		return this.api.GET("game/factions", { timeout: timeout });
	}
	races(query:any, timeout: number = 2000) {
		return this.api.GET("game/races", { timeout: timeout });
	}
	players(query:any, timeout: number = 2000) {
		return this.api.GET("game/players", { timeout: timeout });
	}
	banes(query:any) {
		return this.api.GET("game/banes");
	}
	boons(query:any) {
		return this.api.GET("game/boons");
	}
	attributes(query:any) {
		return this.api.GET("game/attributes");
	}
	controlGame(query:any) {
		return this.api.GET("game/controlgame", { query: query });
	}
}

export default class RestAPI {
	private api: Rest;
	Game: Game;
	constructor() {
		this.api = new Rest();
		let server: string [] = cuAPI.webApiHost.split(".");
		switch(server[0]) {
			case "hatchery":
				this.api.selectServer(channelId.HATCHERY);
				break;
			case "wyrmling":
				this.api.selectServer(channelId.WYRMLING);
				break;
		}
		this.Game = new Game(this.api);
	}

	patchnotes() {
		return this.api.GET("patchnotes");
	}
	banners() {
		return this.api.GET("banners");
	}
	scheduledEvents() {
		return this.api.GET("scheduledevents");
	}
	kills(query:any = {}, timeout:number = 2000) {
		return this.api.GET("kills", { query: query, timeout: timeout });
	}
}

