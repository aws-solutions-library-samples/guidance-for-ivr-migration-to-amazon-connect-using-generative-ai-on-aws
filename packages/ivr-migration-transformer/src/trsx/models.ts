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


/**
 * interface for XML declaration
 */
export interface XmlDeclaration {
	version: string;
	encoding?: string;
	standalone?: string;
}

/**
 * interface for project attributes
 */
export interface ProjectAttributes {
	xmlLang?: string;
	nuanceVersion: string;
	nuanceEnginePackVersion?: string;
}

/**
 * interface for metadata entry
 */
export interface MetadataEntry {
	key: string;
	value: string;
}

export interface Source {
	name: string;
	displayName?: string;
	uri?: string;
	version?: string;
	type?: SourceType;
	useForOOV?: boolean;
}

export enum SourceType {
	"CUSTOM",
	"PREBUILT",
	"REJECTION"
}

/**
 * interface for link
 */
export interface Link {
	conceptref: string;
	sourceref?: string;
}

/**
 * interface for concept
 */
export interface Concept {
	name: string;
	dataType?: string;
	freetext?: boolean;
	dynamic?: boolean;
	ruleGrammarFileName?: string;
	sourceref?: string;
	settings?: Setting[];
	relations?: Relation[];
}

export interface Setting {
	name: string;
	value: string;
}

export interface Relation {
	type: string;
	conceptref: string;
	sourceref?: string;
}

/**
 * interface for dictionary entry
 */
export interface DictionaryEntry {
	literal: string;
	value?: string;
	protected?: boolean;
	sourceref?: string;
}

/**
 * interface for dictionary
 */
export interface Dictionary {
	conceptref: string;
	entries: DictionaryEntry[];
}

/**
 * interface for annotation
 */
export interface Annotation {
	conceptref: string;
	text: string;
	annotations?: Annotation[];
}

/**
 * interface for sample
 */
export interface Sample {
	description?: string;
	count?: number;
	intentref?: string;
	excluded?: boolean;
	fullyVerified?: boolean;
	protected?: boolean;
	sourceref?: string;
	text: string;

	annotations: Annotation[];
}

/**
 * interface for intent
 */
export interface Intent {
	name: string;
	sourceref?: string;
	links?: Link[];
}

/**
 * interface for ontology
 */
export interface Ontology {
	base?: string;
	intents?: Intent[];
	concepts?: Concept[];
}

/**
 * interface for project
 */
export interface Project {
	attributes: ProjectAttributes;
	metadata?: MetadataEntry[];
	sources?: Source[];
	ontology?: Ontology;
	dictionaries?: Dictionary[];
	samples?: Sample[];
}


