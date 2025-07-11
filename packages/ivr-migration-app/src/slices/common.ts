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

import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { ResourcesConfig } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";

export const getToken: () => Promise<string> = async () => {
    return (await fetchAuthSession()).tokens?.idToken?.toString() ?? '';
};

export const dynamicBaseQuery: BaseQueryFn<string | FetchArgs,
    unknown,
    FetchBaseQueryError> = async (args, WebApi, extraOptions) => {
        const result = await fetch("/aws-exports.json");
        const awsExports: ResourcesConfig = await result.json();
        const baseUrl = awsExports.API?.REST?.RestApi.endpoint;
        const rawBaseQuery = fetchBaseQuery({
            baseUrl, prepareHeaders: async (headers) => {
                const accessToken = await getToken();
                headers.set('Authorization', `Bearer ${accessToken}`);
                headers.set('accept', 'application/json');
                headers.set('accept-version', '1.0.0');
                return headers;
            },
        });
        return rawBaseQuery(args, WebApi, extraOptions);
    };
