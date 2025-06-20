/*
 * MIT No Attribution
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { Logger } from "pino";
import { getLogger } from "./logger";
import stringify from "json-stringify-safe";
import { CommonApiSchema } from '@ivr-migration-tool/schemas';

export class EventsApiPublisher {
    constructor(private readonly log: Logger<any, boolean>, private readonly eventApiDomain: string, private readonly apiKey: string) {
    }

    public async publish<TResource>(events: CommonApiSchema.Event<TResource>[], channel: string) {
        const logger = getLogger(this.log, 'EventsPublisher', 'publish');
        logger.trace(`in: events: ${stringify(events)}, channel: ${channel}`);

        const response = await fetch(`https://${this.eventApiDomain}/event`, {
            "method": "POST",
            "headers": {
                "x-api-key": this.apiKey
            },
            "body": JSON.stringify({
                channel: channel,
                events: events.map(e => JSON.stringify(e))
            })
        })

        logger.trace(`out: response: ${stringify(await response.json())}`)

        if (response.status > 299) {
            logger.error(`Error publishing events: ${response.status} ${response.statusText}`);
        }

        logger.trace(`out: events: ${stringify(events)}`)
    }
}

