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

import { TerminalNode } from 'antlr4ng';
import {
	AnnotationAttrsContext,
	AnnotationContext,
	ConceptAttrsContext,
	DictionaryAttrsContext,
	DictionaryEntryAttrsContext,
	EntryAttrsContext,
	EntryContext,
	IntentAttrsContext,
	LinkAttrsContext,
	OntologyAttrsContext,
	ProjectAttrsContext,
	SampleAttrsContext,
	SampleContext,
	SourceAttrsContext,
	SourceContext,
	TRSXParser,
} from './generated/TRSXParser';
import { TRSXParserListener } from './generated/TRSXParserListener';
import {
	SourceType,
	type Annotation,
	type Concept,
	type Dictionary,
	type DictionaryEntry,
	type Intent,
	type Link,
	type MetadataEntry,
	type Ontology,
	type Project,
	type Sample,
	type Source,
	type XmlDeclaration,
} from './models.ts';
import type { Logger } from 'pino';
import { getLogger } from '../common/logger.ts';
import stringify from 'json-stringify-safe';

/**
 * TRSXListener class for parsing TRSX files
 * @class
 */
export class TRSXListener extends TRSXParserListener {
	private currentProject?: Project;
	private currentXmlDecl?: XmlDeclaration;
	private currentMetadataEntry?: MetadataEntry;
	private currentSource?: Source;
	private currentIntent?: Intent;
	private currentLink?: Link;
	private currentConcept?: Concept;
	private currentDictionary?: Dictionary;
	private currentDictionaryEntry?: DictionaryEntry;
	private currentSample?: Sample;
	private currentAnnotation?: Annotation;

	constructor(private readonly log: Logger<any, boolean>) {
		super();
	}

	/**
	 * Gets the parsing result
	 * @returns {Object} The parsing result containing XML declaration and project
	 */
	public getResult(): { xmlDecl?: XmlDeclaration; project: Project } {
		const logger = getLogger(this.log, 'TRSXListener', 'getResult');
		logger.trace(`in:`);

		if (!this.currentProject) {
			throw new Error('No project was parsed');
		}

		logger.trace(`exit: xmlDecl:${this.currentXmlDecl}, project:${this.currentProject}`);
		return {
			xmlDecl: this.currentXmlDecl,
			project: this.currentProject,
		};
	}

	/**
	 * Handles XML declaration entry
	 */
	override enterXmlDecl = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterXmlDecl');
		logger.trace(`in:`);

		this.currentProject = undefined;
		this.currentXmlDecl = {
			version: '',
			encoding: undefined,
			standalone: undefined,
		};
		this.currentMetadataEntry = undefined;
		this.currentSource = undefined;
		this.currentIntent = undefined;
		this.currentLink = undefined;
		this.currentConcept = undefined;
		this.currentDictionary = undefined;
		this.currentDictionaryEntry = undefined;
		this.currentSample = undefined;
		this.currentAnnotation = undefined;

		logger.trace(`exit:`);
	};

	/**
	 * Handles project entry
	 */
	override enterProject = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterProject');
		logger.trace(`in:`);

		this.currentProject = {
			attributes: {
				nuanceVersion: '',
			},
		};
		logger.trace(`exit:`);
	};

	override enterProjectAttrs = (ctx: ProjectAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterProjectAttrs');
		logger.trace(`in: ctx.text: ${ctx.getText()}`);

		if (!this.currentProject) {
			throw new Error('Project not initialized');
		}
		const xmlLang = ctx.xmlLangAttr()?.STRING();
		const nuanceVersion = ctx.nuanceVersionAttr()?.STRING();
		const nuanceEnginePackVersion = ctx.nuanceEnginePackVersionAttr()?.STRING();

		if (xmlLang) {
			this.currentProject!.attributes.xmlLang = xmlLang.getText().slice(1, -1);
			logger.trace(`xmlLang: ${this.currentProject!.attributes.xmlLang}`);
		}
		if (nuanceVersion) {
			this.currentProject!.attributes.nuanceVersion = nuanceVersion.getText().slice(1, -1);
			logger.trace(`nuanceVersion: ${this.currentProject!.attributes.nuanceVersion}`);
		}
		if (nuanceEnginePackVersion) {
			this.currentProject!.attributes.nuanceEnginePackVersion = nuanceEnginePackVersion.getText().slice(1, -1);
			logger.trace(`nuanceEnginePackVersion: ${this.currentProject!.attributes.nuanceEnginePackVersion}`);
		}
		logger.trace(`exit:`);
	};

	/**
	 * Handles metadata entry
	 */
	override enterMetadata = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterMetadata');
		logger.trace(`in:`);

		this.currentProject!.metadata = [];
		logger.trace(`exit:`);
	};

	/**
	 * Handles entry entry
	 */
	override enterEntry = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterEntry');
		logger.trace(`in:`);

		this.currentMetadataEntry = {
			key: '',
			value: '',
		};
		logger.trace(`exit:`);
	};

	/**
	 * Handles entry exit
	 * @param {EntryContext} ctx - The parser context
	 */
	override exitEntry = (ctx: EntryContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'exitEntry');
		logger.trace(`in:`);

		if (!this.currentProject || !this.currentMetadataEntry) {
			throw new Error('Project or metadata entry not initialized');
		}
		// Get all text nodes within the entry
		const textNodes = ctx.entryContent();
		if (textNodes && textNodes.length > 0) {
			// Join all text nodes and trim whitespace
			this.currentMetadataEntry.value = textNodes
				.map((node) => node.getText())
				.join('')
				.trim();
		}
		this.currentProject!.metadata!.push(this.currentMetadataEntry);
		this.currentMetadataEntry = undefined;
		logger.trace(`exit: ${stringify(this.currentMetadataEntry)}`);
	};

	/**
	 * Handles required entry attribute entry
	 * @param {EntryAttrContext} ctx - The parser context
	 */
	override enterEntryAttrs = (ctx: EntryAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterEntryAttrs');
		logger.trace(`in: ctx.text:${ctx.getText()}`);

		if (!this.currentMetadataEntry) {
			throw new Error('Metadata entry not initialized');
		}
		const key = ctx.keyAttr()?.STRING();
		if (key) {
			this.currentMetadataEntry!.key = key.getText().slice(1, -1);
			logger.trace(`key: ${this.currentMetadataEntry!.key}`);
		}
		logger.trace(`exit:`);
	};

	/**
	 * Handles sources entry
	 */
	override enterSources = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterSources');
		logger.trace(`in:`);

		this.currentProject!.sources = [];
		logger.trace(`exit:`);
	};

	/**
	 * Handles source entry
	 */
	override enterSource = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterSource');
		logger.trace(`in:`);

		this.currentSource = {
			name: '',
		};
		logger.trace(`exit:`);
	};

	/**
	 * Handles source exit
	 * @param {SourceContext} ctx - The parser context
	 */
	override exitSource = (ctx: SourceContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'exitSource');
		logger.trace(`in:`);

		if (!this.currentSource) {
			throw new Error('Source not initialized');
		}
		this.currentProject!.sources?.push(this.currentSource);
		this.currentSource = undefined;
		logger.trace(`exit:`);
	};

	override enterSourceAttrs = (ctx: SourceAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterSourceAttrs');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentSource) {
			throw new Error('Source not initialized');
		}
		const name = ctx.nameAttr()?.STRING();
		const sourceDisplayName = ctx.sourceDisplayNameAttr()?.STRING();
		const sourceUri = ctx.sourceUriAttr()?.STRING();
		const sourceVersion = ctx.sourceVersionAttr()?.STRING();
		const sourceType = ctx.typeAttr()?.STRING();
		const sourceUseForOOV = ctx.sourceUseForOOVAttr()?.STRING();

		if (name) {
			this.currentSource!.name = name.getText().slice(1, -1);
			logger.trace(`name: ${this.currentSource!.name}`);
		}
		if (sourceDisplayName) {
			this.currentSource!.displayName = sourceDisplayName.getText().slice(1, -1);
			logger.trace(`displayName: ${this.currentSource!.displayName}`);
		}
		if (sourceUri) {
			this.currentSource!.uri = sourceUri.getText().slice(1, -1);
			logger.trace(`uri: ${this.currentSource!.uri}`);
		}
		if (sourceVersion) {
			this.currentSource!.version = sourceVersion.getText().slice(1, -1);
			logger.trace(`version: ${this.currentSource!.version}`);
		}
		if (sourceType) {
			this.currentSource!.type = sourceType.getText().slice(1, -1) as unknown as SourceType;
			logger.trace(`type: ${this.currentSource!.type}`);
		}
		if (sourceUseForOOV) {
			this.currentSource!.useForOOV = new Boolean(sourceUseForOOV.getText().slice(1, -1)).valueOf();
			logger.trace(`useForOOV: ${this.currentSource!.useForOOV}`);
		}
		logger.trace(`exit:`);
	};

	/**
	 * Handles ontology entry
	 */
	override enterOntology = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterOntology');
		logger.trace(`in:`);

		this.currentProject!.ontology = {};
		logger.trace(`exit:`);
	};

	/**
	 * Handles required ontology attribute entry
	 * @param {OntologyAttrContext} ctx - The parser context
	 */
	override enterOntologyAttrs = (ctx: OntologyAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterOntologyAttrs');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentProject!.ontology) {
			throw new Error('Ontology not initialized');
		}
		const base = ctx.baseAttr()?.STRING();

		if (base) {
			this.currentProject!.ontology!.base = base.getText().slice(1, -1);
			logger.trace(`base: ${this.currentProject!.ontology!.base}`);
		}
		logger.trace(`exit:`);
	};

	/**
	 * Handles intents entry
	 */
	override enterIntents = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterIntents');
		logger.trace(`in:`);

		this.currentProject!.ontology!.intents = [];
		logger.trace(`exit:`);
	};

	/**
	 * Handles intent entry
	 */
	override enterIntent = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterIntent');
		logger.trace(`in:`);

		this.currentIntent = {
			name: '',
		};
		logger.trace(`exit:`);
	};

	/**
	 * Handles intent exit
	 */
	override exitIntent = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'exitIntent');
		logger.trace(`in:`);

		if (!this.currentIntent) {
			throw new Error('Intent not initialized');
		}
		this.currentProject!.ontology!.intents!.push(this.currentIntent);
		this.currentIntent = undefined;
		logger.trace(`exit:`);
	};

	override enterIntentAttrs = (ctx: IntentAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterIntentAttrs');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentIntent) {
			throw new Error('Intent not initialized');
		}
		const name = ctx.nameAttr()?.STRING();
		const sourceref = ctx.sourcerefAttr()?.STRING();

		if (name) {
			this.currentIntent!.name = name.getText().slice(1, -1);
			logger.trace(`name: ${this.currentIntent!.name}`);
		}
		if (sourceref) {
			this.currentIntent!.sourceref = sourceref.getText().slice(1, -1);
			logger.trace(`sourceref: ${this.currentIntent!.sourceref}`);
		}
		logger.trace(`exit:`);
	};

	/**
	 * Handles links entry
	 */
	override enterLinks = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterLinks');
		logger.trace(`in:`);

		this.currentIntent!.links = [];
		logger.trace(`exit:`);
	};

	/**
	 * Handles link entry
	 */
	override enterLink = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterLink');
		logger.trace(`in:`);

		this.currentLink = {
			conceptref: '',
		};
		logger.trace(`exit:`);
	};

	/**
	 * Handles link exit
	 */
	override exitLink = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'exitLink');
		logger.trace(`in:`);

		if (!this.currentLink) {
			throw new Error('Link not initialized');
		}
		this.currentIntent!.links!.push(this.currentLink);
		this.currentLink = undefined;
		logger.trace(`exit:`);
	};

	override enterLinkAttrs = (ctx: LinkAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterLinkAttrs');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentLink) {
			throw new Error('Link not initialized');
		}
		const conceptref = ctx.conceptrefAttr()?.STRING();
		const sourceref = ctx.sourcerefAttr()?.STRING();

		if (conceptref) {
			this.currentLink!.conceptref = conceptref.getText().slice(1, -1);
			logger.trace(`conceptref: ${this.currentLink!.conceptref}`);
		}
		if (sourceref) {
			this.currentLink!.sourceref = sourceref.getText().slice(1, -1);
			logger.trace(`sourceref: ${this.currentLink!.sourceref}`);
		}
		logger.trace(`exit:`);
	};

	/**
	 * Handles concepts entry
	 */
	override enterConcepts = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterConcepts');
		logger.trace(`in:`);

		this.currentProject!.ontology!.concepts = [];
		logger.trace(`exit:`);
	};

	/**
	 * Handles concept entry
	 */
	override enterConcept = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterConcept');
		logger.trace(`in:`);

		this.currentConcept = {
			name: '',
		};
		logger.trace(`exit:`);
	};

	/**
	 * Handles concept exit
	 */
	override exitConcept = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'exitConcept');
		logger.trace(`in:`);

		if (!this.currentConcept) {
			throw new Error('Concept not initialized');
		}
		this.currentProject!.ontology!.concepts!.push(this.currentConcept);
		this.currentConcept = undefined;
		logger.trace(`exit:`);
	};

	override enterConceptAttrs = (ctx: ConceptAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterConceptAttrs');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentConcept) {
			throw new Error('Concept not initialized');
		}
		const name = ctx.nameAttr()?.STRING();
		const dataType = ctx.dataTypeAttr()?.STRING();
		const freetext = ctx.freetextAttr()?.STRING();
		const dynamic = ctx.dynamicAttr()?.STRING();
		const ruleGrammarFileName = ctx.ruleGrammarFileNameAttr()?.STRING();
		const sourceref = ctx.sourcerefAttr()?.STRING();

		if (name) {
			this.currentConcept!.name = name.getText().slice(1, -1);
			logger.trace(`name: ${this.currentConcept!.name}`);
		}
		if (dataType) {
			this.currentConcept!.dataType = dataType.getText().slice(1, -1);
			logger.trace(`dataType: ${this.currentConcept!.dataType}`);
		}
		if (freetext) {
			this.currentConcept!.freetext = new Boolean(freetext.getText().slice(1, -1)).valueOf();
			logger.trace(`freetext: ${this.currentConcept!.freetext}`);
		}
		if (dynamic) {
			this.currentConcept!.dynamic = new Boolean(dynamic.getText().slice(1, -1)).valueOf();
			logger.trace(`dynamic: ${this.currentConcept!.dynamic}`);
		}
		if (ruleGrammarFileName) {
			this.currentConcept!.ruleGrammarFileName = ruleGrammarFileName.getText().slice(1, -1);
			logger.trace(
				`ruleGrammarFileName: ${this.currentConcept!.ruleGrammarFileName}`
			);
		}
		if (sourceref) {
			this.currentConcept!.sourceref = sourceref.getText().slice(1, -1);
			logger.trace(`sourceref: ${this.currentConcept!.sourceref}`);
		}
		logger.trace(`exit:`);
	};

	/**
	 * Handles dictionaries entry
	 */
	override enterDictionaries = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterDictionaries');
		logger.trace(`in:`);

		this.currentProject!.dictionaries = [];
		logger.trace(`exit:`);
	};

	/**
	 * Handles dictionary entry
	 */
	override enterDictionary = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterDictionary');
		logger.trace(`in:`);

		this.currentDictionary = {
			conceptref: '',
			entries: [],
		};
		logger.trace(`exit:`);
	};

	/**
	 * Handles dictionary exit
	 */
	override exitDictionary = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'exitDictionary');
		logger.trace(`in:`);

		if (!this.currentDictionary) {
			throw new Error('Dictionary not initialized');
		}
		this.currentProject!.dictionaries!.push(this.currentDictionary);
		this.currentDictionary = undefined;
		logger.trace(`exit:`);
	};

	override enterDictionaryAttrs = (ctx: DictionaryAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterDictionaryAttrs');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentDictionary) {
			throw new Error('Dictionary entry not initialized');
		}
		const conceptref = ctx.conceptrefAttr()?.STRING();

		if (conceptref) {
			this.currentDictionary!.conceptref = conceptref.getText().slice(1, -1);
			logger.trace(`conceptref: ${this.currentDictionary!.conceptref}`);
		}
		logger.trace(`exit:`);
	};

	/**
	 * Handles dictionary entry entry
	 */
	override enterDictionaryEntry = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterDictionaryEntry');
		logger.trace(`in:`);

		this.currentDictionaryEntry = {
			literal: '',
		};
		logger.trace(`exit:`);
	};

	/**
	 * Handles dictionary entry exit
	 */
	override exitDictionaryEntry = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'exitDictionaryEntry');
		logger.trace(`in:`);

		if (!this.currentDictionary || !this.currentDictionaryEntry) {
			throw new Error('Dictionary or dictionary entry not initialized');
		}
		this.currentDictionary.entries.push(this.currentDictionaryEntry);
		this.currentDictionaryEntry = undefined;
		logger.trace(`exit:`);
	};

	/**
	 * Handles required dictionary entry attributes entry
	 * @param {DictionaryEntryAttrsContext} ctx - The parser context
	 */
	override enterDictionaryEntryAttrs = (ctx: DictionaryEntryAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterDictionaryEntryAttrs');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentDictionaryEntry) {
			throw new Error('Dictionary entry not initialized');
		}
		const literal = ctx.literalAttr()?.STRING();
		const value = ctx.valueAttr()?.STRING();
		const protected_ = ctx.protectedAttr()?.STRING();
		const sourceref = ctx.sourcerefAttr()?.STRING();

		if (literal) {
			this.currentDictionaryEntry!.literal = literal.getText().slice(1, -1);
			logger.trace(`literal: ${this.currentDictionaryEntry!.literal}`);
		}
		if (value) {
			this.currentDictionaryEntry!.value = value.getText().slice(1, -1);
			logger.trace(`value: ${this.currentDictionaryEntry!.value}`);
		}
		if (protected_) {
			this.currentDictionaryEntry!.protected = new Boolean(protected_.getText().slice(1, -1)).valueOf();
			logger.trace(`protected: ${this.currentDictionaryEntry!.protected}`);
		}
		if (sourceref) {
			this.currentDictionaryEntry!.sourceref = sourceref.getText().slice(1, -1);
			logger.trace(`sourceref: ${this.currentDictionaryEntry!.sourceref}`);
		}
		logger.trace(`exit:`);
	};

	/**
	 * Handles samples entry
	 */
	override enterSamples = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterSamples');
		logger.trace(`in:`);

		this.currentProject!.samples = [];
		logger.trace(`exit:`);
	};

	/**
	 * Handles sample entry
	 */
	override enterSample = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterSample');
		logger.trace(`in:`);

		this.currentSample = {
			text: '',
			annotations: [],
		};
		logger.trace(`exit:`);
	};

	/**
	 * Handles sample exit
	 * @param {SampleContext} ctx - The parser context
	 */
	override exitSample = (ctx: SampleContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'exitSample');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentProject || !this.currentSample) {
			throw new Error('Project or sample not initialized');
		}
		let formattedText = '';

		// Process all children in order
		for (let i = 0; i < ctx.getChildCount(); i++) {
			const child = ctx.getChild(i);
			if (!child) continue;

			if (child instanceof TerminalNode) {
				// Handle text nodes
				if (child.symbol.type === TRSXParser.TEXT) {
					formattedText += child.getText();
				}
			} else if (child instanceof AnnotationContext) {
				if (i > 0) {
					formattedText += ' ';
				}

				if (child.annotationAttrs.length > 0) {
					const annotationText = child.annotationAttrs()[0]?.conceptrefAttr().STRING().getText().slice(1, -1).valueOf()
					if (annotationText) {
						const annotation = this.currentProject!.ontology!.concepts!.find((a) => a.name === annotationText);
						if (annotation) {
							formattedText += '{' + annotation.name + '}';
						}
					}
				}

				if (i > 0) {
					formattedText += ' ';
				}
			}
		}

		this.currentSample.text = formattedText.trim();
		this.currentProject!.samples!.push(this.currentSample);
		const sample = this.currentSample;
		this.currentSample = undefined;
		logger.trace(`exit:`);
	};

	/**
	 * Handles required sample attributes entry
	 * @param {SampleAttrsContext} ctx - The parser context
	 */
	override enterSampleAttrs = (ctx: SampleAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterSampleAttrs');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentSample) {
			throw new Error('Sample not initialized');
		}
		const description = ctx.descriptionAttr()?.STRING();
		const count = ctx.countAttr()?.STRING();
		const intentref = ctx.intentrefAttr()?.STRING();
		const excluded = ctx.excludedAttr()?.STRING();
		const fullyVerified = ctx.fullyVerifiedAttr()?.STRING();
		const protected_ = ctx.protectedAttr()?.STRING();
		const sourceref = ctx.sourcerefAttr()?.STRING();

		if (description) {
			this.currentSample!.description = description.getText().slice(1, -1);
			logger.trace(`description: ${this.currentSample!.description}`);
		}
		if (count) {
			this.currentSample!.count = new Number(count.getText().slice(1, -1)).valueOf();
			logger.trace(`count: ${this.currentSample!.count}`);
		}
		if (intentref) {
			this.currentSample!.intentref = intentref.getText().slice(1, -1);
			logger.trace(`intentref: ${this.currentSample!.intentref}`);
		}
		if (excluded) {
			this.currentSample!.excluded = new Boolean(excluded.getText().slice(1, -1)).valueOf();
			logger.trace(`excluded: ${this.currentSample!.excluded}`);
		}
		if (fullyVerified) {
			this.currentSample!.fullyVerified = new Boolean(fullyVerified.getText().slice(1, -1)).valueOf();
			logger.trace(`fullyVerified: ${this.currentSample!.fullyVerified}`);
		}
		if (protected_) {
			this.currentSample!.protected = new Boolean(protected_.getText().slice(1, -1)).valueOf();
			logger.trace(`protected: ${this.currentSample!.protected}`);
		}
		if (sourceref) {
			this.currentSample!.sourceref = sourceref.getText().slice(1, -1);
			logger.trace(`sourceref: ${this.currentSample!.sourceref}`);
		}
		logger.trace(`exit:`);
	};

	/**
	 * Handles annotation entry
	 */
	override enterAnnotation = (): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterAnnotation');
		logger.trace(`in:`);

		this.currentAnnotation = {
			conceptref: '',
			text: '',
		};
		logger.trace(`exit:`);
	};

	/**
	 * Handles annotation exit
	 * @param {AnnotationContext} ctx - The parser context
	 */
	override exitAnnotation = (ctx: AnnotationContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'exitAnnotation');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentSample || !this.currentAnnotation) {
			// throw new Error('Sample or annotation not initialized');
			return;
		}
		const textNodes = ctx.annotationContent();
		if (textNodes && textNodes.length > 0) {
			this.currentAnnotation.text = textNodes
				.map((node) => node.getText())
				.join('')
				.trim();
		}
		this.currentSample.annotations.push(this.currentAnnotation);
		const annotation = this.currentAnnotation;
		this.currentAnnotation = undefined;
		logger.trace(`exit:`);
	};

	/**
	 * Handles required annotation attribute entry
	 * @param {AnnotationAttrContext} ctx - The parser context
	 */
	override enterAnnotationAttrs = (ctx: AnnotationAttrsContext): void => {
		const logger = getLogger(this.log, 'TRSXListener', 'enterAnnotationAttrs');
		logger.trace(`in: ctx:${ctx.getText()}`);

		if (!this.currentAnnotation) {
			throw new Error('Annotation not initialized');
		}
		const conceptref = ctx.conceptrefAttr()?.STRING();

		if (conceptref) {
			this.currentAnnotation!.conceptref = conceptref.getText().slice(1, -1);
			logger.trace(`conceptref: ${this.currentAnnotation!.conceptref}`);
		}
		logger.trace(`exit:`);
	};
}
