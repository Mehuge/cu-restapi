var cu_core_1 = require('cu-core');
// TODO: I wanted this to extend CoreSettings but CoreSettings 
// won't allow super to access its memebers, or pass anything
// but a default CoreSettings object to its constructor, so
// you can't customise the settings at all (e.g. like define
// the api key or current channel)
var Settings = (function () {
    function Settings(channel) {
        this.core = new cu_core_1.CoreSettings(); // TODO: This class is a bit weird
        this.apiKey = cuAPI.loginToken;
        this.channelId = channel;
        this.timeout = 2000; // default timeout
        switch (channel) {
            case cu_core_1.channelId.HATCHERY:
                this.url = this.core.hatcheryApiUrl;
                this.port = this.core.hatcheryApiPort;
                break;
            case cu_core_1.channelId.WYRMLING:
                this.url = this.core.wyrmlingApiUrl;
                this.port = this.core.wyrmlingApiPort;
                break;
        }
    }
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
        var XHR = new XMLHttpRequest();
        var key;
        var url;
        // construct request URL
        url = this.makeUrl(verb);
        // add params
        if (params.query) {
            var count = 0;
            for (key in params) {
                if (params.hasOwnProperty(key)) {
                    count++;
                    params[key] = encodeURIComponent(params[key]);
                }
            }
            if (count) {
                url += "?" + params.join("&");
            }
        }
        function executor(resolve, reject) {
            XHR.open(method, url, true);
            XHR.timeout = params.timeout || this.api.settings.timeout;
            XHR.addEventListener("readystatechanged", function (ev) {
                if (XHR.readyState === 4 && XHR.status === 200) {
                    resolve(XHR.responseText);
                }
            });
            XHR.addEventListener("timeout", function (ev) {
                reject("timeout", "timed out");
            });
            XHR.addEventListener("error", function (ev) {
                reject("error", "errored");
            });
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
var Game = (function () {
    function Game(api) {
        this.api = api;
    }
    Game.prototype.factions = function (query, timeout) {
        if (timeout === void 0) { timeout = 2000; }
        return this.api.GET("game/factions", { timeout: timeout });
    };
    Game.prototype.races = function (query, timeout) {
        if (timeout === void 0) { timeout = 2000; }
        return this.api.GET("game/races", { timeout: timeout });
    };
    Game.prototype.players = function (query, timeout) {
        if (timeout === void 0) { timeout = 2000; }
        return this.api.GET("game/players", { timeout: timeout });
    };
    Game.prototype.banes = function (query) {
        return this.api.GET("game/banes");
    };
    Game.prototype.boons = function (query) {
        return this.api.GET("game/boons");
    };
    Game.prototype.attributes = function (query) {
        return this.api.GET("game/attributes");
    };
    Game.prototype.controlGame = function (query) {
        return this.api.GET("game/controlgame", { query: query });
    };
    return Game;
})();
exports.Game = Game;
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
        this.Game = new Game(this.api);
    }
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
        if (query === void 0) { query = {}; }
        if (timeout === void 0) { timeout = 2000; }
        return this.api.GET("kills", { query: query, timeout: timeout });
    };
    return RestAPI;
})();
exports.__esModule = true;
exports["default"] = RestAPI;
