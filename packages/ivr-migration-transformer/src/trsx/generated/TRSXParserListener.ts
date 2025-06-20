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


import { ErrorNode, type ParseTreeListener, ParserRuleContext, TerminalNode } from "antlr4ng";


import { UnexpectedTokenContext } from "./TRSXParser.js";
import { DocumentContext } from "./TRSXParser.js";
import { XmlDeclContext } from "./TRSXParser.js";
import { XmlDeclAttrsContext } from "./TRSXParser.js";
import { XmlDeclAttrContext } from "./TRSXParser.js";
import { VersionAttrContext } from "./TRSXParser.js";
import { EncodingAttrContext } from "./TRSXParser.js";
import { StandaloneAttrContext } from "./TRSXParser.js";
import { NameAttrContext } from "./TRSXParser.js";
import { SourcerefAttrContext } from "./TRSXParser.js";
import { ConceptrefAttrContext } from "./TRSXParser.js";
import { ProjectContext } from "./TRSXParser.js";
import { ProjectElementsContext } from "./TRSXParser.js";
import { ProjectAttrsContext } from "./TRSXParser.js";
import { XmlnsAttrContext } from "./TRSXParser.js";
import { XmlnsNuanceAttrContext } from "./TRSXParser.js";
import { XmlLangAttrContext } from "./TRSXParser.js";
import { NuanceVersionAttrContext } from "./TRSXParser.js";
import { NuanceEnginePackVersionAttrContext } from "./TRSXParser.js";
import { MetadataContext } from "./TRSXParser.js";
import { EntryContext } from "./TRSXParser.js";
import { EntryContentContext } from "./TRSXParser.js";
import { EntryAttrsContext } from "./TRSXParser.js";
import { KeyAttrContext } from "./TRSXParser.js";
import { SourcesContext } from "./TRSXParser.js";
import { SourceContext } from "./TRSXParser.js";
import { SourceAttrsContext } from "./TRSXParser.js";
import { SourceDisplayNameAttrContext } from "./TRSXParser.js";
import { SourceUriAttrContext } from "./TRSXParser.js";
import { SourceVersionAttrContext } from "./TRSXParser.js";
import { SourceUseForOOVAttrContext } from "./TRSXParser.js";
import { OntologyContext } from "./TRSXParser.js";
import { OntologyAttrsContext } from "./TRSXParser.js";
import { BaseAttrContext } from "./TRSXParser.js";
import { IntentsContext } from "./TRSXParser.js";
import { IntentContext } from "./TRSXParser.js";
import { IntentAttrsContext } from "./TRSXParser.js";
import { LinksContext } from "./TRSXParser.js";
import { LinkContext } from "./TRSXParser.js";
import { LinkAttrsContext } from "./TRSXParser.js";
import { ConceptsContext } from "./TRSXParser.js";
import { ConceptContext } from "./TRSXParser.js";
import { ConceptElementsContext } from "./TRSXParser.js";
import { ConceptAttrsContext } from "./TRSXParser.js";
import { DataTypeAttrContext } from "./TRSXParser.js";
import { FreetextAttrContext } from "./TRSXParser.js";
import { DynamicAttrContext } from "./TRSXParser.js";
import { RuleGrammarFileNameAttrContext } from "./TRSXParser.js";
import { SettingsContext } from "./TRSXParser.js";
import { SettingContext } from "./TRSXParser.js";
import { SettingAttrsContext } from "./TRSXParser.js";
import { RelationsContext } from "./TRSXParser.js";
import { RelationContext } from "./TRSXParser.js";
import { RelationAttrsContext } from "./TRSXParser.js";
import { TypeAttrContext } from "./TRSXParser.js";
import { DictionariesContext } from "./TRSXParser.js";
import { DictionaryContext } from "./TRSXParser.js";
import { DictionaryAttrsContext } from "./TRSXParser.js";
import { DictionaryEntryContext } from "./TRSXParser.js";
import { DictionaryEntryAttrsContext } from "./TRSXParser.js";
import { LiteralAttrContext } from "./TRSXParser.js";
import { ValueAttrContext } from "./TRSXParser.js";
import { ProtectedAttrContext } from "./TRSXParser.js";
import { SamplesContext } from "./TRSXParser.js";
import { SampleContext } from "./TRSXParser.js";
import { SampleAttrsContext } from "./TRSXParser.js";
import { DescriptionAttrContext } from "./TRSXParser.js";
import { CountAttrContext } from "./TRSXParser.js";
import { IntentrefAttrContext } from "./TRSXParser.js";
import { ExcludedAttrContext } from "./TRSXParser.js";
import { FullyVerifiedAttrContext } from "./TRSXParser.js";
import { AnnotationContext } from "./TRSXParser.js";
import { AnnotationContentContext } from "./TRSXParser.js";
import { AnnotationAttrsContext } from "./TRSXParser.js";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `TRSXParser`.
 */
export class TRSXParserListener implements ParseTreeListener {
    /**
     * Enter a parse tree produced by `TRSXParser.unexpectedToken`.
     * @param ctx the parse tree
     */
    enterUnexpectedToken?: (ctx: UnexpectedTokenContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.unexpectedToken`.
     * @param ctx the parse tree
     */
    exitUnexpectedToken?: (ctx: UnexpectedTokenContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.document`.
     * @param ctx the parse tree
     */
    enterDocument?: (ctx: DocumentContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.document`.
     * @param ctx the parse tree
     */
    exitDocument?: (ctx: DocumentContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.xmlDecl`.
     * @param ctx the parse tree
     */
    enterXmlDecl?: (ctx: XmlDeclContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.xmlDecl`.
     * @param ctx the parse tree
     */
    exitXmlDecl?: (ctx: XmlDeclContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.xmlDeclAttrs`.
     * @param ctx the parse tree
     */
    enterXmlDeclAttrs?: (ctx: XmlDeclAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.xmlDeclAttrs`.
     * @param ctx the parse tree
     */
    exitXmlDeclAttrs?: (ctx: XmlDeclAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.xmlDeclAttr`.
     * @param ctx the parse tree
     */
    enterXmlDeclAttr?: (ctx: XmlDeclAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.xmlDeclAttr`.
     * @param ctx the parse tree
     */
    exitXmlDeclAttr?: (ctx: XmlDeclAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.versionAttr`.
     * @param ctx the parse tree
     */
    enterVersionAttr?: (ctx: VersionAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.versionAttr`.
     * @param ctx the parse tree
     */
    exitVersionAttr?: (ctx: VersionAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.encodingAttr`.
     * @param ctx the parse tree
     */
    enterEncodingAttr?: (ctx: EncodingAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.encodingAttr`.
     * @param ctx the parse tree
     */
    exitEncodingAttr?: (ctx: EncodingAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.standaloneAttr`.
     * @param ctx the parse tree
     */
    enterStandaloneAttr?: (ctx: StandaloneAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.standaloneAttr`.
     * @param ctx the parse tree
     */
    exitStandaloneAttr?: (ctx: StandaloneAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.nameAttr`.
     * @param ctx the parse tree
     */
    enterNameAttr?: (ctx: NameAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.nameAttr`.
     * @param ctx the parse tree
     */
    exitNameAttr?: (ctx: NameAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.sourcerefAttr`.
     * @param ctx the parse tree
     */
    enterSourcerefAttr?: (ctx: SourcerefAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.sourcerefAttr`.
     * @param ctx the parse tree
     */
    exitSourcerefAttr?: (ctx: SourcerefAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.conceptrefAttr`.
     * @param ctx the parse tree
     */
    enterConceptrefAttr?: (ctx: ConceptrefAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.conceptrefAttr`.
     * @param ctx the parse tree
     */
    exitConceptrefAttr?: (ctx: ConceptrefAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.project`.
     * @param ctx the parse tree
     */
    enterProject?: (ctx: ProjectContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.project`.
     * @param ctx the parse tree
     */
    exitProject?: (ctx: ProjectContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.projectElements`.
     * @param ctx the parse tree
     */
    enterProjectElements?: (ctx: ProjectElementsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.projectElements`.
     * @param ctx the parse tree
     */
    exitProjectElements?: (ctx: ProjectElementsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.projectAttrs`.
     * @param ctx the parse tree
     */
    enterProjectAttrs?: (ctx: ProjectAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.projectAttrs`.
     * @param ctx the parse tree
     */
    exitProjectAttrs?: (ctx: ProjectAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.xmlnsAttr`.
     * @param ctx the parse tree
     */
    enterXmlnsAttr?: (ctx: XmlnsAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.xmlnsAttr`.
     * @param ctx the parse tree
     */
    exitXmlnsAttr?: (ctx: XmlnsAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.xmlnsNuanceAttr`.
     * @param ctx the parse tree
     */
    enterXmlnsNuanceAttr?: (ctx: XmlnsNuanceAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.xmlnsNuanceAttr`.
     * @param ctx the parse tree
     */
    exitXmlnsNuanceAttr?: (ctx: XmlnsNuanceAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.xmlLangAttr`.
     * @param ctx the parse tree
     */
    enterXmlLangAttr?: (ctx: XmlLangAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.xmlLangAttr`.
     * @param ctx the parse tree
     */
    exitXmlLangAttr?: (ctx: XmlLangAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.nuanceVersionAttr`.
     * @param ctx the parse tree
     */
    enterNuanceVersionAttr?: (ctx: NuanceVersionAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.nuanceVersionAttr`.
     * @param ctx the parse tree
     */
    exitNuanceVersionAttr?: (ctx: NuanceVersionAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.nuanceEnginePackVersionAttr`.
     * @param ctx the parse tree
     */
    enterNuanceEnginePackVersionAttr?: (ctx: NuanceEnginePackVersionAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.nuanceEnginePackVersionAttr`.
     * @param ctx the parse tree
     */
    exitNuanceEnginePackVersionAttr?: (ctx: NuanceEnginePackVersionAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.metadata`.
     * @param ctx the parse tree
     */
    enterMetadata?: (ctx: MetadataContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.metadata`.
     * @param ctx the parse tree
     */
    exitMetadata?: (ctx: MetadataContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.entry`.
     * @param ctx the parse tree
     */
    enterEntry?: (ctx: EntryContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.entry`.
     * @param ctx the parse tree
     */
    exitEntry?: (ctx: EntryContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.entryContent`.
     * @param ctx the parse tree
     */
    enterEntryContent?: (ctx: EntryContentContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.entryContent`.
     * @param ctx the parse tree
     */
    exitEntryContent?: (ctx: EntryContentContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.entryAttrs`.
     * @param ctx the parse tree
     */
    enterEntryAttrs?: (ctx: EntryAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.entryAttrs`.
     * @param ctx the parse tree
     */
    exitEntryAttrs?: (ctx: EntryAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.keyAttr`.
     * @param ctx the parse tree
     */
    enterKeyAttr?: (ctx: KeyAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.keyAttr`.
     * @param ctx the parse tree
     */
    exitKeyAttr?: (ctx: KeyAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.sources`.
     * @param ctx the parse tree
     */
    enterSources?: (ctx: SourcesContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.sources`.
     * @param ctx the parse tree
     */
    exitSources?: (ctx: SourcesContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.source`.
     * @param ctx the parse tree
     */
    enterSource?: (ctx: SourceContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.source`.
     * @param ctx the parse tree
     */
    exitSource?: (ctx: SourceContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.sourceAttrs`.
     * @param ctx the parse tree
     */
    enterSourceAttrs?: (ctx: SourceAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.sourceAttrs`.
     * @param ctx the parse tree
     */
    exitSourceAttrs?: (ctx: SourceAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.sourceDisplayNameAttr`.
     * @param ctx the parse tree
     */
    enterSourceDisplayNameAttr?: (ctx: SourceDisplayNameAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.sourceDisplayNameAttr`.
     * @param ctx the parse tree
     */
    exitSourceDisplayNameAttr?: (ctx: SourceDisplayNameAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.sourceUriAttr`.
     * @param ctx the parse tree
     */
    enterSourceUriAttr?: (ctx: SourceUriAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.sourceUriAttr`.
     * @param ctx the parse tree
     */
    exitSourceUriAttr?: (ctx: SourceUriAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.sourceVersionAttr`.
     * @param ctx the parse tree
     */
    enterSourceVersionAttr?: (ctx: SourceVersionAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.sourceVersionAttr`.
     * @param ctx the parse tree
     */
    exitSourceVersionAttr?: (ctx: SourceVersionAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.sourceUseForOOVAttr`.
     * @param ctx the parse tree
     */
    enterSourceUseForOOVAttr?: (ctx: SourceUseForOOVAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.sourceUseForOOVAttr`.
     * @param ctx the parse tree
     */
    exitSourceUseForOOVAttr?: (ctx: SourceUseForOOVAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.ontology`.
     * @param ctx the parse tree
     */
    enterOntology?: (ctx: OntologyContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.ontology`.
     * @param ctx the parse tree
     */
    exitOntology?: (ctx: OntologyContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.ontologyAttrs`.
     * @param ctx the parse tree
     */
    enterOntologyAttrs?: (ctx: OntologyAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.ontologyAttrs`.
     * @param ctx the parse tree
     */
    exitOntologyAttrs?: (ctx: OntologyAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.baseAttr`.
     * @param ctx the parse tree
     */
    enterBaseAttr?: (ctx: BaseAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.baseAttr`.
     * @param ctx the parse tree
     */
    exitBaseAttr?: (ctx: BaseAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.intents`.
     * @param ctx the parse tree
     */
    enterIntents?: (ctx: IntentsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.intents`.
     * @param ctx the parse tree
     */
    exitIntents?: (ctx: IntentsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.intent`.
     * @param ctx the parse tree
     */
    enterIntent?: (ctx: IntentContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.intent`.
     * @param ctx the parse tree
     */
    exitIntent?: (ctx: IntentContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.intentAttrs`.
     * @param ctx the parse tree
     */
    enterIntentAttrs?: (ctx: IntentAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.intentAttrs`.
     * @param ctx the parse tree
     */
    exitIntentAttrs?: (ctx: IntentAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.links`.
     * @param ctx the parse tree
     */
    enterLinks?: (ctx: LinksContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.links`.
     * @param ctx the parse tree
     */
    exitLinks?: (ctx: LinksContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.link`.
     * @param ctx the parse tree
     */
    enterLink?: (ctx: LinkContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.link`.
     * @param ctx the parse tree
     */
    exitLink?: (ctx: LinkContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.linkAttrs`.
     * @param ctx the parse tree
     */
    enterLinkAttrs?: (ctx: LinkAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.linkAttrs`.
     * @param ctx the parse tree
     */
    exitLinkAttrs?: (ctx: LinkAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.concepts`.
     * @param ctx the parse tree
     */
    enterConcepts?: (ctx: ConceptsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.concepts`.
     * @param ctx the parse tree
     */
    exitConcepts?: (ctx: ConceptsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.concept`.
     * @param ctx the parse tree
     */
    enterConcept?: (ctx: ConceptContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.concept`.
     * @param ctx the parse tree
     */
    exitConcept?: (ctx: ConceptContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.conceptElements`.
     * @param ctx the parse tree
     */
    enterConceptElements?: (ctx: ConceptElementsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.conceptElements`.
     * @param ctx the parse tree
     */
    exitConceptElements?: (ctx: ConceptElementsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.conceptAttrs`.
     * @param ctx the parse tree
     */
    enterConceptAttrs?: (ctx: ConceptAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.conceptAttrs`.
     * @param ctx the parse tree
     */
    exitConceptAttrs?: (ctx: ConceptAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.dataTypeAttr`.
     * @param ctx the parse tree
     */
    enterDataTypeAttr?: (ctx: DataTypeAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.dataTypeAttr`.
     * @param ctx the parse tree
     */
    exitDataTypeAttr?: (ctx: DataTypeAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.freetextAttr`.
     * @param ctx the parse tree
     */
    enterFreetextAttr?: (ctx: FreetextAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.freetextAttr`.
     * @param ctx the parse tree
     */
    exitFreetextAttr?: (ctx: FreetextAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.dynamicAttr`.
     * @param ctx the parse tree
     */
    enterDynamicAttr?: (ctx: DynamicAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.dynamicAttr`.
     * @param ctx the parse tree
     */
    exitDynamicAttr?: (ctx: DynamicAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.ruleGrammarFileNameAttr`.
     * @param ctx the parse tree
     */
    enterRuleGrammarFileNameAttr?: (ctx: RuleGrammarFileNameAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.ruleGrammarFileNameAttr`.
     * @param ctx the parse tree
     */
    exitRuleGrammarFileNameAttr?: (ctx: RuleGrammarFileNameAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.settings`.
     * @param ctx the parse tree
     */
    enterSettings?: (ctx: SettingsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.settings`.
     * @param ctx the parse tree
     */
    exitSettings?: (ctx: SettingsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.setting`.
     * @param ctx the parse tree
     */
    enterSetting?: (ctx: SettingContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.setting`.
     * @param ctx the parse tree
     */
    exitSetting?: (ctx: SettingContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.settingAttrs`.
     * @param ctx the parse tree
     */
    enterSettingAttrs?: (ctx: SettingAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.settingAttrs`.
     * @param ctx the parse tree
     */
    exitSettingAttrs?: (ctx: SettingAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.relations`.
     * @param ctx the parse tree
     */
    enterRelations?: (ctx: RelationsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.relations`.
     * @param ctx the parse tree
     */
    exitRelations?: (ctx: RelationsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.relation`.
     * @param ctx the parse tree
     */
    enterRelation?: (ctx: RelationContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.relation`.
     * @param ctx the parse tree
     */
    exitRelation?: (ctx: RelationContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.relationAttrs`.
     * @param ctx the parse tree
     */
    enterRelationAttrs?: (ctx: RelationAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.relationAttrs`.
     * @param ctx the parse tree
     */
    exitRelationAttrs?: (ctx: RelationAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.typeAttr`.
     * @param ctx the parse tree
     */
    enterTypeAttr?: (ctx: TypeAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.typeAttr`.
     * @param ctx the parse tree
     */
    exitTypeAttr?: (ctx: TypeAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.dictionaries`.
     * @param ctx the parse tree
     */
    enterDictionaries?: (ctx: DictionariesContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.dictionaries`.
     * @param ctx the parse tree
     */
    exitDictionaries?: (ctx: DictionariesContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.dictionary`.
     * @param ctx the parse tree
     */
    enterDictionary?: (ctx: DictionaryContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.dictionary`.
     * @param ctx the parse tree
     */
    exitDictionary?: (ctx: DictionaryContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.dictionaryAttrs`.
     * @param ctx the parse tree
     */
    enterDictionaryAttrs?: (ctx: DictionaryAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.dictionaryAttrs`.
     * @param ctx the parse tree
     */
    exitDictionaryAttrs?: (ctx: DictionaryAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.dictionaryEntry`.
     * @param ctx the parse tree
     */
    enterDictionaryEntry?: (ctx: DictionaryEntryContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.dictionaryEntry`.
     * @param ctx the parse tree
     */
    exitDictionaryEntry?: (ctx: DictionaryEntryContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.dictionaryEntryAttrs`.
     * @param ctx the parse tree
     */
    enterDictionaryEntryAttrs?: (ctx: DictionaryEntryAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.dictionaryEntryAttrs`.
     * @param ctx the parse tree
     */
    exitDictionaryEntryAttrs?: (ctx: DictionaryEntryAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.literalAttr`.
     * @param ctx the parse tree
     */
    enterLiteralAttr?: (ctx: LiteralAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.literalAttr`.
     * @param ctx the parse tree
     */
    exitLiteralAttr?: (ctx: LiteralAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.valueAttr`.
     * @param ctx the parse tree
     */
    enterValueAttr?: (ctx: ValueAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.valueAttr`.
     * @param ctx the parse tree
     */
    exitValueAttr?: (ctx: ValueAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.protectedAttr`.
     * @param ctx the parse tree
     */
    enterProtectedAttr?: (ctx: ProtectedAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.protectedAttr`.
     * @param ctx the parse tree
     */
    exitProtectedAttr?: (ctx: ProtectedAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.samples`.
     * @param ctx the parse tree
     */
    enterSamples?: (ctx: SamplesContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.samples`.
     * @param ctx the parse tree
     */
    exitSamples?: (ctx: SamplesContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.sample`.
     * @param ctx the parse tree
     */
    enterSample?: (ctx: SampleContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.sample`.
     * @param ctx the parse tree
     */
    exitSample?: (ctx: SampleContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.sampleAttrs`.
     * @param ctx the parse tree
     */
    enterSampleAttrs?: (ctx: SampleAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.sampleAttrs`.
     * @param ctx the parse tree
     */
    exitSampleAttrs?: (ctx: SampleAttrsContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.descriptionAttr`.
     * @param ctx the parse tree
     */
    enterDescriptionAttr?: (ctx: DescriptionAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.descriptionAttr`.
     * @param ctx the parse tree
     */
    exitDescriptionAttr?: (ctx: DescriptionAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.countAttr`.
     * @param ctx the parse tree
     */
    enterCountAttr?: (ctx: CountAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.countAttr`.
     * @param ctx the parse tree
     */
    exitCountAttr?: (ctx: CountAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.intentrefAttr`.
     * @param ctx the parse tree
     */
    enterIntentrefAttr?: (ctx: IntentrefAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.intentrefAttr`.
     * @param ctx the parse tree
     */
    exitIntentrefAttr?: (ctx: IntentrefAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.excludedAttr`.
     * @param ctx the parse tree
     */
    enterExcludedAttr?: (ctx: ExcludedAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.excludedAttr`.
     * @param ctx the parse tree
     */
    exitExcludedAttr?: (ctx: ExcludedAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.fullyVerifiedAttr`.
     * @param ctx the parse tree
     */
    enterFullyVerifiedAttr?: (ctx: FullyVerifiedAttrContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.fullyVerifiedAttr`.
     * @param ctx the parse tree
     */
    exitFullyVerifiedAttr?: (ctx: FullyVerifiedAttrContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.annotation`.
     * @param ctx the parse tree
     */
    enterAnnotation?: (ctx: AnnotationContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.annotation`.
     * @param ctx the parse tree
     */
    exitAnnotation?: (ctx: AnnotationContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.annotationContent`.
     * @param ctx the parse tree
     */
    enterAnnotationContent?: (ctx: AnnotationContentContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.annotationContent`.
     * @param ctx the parse tree
     */
    exitAnnotationContent?: (ctx: AnnotationContentContext) => void;
    /**
     * Enter a parse tree produced by `TRSXParser.annotationAttrs`.
     * @param ctx the parse tree
     */
    enterAnnotationAttrs?: (ctx: AnnotationAttrsContext) => void;
    /**
     * Exit a parse tree produced by `TRSXParser.annotationAttrs`.
     * @param ctx the parse tree
     */
    exitAnnotationAttrs?: (ctx: AnnotationAttrsContext) => void;

    visitTerminal(node: TerminalNode): void { }
    visitErrorNode(node: ErrorNode): void { }
    enterEveryRule(node: ParserRuleContext): void { }
    exitEveryRule(node: ParserRuleContext): void { }
}

