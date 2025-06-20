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

// src/utils/api.ts
import axios from 'axios';
import {
    SolutionActionType,
    SolutionSectionType,
    SolutionRequest
} from '../src/oldtypes/api';
// Create a centralized API client
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Helper function to make POST requests to the solutions API
export const solutionsApi = async (
    type: SolutionActionType,
    data: Record<string, any> = {}
) => {
    try {
        const response = await apiClient.post('/solutions', {
            type,
            data
        } as SolutionRequest);

        return response.data;
    } catch (error) {
        console.error(`Error in ${type} API call:`, error);
        throw error;
    }
};

// Helper functions for common API operations

// Get solution details
export const getSolutionDetails = (solutionId: string) => {
    return solutionsApi('DETAIL', { solutionId });
};

// Get section data
export const getSectionData = (solutionId: string, sectionType: SolutionSectionType) => {
    return solutionsApi('SECTION_DETAIL', { solutionId, sectionType });
};

// Update section data
export const updateSectionData = (
    solutionId: string,
    sectionType: SolutionSectionType,
    sectionData: Record<string, any>
) => {
    return solutionsApi('SECTION_UPDATE', {
        solutionId,
        sectionType,
        ...sectionData
    });
};

// Update solution
export const updateSolution = (solutionId: string, data: Record<string, any>) => {
    return solutionsApi('UPDATE', {
        solutionId,
        ...data
    });
};

// List solutions with optional filtering/sorting
export const listSolutions = (params: {
    limit?: number;
    cursor?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
} = {}) => {
    return solutionsApi('LIST', params);
};

// Search solutions
export const searchSolutions = (params: {
    searchTerm?: string;
    field?: string;
    query?: string;
    limit?: number;
    cursor?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    return solutionsApi('SEARCH', params);
};
