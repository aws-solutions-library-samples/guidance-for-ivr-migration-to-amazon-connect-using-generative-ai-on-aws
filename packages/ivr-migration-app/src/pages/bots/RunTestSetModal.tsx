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

import { Box, Button, ContentLayout, FormField, Modal, Select, SpaceBetween } from "@cloudscape-design/components";
import { BotsApiSchema, TestSetsApiSchema } from "@ivr-migration-tool/schemas";
import { useListTestSetsQuery } from "../../slices/testSetsApiSlice";
import { useState } from "react";
import { useCreateTestExecutionMutation } from "../../slices/testExecutionsApiSlice";

// eslint-disable-next-line react-refresh/only-export-components
export default function ({
	visible,
	onCancel,
	onRunTestSetSuccessful,
	bot,
}: {
	visible: boolean;
	onCancel: () => void;
	onRunTestSetSuccessful: () => void;
	bot: BotsApiSchema.Bot;
}) {
	const [createTestExecution, createTestExecutionResult] = useCreateTestExecutionMutation();
	const { data = { testSets: [] }, isFetching } = useListTestSetsQuery({});
	const [testSet, setTestSet] = useState<Pick<TestSetsApiSchema.TestSet, "name" | "id">>();
	const onCreate = async () => {
		try {
			await createTestExecution({
				botId: bot.id,
				testSetId: testSet!.id,
			}).unwrap();
			onRunTestSetSuccessful();
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<Modal
			visible={visible}
			onDismiss={onCancel}
			header={"Execute Test Set"}
			closeAriaLabel="Close dialog"
			footer={
				<Box float="right">
					<SpaceBetween direction="horizontal" size="xs">
						<Button variant="link" onClick={onCancel}>
							Cancel
						</Button>
						<Button variant="primary" loading={createTestExecutionResult.isLoading} onClick={onCreate} data-testid="submit">
							Execute
						</Button>
					</SpaceBetween>
				</Box>
			}
		>
			{bot && (
				<ContentLayout>
					<form onSubmit={(event) => event.preventDefault()}>
						<FormField label="Test Set" description="Select test set">
							<Select
								onLoadItems={isFetching}
								selectedOption={
									testSet
										? {
												label: testSet.name,
												value: testSet.id,
										  }
										: null
								}
								onChange={({ detail }) =>
									setTestSet({
										name: detail.selectedOption.label!,
										id: detail.selectedOption.value!,
									})
								}
								options={data.testSets.map((testSet: TestSetsApiSchema.TestSet) => ({ label: testSet.name, value: testSet.id }))}
								placeholder="Choose a test set"
							/>
						</FormField>
					</form>
				</ContentLayout>
			)}
		</Modal>
	);
}
