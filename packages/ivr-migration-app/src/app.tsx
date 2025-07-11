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

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListBots from "./pages/bots/ListBots";
import CreateBot from "./pages/bots/CreateBot";
import ViewBot from "./pages/bots/ViewBot";
import ListTestSets from "./pages/test-sets/ListTestSets";
import ViewTestSet from "./pages/test-sets/ViewTestSet";
import CreateTestSet from "./pages/test-sets/CreateTestSet";
import ViewTestExecution from "./pages/test-executions/ViewTestExecution";
import ListRecommendations from "./pages/recommendations/ListRecommendations";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<ListBots />} />
				<Route path="/bots" element={<ListBots />} />
				<Route path="/bots/create" element={<CreateBot />} />
				<Route path="/bots/:id" element={<ViewBot />} />
				<Route path="/testSets" element={<ListTestSets />} />
				<Route path="/testSets/:id" element={<ViewTestSet />} />
				<Route path="/testSets/create" element={<CreateTestSet />} />
				<Route path="/bots/:botId/testExecutions/:id" element={<ViewTestExecution />} />
				<Route path="/recommendations/:taskId" element={<ListRecommendations />} />
			</Routes>
		</BrowserRouter>
	);
}
