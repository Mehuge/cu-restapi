// Generated by dts-bundle v0.3.0
// Dependencies for this module:
//   ../node_modules/cu-core/lib/cu-core.d.ts

declare module 'cu-restapi' {
    /**
      * This Source Code Form is subject to the terms of the Mozilla Public
      * License, v. 2.0. If a copy of the MPL was not distributed with this
      * file, You can obtain one at http://mozilla.org/MPL/2.0/.
      */
    import RestAPI from '__cu-restapi/classes/RestAPI';
    export default RestAPI;
}

declare module '__cu-restapi/classes/RestAPI' {
    import { channelId } from 'cu-core';
    export class Rest {
        constructor();
        selectServer(channel: channelId): void;
        makeUrl(verb: string): string;
        request(method: string, verb: string, params: any): any;
        GET(verb: string, params?: any): any;
    }
    export default class RestAPI {
        constructor();
        factions(timeout?: number): any;
        races(timeout?: number): any;
        players(timeout?: number): any;
        banes(): any;
        boons(): any;
        attributes(): any;
        controlGame(query?: any, timeout?: number): any;
        patchnotes(): any;
        banners(): any;
        scheduledEvents(): any;
        kills(query?: any, timeout?: number): any;
    }
}

