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
import Breadcrumbs from "../../shared/Breadcrumbs";
import Shell from "../../shared/Shell";
import RecommendationsTable from "./RecommendationsTable";
import { RecommendationTaskItemsApiSchema } from "@ivr-migration-tool/schemas";
import { Box, HelpPanel, SplitPanel, StatusIndicator } from "@cloudscape-design/components";
import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import ButtonGroup from "@cloudscape-design/components/button-group";
import Avatar from "@cloudscape-design/chat-components/avatar";
import { useGetRecommendationTaskItemQuery } from "../../slices/recommendationTaskItemsApiSlice";
import { useParams } from "react-router";
import { CodeBlock, MarkdownComponent } from "../../components/markdown";
import { codeBlockLookBack, findCompleteCodeBlock, findPartialCodeBlock } from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput } from "@llm-ui/react";

export default function ListRecommendations() {
	const [selectedItems, setSelectedItems] = useState<RecommendationTaskItemsApiSchema.TaskItemResource[]>([]);
	const { taskId } = useParams();
	const [recommendation, setRecommendation] = useState<string>("");
	const [splitPanelOpen, setSplitPanelOpen] = useState<boolean>(false);
	const { data, isFetching } = useGetRecommendationTaskItemQuery({ id: selectedItems[0]?.taskItemId!, taskId: taskId! }, { skip: selectedItems.length === 0 });

	const setChatMessage = async (url: string) => {
		try {
			setSplitPanelOpen(true);
			const response = await fetch(url);
			const output = await response.text();
			setRecommendation(output);
		} catch (error) {
			console.error("Error retrieving the generated intents and slots:", error);
		}
	};

	const { blockMatches } = useLLMOutput({
		llmOutput: recommendation,
		fallbackBlock: {
			component: MarkdownComponent, // from Step 1
			lookBack: markdownLookBack(),
		},
		blocks: [
			{
				component: CodeBlock, // from Step 2
				findCompleteMatch: findCompleteCodeBlock(),
				findPartialMatch: findPartialCodeBlock(),
				lookBack: codeBlockLookBack(),
			},
		],
		isStreamFinished: false,
	});

	useEffect(() => {
		if (data?.recommendationDownloadUrl) {
			setChatMessage(data?.recommendationDownloadUrl).then(() => {});
		}
	}, [data]);

	return (
		<Shell
			tools={
				<HelpPanel header={<h2>AI-Powered Recommendations</h2>}>
					<div>
						<p>
							This page displays AI-generated recommendations to improve your bot based on test execution results. These recommendations help you enhance your bot's
							performance and user experience.
						</p>

						<h3>Understanding Recommendations</h3>
						<p>Each recommendation addresses specific issues identified during test execution:</p>
						<ul>
							<li>
								<b>Intent Improvements</b> - Suggestions to enhance intent recognition accuracy
							</li>
							<li>
								<b>Utterance Additions</b> - New sample utterances to improve intent matching
							</li>
							<li>
								<b>Slot Refinements</b> - Ways to improve slot extraction and validation
							</li>
							<li>
								<b>Confidence Boosters</b> - Changes to increase confidence scores
							</li>
							<li>
								<b>Error Handling</b> - Strategies to better handle misunderstood inputs
							</li>
						</ul>

						<h3>Working with Recommendations</h3>
						<p>To get the most out of recommendations:</p>
						<ul>
							<li>Select a recommendation to view its detailed explanation</li>
							<li>Review the context that led to the recommendation</li>
							<li>Consider how each suggestion fits into your overall bot design</li>
							<li>Implement high-priority recommendations first (those addressing critical failures)</li>
							<li>Test your bot again after implementing changes</li>
						</ul>

						<h3>Implementation Process</h3>
						<p>After reviewing recommendations:</p>
						<ul>
							<li>Apply changes to your bot in Amazon Lex</li>
							<li>Rebuild your bot to incorporate the changes</li>
							<li>Run tests again to verify improvements</li>
							<li>Generate new recommendations if needed</li>
						</ul>
					</div>
				</HelpPanel>
			}
			breadcrumbs={<Breadcrumbs items={[{ text: "Recommendations", href: "/recommendations" }]} />}
			contentType="table"
			content={<RecommendationsTable selectedItems={selectedItems} setSelectedItems={setSelectedItems} variant="full-page" />}
			setSplitPanelOpen={() => setSplitPanelOpen(!splitPanelOpen)}
			splitPanelOpen={splitPanelOpen}
			splitPanel={
				<SplitPanel header={"Detail"}>
					{isFetching && (
						<ChatBubble
							ariaLabel="Generative AI assistant"
							type="incoming"
							avatar={<Avatar loading={true} color="gen-ai" iconName="gen-ai" ariaLabel="Generative AI assistant" tooltipText="Generative AI assistant" />}
						>
							<Box color="text-status-inactive">Generating response</Box>
						</ChatBubble>
					)}

					{recommendation && !isFetching && (
						<ChatBubble
							ariaLabel="Generative AI assistant at 6:35:10pm"
							type="incoming"
							actions={
								<ButtonGroup
									ariaLabel="Chat bubble actions"
									variant="icon"
									items={[
										{
											type: "group",
											text: "Feedback",
											items: [
												{
													type: "icon-button",
													id: "helpful",
													iconName: "thumbs-up-filled",
													text: "Helpful.",
													disabled: true,
													disabledReason: "“Helpful” feedback has been submitted.",
												},
												{
													type: "icon-button",
													id: "not-helpful",
													iconName: "thumbs-down",
													text: "Not helpful",
													disabled: true,
													disabledReason: "“Not helpful” option is unavailable after “helpful” feedback submitted.",
												},
											],
										},
										{
											type: "icon-button",
											id: "copy",
											iconName: "copy",
											text: "Copy",
											popoverFeedback: <StatusIndicator type="success">Message copied</StatusIndicator>,
										},
									]}
								/>
							}
							avatar={<Avatar color="gen-ai" iconName="gen-ai" ariaLabel="Generative AI assistant" tooltipText="Generative AI assistant" />}
						>
							<div>
								{blockMatches.map((blockMatch, index) => {
									console.log(blockMatch);
									const Component = blockMatch.block.component;
									return <Component key={index} blockMatch={blockMatch} />;
								})}
							</div>
						</ChatBubble>
					)}
				</SplitPanel>
			}
		/>
	);
}
