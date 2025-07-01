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

import SideNavigation from "@cloudscape-design/components/side-navigation";
import { useLocation, useNavigate } from "react-router-dom";

export default () => {
	const navigate = useNavigate();
	const location = useLocation();
	const activeHref = location.pathname.match(/^\/(\w+)/)?.[1] || "";

	return (
		<SideNavigation
			activeHref={`/${activeHref}`}
			header={{ href: "/", text: "IVR Migration Tool" }}
			onFollow={(event) => {
				if (!event.detail.external) {
					event.preventDefault();
					navigate(event.detail.href);
				}
			}}
			items={[
				{ type: "link", text: "Bots", href: "/bots" },
				{ type: "divider" },
				{ type: "link", text: "Test Sets", href: "/testsets" },
				{ type: "divider" },
				{
					type: "link",
					text: "Documentation",
					href: "https://github.com/aws-solutions-library-samples/guidance-for-ivr-migration-to-amazon-connect-using-generative-ai-on-aws",
					external: true,
				},
			]}
		/>
	);
};
