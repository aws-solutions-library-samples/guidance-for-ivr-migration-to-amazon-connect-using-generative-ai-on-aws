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

import { Alert, Box, Button, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useDeleteTestSetMutation } from "../../slices/testSetsApiSlice";
import { TestSetsApiSchema } from "@ivr-migration-tool/schemas";

// eslint-disable-next-line react-refresh/only-export-components
export default function ({
	visible,
	onCancel,
	onDeleteSuccessful,
	testSet,
}: {
	visible: boolean;
	onCancel: () => void;
	onDeleteSuccessful: () => void;
	testSet: TestSetsApiSchema.TestSet;
}) {
	const [deleteTestSet, response] = useDeleteTestSetMutation();
	const onInitDelete = () => {
		deleteTestSet(testSet.id)
			.unwrap()
			.then(() => {
				onDeleteSuccessful();
			})
			.catch((reason) => {
				console.error(reason);
			});
	};
	return (
		<Modal
			visible={visible}
			onDismiss={onCancel}
			header={"Delete Bot"}
			closeAriaLabel="Close dialog"
			footer={
				<Box float="right">
					<SpaceBetween direction="horizontal" size="xs">
						<Button variant="link" onClick={onCancel}>
							Cancel
						</Button>
						<Button variant="primary" onClick={onInitDelete} loading={response.isLoading} data-testid="submit">
							Delete
						</Button>
					</SpaceBetween>
				</Box>
			}
		>
			{testSet && (
				<SpaceBetween size="m">
					<Box variant="span">
						Permanently delete test set{" "}
						<Box variant="span" fontWeight="bold">
							{testSet.name}
						</Box>
						? You can’t undo this action.
					</Box>

					<Alert statusIconAriaLabel="Info">Proceeding with this action will delete the test set and can affect related resources.</Alert>
				</SpaceBetween>
			)}
		</Modal>
	);
}
