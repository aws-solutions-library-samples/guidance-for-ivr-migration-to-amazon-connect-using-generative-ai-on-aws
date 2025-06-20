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
	SplitPanel,
	StatusIndicator,
	Table,
	TextFilter,
} from "@cloudscape-design/components";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../shared/Breadcrumbs";
import Shell from "../../shared/Shell";
import { useBuildBotMutation, useGetBotQuery } from "../../slices/botsApiSlice";
import { useEffect, useState } from "react";
import { DescribeIntentCommandOutput } from "@aws-sdk/client-lex-models-v2";
import DeleteBotModal from "./DeleteBotModal";
import { LexSlotModel, TestExecutionsApiSchema } from "@ivr-migration-tool/schemas";
import RunTestSetModal from "./RunTestSetModal";
import { useListTestExecutionsQuery } from "../../slices/testExecutionsApiSlice";

export type Intent = DescribeIntentCommandOutput & { slots: LexSlotModel.SlotExportDefinition[] };

export default function ViewBot() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { data: bot } = useGetBotQuery(id!);
	const [intents, setIntents] = useState<Intent[]>([]);
	const [utterances, setUtterances] = useState<string[]>([]);
	const [slots, setSlots] = useState<LexSlotModel.SlotExportDefinition[]>([]);
	const [selectedItems, setSelectedItems] = useState<Intent[]>([]);
	const [buildBot, buildBotResult] = useBuildBotMutation();
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
	const [showRunTestSetModal, setShowRunTestSetModal] = useState<boolean>(false);
	const [splitPanelOpen, setSplitPanelOpen] = useState<boolean>(false);
	const [buildError, setBuildError] = useState<string | null>(null);

	const { data = { testExecutions: [] }, isFetching: isFetchingTestExecutions } = useListTestExecutionsQuery({ botId: bot?.id! }, { skip: bot === undefined });

	// Add a loading state variable
	const [loadingIntents, setLoadingIntents] = useState<boolean>(false);

	// Update the setGeneratedIntents function to manage loading state
	const setGeneratedIntents = async (url: string) => {
		setLoadingIntents(true);
		try {
			// Download the file
			const response = await fetch(url);
			const output = await response.json();
			setIntents(Object.values(output.intents));
		} catch (error) {
			console.error("Error retrieving the generated intents and slots:", error);
		} finally {
			setLoadingIntents(false);
		}
	};

	useEffect(() => {
		// Function to download and unzip the output URL
		if (selectedItems.length > 0) {
			const utterances = selectedItems?.[0]?.sampleUtterances ?? [];
			setSplitPanelOpen(true);
			setUtterances(utterances.map((o: any) => o.utterance));
			setSlots(Object.values(selectedItems[0].slots));
		} else {
			setSplitPanelOpen(false);
			setUtterances([]);
			setSlots([]);
		}
	}, [selectedItems]);

	useEffect(() => {
		// Function to download and unzip the output URL
		if (bot?.rawOutputDownloadUrl) {
			setGeneratedIntents(bot?.rawOutputDownloadUrl!).then((r) => {});
		}
	}, [bot]);

	const handleBuild = async () => {
		// Reset any previous errors
		setBuildError(null);

		try {
			await buildBot(id!).unwrap();
			// Success - you might want to show a success message instead of navigating
			navigate("/");
		} catch (reason: any) {
			console.error("Build bot failed:", reason);

			// Extract error message from the response
			if (reason.data?.message) {
				setBuildError(reason.data.message);
			} else if (reason.error) {
				setBuildError(`Error: ${reason.error}`);
			} else {
				setBuildError("Failed to build bot. Please try again later.");
			}
		}
	};

	return (
		<Shell
			tools={
				<HelpPanel header={<h2>Bot Management</h2>}>
					<div>
						<p>This page allows you to manage your Amazon Lex bot that was created from your IVR script. You can view details, build the bot, run tests, and more.</p>

						<h3>Bot Status</h3>
						<p>Your bot can have the following statuses:</p>
						<ul>
							<li>
								<b>success</b> - Initial generation completed successfully
							</li>
							<li>
								<b>built</b> - Bot has been successfully built in Amazon Lex
							</li>
							<li>
								<b>in-progress</b> - Bot is currently being processed
							</li>
							<li>
								<b>error</b> - An error occurred during processing
							</li>
						</ul>

						<h3>Build Bot</h3>
						<p>
							The <b>Build</b> button creates your bot in Amazon Lex using the generated intents and slots. This process:
						</p>
						<ul>
							<li>Creates all intents with their sample utterances</li>
							<li>Creates all slots and slot types</li>
							<li>Configures the bot with the appropriate locale settings</li>
							<li>Builds the bot so it's ready for testing</li>
						</ul>
						<p>Once built, you can download the bot configuration or run tests against it.</p>

						<h3>Testing Your Bot</h3>
						<p>After building your bot, you can test it by:</p>
						<ul>
							<li>
								Clicking the <b>Test</b> button to run a test set against your bot
							</li>
							<li>Viewing test execution results to identify any issues</li>
							<li>Analyzing the performance of your bot against various test cases</li>
						</ul>

						<h3>Viewing Intents</h3>
						<p>The intents table shows all the intents generated from your IVR script. Select an intent to view:</p>
						<ul>
							<li>Sample utterances that trigger the intent</li>
							<li>Slots used by the intent</li>
							<li>Slot types and configurations</li>
						</ul>
					</div>
				</HelpPanel>
			}
			breadcrumbs={
				<Breadcrumbs
					items={[
						{ text: "Bots", href: "/bots" },
						{ text: id!, href: `/bots/${id}` },
					]}
				/>
			}
			splitPanelOpen={splitPanelOpen}
			setSplitPanelOpen={() => setSplitPanelOpen(!splitPanelOpen)}
			splitPanel={
				<SplitPanel header={selectedItems.length > 0 ? `Generated intent: ${selectedItems[0].intentName}` : ""}>
					<SpaceBetween direction="vertical" size="l">
						<Table
							header={<Header variant={"h3"}>Sample utterances</Header>}
							stickyHeader={true}
							items={utterances}
							filter={<TextFilter filteringPlaceholder="Find utterance" filteringText="" countText="0 matches" />}
							columnDefinitions={[
								{
									id: "utterance",
									header: "Utterance",
									cell: (item: string) => item,
									sortingField: "utterance",
								},
							]}
						></Table>

						<Table
							header={<Header variant={"h3"}>Slots</Header>}
							items={slots}
							columnDefinitions={[
								{
									id: "name",
									header: "Name",
									cell: (item: LexSlotModel.SlotExportDefinition) => item.slotName,
									sortingField: "name",
								},
								{
									id: "type",
									header: "Type",
									cell: (item: LexSlotModel.SlotExportDefinition) => item.slotTypeName,
									sortingField: "type",
								},
							]}
						></Table>
					</SpaceBetween>
				</SplitPanel>
			}
			contentType="table"
			content={
				<ContentLayout
					header={
						bot && (
							<Header
								variant="h1"
								actions={
									<SpaceBetween direction="horizontal" size="xs">
										{bot.status === "built" && (
											<Button variant="primary" href={bot.outputDownloadUrl}>
												Download
											</Button>
										)}
										{(bot.status === "error" || bot.status === "success" || bot.status === "built") && (
											<Button iconAlign="left" iconName="gen-ai" variant="primary" loading={buildBotResult.isLoading} onClick={handleBuild}>
												Build
											</Button>
										)}
										<Button disabled={bot.status !== "built"} onClick={(_e) => setShowRunTestSetModal(true)}>
											Test
										</Button>
										<Button disabled={bot.status === "in-progress"} onClick={(_e) => setShowDeleteModal(true)}>
											Delete
										</Button>
									</SpaceBetween>
								}
							>
								{bot.name}
							</Header>
						)
					}
				>
					<SpaceBetween direction="vertical" size="l">
						{buildError && (
							<Alert type="error" dismissible onDismiss={() => setBuildError(null)} header="Failed to build bot">
								{buildError}
							</Alert>
						)}

						<Container header={<Header variant="h2">Details</Header>}>
							{bot === undefined && <Spinner size={"large"} />}
							{bot && (
								<ColumnLayout columns={2} variant="text-grid">
									<div>
										<Box variant="awsui-key-label">Name</Box>
										<div>{bot!.name}</div>
									</div>
									<div>
										<Box variant="awsui-key-label">Description</Box>
										<div>{bot!.description}</div>
									</div>
									<div>
										<Box variant="awsui-key-label">ID</Box>
										<CopyToClipboard
											variant="inline"
											textToCopy={bot!.id}
											copyButtonAriaLabel="Copy ID"
											copySuccessText="ID copied"
											copyErrorText="ID failed to copy"
										/>
									</div>
									<div>
										<Box variant="awsui-key-label">Locale</Box>
										<div>{bot!.locale}</div>
									</div>
									<div>
										<Box variant="awsui-key-label">Type</Box>
										<div>{bot!.type}</div>
									</div>
									<div>
										<Box variant="awsui-key-label">Status</Box>
										<div>
											<StatusIndicator type={bot.status === "built" ? "success" : bot.status}>{bot.status}</StatusIndicator>
										</div>
									</div>
								</ColumnLayout>
							)}
						</Container>
						<Table
							items={intents}
							selectionType="single"
							header={<Header variant={"h3"}>Generated Resources</Header>}
							onSelectionChange={({ detail }) => {
								setSelectedItems(detail.selectedItems);
							}}
							selectedItems={selectedItems}
							loading={loadingIntents}
							loadingText="Loading generated resources"
							empty={
								<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
									<SpaceBetween size="m">
										<b>No generated resources available</b>
										{bot?.status === "in-progress" && <div>Resource generation is in progress</div>}
									</SpaceBetween>
								</Box>
							}
							columnDefinitions={[
								{
									id: "name",
									header: "Name",
									cell: (item: Intent) => <Link>{item.intentName}</Link>,
									sortingField: "name",
								},
								{
									id: "utterances",
									header: "Generated utterances",
									cell: (item: Intent) => item.sampleUtterances?.length ?? 0,
									sortingField: "utterances",
								},
								{
									id: "slots",
									header: "Generated slots",
									cell: (item: Intent) => Object.keys(item.slots).length,
									sortingField: "slots",
								},
							]}
						></Table>
						<Table
							loading={isFetchingTestExecutions}
							loadingText="Loading test executions"
							items={data?.testExecutions! ?? []}
							empty={
								<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
									<SpaceBetween size="m">
										<b>No test executions available</b>
									</SpaceBetween>
								</Box>
							}
							resizableColumns={true}
							header={<Header variant={"h3"}>Test Executions</Header>}
							columnDefinitions={[
								{
									id: "id",
									header: "ID",
									cell: (item: TestExecutionsApiSchema.TestExecutionResource) => <Link href={`/bots/${bot!.id}/testExecutions/${item.id}`}>{item.id}</Link>,
									sortingField: "id",
								},
								{
									id: "testSetName",
									header: "Test Set",
									cell: (item: TestExecutionsApiSchema.TestExecutionResource) => item.testSetName,
									sortingField: "testSetName",
								},
								{
									id: "status",
									header: "Status",
									cell: (item: TestExecutionsApiSchema.TestExecutionResource) => <StatusIndicator type={item.status}>{item.status}</StatusIndicator>,
									sortingField: "status",
								},
								{
									id: "failureReasons",
									header: "Failure Reasons",
									cell: (item: TestExecutionsApiSchema.TestExecutionResource) => {
										// Check if failureReasons is an array with multiple values
										if (Array.isArray(item.failureReasons) && item.failureReasons.length > 0) {
											return (
												<SpaceBetween direction="vertical" size="xs">
													{item.failureReasons.map((reason, index) => (
														<div key={index}>{reason}</div>
													))}
												</SpaceBetween>
											);
										}
										// Return a single value or empty string if no reasons
										return item.failureReasons || "";
									},
									sortingField: "failureReasons",
								},
							]}
						></Table>
					</SpaceBetween>
					{bot && (
						<DeleteBotModal
							visible={showDeleteModal}
							onCancel={() => setShowDeleteModal(false)}
							onDeleteSuccessful={() => {
								setShowDeleteModal(false);
								navigate("/bots");
							}}
							bot={bot}
						/>
					)}
					{bot && (
						<RunTestSetModal
							visible={showRunTestSetModal}
							onCancel={() => setShowRunTestSetModal(false)}
							onRunTestSetSuccessful={() => {
								setShowRunTestSetModal(false);
							}}
							bot={bot}
						/>
					)}
				</ContentLayout>
			}
		></Shell>
	);
}
