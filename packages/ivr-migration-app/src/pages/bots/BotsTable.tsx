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

import { Box, Button, ExpandableSection, Header, Link, LiveRegion, SpaceBetween, StatusIndicator, Steps, Table } from "@cloudscape-design/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListBotsQuery } from "../../slices/botsApiSlice";
import DeleteBotModal from "./DeleteBotModal";
import { BotsApiSchema } from "@ivr-migration-tool/schemas";
import LoadingBar from "@cloudscape-design/chat-components/loading-bar";

export default function BotsTable({ variant }: { variant: "container" | "full-page" }) {
	const navigate = useNavigate();
	const { data = { bots: [] }, isFetching, error } = useListBotsQuery({});
	const [selectedItems, setSelectedItems] = useState<BotsApiSchema.Bot[]>([]);
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

	return (
		<>
			<Table
				variant={variant}
				selectionType="single"
				sortingDisabled
				selectedItems={selectedItems}
				resizableColumns={true}
				onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
				loading={isFetching}
				header={
					<Header
						variant={variant === "full-page" ? "awsui-h1-sticky" : "h2"}
						actions={
							<SpaceBetween direction="horizontal" size="xs">
								<Button
									onClick={() => {
										setShowDeleteModal(true);
									}}
									disabled={!selectedItems.length}
								>
									Delete
								</Button>
								<Button iconAlign="left" iconName="gen-ai" variant="primary" onClick={() => navigate(`/bots/create`)}>
									Create Bot
								</Button>
							</SpaceBetween>
						}
						description="Add description for your bot."
					>
						Bots
					</Header>
				}
				empty={
					<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
						<SpaceBetween size="m">
							<b>No Bot</b>
							{error ? "There was an error loading the data." : <Button onClick={() => navigate(`/bots/create`)}>Create Bot</Button>}
						</SpaceBetween>
					</Box>
				}
				items={data.bots}
				columnDefinitions={[
					{
						id: "id",
						header: "Id",
						cell: (item: BotsApiSchema.Bot) => <Link href={`/bots/${item.id}`}>{item.id}</Link>,
						sortingField: "id",
					},
					{
						id: "name",
						header: "Name",
						cell: (item: BotsApiSchema.Bot) => item.name,
						sortingField: "name",
					},
					{
						id: "description",
						header: "Description",
						cell: (item: BotsApiSchema.Bot) => item.description,
						sortingField: "description",
					},
					{
						id: "type",
						header: "Type",
						cell: (item: BotsApiSchema.Bot) => item.type,
						sortingField: "type",
					},
					{
						id: "status",
						header: "Status",
						cell: (item: BotsApiSchema.Bot) => <StatusIndicator type={item.status === "built" ? "success" : item.status}>{item.status}</StatusIndicator>,

						sortingField: "status",
					},
					{
						id: "statusMessage",
						header: "Message",
						cell: (item: BotsApiSchema.Bot) => (
							<ExpandableSection variant="footer" headerText={item.statusMessages[item.statusMessages.length - 1].message.slice(0, 50)}>
								<Steps
									steps={item.statusMessages.map((i) => ({
										details:
											i.status === "in-progress" ? (
												<LiveRegion>
													<Box margin={{ bottom: "xs", left: "l" }} color="text-body-secondary"></Box>
													<LoadingBar variant="gen-ai" />
												</LiveRegion>
											) : undefined,
										header: i.message,
										status: i.status === "built" ? "success" : i.status,
									}))}
								/>
							</ExpandableSection>
						),
						sortingField: "statusMessage",
					},
				]}
			/>

			{selectedItems[0]?.id && (
				<DeleteBotModal
					visible={showDeleteModal}
					onCancel={() => setShowDeleteModal(false)}
					onDeleteSuccessful={() => {
						setShowDeleteModal(false);
						setSelectedItems([]);
					}}
					bot={selectedItems[0]}
				/>
			)}
		</>
	);
}
