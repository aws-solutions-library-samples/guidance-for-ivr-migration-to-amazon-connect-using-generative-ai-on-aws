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

import {
	Alert,
	Box,
	Button,
	ColumnLayout,
	Container,
	ContentLayout,
	CopyToClipboard,
	Header,
	HelpPanel,
	Link,
	SpaceBetween,
	Spinner,
	StatusIndicator,
	Table,
} from "@cloudscape-design/components";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../../shared/Breadcrumbs";
import Shell from "../../shared/Shell";
import { DescribeIntentCommandOutput } from "@aws-sdk/client-lex-models-v2";
import { useGetTestExecutionQuery } from "../../slices/testExecutionsApiSlice";
import { useEffect, useState } from "react";
import { parse } from "csv-parse/browser/esm/sync";
import { useCreateRecommendationTaskMutation, useListRecommendationTasksQuery } from "../../slices/recommendationTasksApiSlice";
import { RecommendationTaskApiSchema } from "@ivr-migration-tool/schemas";
export type Slot = { slotName: string; slotTypeId: string };
export type Intent = DescribeIntentCommandOutput & { slots: Slot[] };

export default function ViewTestExecution() {
	const { id, botId } = useParams();
	const { data: testExecution, isLoading: isLoadingTestExecution } = useGetTestExecutionQuery({ id: id!, botId: botId! }, { skip: !id || !botId });
	const [createRecommendationTask, result] = useCreateRecommendationTaskMutation();
	const [testExecutions, setTestExecutions] = useState<Record<string, any>[]>([]);
	const { data: listRecommendationTasksData, isFetching } = useListRecommendationTasksQuery({ testExecutionId: id! }, { skip: !id });
	const [loadingTestExecutions, setLoadingTestExecutions] = useState<boolean>(false);

	const downloadTestExecutions = async (url: string) => {
		setLoadingTestExecutions(true);
		try {
			// Download the file
			const response = await fetch(url);
			const blob = await response.text();
			const records = parse(blob, {
				columns: true,
				skip_empty_lines: true,
			});
			setTestExecutions(records);
		} catch (error) {
			console.error("Error downloading/unzipping:", error);
		} finally {
			setLoadingTestExecutions(false);
		}
	};
	useEffect(() => {
		// Function to download and unzip the output URL
		if (testExecution?.outputDownloadUrl) {
			downloadTestExecutions(testExecution?.outputDownloadUrl!).then((r) => {});
		}
	}, [testExecution]);

	const [recommendError, setRecommendError] = useState<string | null>(null);

	const handleGenerateRecommend = async () => {
		// Clear any previous errors
		setRecommendError(null);

		try {
			await createRecommendationTask({ botId: botId!, testExecutionId: id! }).unwrap();
		} catch (reason: any) {
			console.error("Error creating recommendation task:", reason);

			// Extract error message from the response
			if (reason.data?.message) {
				setRecommendError(reason.data.message);
			} else if (reason.error) {
				setRecommendError(`Error: ${reason.error}`);
			} else {
				setRecommendError("Failed to create recommendation task. Please try again.");
			}
		}
	};

	return (
		<Shell
			tools={
				<HelpPanel header={<h2>Test Execution Results</h2>}>
					<div>
						<p>
							This page displays the results of a test execution against your Amazon Lex bot. Test executions help you evaluate your bot's performance and identify
							areas for improvement.
						</p>

						<h3>Understanding Test Results</h3>
						<p>The test execution results show how your bot responded to various test inputs. Each row represents a test case with:</p>
						<ul>
							<li>
								<b>Input</b> - The utterance sent to your bot
							</li>
							<li>
								<b>Expected Intent</b> - The intent that should have been recognized
							</li>
							<li>
								<b>Actual Intent</b> - The intent that was actually recognized
							</li>
							<li>
								<b>Status</b> - Whether the test passed or failed
							</li>
							<li>
								<b>Confidence Score</b> - How confident the bot was in its intent recognition
							</li>
						</ul>

						<h3>Common Failure Reasons</h3>
						<ul>
							<li>
								<b>Intent Mismatch</b> - The bot recognized a different intent than expected
							</li>
							<li>
								<b>Low Confidence</b> - The bot wasn't confident in its intent recognition
							</li>
							<li>
								<b>Slot Errors</b> - The bot couldn't extract the expected slot values
							</li>
							<li>
								<b>No Match</b> - The bot couldn't match the input to any intent
							</li>
						</ul>

						<h3>Generating Recommendations</h3>
						<p>
							Click the <b>Recommend</b> button to generate AI-powered recommendations for improving your bot based on test results. The system will:
						</p>
						<ul>
							<li>Analyze patterns in test failures</li>
							<li>Identify missing sample utterances</li>
							<li>Suggest improvements to slot configurations</li>
							<li>Recommend changes to intent definitions</li>
						</ul>

						<h3>Next Steps</h3>
						<ul>
							<li>Review test results to understand bot performance</li>
							<li>Generate recommendations to improve your bot</li>
							<li>Download test results for offline analysis</li>
							<li>Apply recommended changes to your bot</li>
							<li>Re-run tests to verify improvements</li>
						</ul>
					</div>
				</HelpPanel>
			}
			breadcrumbs={
				<Breadcrumbs
					items={[
						{ text: "Bots", href: `/bots` },
						{ text: botId!, href: `/bots/${botId}` },
						{ text: "Test Executions", href: `/bots/${botId}` },
						{ text: id!, href: `/bots/${botId}/testExecutions/${id}` },
					]}
				/>
			}
			contentType="table"
			content={
				<ContentLayout
					header={
						testExecution && (
							<Header
								variant="h1"
								actions={
									<SpaceBetween direction="horizontal" size="xs">
										<Button
											onClick={handleGenerateRecommend}
											loading={result.isLoading}
											variant="primary"
											iconAlign="left"
											iconName="gen-ai"
											disabled={testExecution.status !== "success"}
										>
											Recommend
										</Button>
									</SpaceBetween>
								}
							>
								{testExecution.id}
							</Header>
						)
					}
				>
					<SpaceBetween direction="vertical" size="l">
						{recommendError && (
							<Alert type="error" dismissible onDismiss={() => setRecommendError(null)} header="Failed to create recommendation task">
								{recommendError}
							</Alert>
						)}

						<Container header={<Header variant="h2">Details</Header>}>
							{isLoadingTestExecution ? (
								<Box textAlign="center" padding={{ vertical: "l" }}>
									<Spinner size="normal" />
								</Box>
							) : testExecution ? (
								<ColumnLayout columns={2} variant="text-grid">
									<div>
										<Box variant="awsui-key-label">ID</Box>
										<CopyToClipboard
											variant="inline"
											textToCopy={testExecution.id}
											copyButtonAriaLabel="Copy ID"
											copySuccessText="ID copied"
											copyErrorText="ID failed to copy"
										/>
									</div>
									<div>
										<Box variant="awsui-key-label">Status</Box>
										<div>
											<StatusIndicator type={testExecution.status}>{testExecution.status}</StatusIndicator>
										</div>
									</div>
									<div>
										<Box variant="awsui-key-label">Test Set</Box>
										<div>{testExecution.testSetName}</div>
									</div>
									<div>
										<Box variant="awsui-key-label">Bot</Box>
										<div>{testExecution.botId}</div>
									</div>
								</ColumnLayout>
							) : (
								<Box textAlign="center" color="inherit">
									<SpaceBetween size="m">
										<b>No test execution details available</b>
									</SpaceBetween>
								</Box>
							)}
						</Container>

						<Table
							stickyHeader={true}
							header={
								<Header variant={"h3"} actions={<SpaceBetween direction="horizontal" size="xs"></SpaceBetween>}>
									Recommendation Tasks
								</Header>
							}
							items={listRecommendationTasksData?.tasks ?? []}
							loading={isFetching}
							loadingText="Loading recommendation tasks"
							empty={
								<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
									<SpaceBetween size="m">
										<b>No Recommendation</b>
									</SpaceBetween>
								</Box>
							}
							columnDefinitions={[
								{
									id: "id",
									header: "ID",
									cell: (item: RecommendationTaskApiSchema.TaskResource) => <Link href={`/recommendations/${item.id}`}>{item.id}</Link>,
									sortingField: "id",
								},
								{
									id: "total",
									header: "Total Recommendation Task",
									cell: (item: RecommendationTaskApiSchema.TaskResource) => item.itemsTotal,
									sortingField: "total",
								},
								{
									id: "completed",
									header: "Total Completed Task",
									cell: (item: RecommendationTaskApiSchema.TaskResource) => item.itemsCompleted,
									sortingField: "complete",
								},
								{
									id: "status",
									header: "Status",
									cell: (item: RecommendationTaskApiSchema.TaskResource) => <StatusIndicator type={item.taskStatus}>{item.taskStatus}</StatusIndicator>,
									sortingField: "status",
								},
							]}
						/>

						<Table
							stickyHeader={true}
							header={
								<Header
									variant={"h3"}
									actions={
										<SpaceBetween direction="horizontal" size="xs">
											<Button variant="normal" iconName="file" disabled={testExecution?.status !== "success"} href={testExecution?.outputDownloadUrl}>
												Download
											</Button>
										</SpaceBetween>
									}
								>
									Test Execution Results
								</Header>
							}
							items={testExecutions ?? []}
							loading={loadingTestExecutions}
							empty={
								<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
									<SpaceBetween size="m">
										<b>No test execution results available</b>
									</SpaceBetween>
								</Box>
							}
							loadingText="Loading test execution results"
							columnDefinitions={Object.keys(testExecutions?.[0] ?? {}).map((key) => ({
								id: key,
								header: key.charAt(0).toUpperCase() + key.slice(1),
								cell: (item: any) => item[key],
								sortingField: key,
							}))}
						/>
					</SpaceBetween>
				</ContentLayout>
			}
		></Shell>
	);
}
