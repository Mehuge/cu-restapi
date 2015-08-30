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
		this.channelId = channel;
		this.timeout = 2000;					// default timeout
		switch(channel) {
			case channelId.HATCHERY:
				this.url = 'http://hatchery.camelotunchained.com';
				// BUG: (returns https://) this.url = this.core.hatcheryApiUrl;
				this.port = this.core.hatcheryApiPort;
				break;
			case channelId.WYRMLING:
				this.url = 'http://wyrmling.camelotunchained.com'; 
				// BUG: (returns https://) this.url = this.core.wyrmlingApiUrl;
				this.port = this.core.wyrmlingApiPort;
				break;
		}
	}
	getApiKey() {
		if (!this.apiKey) {
			this.apiKey = cuAPI.loginToken;		// in fake API will prompt for token
		}
		return this.apiKey;
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
		let key: string;
		let url: string;

		// construct request URL
		url = this.makeUrl(verb);

		// add params
		const query = params.query;
		if (query) {
			let qs = [];
			for (key in query) {
				if (query.hasOwnProperty(key)) {
					qs.push(key + "=" + encodeURIComponent(query[key]);
				}
			}
			if (qs.length) {
				url += "?" + qs.join("&");
			}
		}

		function executor(resolve: (data: any) => void, reject: (status: string, errorThrown: string) => void) {
			const XHR : XMLHttpRequest = new XMLHttpRequest();

			// Set timeout
			XHR.timeout = params.timeout || this.api.settings.timeout;

			// TODO: Implement progressive timeouts 
			XHR.open(method, url, true);
			XHR.addEventListener("progress", (ev: ProgressEvent) => {
				console.dir(ev);
			});
			XHR.addEventListener("load", (ev : UIEvent) => {
				if (XHR.readyState === 4 && XHR.status === 200) {
					resolve(XHR.responseText);
				}
			});
			XHR.addEventListener("abort", (ev: UIEvent) => {
				reject("abort", "aborted");
			});
			XHR.addEventListener("error", (ev : UIEvent) => {
				reject("error", "errored");
			});

			XHR.send();
		}

		return new Promise(executor);
	}

	GET(verb: string, params:any = {}) {
		return this.request("GET", verb, params);
	}
}

export default class RestAPI {
	private api: Rest;
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
	}

	factions(timeout: number = 2000) {
		return this.api.GET("game/factions", { timeout: timeout });
	}
	races(timeout: number = 2000) {
		return this.api.GET("game/races", { timeout: timeout });
	}
	players(timeout: number = 2000) {
		return this.api.GET("game/players", { timeout: timeout });
	}
	banes() {
		return this.api.GET("game/banes");
	}
	boons() {
		return this.api.GET("game/boons");
	}
	attributes() {
		return this.api.GET("game/attributes");
	}

	//	Optional Query Parameters: {
	//		includeControlPoints: false 		// true/false
	//	}
	controlGame(query:any = undefined, timeout = 3000) {
		return this.api.GET("game/controlgame", { query: query, timeout: timeout });
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
	kills(query:any = undefined, timeout:number = 2000) {
		return this.api.GET("kills", { query: query, timeout: timeout });
	}
}

