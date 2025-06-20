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

import { Button, Container, ContentLayout, Form, FormField, Header, HelpPanel, Input, Select, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../shared/Breadcrumbs";
import Shell from "../../shared/Shell";
import { BotsApiSchema } from "@ivr-migration-tool/schemas";
import { useListBotsQuery } from "../../slices/botsApiSlice";
import { useCreateTestSetMutation } from "../../slices/testSetsApiSlice";
import { Alert } from "@cloudscape-design/components";

export interface CreateTestSetInput {
	name: string;
	description: string;
	dataSource: string;
}

const defaultMetadata: CreateTestSetInput = {
	name: "",
	description: "",
	dataSource: "",
};

export default function CreateTestSet() {
	const navigate = useNavigate();
	const [createTestSet, result] = useCreateTestSetMutation();
	const [testSet, setTestSet] = useState<CreateTestSetInput>(defaultMetadata);
	const [error, setError] = useState<string>();
	const { data = { bots: [] }, isFetching } = useListBotsQuery({});

	const onChange = (attribute: string, value: any) => {
		setTestSet((prevState: CreateTestSetInput) => {
			return {
				...prevState,
				[attribute]: value,
			};
		});
	};

	// Update the handleSubmit function with better validation and error handling
	const handleSubmit = async () => {
		// Reset any previous errors
		setError(undefined);

		// Validate required fields
		if (!testSet.name) {
			setError("Test set name is required");
			return;
		}

		if (!testSet.dataSource) {
			setError("Please select a bot source");
			return;
		}

		try {
			const bot = data.bots.find((b) => b.name === testSet.dataSource);

			if (!bot) {
				setError("Selected bot not found");
				return;
			}

			await createTestSet({
				...testSet,
				dataSource: {
					botDataSource: {
						botId: bot.id,
					},
				},
			}).unwrap();

			navigate("/testsets");
		} catch (reason: any) {
			console.error("Error creating test set:", reason);

			if (reason.data?.message) {
				setError(reason.data.message);
			} else if (reason.error) {
				setError(`Error: ${reason.error}`);
			} else {
				setError("Failed to create test set. Please try again.");
			}
		}
	};

	return (
		<Shell
			tools={
				<HelpPanel header={<h2>Creating Test Sets</h2>}>
					<div>
						<p>Test sets allow you to evaluate your bot's performance by generating realistic user interactions based on your bot's intents and slots.</p>

						<h3>Test Set Details</h3>
						<p>When creating a test set, you'll need to provide:</p>
						<ul>
							<li>
								<b>Name</b> - A descriptive name for your test set
							</li>
							<li>
								<b>Description</b> - Additional information about the purpose of the test set
							</li>
							<li>
								<b>Source</b> - The bot that will be used to generate test cases
							</li>
						</ul>

						<h3>Test Generation Process</h3>
						<p>When you create a test set, the system will:</p>
						<ul>
							<li>Analyze your bot's intents and slots</li>
							<li>Generate realistic user utterances that should trigger each intent</li>
							<li>Create test cases with expected outcomes</li>
							<li>Prepare the test set for execution against your bot</li>
						</ul>

						<h3>Best Practices</h3>
						<ul>
							<li>Create test sets after your bot has been successfully built</li>
							<li>Use descriptive names that indicate the purpose of the test set</li>
							<li>Create multiple test sets to focus on different aspects of your bot</li>
							<li>Review generated test cases to ensure they cover your key scenarios</li>
						</ul>

						<h3>Next Steps</h3>
						<p>After creating a test set, you can:</p>
						<ul>
							<li>View the generated test cases</li>
							<li>Execute the test set against your bot</li>
							<li>Analyze test results to identify areas for improvement</li>
							<li>Generate recommendations based on test results</li>
						</ul>
					</div>
				</HelpPanel>
			}
			breadcrumbs={
				<Breadcrumbs
					items={[
						{ text: "Test Sets", href: "/testSets" },
						{ text: "Create Test Set", href: `/testSets/create` },
					]}
				/>
			}
			contentType="form"
			content={
				<ContentLayout header={<Header variant="h1">Create Test Set</Header>}>
					<form onSubmit={(event) => event.preventDefault()}>
						<Form
							actions={
								<SpaceBetween direction="horizontal" size="xs">
									<Button
										variant="link"
										onClick={() => {
											navigate(-1);
										}}
									>
										Cancel
									</Button>
									<Button data-testid="create" variant="primary" loading={result.isLoading} onClick={handleSubmit}>
										Create Test Set
									</Button>
								</SpaceBetween>
							}
							errorIconAriaLabel="Error"
						>
							{
								<SpaceBetween size="l">
									{error && (
										<Alert type="error" dismissible onDismiss={() => setError(undefined)} header="Failed to create test set">
											{error}
										</Alert>
									)}
									<Container header={<Header variant="h2">Details</Header>}>
										<SpaceBetween size="l">
											<FormField label="Name" description="Enter test set name.">
												<Input value={testSet.name!} ariaRequired={true} onChange={({ detail: { value } }) => onChange("name", value)} />
											</FormField>
											<FormField label="Description" description="Enter test set description.">
												<Input value={testSet.description!} ariaRequired={true} onChange={({ detail: { value } }) => onChange("description", value)} />
											</FormField>
											<FormField label="Source" description="Select bot source">
												<Select
													selectedOption={testSet.dataSource ? { label: testSet.dataSource, value: testSet.dataSource } : null}
													onChange={({ detail }) => onChange("dataSource", detail.selectedOption?.value!)}
													options={data.bots
														.filter((b) => b.status === "success" || b.status === "built")
														.map((bot: BotsApiSchema.Bot) => ({ label: bot.name, value: bot.name }))}
													placeholder="Choose a source"
												/>
											</FormField>
										</SpaceBetween>
									</Container>
								</SpaceBetween>
							}
						</Form>
					</form>
				</ContentLayout>
			}
		/>
	);
}
