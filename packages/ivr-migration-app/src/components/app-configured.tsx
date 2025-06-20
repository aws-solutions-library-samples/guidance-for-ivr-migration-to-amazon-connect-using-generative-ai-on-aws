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

import { useEffect, useState } from "react";
import { Alert, Authenticator } from "@aws-amplify/ui-react";
import { StatusIndicator } from "@cloudscape-design/components";
import { Amplify, ResourcesConfig } from "aws-amplify";
import App from "../app";
import "@aws-amplify/ui-react/styles.css";
import { Provider } from "react-redux";
import { store } from "../app/store";

export default function AppConfigured() {
	const [config, setConfig] = useState<ResourcesConfig | null>(null);
	const [error, setError] = useState<boolean | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const result = await fetch("/aws-exports.json");
				const awsExports: ResourcesConfig = await result.json();
				Amplify.configure(awsExports);
				import.meta.env["VITE_UI_REST_API_URL"] = awsExports.API?.REST?.RestApi.endpoint;
				setConfig(awsExports);
			} catch (e) {
				console.error(e);
				setError(true);
			}
		})();
	}, []);

	return (
		<>
			{config && (
				<Provider store={store}>
					<Authenticator loginMechanisms={["email"]}>
						<App />
					</Authenticator>
				</Provider>
			)}

			{!config && (
				<div
					style={{
						width: "100%",
						height: "100%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<StatusIndicator type="loading">Loading</StatusIndicator>
				</div>
			)}

			{!config && error && (
				<div
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Alert heading="Configuration error" variation="error">
						Error loading configuration from "
						<a href="/aws-exports.json" style={{ fontWeight: "600" }}>
							/aws-exports.json
						</a>
						"
					</Alert>
				</div>
			)}
		</>
	);
}
