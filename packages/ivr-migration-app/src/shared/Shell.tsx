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

import { AppLayout, AppLayoutProps, NonCancelableCustomEvent } from "@cloudscape-design/components";
import TopNavigation from "./TopNavigation";
import SideNavigation from "./SideNavigation";
import React from "react";
export interface ShellProps {
	contentType: AppLayoutProps["contentType"];
	breadcrumbs: AppLayoutProps["breadcrumbs"];
	content: AppLayoutProps["content"];
	splitPanel?: React.ReactNode;
	splitPanelOpen?: boolean;
	setSplitPanelOpen?: (event: NonCancelableCustomEvent<any>) => void;
	tools?: React.ReactNode;
}
export default function Shell(props: ShellProps) {
	return (
		<>
			<TopNavigation />
			<AppLayout
				tools={props.tools}
				onSplitPanelToggle={props.setSplitPanelOpen}
				splitPanel={props.splitPanel}
				splitPanelOpen={props.splitPanelOpen}
				toolsHide={!props.tools}
				breadcrumbs={props.breadcrumbs}
				navigation={<SideNavigation />}
				contentType={props.contentType}
				content={props.content}
			></AppLayout>
		</>
	);
}
