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
	Box,
	Button,
	ColumnLayout,
	Container,
	ContentLayout,
	CopyToClipboard,
	Header,
	HelpPanel,
	Input,
	SpaceBetween,
	Spinner,
	StatusIndicator,
	Table,
} from "@cloudscape-design/components";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../shared/Breadcrumbs";
import Shell from "../../shared/Shell";
import { useGetTestSetQuery } from "../../slices/testSetsApiSlice";
import { DescribeIntentCommandOutput } from "@aws-sdk/client-lex-models-v2";
import { useGetBotQuery } from "../../slices/botsApiSlice";
import { useEffect, useState } from "react";
import DeleteTestSetModal from "./DeleteTestSetModal";
import UpdateTestSetModal from "./UpdateTestSetModal";
import { parse } from "csv-parse/browser/esm/sync";

export type Slot = { slotName: string; slotTypeId: string };
export type Intent = DescribeIntentCommandOutput & { slots: Slot[] };

export default function ViewTestSet() {
	const { id } = useParams();
	const { data: testSet, isLoading: isLoadingTestSet } = useGetTestSetQuery(id!);
	const navigate = useNavigate();
	const [testSets, setTestSets] = useState<Record<string, any>[]>([]);
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
	const [showUpdateModel, setShowUpdateModal] = useState<boolean>(false);
	const { data: bot, isLoading: isLoadingBot } = useGetBotQuery(testSet?.dataSource?.botDataSource?.botId!, {
		skip: !testSet?.dataSource?.botDataSource?.botId,
	});

	const [loadingTestSets, setLoadingTestSets] = useState<boolean>(false);

	const downloadTestSets = async (url: string) => {
		setLoadingTestSets(true);
		try {
			// Download the file
			const response = await fetch(url);
			const blob = await response.text();
			const records = parse(blob, {
				columns: true,
				skip_empty_lines: true,
			});
			setTestSets(records);
		} catch (error) {
			console.error("Error downloading/unzipping:", error);
		} finally {
			setLoadingTestSets(false);
		}
	};

	useEffect(() => {
		// Function to download and unzip the output URL
		if (testSet?.outputDownloadUrl) {
			downloadTestSets(testSet?.outputDownloadUrl!).then((r) => {});
		}
	}, [testSet]);

	return (
		<Shell
			tools={
				<HelpPanel header={<h2>Test Set Details</h2>}>
					<div>
						<p>
							This page displays details about your test set and the test cases it contains. Test sets are collections of inputs designed to evaluate your bot's
							performance.
						</p>

						<h3>Test Set Information</h3>
						<p>The details section shows key information about your test set:</p>
						<ul>
							<li>
								<b>Name</b> - The name you provided when creating the test set
							</li>
							<li>
								<b>Description</b> - Additional information about the test set's purpose
							</li>
							<li>
								<b>ID</b> - Unique identifier for the test set
							</li>
							<li>
								<b>Source</b> - The bot used to generate this test set
							</li>
							<li>
								<b>Status</b> - Current status of the test set (in-progress, success, error)
							</li>
						</ul>

						<h3>Test Cases</h3>
						<p>The table shows all test cases in this test set. Each test case includes:</p>
						<ul>
							<li>
								<b>Line #</b> - Sequential identifier for the test case
							</li>
							<li>
								<b>Conversation #</b> - Groups related test cases in a conversation flow
							</li>
							<li>
								<b>Utterance</b> - The input text that will be sent to your bot
							</li>
							<li>
								<b>Expected Intent</b> - The intent your bot should recognize
							</li>
							<li>
								<b>Expected Slots</b> - Any slots your bot should extract from the utterance
							</li>
						</ul>

						<h3>Editing Test Cases</h3>
						<p>You can edit most fields in the test cases table:</p>
						<ul>
							<li>Click the edit icon next to a field to modify it</li>
							<li>Press Enter or click outside the field to save changes</li>
							<li>Note that some fields like Line # and Conversation # cannot be edited</li>
						</ul>

						<h3>Available Actions</h3>
						<ul>
							<li>
								<b>Update</b> - Modify the test set by uploading a new Test Set file
							</li>
							<li>
								<b>Download</b> - Export the test set as a CSV file for offline use
							</li>
							<li>
								<b>Delete</b> - Remove the test set (cannot be undone)
							</li>
							<li>
								<b>Execute</b> - Run this test set against your bot (from the Test Sets page)
							</li>
						</ul>
					</div>
				</HelpPanel>
			}
			breadcrumbs={
				<Breadcrumbs
					items={[
						{ text: "Test Sets", href: "/testSets" },
						{ text: id!, href: `/testSets/${id}` },
					]}
				/>
			}
			contentType="table"
			content={
				<ContentLayout
					header={
						testSet && (
							<Header
								variant="h1"
								actions={
									<SpaceBetween direction="horizontal" size="xs">
										<Button variant="primary" disabled={testSet.status !== "success"} onClick={(_e) => setShowUpdateModal(true)}>
											Update
										</Button>
										<Button variant="normal" iconName="file" disabled={testSet.status !== "success"} href={testSet.outputDownloadUrl}>
											Download
										</Button>
										<Button disabled={testSet.status === "in-progress"} onClick={(_e) => setShowDeleteModal(true)}>
											Delete
										</Button>
									</SpaceBetween>
								}
							>
								{testSet.name}
							</Header>
						)
					}
				>
					<SpaceBetween direction="vertical" size="l">
						<Container header={<Header variant="h2">Details</Header>}>
							{isLoadingTestSet || isLoadingBot ? (
								<Box textAlign="center" padding={{ vertical: "l" }}>
									<Spinner size="normal" />
								</Box>
							) : testSet ? (
								<ColumnLayout columns={2} variant="text-grid">
									<div>
										<Box variant="awsui-key-label">ID</Box>
										<CopyToClipboard
											variant="inline"
											textToCopy={testSet.id}
											copyButtonAriaLabel="Copy ID"
											copySuccessText="ID copied"
											copyErrorText="ID failed to copy"
										/>
									</div>
									<div>
										<Box variant="awsui-key-label">Name</Box>
										<div>{testSet.name}</div>
									</div>
									<div>
										<Box variant="awsui-key-label">Description</Box>
										<div>{testSet.description}</div>
									</div>
									<div>
										<Box variant="awsui-key-label">Source</Box>
										<div>{bot?.name}</div>
									</div>
									<div>
										<Box variant="awsui-key-label">Status</Box>
										<div>
											<StatusIndicator type={testSet.status}>{testSet.status}</StatusIndicator>
										</div>
									</div>
								</ColumnLayout>
							) : (
								<Box textAlign="center" color="inherit">
									<SpaceBetween size="m">
										<b>No test set details available</b>
									</SpaceBetween>
								</Box>
							)}
						</Container>

						<Table
							stickyHeader={true}
							resizableColumns={true}
							header={<Header variant={"h3"}>Generated Test Sets</Header>}
							items={testSets ?? []}
							submitEdit={async (prevItem, column, newValue) => {
								const newTestSet = structuredClone(testSets);
								prevItem[column.header! as string] = newValue;
								newTestSet[parseInt(prevItem["Line #"]) - 1] = prevItem;
								setTestSets(newTestSet);
							}}
							loading={loadingTestSets}
							loadingText="Loading test cases"
							empty={
								<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
									<SpaceBetween size="m">
										<b>No test cases available</b>
										{testSet?.status === "in-progress" && <div>Test set generation is in progress</div>}
									</SpaceBetween>
								</Box>
							}
							columnDefinitions={Object.keys(testSets?.[0] ?? {}).map((key: string) => ({
								id: key,
								header: key.charAt(0).toUpperCase() + key.slice(1),
								cell: (item: any) => item[key],
								sortingField: key,
								editConfig: ["Line #", "Conversation #", "Source"].includes(key)
									? undefined
									: {
											ariaLabel: "key",
											editIconAriaLabel: "editable",
											errorIconAriaLabel: `${key} Error`,
											editingCell: (item, { currentValue, setValue }) => {
												return <Input autoFocus={true} value={currentValue ?? (item[key] as string)} onChange={(event) => setValue(event.detail.value)} />;
											},
									  },
							}))}
						/>
					</SpaceBetween>
					{testSet && (
						<DeleteTestSetModal
							visible={showDeleteModal}
							onCancel={() => setShowDeleteModal(false)}
							onDeleteSuccessful={() => {
								setShowDeleteModal(false);
								navigate("/testSets");
							}}
							testSet={testSet}
						/>
					)}
					{testSet && (
						<UpdateTestSetModal
							visible={showUpdateModel}
							onCancel={() => setShowUpdateModal(false)}
							onUploadSuccessful={() => {
								setShowDeleteModal(false);
								navigate("/testSets");
							}}
							testSet={testSet}
						/>
					)}
				</ContentLayout>
			}
		></Shell>
	);
}
