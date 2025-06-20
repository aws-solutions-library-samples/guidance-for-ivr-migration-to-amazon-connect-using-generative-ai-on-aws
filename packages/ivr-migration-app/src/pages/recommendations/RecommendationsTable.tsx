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

import { Box, Header, SpaceBetween, StatusIndicator, Table } from "@cloudscape-design/components";
import { useParams } from "react-router-dom";
import { RecommendationTaskItemsApiSchema } from "@ivr-migration-tool/schemas";
import { useListRecommendationTaskItemsQuery } from "../../slices/recommendationTaskItemsApiSlice";

export interface RecommendationsTableProps {
	variant: "container" | "full-page";
	setSelectedItems: React.Dispatch<React.SetStateAction<RecommendationTaskItemsApiSchema.TaskItemResource[]>>;
	selectedItems: RecommendationTaskItemsApiSchema.TaskItemResource[];
}

export default function RecommendationsTable({ variant, selectedItems, setSelectedItems }: RecommendationsTableProps) {
	const { taskId } = useParams();

	const { data, isFetching } = useListRecommendationTaskItemsQuery({ id: taskId! });

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
						actions={<SpaceBetween direction="horizontal" size="xs"></SpaceBetween>}
						description="List of recommendations."
					>
						Recommendations
					</Header>
				}
				empty={
					<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
						<SpaceBetween size="m">
							<b>No Recommendation</b>
						</SpaceBetween>
					</Box>
				}
				items={data?.taskItems ?? []}
				columnDefinitions={[
					{
						id: "taskItemId",
						header: "ID",
						cell: (item: RecommendationTaskItemsApiSchema.TaskItemResource) => item.taskItemId,
						sortingField: "taskItemId",
					},
					{
						id: "recommendation",
						header: "Recommendation",
						cell: (item: RecommendationTaskItemsApiSchema.TaskItemResource) => item.statusMessage,
						sortingField: "recommendation",
					},
					{
						id: "status",
						header: "Status",
						cell: (item: RecommendationTaskItemsApiSchema.TaskItemResource) => <StatusIndicator type={item.status}>{item.status}</StatusIndicator>,
						sortingField: "status",
					},
				]}
			/>
		</>
	);
}
