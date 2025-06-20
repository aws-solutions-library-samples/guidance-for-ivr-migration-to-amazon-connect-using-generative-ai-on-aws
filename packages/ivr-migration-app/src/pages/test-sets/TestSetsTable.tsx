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

import { Box, Button, ExpandableSection, Header, Link, SpaceBetween, StatusIndicator, Steps, Table } from "@cloudscape-design/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteTestSetModal from "./DeleteTestSetModal";
import { useListTestSetsQuery } from "../../slices/testSetsApiSlice";
import { TestSetsApiSchema } from "@ivr-migration-tool/schemas";

export default function TestSetsTable({ variant }: { variant: "container" | "full-page" }) {
	const navigate = useNavigate();
	const { data = { testSets: [] }, isFetching } = useListTestSetsQuery({});
	const [selectedItems, setSelectedItems] = useState<TestSetsApiSchema.TestSet[]>([]);
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
								<Button variant="primary" onClick={() => navigate(`/testSets/create`)}>Create TestSet</Button>
							</SpaceBetween>
						}
						description="List of generated test sets."
					>
						Test Sets
					</Header>
				}
				empty={
					<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
						<SpaceBetween size="m">
							<b>No TestSet</b>
							<Button onClick={() => navigate(`/testSets/create`)}>Create TestSet</Button>
						</SpaceBetween>
					</Box>
				}
				items={data.testSets}
				columnDefinitions={[
					{
						id: "name",
						header: "Name",
						cell: (item: TestSetsApiSchema.TestSet) => <Link href={`/testSets/${item.id}`}>{item.name}</Link>,
						sortingField: "name",
					},
					{
						id: "description",
						header: "Description",
						cell: (item: TestSetsApiSchema.TestSet) => item.description,
						sortingField: "description",
					},
					{
						id: "status",
						header: "Status",
						cell: (item: TestSetsApiSchema.TestSet) => <StatusIndicator type={item.status}>{item.status}</StatusIndicator>,
						sortingField: "status",
					},
					{
						id: "statusMessage",
						header: "Message",
						cell: (item: TestSetsApiSchema.TestSet) => (
							<ExpandableSection headerText={item.statusMessages[item.statusMessages.length - 1].message.slice(0, 40)}>
								<Steps steps={item.statusMessages.map((i) => ({ header: i.message, status: i.status }))} />
							</ExpandableSection>
						),
						sortingField: "statusMessage",
					},
					{
						id: "createdBy",
						header: "Created By",
						cell: (item: TestSetsApiSchema.TestSet) => item.createdBy,
						sortingField: "createdBy",
					},
				]}
			/>
			{selectedItems[0]?.id && (
				<DeleteTestSetModal
					visible={showDeleteModal}
					onCancel={() => setShowDeleteModal(false)}
					onDeleteSuccessful={() => {
						setShowDeleteModal(false);
						setSelectedItems([]);
					}}
					testSet={selectedItems[0]}
				/>
			)}
		</>
	);
}
