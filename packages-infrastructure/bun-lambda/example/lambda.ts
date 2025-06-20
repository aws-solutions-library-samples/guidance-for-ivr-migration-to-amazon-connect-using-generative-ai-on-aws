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

import type { Server, ServerWebSocket } from "bun";

export default {
  async fetch(request: Request, server: Server): Promise<Response | undefined> {
    console.log("Request", {
      url: request.url,
      method: request.method,
      headers: request.headers.toJSON(),
      body: request.body ? await request.text() : null,
    });
    if (server.upgrade(request)) {
      console.log("WebSocket upgraded");
      return;
    }
    return new Response("Hello from Bun on Lambda!", {
      status: 200,
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
  },
  websocket: {
    async open(ws: ServerWebSocket): Promise<void> {
      console.log("WebSocket opened");
    },
    async message(ws: ServerWebSocket, message: string): Promise<void> {
      console.log("WebSocket message", message);
    },
    async close(ws: ServerWebSocket, code: number, reason?: string): Promise<void> {
      console.log("WebSocket closed", { code, reason });
    },
  },
};
