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

import { Box, Button, FileUpload, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useCreateTestSetUploadUrlMutation } from "../../slices/testSetsApiSlice";
import { TestSetsApiSchema } from "@ivr-migration-tool/schemas";
import { useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export default function ({
	visible,
	onCancel,
	onUploadSuccessful,
	testSet,
}: {
	visible: boolean;
	onCancel: () => void;
	onUploadSuccessful: () => void;
	testSet: TestSetsApiSchema.TestSet;
}) {
	const uploadFileToS3 = async (file: File, signedUrl: string) => {
		try {
			const response = await fetch(signedUrl, {
				method: "PUT",
				body: file,
				headers: {
					"Content-Type": file.type,
				},
			});
			if (!response.ok) {
				throw new Error(`Failed to upload file: ${response.statusText}`);
			}
			return true;
		} catch (error) {
			console.error("Error uploading file:", error);
			throw error;
		}
	};
	const [file, setFile] = useState<File[]>();
	const [createUploadUrl, response] = useCreateTestSetUploadUrlMutation();

	const onUpload = async () => {
		const response = await createUploadUrl(testSet.id).unwrap();
		await uploadFileToS3(file![0], response.uploadUrl);
		onUploadSuccessful();
	};

	return (
		<Modal
			visible={visible}
			onDismiss={onCancel}
			header={"Update Test Set File"}
			closeAriaLabel="Close dialog"
			footer={
				<Box float="right">
					<SpaceBetween direction="horizontal" size="xs">
						<Button variant="link" onClick={onCancel}>
							Cancel
						</Button>
						<Button variant="primary" disabled={(file ?? []).length == 0} onClick={onUpload} loading={response.isLoading} data-testid="submit">
							Update
						</Button>
					</SpaceBetween>
				</Box>
			}
		>
			{testSet && (
				<SpaceBetween size="m">
					<Box variant="span">Uploading a new file will replace all existing test cases. This action cannot be undone. Are you sure you want to proceed?</Box>
					<FileUpload
						onChange={({ detail }) => setFile(detail.value)}
						value={file! ?? []}
						i18nStrings={{
							uploadButtonText: (e) => (e ? "Choose files" : "Choose file"),
							dropzoneText: (e) => (e ? "Drop files to upload" : "Drop file to upload"),
							removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
							limitShowFewer: "Show fewer files",
							limitShowMore: "Show more files",
							errorIconAriaLabel: "Error",
							warningIconAriaLabel: "Warning",
						}}
						showFileLastModified
						showFileSize
						showFileThumbnail
						tokenLimit={3}
						constraintText="The test set is a comma-separated value (CSV) file consisting of single user utterances and multi-turn conversations."
					/>
				</SpaceBetween>
			)}
		</Modal>
	);
}
