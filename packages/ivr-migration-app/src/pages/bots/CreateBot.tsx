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

import { Alert, Box, Button, Container, ContentLayout, FileUpload, Form, FormField, Header, HelpPanel, Input, Popover, Select, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../shared/Breadcrumbs";
import Shell from "../../shared/Shell";
import { BotsApiSchema } from "@ivr-migration-tool/schemas";
import { useCreateBotMutation } from "../../slices/botsApiSlice";

const defaultMetadata: BotsApiSchema.CreateBot = {
	name: "",
	description: "",
	locale: "en_US",
	type: "NUANCE",
};

const localeMap: { [key: string]: string } = {
	en_US: "English (US)",
	en_GB: "English (UK)",
	es_ES: "Spanish",
	fr_FR: "French",
	de_DE: "German",
	it_IT: "Italian",
	ja_JP: "Japanese",
	ko_KR: "Korean",
	zh_CN: "Chinese (Simplified)",
	zh_TW: "Chinese (Traditional)",
};

export default function CreateBot() {
	const navigate = useNavigate();
	const [createBot, result] = useCreateBotMutation();
	const [bot, setBot] = useState<BotsApiSchema.CreateBot>(defaultMetadata);
	const [error, setError] = useState<string>();
	const [file, setFile] = useState<File[]>();

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

	const onChange = (attribute: string, value: string) => {
		setBot((prevState: BotsApiSchema.CreateBot) => {
			return {
				...prevState,
				[attribute]: value,
			};
		});
	};

	const handleSubmit = async () => {
		// Reset any previous errors
		setError(undefined);

		// Validate required fields
		if (!bot.name) {
			setError("Bot name is required");
			return;
		}

		if (!file || file.length === 0) {
			setError("Please upload a specification file");
			return;
		}

		try {
			const result = await createBot(bot).unwrap();

			try {
				await uploadFileToS3(file[0], result.inputUploadUrl!);
				navigate("/");
			} catch (uploadError) {
				console.error("Error uploading file:", uploadError);
				setError("Failed to upload specification file. Please try again.");
			}
		} catch (reason: any) {
			console.error("Error creating bot:", reason);

			if (reason.data?.message) {
				setError(reason.data.message);
			} else if (reason.error) {
				setError(`Error: ${reason.error}`);
			} else {
				setError("An unexpected error occurred. Please try again.");
			}
		}
	};

	return (
		<Shell
			tools={
				<HelpPanel header={<h2>Creating a Bot</h2>}>
					<div>
						<p>This page allows you to create a new bot by converting your legacy IVR system specifications into an Amazon Lex bot.</p>

						<h3>Required Information</h3>
						<ul>
							<li>
								<b>Name</b> - A descriptive name for your bot
							</li>
							<li>
								<b>Description</b> - Additional information about your bot's purpose
							</li>
							<li>
								<b>Source</b> - The type of legacy IVR system you're migrating from
							</li>
							<li>
								<b>Locale</b> - The language and region for your bot
							</li>
							<li>
								<b>Specification Files</b> - A ZIP file containing your legacy IVR system files
							</li>
						</ul>

						<h3>Supported File Formats</h3>
						<p>Currently, the tool supports the following file formats:</p>
						<ul>
							<li>
								<b>Nuance</b> - TRSX and Dialog files in a ZIP archive
							</li>
							<li>
								<b>VoiceXML</b> - Coming soon
							</li>
							<li>
								<b>Flow Diagram</b> - Coming soon
							</li>
						</ul>

						<h3>Preparing Your Files</h3>
						<p>For best results when uploading Nuance files:</p>
						<ul>
							<li>Include all TRSX files for your IVR application</li>
							<li>Include all Dialog files referenced by your TRSX files</li>
							<li>Compress all files into a single ZIP archive</li>
							<li>Ensure file names maintain their original structure</li>
							<li>Verify that all referenced files are included</li>
						</ul>

						<h3>After Creation</h3>
						<p>Once you create a bot:</p>
						<ul>
							<li>The system will analyze your files and extract intents and slots</li>
							<li>You'll be able to review the generated intents</li>
							<li>You can build the bot to deploy it to Amazon Lex</li>
							<li>You can create test sets to evaluate your bot's performance</li>
						</ul>
					</div>
				</HelpPanel>
			}
			breadcrumbs={
				<Breadcrumbs
					items={[
						{ text: "Bots", href: "/bots" },
						{ text: "Create bot", href: `/bots/create` },
					]}
				/>
			}
			contentType="form"
			content={
				<ContentLayout header={<Header variant="h1">Create Bot</Header>}>
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
										Create Bot
									</Button>
								</SpaceBetween>
							}
							errorIconAriaLabel="Error"
						>
							{
								<SpaceBetween size="l">
									{error && (
										<Alert type="error" dismissible onDismiss={() => setError(undefined)} header="Failed to create bot">
											{error}
										</Alert>
									)}
									<Container
										header={
											<>
												<Header variant="h2">Details</Header>
												<Box color="text-status-info" display="inline">
													<Popover
														header="Beta feature"
														size="medium"
														triggerType="text"
														content={<>Support for other input types and languages will be added into the coming releases.</>}
														renderWithPortal={true}
													>
														<Box color="text-status-info" fontSize="body-s" fontWeight="bold">
															Info
														</Box>
													</Popover>
												</Box>
											</>
										}
									>
										<SpaceBetween size="l">
											<FormField label="Name" description="Enter bot name.">
												<Input value={bot.name!} ariaRequired={true} onChange={({ detail: { value } }) => onChange("name", value)} />
											</FormField>
											<FormField label="Description" description="Enter bot description.">
												<Input value={bot.description!} ariaRequired={true} onChange={({ detail: { value } }) => onChange("description", value)} />
											</FormField>
											<FormField label="Source" description="Select bot source">
												<Select
													selectedOption={bot.type ? { label: bot.type, value: bot.type } : null}
													onChange={({ detail }) => onChange("source", detail.selectedOption?.value!)}
													options={[
														{ label: "Nuance", value: "NUANCE" },
														{ label: "VoiceXML", value: "VXML", disabled: true },
														{ label: "Flow Diagram", value: "FLOW_DIAGRAM", disabled: true },
													]}
													placeholder="Choose a source"
												></Select>
											</FormField>
											<FormField label="Locale" description="Select bot locale">
												<Select
													selectedOption={bot.locale ? { label: localeMap[bot.locale], value: bot.locale } : null}
													onChange={({ detail }) => onChange("locale", detail.selectedOption?.value!)}
													options={Object.entries(localeMap).map(([k, v]) => ({ label: v, value: k, disabled: k !== "en-US" }))}
													placeholder="Choose a locale"
												/>
											</FormField>{" "}
											<FormField label="Specification files">
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
													constraintText="Zip file containing Nuance TRSX and Dialog files."
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
