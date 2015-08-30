var cu_core_1 = require('cu-core');
// TODO: I wanted this to extend CoreSettings but CoreSettings 
// won't allow super to access its memebers, or pass anything
// but a default CoreSettings object to its constructor, so
// you can't customise the settings at all (e.g. like define
// the api key or current channel)
var Settings = (function () {
    function Settings(channel) {
        this.core = new cu_core_1.CoreSettings(); // TODO: This class is a bit weird
        this.channelId = channel;
        this.timeout = 2000; // default timeout
        switch (channel) {
            case cu_core_1.channelId.HATCHERY:
                this.url = 'http://hatchery.camelotunchained.com';
                // BUG: (returns https://) this.url = this.core.hatcheryApiUrl;
                this.port = this.core.hatcheryApiPort;
                break;
            case cu_core_1.channelId.WYRMLING:
                this.url = 'http://wyrmling.camelotunchained.com';
                // BUG: (returns https://) this.url = this.core.wyrmlingApiUrl;
                this.port = this.core.wyrmlingApiPort;
                break;
        }
    }
    Settings.prototype.getApiKey = function () {
        if (!this.apiKey) {
            this.apiKey = cuAPI.loginToken; // in fake API will prompt for token
        }
        return this.apiKey;
    };
    return Settings;
})();
var Rest = (function () {
    function Rest() {
    }
    Rest.prototype.selectServer = function (channel) {
        this.settings = new Settings(channel);
    };
    Rest.prototype.makeUrl = function (verb) {
        return this.settings.url + ":" + this.settings.port + "/api/" + verb;
    };
    Rest.prototype.request = function (method, verb, params) {
        var key;
        var url;
        // construct request URL
        url = this.makeUrl(verb);
        // add params
        var query = params.query;
        if (query) {
            var qs = [];
            for (key in query) {
                if (query.hasOwnProperty(key)) {
                    qs.push(key + "=" + encodeURIComponent(query[key]));
                }
            }
            if (qs.length) {
                url += "?" + qs.join("&");
            }
        }
        function executor(resolve, reject) {
            var XHR = new XMLHttpRequest();
            // Set timeout
            XHR.timeout = params.timeout || this.api.settings.timeout;
            // TODO: Implement progressive timeouts 
            XHR.open(method, url, true);
            XHR.addEventListener("progress", function (ev) {
                console.dir(ev);
            });
            XHR.addEventListener("load", function (ev) {
                if (XHR.readyState === 4 && XHR.status === 200) {
                    resolve(XHR.responseText);
                }
            });
            XHR.addEventListener("abort", function (ev) {
                reject("abort", "aborted");
            });
            XHR.addEventListener("error", function (ev) {
                reject("error", "errored");
            });
            XHR.send();
        }
        return new Promise(executor);
    };
    Rest.prototype.GET = function (verb, params) {
        if (params === void 0) { params = {}; }
        return this.request("GET", verb, params);
    };
    return Rest;
})();
exports.Rest = Rest;
var RestAPI = (function () {
    function RestAPI() {
        this.api = new Rest();
        var server = cuAPI.webApiHost.split(".");
        switch (server[0]) {
            case "hatchery":
                this.api.selectServer(cu_core_1.channelId.HATCHERY);
                break;
            case "wyrmling":
                this.api.selectServer(cu_core_1.channelId.WYRMLING);
                break;
        }
    }
    RestAPI.prototype.factions = function (timeout) {
        if (timeout === void 0) { timeout = 2000; }
        return this.api.GET("game/factions", { timeout: timeout });
    };
    RestAPI.prototype.races = function (timeout) {
        if (timeout === void 0) { timeout = 2000; }
        return this.api.GET("game/races", { timeout: timeout });
    };
    RestAPI.prototype.players = function (timeout) {
        if (timeout === void 0) { timeout = 2000; }
        return this.api.GET("game/players", { timeout: timeout });
    };
    RestAPI.prototype.banes = function () {
        return this.api.GET("game/banes");
    };
    RestAPI.prototype.boons = function () {
        return this.api.GET("game/boons");
    };
    RestAPI.prototype.attributes = function () {
        return this.api.GET("game/attributes");
    };
    //	Optional Query Parameters: {
    //		includeControlPoints: false 		// true/false
    //	}
    RestAPI.prototype.controlGame = function (query, timeout) {
        if (query === void 0) { query = undefined; }
        if (timeout === void 0) { timeout = 3000; }
        return this.api.GET("game/controlgame", { query: query, timeout: timeout });
    };
    RestAPI.prototype.patchnotes = function () {
        return this.api.GET("patchnotes");
    };
    RestAPI.prototype.banners = function () {
        return this.api.GET("banners");
    };
    RestAPI.prototype.scheduledEvents = function () {
        return this.api.GET("scheduledevents");
    };
    RestAPI.prototype.kills = function (query, timeout) {
        if (query === void 0) { query = undefined; }
        if (timeout === void 0) { timeout = 2000; }
        return this.api.GET("kills", { query: query, timeout: timeout });
    };
    return RestAPI;
})();
exports.__esModule = true;
exports["default"] = RestAPI;
