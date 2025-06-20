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


import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { TRSXParserListener } from "./TRSXParserListener.js";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class TRSXParser extends antlr.Parser {
    public static readonly XMLDeclOpen = 1;
    public static readonly COMMENT = 2;
    public static readonly CDATA = 3;
    public static readonly DTD = 4;
    public static readonly OPEN = 5;
    public static readonly OPEN_SLASH = 6;
    public static readonly TEXT = 7;
    public static readonly WS = 8;
    public static readonly EntityRef = 9;
    public static readonly CharRef = 10;
    public static readonly SPECIAL_CLOSE = 11;
    public static readonly CLOSE = 12;
    public static readonly CLOSE_SLASH = 13;
    public static readonly EQUALS = 14;
    public static readonly S = 15;
    public static readonly ENCODING = 16;
    public static readonly STANDALONE = 17;
    public static readonly XMLNS = 18;
    public static readonly XMLNS_NUANCE = 19;
    public static readonly XML_LANG = 20;
    public static readonly NUANCE_VERSION = 21;
    public static readonly NUANCE_ENGINE_PACK_VERSION = 22;
    public static readonly PROJECT = 23;
    public static readonly METADATA = 24;
    public static readonly ENTRY = 25;
    public static readonly SOURCES = 26;
    public static readonly SOURCE = 27;
    public static readonly ONTOLOGY = 28;
    public static readonly INTENTS = 29;
    public static readonly INTENT = 30;
    public static readonly LINKS = 31;
    public static readonly LINK = 32;
    public static readonly CONCEPTS = 33;
    public static readonly CONCEPT = 34;
    public static readonly SETTINGS = 35;
    public static readonly SETTING = 36;
    public static readonly RELATIONS = 37;
    public static readonly RELATION = 38;
    public static readonly DICTIONARIES = 39;
    public static readonly DICTIONARY = 40;
    public static readonly SAMPLES = 41;
    public static readonly SAMPLE = 42;
    public static readonly ANNOTATION = 43;
    public static readonly SOURCEREF = 44;
    public static readonly VERSION = 45;
    public static readonly KEY = 46;
    public static readonly BASE = 47;
    public static readonly NAME_ATTR = 48;
    public static readonly FREETEXT = 49;
    public static readonly CONCEPTREF = 50;
    public static readonly INTENTREF = 51;
    public static readonly COUNT = 52;
    public static readonly LITERAL = 53;
    public static readonly VALUE = 54;
    public static readonly PROTECTED = 55;
    public static readonly DESCRIPTION = 56;
    public static readonly EXCLUDED = 57;
    public static readonly FULLY_VERIFIED = 58;
    public static readonly DATATYPE = 59;
    public static readonly DYNAMIC = 60;
    public static readonly RULE_GRAMMAR_FILE = 61;
    public static readonly TYPE = 62;
    public static readonly SOURCE_DISPLAY_NAME = 63;
    public static readonly SOURCE_URI = 64;
    public static readonly SOURCE_USE_FOR_OOV = 65;
    public static readonly PREFIXED_NAME = 66;
    public static readonly NAME = 67;
    public static readonly ATTVALUE_WS = 68;
    public static readonly STRING = 69;
    public static readonly RULE_unexpectedToken = 0;
    public static readonly RULE_document = 1;
    public static readonly RULE_xmlDecl = 2;
    public static readonly RULE_xmlDeclAttrs = 3;
    public static readonly RULE_xmlDeclAttr = 4;
    public static readonly RULE_versionAttr = 5;
    public static readonly RULE_encodingAttr = 6;
    public static readonly RULE_standaloneAttr = 7;
    public static readonly RULE_nameAttr = 8;
    public static readonly RULE_sourcerefAttr = 9;
    public static readonly RULE_conceptrefAttr = 10;
    public static readonly RULE_project = 11;
    public static readonly RULE_projectElements = 12;
    public static readonly RULE_projectAttrs = 13;
    public static readonly RULE_xmlnsAttr = 14;
    public static readonly RULE_xmlnsNuanceAttr = 15;
    public static readonly RULE_xmlLangAttr = 16;
    public static readonly RULE_nuanceVersionAttr = 17;
    public static readonly RULE_nuanceEnginePackVersionAttr = 18;
    public static readonly RULE_metadata = 19;
    public static readonly RULE_entry = 20;
    public static readonly RULE_entryContent = 21;
    public static readonly RULE_entryAttrs = 22;
    public static readonly RULE_keyAttr = 23;
    public static readonly RULE_sources = 24;
    public static readonly RULE_source = 25;
    public static readonly RULE_sourceAttrs = 26;
    public static readonly RULE_sourceDisplayNameAttr = 27;
    public static readonly RULE_sourceUriAttr = 28;
    public static readonly RULE_sourceVersionAttr = 29;
    public static readonly RULE_sourceUseForOOVAttr = 30;
    public static readonly RULE_ontology = 31;
    public static readonly RULE_ontologyAttrs = 32;
    public static readonly RULE_baseAttr = 33;
    public static readonly RULE_intents = 34;
    public static readonly RULE_intent = 35;
    public static readonly RULE_intentAttrs = 36;
    public static readonly RULE_links = 37;
    public static readonly RULE_link = 38;
    public static readonly RULE_linkAttrs = 39;
    public static readonly RULE_concepts = 40;
    public static readonly RULE_concept = 41;
    public static readonly RULE_conceptElements = 42;
    public static readonly RULE_conceptAttrs = 43;
    public static readonly RULE_dataTypeAttr = 44;
    public static readonly RULE_freetextAttr = 45;
    public static readonly RULE_dynamicAttr = 46;
    public static readonly RULE_ruleGrammarFileNameAttr = 47;
    public static readonly RULE_settings = 48;
    public static readonly RULE_setting = 49;
    public static readonly RULE_settingAttrs = 50;
    public static readonly RULE_relations = 51;
    public static readonly RULE_relation = 52;
    public static readonly RULE_relationAttrs = 53;
    public static readonly RULE_typeAttr = 54;
    public static readonly RULE_dictionaries = 55;
    public static readonly RULE_dictionary = 56;
    public static readonly RULE_dictionaryAttrs = 57;
    public static readonly RULE_dictionaryEntry = 58;
    public static readonly RULE_dictionaryEntryAttrs = 59;
    public static readonly RULE_literalAttr = 60;
    public static readonly RULE_valueAttr = 61;
    public static readonly RULE_protectedAttr = 62;
    public static readonly RULE_samples = 63;
    public static readonly RULE_sample = 64;
    public static readonly RULE_sampleAttrs = 65;
    public static readonly RULE_descriptionAttr = 66;
    public static readonly RULE_countAttr = 67;
    public static readonly RULE_intentrefAttr = 68;
    public static readonly RULE_excludedAttr = 69;
    public static readonly RULE_fullyVerifiedAttr = 70;
    public static readonly RULE_annotation = 71;
    public static readonly RULE_annotationContent = 72;
    public static readonly RULE_annotationAttrs = 73;

    public static readonly literalNames = [
        null, "'<?xml'", null, null, null, "'<'", "'</'", null, null, null, 
        null, "'?>'", "'>'", "'/>'", "'='", null, "'encoding'", "'standalone'", 
        "'xmlns'", "'xmlns:nuance'", "'xml:lang'", "'nuance:version'", "'nuance:enginePackVersion'", 
        "'project'", "'metadata'", "'entry'", "'sources'", "'source'", "'ontology'", 
        "'intents'", "'intent'", "'links'", "'link'", "'concepts'", "'concept'", 
        "'settings'", "'setting'", "'relations'", "'relation'", "'dictionaries'", 
        "'dictionary'", "'samples'", "'sample'", "'annotation'", "'sourceref'", 
        "'version'", "'key'", "'base'", "'name'", "'freetext'", "'conceptref'", 
        "'intentref'", "'count'", "'literal'", "'value'", "'protected'", 
        "'description'", "'excluded'", "'fullyVerified'", "'dataType'", 
        "'dynamic'", "'ruleGrammarFileName'", "'type'", "'displayName'", 
        "'uri'", "'useForOOV'"
    ];

    public static readonly symbolicNames = [
        null, "XMLDeclOpen", "COMMENT", "CDATA", "DTD", "OPEN", "OPEN_SLASH", 
        "TEXT", "WS", "EntityRef", "CharRef", "SPECIAL_CLOSE", "CLOSE", 
        "CLOSE_SLASH", "EQUALS", "S", "ENCODING", "STANDALONE", "XMLNS", 
        "XMLNS_NUANCE", "XML_LANG", "NUANCE_VERSION", "NUANCE_ENGINE_PACK_VERSION", 
        "PROJECT", "METADATA", "ENTRY", "SOURCES", "SOURCE", "ONTOLOGY", 
        "INTENTS", "INTENT", "LINKS", "LINK", "CONCEPTS", "CONCEPT", "SETTINGS", 
        "SETTING", "RELATIONS", "RELATION", "DICTIONARIES", "DICTIONARY", 
        "SAMPLES", "SAMPLE", "ANNOTATION", "SOURCEREF", "VERSION", "KEY", 
        "BASE", "NAME_ATTR", "FREETEXT", "CONCEPTREF", "INTENTREF", "COUNT", 
        "LITERAL", "VALUE", "PROTECTED", "DESCRIPTION", "EXCLUDED", "FULLY_VERIFIED", 
        "DATATYPE", "DYNAMIC", "RULE_GRAMMAR_FILE", "TYPE", "SOURCE_DISPLAY_NAME", 
        "SOURCE_URI", "SOURCE_USE_FOR_OOV", "PREFIXED_NAME", "NAME", "ATTVALUE_WS", 
        "STRING"
    ];
    public static readonly ruleNames = [
        "unexpectedToken", "document", "xmlDecl", "xmlDeclAttrs", "xmlDeclAttr", 
        "versionAttr", "encodingAttr", "standaloneAttr", "nameAttr", "sourcerefAttr", 
        "conceptrefAttr", "project", "projectElements", "projectAttrs", 
        "xmlnsAttr", "xmlnsNuanceAttr", "xmlLangAttr", "nuanceVersionAttr", 
        "nuanceEnginePackVersionAttr", "metadata", "entry", "entryContent", 
        "entryAttrs", "keyAttr", "sources", "source", "sourceAttrs", "sourceDisplayNameAttr", 
        "sourceUriAttr", "sourceVersionAttr", "sourceUseForOOVAttr", "ontology", 
        "ontologyAttrs", "baseAttr", "intents", "intent", "intentAttrs", 
        "links", "link", "linkAttrs", "concepts", "concept", "conceptElements", 
        "conceptAttrs", "dataTypeAttr", "freetextAttr", "dynamicAttr", "ruleGrammarFileNameAttr", 
        "settings", "setting", "settingAttrs", "relations", "relation", 
        "relationAttrs", "typeAttr", "dictionaries", "dictionary", "dictionaryAttrs", 
        "dictionaryEntry", "dictionaryEntryAttrs", "literalAttr", "valueAttr", 
        "protectedAttr", "samples", "sample", "sampleAttrs", "descriptionAttr", 
        "countAttr", "intentrefAttr", "excludedAttr", "fullyVerifiedAttr", 
        "annotation", "annotationContent", "annotationAttrs",
    ];

    public get grammarFileName(): string { return "TRSXParser.g4"; }
    public get literalNames(): (string | null)[] { return TRSXParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return TRSXParser.symbolicNames; }
    public get ruleNames(): string[] { return TRSXParser.ruleNames; }
    public get serializedATN(): number[] { return TRSXParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, TRSXParser._ATN, TRSXParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public unexpectedToken(): UnexpectedTokenContext {
        let localContext = new UnexpectedTokenContext(this.context, this.state);
        this.enterRule(localContext, 0, TRSXParser.RULE_unexpectedToken);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 148;
            this.matchWildcard();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public document(): DocumentContext {
        let localContext = new DocumentContext(this.context, this.state);
        this.enterRule(localContext, 2, TRSXParser.RULE_document);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 151;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 1) {
                {
                this.state = 150;
                this.xmlDecl();
                }
            }

            this.state = 153;
            this.project();
            this.state = 154;
            this.match(TRSXParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public xmlDecl(): XmlDeclContext {
        let localContext = new XmlDeclContext(this.context, this.state);
        this.enterRule(localContext, 4, TRSXParser.RULE_xmlDecl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 156;
            this.match(TRSXParser.XMLDeclOpen);
            this.state = 157;
            this.xmlDeclAttrs();
            this.state = 158;
            this.match(TRSXParser.SPECIAL_CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public xmlDeclAttrs(): XmlDeclAttrsContext {
        let localContext = new XmlDeclAttrsContext(this.context, this.state);
        this.enterRule(localContext, 6, TRSXParser.RULE_xmlDeclAttrs);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 161;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 160;
                this.xmlDeclAttr();
                }
                }
                this.state = 163;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (((((_la - 16)) & ~0x1F) === 0 && ((1 << (_la - 16)) & 536870915) !== 0));
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public xmlDeclAttr(): XmlDeclAttrContext {
        let localContext = new XmlDeclAttrContext(this.context, this.state);
        this.enterRule(localContext, 8, TRSXParser.RULE_xmlDeclAttr);
        try {
            this.state = 168;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.VERSION:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 165;
                this.versionAttr();
                }
                break;
            case TRSXParser.ENCODING:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 166;
                this.encodingAttr();
                }
                break;
            case TRSXParser.STANDALONE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 167;
                this.standaloneAttr();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public versionAttr(): VersionAttrContext {
        let localContext = new VersionAttrContext(this.context, this.state);
        this.enterRule(localContext, 10, TRSXParser.RULE_versionAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 170;
            this.match(TRSXParser.VERSION);
            this.state = 171;
            this.match(TRSXParser.EQUALS);
            this.state = 172;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public encodingAttr(): EncodingAttrContext {
        let localContext = new EncodingAttrContext(this.context, this.state);
        this.enterRule(localContext, 12, TRSXParser.RULE_encodingAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 174;
            this.match(TRSXParser.ENCODING);
            this.state = 175;
            this.match(TRSXParser.EQUALS);
            this.state = 176;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public standaloneAttr(): StandaloneAttrContext {
        let localContext = new StandaloneAttrContext(this.context, this.state);
        this.enterRule(localContext, 14, TRSXParser.RULE_standaloneAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 178;
            this.match(TRSXParser.STANDALONE);
            this.state = 179;
            this.match(TRSXParser.EQUALS);
            this.state = 180;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public nameAttr(): NameAttrContext {
        let localContext = new NameAttrContext(this.context, this.state);
        this.enterRule(localContext, 16, TRSXParser.RULE_nameAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 182;
            this.match(TRSXParser.NAME_ATTR);
            this.state = 183;
            this.match(TRSXParser.EQUALS);
            this.state = 184;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sourcerefAttr(): SourcerefAttrContext {
        let localContext = new SourcerefAttrContext(this.context, this.state);
        this.enterRule(localContext, 18, TRSXParser.RULE_sourcerefAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 186;
            this.match(TRSXParser.SOURCEREF);
            this.state = 187;
            this.match(TRSXParser.EQUALS);
            this.state = 188;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public conceptrefAttr(): ConceptrefAttrContext {
        let localContext = new ConceptrefAttrContext(this.context, this.state);
        this.enterRule(localContext, 20, TRSXParser.RULE_conceptrefAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 190;
            this.match(TRSXParser.CONCEPTREF);
            this.state = 191;
            this.match(TRSXParser.EQUALS);
            this.state = 192;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public project(): ProjectContext {
        let localContext = new ProjectContext(this.context, this.state);
        this.enterRule(localContext, 22, TRSXParser.RULE_project);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 194;
            this.match(TRSXParser.OPEN);
            this.state = 195;
            this.match(TRSXParser.PROJECT);
            this.state = 199;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 3, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 196;
                    this.match(TRSXParser.S);
                    }
                    }
                }
                this.state = 201;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 3, this.context);
            }
            this.state = 205;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 8126464) !== 0)) {
                {
                {
                this.state = 202;
                this.projectAttrs();
                }
                }
                this.state = 207;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 211;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 208;
                this.match(TRSXParser.S);
                }
                }
                this.state = 213;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 214;
            this.match(TRSXParser.CLOSE);
            this.state = 218;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 215;
                this.projectElements();
                }
                }
                this.state = 220;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 221;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 222;
            this.match(TRSXParser.PROJECT);
            this.state = 223;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public projectElements(): ProjectElementsContext {
        let localContext = new ProjectElementsContext(this.context, this.state);
        this.enterRule(localContext, 24, TRSXParser.RULE_projectElements);
        try {
            this.state = 230;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 7, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 225;
                this.metadata();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 226;
                this.sources();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 227;
                this.ontology();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 228;
                this.dictionaries();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 229;
                this.samples();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public projectAttrs(): ProjectAttrsContext {
        let localContext = new ProjectAttrsContext(this.context, this.state);
        this.enterRule(localContext, 26, TRSXParser.RULE_projectAttrs);
        try {
            this.state = 237;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.XMLNS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 232;
                this.xmlnsAttr();
                }
                break;
            case TRSXParser.XMLNS_NUANCE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 233;
                this.xmlnsNuanceAttr();
                }
                break;
            case TRSXParser.XML_LANG:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 234;
                this.xmlLangAttr();
                }
                break;
            case TRSXParser.NUANCE_VERSION:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 235;
                this.nuanceVersionAttr();
                }
                break;
            case TRSXParser.NUANCE_ENGINE_PACK_VERSION:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 236;
                this.nuanceEnginePackVersionAttr();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public xmlnsAttr(): XmlnsAttrContext {
        let localContext = new XmlnsAttrContext(this.context, this.state);
        this.enterRule(localContext, 28, TRSXParser.RULE_xmlnsAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 239;
            this.match(TRSXParser.XMLNS);
            this.state = 240;
            this.match(TRSXParser.EQUALS);
            this.state = 241;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public xmlnsNuanceAttr(): XmlnsNuanceAttrContext {
        let localContext = new XmlnsNuanceAttrContext(this.context, this.state);
        this.enterRule(localContext, 30, TRSXParser.RULE_xmlnsNuanceAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 243;
            this.match(TRSXParser.XMLNS_NUANCE);
            this.state = 244;
            this.match(TRSXParser.EQUALS);
            this.state = 245;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public xmlLangAttr(): XmlLangAttrContext {
        let localContext = new XmlLangAttrContext(this.context, this.state);
        this.enterRule(localContext, 32, TRSXParser.RULE_xmlLangAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 247;
            this.match(TRSXParser.XML_LANG);
            this.state = 248;
            this.match(TRSXParser.EQUALS);
            this.state = 249;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public nuanceVersionAttr(): NuanceVersionAttrContext {
        let localContext = new NuanceVersionAttrContext(this.context, this.state);
        this.enterRule(localContext, 34, TRSXParser.RULE_nuanceVersionAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 251;
            this.match(TRSXParser.NUANCE_VERSION);
            this.state = 252;
            this.match(TRSXParser.EQUALS);
            this.state = 253;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public nuanceEnginePackVersionAttr(): NuanceEnginePackVersionAttrContext {
        let localContext = new NuanceEnginePackVersionAttrContext(this.context, this.state);
        this.enterRule(localContext, 36, TRSXParser.RULE_nuanceEnginePackVersionAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 255;
            this.match(TRSXParser.NUANCE_ENGINE_PACK_VERSION);
            this.state = 256;
            this.match(TRSXParser.EQUALS);
            this.state = 257;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public metadata(): MetadataContext {
        let localContext = new MetadataContext(this.context, this.state);
        this.enterRule(localContext, 38, TRSXParser.RULE_metadata);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 259;
            this.match(TRSXParser.OPEN);
            this.state = 260;
            this.match(TRSXParser.METADATA);
            this.state = 264;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 261;
                this.match(TRSXParser.S);
                }
                }
                this.state = 266;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 267;
            this.match(TRSXParser.CLOSE);
            this.state = 271;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 268;
                this.entry();
                }
                }
                this.state = 273;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 274;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 275;
            this.match(TRSXParser.METADATA);
            this.state = 276;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public entry(): EntryContext {
        let localContext = new EntryContext(this.context, this.state);
        this.enterRule(localContext, 40, TRSXParser.RULE_entry);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 278;
            this.match(TRSXParser.OPEN);
            this.state = 279;
            this.match(TRSXParser.ENTRY);
            this.state = 283;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 11, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 280;
                    this.match(TRSXParser.S);
                    }
                    }
                }
                this.state = 285;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 11, this.context);
            }
            this.state = 289;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 46) {
                {
                {
                this.state = 286;
                this.entryAttrs();
                }
                }
                this.state = 291;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 295;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 292;
                this.match(TRSXParser.S);
                }
                }
                this.state = 297;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 298;
            this.match(TRSXParser.CLOSE);
            this.state = 302;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 7 || _la === 8) {
                {
                {
                this.state = 299;
                this.entryContent();
                }
                }
                this.state = 304;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 305;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 306;
            this.match(TRSXParser.ENTRY);
            this.state = 307;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public entryContent(): EntryContentContext {
        let localContext = new EntryContentContext(this.context, this.state);
        this.enterRule(localContext, 42, TRSXParser.RULE_entryContent);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 309;
            _la = this.tokenStream.LA(1);
            if(!(_la === 7 || _la === 8)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public entryAttrs(): EntryAttrsContext {
        let localContext = new EntryAttrsContext(this.context, this.state);
        this.enterRule(localContext, 44, TRSXParser.RULE_entryAttrs);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 311;
            this.keyAttr();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public keyAttr(): KeyAttrContext {
        let localContext = new KeyAttrContext(this.context, this.state);
        this.enterRule(localContext, 46, TRSXParser.RULE_keyAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 313;
            this.match(TRSXParser.KEY);
            this.state = 314;
            this.match(TRSXParser.EQUALS);
            this.state = 315;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sources(): SourcesContext {
        let localContext = new SourcesContext(this.context, this.state);
        this.enterRule(localContext, 48, TRSXParser.RULE_sources);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 317;
            this.match(TRSXParser.OPEN);
            this.state = 318;
            this.match(TRSXParser.SOURCES);
            this.state = 322;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 319;
                this.match(TRSXParser.S);
                }
                }
                this.state = 324;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 325;
            this.match(TRSXParser.CLOSE);
            this.state = 329;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 326;
                this.source();
                }
                }
                this.state = 331;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 332;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 333;
            this.match(TRSXParser.SOURCES);
            this.state = 334;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public source(): SourceContext {
        let localContext = new SourceContext(this.context, this.state);
        this.enterRule(localContext, 50, TRSXParser.RULE_source);
        let _la: number;
        try {
            let alternative: number;
            this.state = 384;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 24, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 336;
                this.match(TRSXParser.OPEN);
                this.state = 337;
                this.match(TRSXParser.SOURCE);
                this.state = 341;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 17, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 338;
                        this.match(TRSXParser.S);
                        }
                        }
                    }
                    this.state = 343;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 17, this.context);
                }
                this.state = 347;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 1966089) !== 0)) {
                    {
                    {
                    this.state = 344;
                    this.sourceAttrs();
                    }
                    }
                    this.state = 349;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 353;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 15) {
                    {
                    {
                    this.state = 350;
                    this.match(TRSXParser.S);
                    }
                    }
                    this.state = 355;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 356;
                this.match(TRSXParser.CLOSE_SLASH);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 357;
                this.match(TRSXParser.OPEN);
                this.state = 358;
                this.match(TRSXParser.SOURCE);
                this.state = 362;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 20, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 359;
                        this.match(TRSXParser.S);
                        }
                        }
                    }
                    this.state = 364;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 20, this.context);
                }
                this.state = 368;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 1966089) !== 0)) {
                    {
                    {
                    this.state = 365;
                    this.sourceAttrs();
                    }
                    }
                    this.state = 370;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 374;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 15) {
                    {
                    {
                    this.state = 371;
                    this.match(TRSXParser.S);
                    }
                    }
                    this.state = 376;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 377;
                this.match(TRSXParser.CLOSE);
                this.state = 379;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 5) {
                    {
                    this.state = 378;
                    this.links();
                    }
                }

                this.state = 381;
                this.match(TRSXParser.OPEN_SLASH);
                this.state = 382;
                this.match(TRSXParser.SOURCE);
                this.state = 383;
                this.match(TRSXParser.CLOSE);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sourceAttrs(): SourceAttrsContext {
        let localContext = new SourceAttrsContext(this.context, this.state);
        this.enterRule(localContext, 52, TRSXParser.RULE_sourceAttrs);
        try {
            this.state = 392;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.NAME_ATTR:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 386;
                this.nameAttr();
                }
                break;
            case TRSXParser.SOURCE_DISPLAY_NAME:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 387;
                this.sourceDisplayNameAttr();
                }
                break;
            case TRSXParser.SOURCE_URI:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 388;
                this.sourceUriAttr();
                }
                break;
            case TRSXParser.VERSION:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 389;
                this.sourceVersionAttr();
                }
                break;
            case TRSXParser.TYPE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 390;
                this.typeAttr();
                }
                break;
            case TRSXParser.SOURCE_USE_FOR_OOV:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 391;
                this.sourceUseForOOVAttr();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sourceDisplayNameAttr(): SourceDisplayNameAttrContext {
        let localContext = new SourceDisplayNameAttrContext(this.context, this.state);
        this.enterRule(localContext, 54, TRSXParser.RULE_sourceDisplayNameAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 394;
            this.match(TRSXParser.SOURCE_DISPLAY_NAME);
            this.state = 395;
            this.match(TRSXParser.EQUALS);
            this.state = 396;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sourceUriAttr(): SourceUriAttrContext {
        let localContext = new SourceUriAttrContext(this.context, this.state);
        this.enterRule(localContext, 56, TRSXParser.RULE_sourceUriAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 398;
            this.match(TRSXParser.SOURCE_URI);
            this.state = 399;
            this.match(TRSXParser.EQUALS);
            this.state = 400;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sourceVersionAttr(): SourceVersionAttrContext {
        let localContext = new SourceVersionAttrContext(this.context, this.state);
        this.enterRule(localContext, 58, TRSXParser.RULE_sourceVersionAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 402;
            this.match(TRSXParser.VERSION);
            this.state = 403;
            this.match(TRSXParser.EQUALS);
            this.state = 404;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sourceUseForOOVAttr(): SourceUseForOOVAttrContext {
        let localContext = new SourceUseForOOVAttrContext(this.context, this.state);
        this.enterRule(localContext, 60, TRSXParser.RULE_sourceUseForOOVAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 406;
            this.match(TRSXParser.SOURCE_USE_FOR_OOV);
            this.state = 407;
            this.match(TRSXParser.EQUALS);
            this.state = 408;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ontology(): OntologyContext {
        let localContext = new OntologyContext(this.context, this.state);
        this.enterRule(localContext, 62, TRSXParser.RULE_ontology);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 410;
            this.match(TRSXParser.OPEN);
            this.state = 411;
            this.match(TRSXParser.ONTOLOGY);
            this.state = 415;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 26, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 412;
                    this.match(TRSXParser.S);
                    }
                    }
                }
                this.state = 417;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 26, this.context);
            }
            this.state = 421;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 47) {
                {
                {
                this.state = 418;
                this.ontologyAttrs();
                }
                }
                this.state = 423;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 427;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 424;
                this.match(TRSXParser.S);
                }
                }
                this.state = 429;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 430;
            this.match(TRSXParser.CLOSE);
            this.state = 432;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 29, this.context) ) {
            case 1:
                {
                this.state = 431;
                this.intents();
                }
                break;
            }
            this.state = 435;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 5) {
                {
                this.state = 434;
                this.concepts();
                }
            }

            this.state = 437;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 438;
            this.match(TRSXParser.ONTOLOGY);
            this.state = 439;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ontologyAttrs(): OntologyAttrsContext {
        let localContext = new OntologyAttrsContext(this.context, this.state);
        this.enterRule(localContext, 64, TRSXParser.RULE_ontologyAttrs);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 441;
            this.baseAttr();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public baseAttr(): BaseAttrContext {
        let localContext = new BaseAttrContext(this.context, this.state);
        this.enterRule(localContext, 66, TRSXParser.RULE_baseAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 443;
            this.match(TRSXParser.BASE);
            this.state = 444;
            this.match(TRSXParser.EQUALS);
            this.state = 445;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public intents(): IntentsContext {
        let localContext = new IntentsContext(this.context, this.state);
        this.enterRule(localContext, 68, TRSXParser.RULE_intents);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 447;
            this.match(TRSXParser.OPEN);
            this.state = 448;
            this.match(TRSXParser.INTENTS);
            this.state = 452;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 449;
                this.match(TRSXParser.S);
                }
                }
                this.state = 454;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 455;
            this.match(TRSXParser.CLOSE);
            this.state = 459;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 456;
                this.intent();
                }
                }
                this.state = 461;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 462;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 463;
            this.match(TRSXParser.INTENTS);
            this.state = 464;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public intent(): IntentContext {
        let localContext = new IntentContext(this.context, this.state);
        this.enterRule(localContext, 70, TRSXParser.RULE_intent);
        let _la: number;
        try {
            this.state = 514;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 40, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 466;
                this.match(TRSXParser.OPEN);
                this.state = 467;
                this.match(TRSXParser.INTENT);
                this.state = 471;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 15) {
                    {
                    {
                    this.state = 468;
                    this.match(TRSXParser.S);
                    }
                    }
                    this.state = 473;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 475;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 474;
                    this.intentAttrs();
                    }
                    }
                    this.state = 477;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (_la === 44 || _la === 48);
                this.state = 482;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 15) {
                    {
                    {
                    this.state = 479;
                    this.match(TRSXParser.S);
                    }
                    }
                    this.state = 484;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 485;
                this.match(TRSXParser.CLOSE_SLASH);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 487;
                this.match(TRSXParser.OPEN);
                this.state = 488;
                this.match(TRSXParser.INTENT);
                this.state = 492;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 15) {
                    {
                    {
                    this.state = 489;
                    this.match(TRSXParser.S);
                    }
                    }
                    this.state = 494;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 496;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 495;
                    this.intentAttrs();
                    }
                    }
                    this.state = 498;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (_la === 44 || _la === 48);
                this.state = 503;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 15) {
                    {
                    {
                    this.state = 500;
                    this.match(TRSXParser.S);
                    }
                    }
                    this.state = 505;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 506;
                this.match(TRSXParser.CLOSE);
                this.state = 508;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 5) {
                    {
                    this.state = 507;
                    this.links();
                    }
                }

                this.state = 510;
                this.match(TRSXParser.OPEN_SLASH);
                this.state = 511;
                this.match(TRSXParser.INTENT);
                this.state = 512;
                this.match(TRSXParser.CLOSE);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public intentAttrs(): IntentAttrsContext {
        let localContext = new IntentAttrsContext(this.context, this.state);
        this.enterRule(localContext, 72, TRSXParser.RULE_intentAttrs);
        try {
            this.state = 518;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.NAME_ATTR:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 516;
                this.nameAttr();
                }
                break;
            case TRSXParser.SOURCEREF:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 517;
                this.sourcerefAttr();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public links(): LinksContext {
        let localContext = new LinksContext(this.context, this.state);
        this.enterRule(localContext, 74, TRSXParser.RULE_links);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 520;
            this.match(TRSXParser.OPEN);
            this.state = 521;
            this.match(TRSXParser.LINKS);
            this.state = 525;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 522;
                this.match(TRSXParser.S);
                }
                }
                this.state = 527;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 528;
            this.match(TRSXParser.CLOSE);
            this.state = 532;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 529;
                this.link();
                }
                }
                this.state = 534;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 535;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 536;
            this.match(TRSXParser.LINKS);
            this.state = 537;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public link(): LinkContext {
        let localContext = new LinkContext(this.context, this.state);
        this.enterRule(localContext, 76, TRSXParser.RULE_link);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 539;
            this.match(TRSXParser.OPEN);
            this.state = 540;
            this.match(TRSXParser.LINK);
            this.state = 544;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 44, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 541;
                    this.match(TRSXParser.S);
                    }
                    }
                }
                this.state = 546;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 44, this.context);
            }
            this.state = 550;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 44 || _la === 50) {
                {
                {
                this.state = 547;
                this.linkAttrs();
                }
                }
                this.state = 552;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 556;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 553;
                this.match(TRSXParser.S);
                }
                }
                this.state = 558;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 559;
            this.match(TRSXParser.CLOSE_SLASH);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public linkAttrs(): LinkAttrsContext {
        let localContext = new LinkAttrsContext(this.context, this.state);
        this.enterRule(localContext, 78, TRSXParser.RULE_linkAttrs);
        try {
            this.state = 563;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.CONCEPTREF:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 561;
                this.conceptrefAttr();
                }
                break;
            case TRSXParser.SOURCEREF:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 562;
                this.sourcerefAttr();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public concepts(): ConceptsContext {
        let localContext = new ConceptsContext(this.context, this.state);
        this.enterRule(localContext, 80, TRSXParser.RULE_concepts);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 565;
            this.match(TRSXParser.OPEN);
            this.state = 566;
            this.match(TRSXParser.CONCEPTS);
            this.state = 570;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 567;
                this.match(TRSXParser.S);
                }
                }
                this.state = 572;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 573;
            this.match(TRSXParser.CLOSE);
            this.state = 577;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 574;
                this.concept();
                }
                }
                this.state = 579;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 580;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 581;
            this.match(TRSXParser.CONCEPTS);
            this.state = 582;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public concept(): ConceptContext {
        let localContext = new ConceptContext(this.context, this.state);
        this.enterRule(localContext, 82, TRSXParser.RULE_concept);
        let _la: number;
        try {
            let alternative: number;
            this.state = 635;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 57, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 584;
                this.match(TRSXParser.OPEN);
                this.state = 585;
                this.match(TRSXParser.CONCEPT);
                this.state = 589;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 50, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 586;
                        this.match(TRSXParser.S);
                        }
                        }
                    }
                    this.state = 591;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 50, this.context);
                }
                this.state = 595;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (((((_la - 44)) & ~0x1F) === 0 && ((1 << (_la - 44)) & 229425) !== 0)) {
                    {
                    {
                    this.state = 592;
                    this.conceptAttrs();
                    }
                    }
                    this.state = 597;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 601;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 15) {
                    {
                    {
                    this.state = 598;
                    this.match(TRSXParser.S);
                    }
                    }
                    this.state = 603;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 604;
                this.match(TRSXParser.CLOSE_SLASH);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 605;
                this.match(TRSXParser.OPEN);
                this.state = 606;
                this.match(TRSXParser.CONCEPT);
                this.state = 610;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 53, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 607;
                        this.match(TRSXParser.S);
                        }
                        }
                    }
                    this.state = 612;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 53, this.context);
                }
                this.state = 616;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (((((_la - 44)) & ~0x1F) === 0 && ((1 << (_la - 44)) & 229425) !== 0)) {
                    {
                    {
                    this.state = 613;
                    this.conceptAttrs();
                    }
                    }
                    this.state = 618;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 622;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 15) {
                    {
                    {
                    this.state = 619;
                    this.match(TRSXParser.S);
                    }
                    }
                    this.state = 624;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 625;
                this.match(TRSXParser.CLOSE);
                this.state = 629;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 5) {
                    {
                    {
                    this.state = 626;
                    this.conceptElements();
                    }
                    }
                    this.state = 631;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 632;
                this.match(TRSXParser.OPEN_SLASH);
                this.state = 633;
                this.match(TRSXParser.CONCEPT);
                this.state = 634;
                this.match(TRSXParser.CLOSE);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public conceptElements(): ConceptElementsContext {
        let localContext = new ConceptElementsContext(this.context, this.state);
        this.enterRule(localContext, 84, TRSXParser.RULE_conceptElements);
        try {
            this.state = 639;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 58, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 637;
                this.settings();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 638;
                this.relations();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public conceptAttrs(): ConceptAttrsContext {
        let localContext = new ConceptAttrsContext(this.context, this.state);
        this.enterRule(localContext, 86, TRSXParser.RULE_conceptAttrs);
        try {
            this.state = 647;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.NAME_ATTR:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 641;
                this.nameAttr();
                }
                break;
            case TRSXParser.DATATYPE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 642;
                this.dataTypeAttr();
                }
                break;
            case TRSXParser.FREETEXT:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 643;
                this.freetextAttr();
                }
                break;
            case TRSXParser.DYNAMIC:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 644;
                this.dynamicAttr();
                }
                break;
            case TRSXParser.RULE_GRAMMAR_FILE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 645;
                this.ruleGrammarFileNameAttr();
                }
                break;
            case TRSXParser.SOURCEREF:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 646;
                this.sourcerefAttr();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dataTypeAttr(): DataTypeAttrContext {
        let localContext = new DataTypeAttrContext(this.context, this.state);
        this.enterRule(localContext, 88, TRSXParser.RULE_dataTypeAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 649;
            this.match(TRSXParser.DATATYPE);
            this.state = 650;
            this.match(TRSXParser.EQUALS);
            this.state = 651;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public freetextAttr(): FreetextAttrContext {
        let localContext = new FreetextAttrContext(this.context, this.state);
        this.enterRule(localContext, 90, TRSXParser.RULE_freetextAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 653;
            this.match(TRSXParser.FREETEXT);
            this.state = 654;
            this.match(TRSXParser.EQUALS);
            this.state = 655;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dynamicAttr(): DynamicAttrContext {
        let localContext = new DynamicAttrContext(this.context, this.state);
        this.enterRule(localContext, 92, TRSXParser.RULE_dynamicAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 657;
            this.match(TRSXParser.DYNAMIC);
            this.state = 658;
            this.match(TRSXParser.EQUALS);
            this.state = 659;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ruleGrammarFileNameAttr(): RuleGrammarFileNameAttrContext {
        let localContext = new RuleGrammarFileNameAttrContext(this.context, this.state);
        this.enterRule(localContext, 94, TRSXParser.RULE_ruleGrammarFileNameAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 661;
            this.match(TRSXParser.RULE_GRAMMAR_FILE);
            this.state = 662;
            this.match(TRSXParser.EQUALS);
            this.state = 663;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public settings(): SettingsContext {
        let localContext = new SettingsContext(this.context, this.state);
        this.enterRule(localContext, 96, TRSXParser.RULE_settings);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 665;
            this.match(TRSXParser.OPEN);
            this.state = 666;
            this.match(TRSXParser.SETTINGS);
            this.state = 670;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 667;
                this.match(TRSXParser.S);
                }
                }
                this.state = 672;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 673;
            this.match(TRSXParser.CLOSE);
            this.state = 677;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 674;
                this.setting();
                }
                }
                this.state = 679;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 680;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 681;
            this.match(TRSXParser.SETTINGS);
            this.state = 682;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public setting(): SettingContext {
        let localContext = new SettingContext(this.context, this.state);
        this.enterRule(localContext, 98, TRSXParser.RULE_setting);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 684;
            this.match(TRSXParser.OPEN);
            this.state = 685;
            this.match(TRSXParser.SETTING);
            this.state = 689;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 62, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 686;
                    this.match(TRSXParser.S);
                    }
                    }
                }
                this.state = 691;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 62, this.context);
            }
            this.state = 695;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 48 || _la === 54) {
                {
                {
                this.state = 692;
                this.settingAttrs();
                }
                }
                this.state = 697;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 701;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 698;
                this.match(TRSXParser.S);
                }
                }
                this.state = 703;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 704;
            this.match(TRSXParser.CLOSE_SLASH);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public settingAttrs(): SettingAttrsContext {
        let localContext = new SettingAttrsContext(this.context, this.state);
        this.enterRule(localContext, 100, TRSXParser.RULE_settingAttrs);
        try {
            this.state = 708;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.NAME_ATTR:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 706;
                this.nameAttr();
                }
                break;
            case TRSXParser.VALUE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 707;
                this.valueAttr();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public relations(): RelationsContext {
        let localContext = new RelationsContext(this.context, this.state);
        this.enterRule(localContext, 102, TRSXParser.RULE_relations);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 710;
            this.match(TRSXParser.OPEN);
            this.state = 711;
            this.match(TRSXParser.RELATIONS);
            this.state = 715;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 712;
                this.match(TRSXParser.S);
                }
                }
                this.state = 717;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 718;
            this.match(TRSXParser.CLOSE);
            this.state = 722;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 719;
                this.relation();
                }
                }
                this.state = 724;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 725;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 726;
            this.match(TRSXParser.RELATIONS);
            this.state = 727;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public relation(): RelationContext {
        let localContext = new RelationContext(this.context, this.state);
        this.enterRule(localContext, 104, TRSXParser.RULE_relation);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 729;
            this.match(TRSXParser.OPEN);
            this.state = 730;
            this.match(TRSXParser.RELATION);
            this.state = 734;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 68, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 731;
                    this.match(TRSXParser.S);
                    }
                    }
                }
                this.state = 736;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 68, this.context);
            }
            this.state = 740;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (((((_la - 44)) & ~0x1F) === 0 && ((1 << (_la - 44)) & 262209) !== 0)) {
                {
                {
                this.state = 737;
                this.relationAttrs();
                }
                }
                this.state = 742;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 746;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 743;
                this.match(TRSXParser.S);
                }
                }
                this.state = 748;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 749;
            this.match(TRSXParser.CLOSE_SLASH);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public relationAttrs(): RelationAttrsContext {
        let localContext = new RelationAttrsContext(this.context, this.state);
        this.enterRule(localContext, 106, TRSXParser.RULE_relationAttrs);
        try {
            this.state = 754;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.TYPE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 751;
                this.typeAttr();
                }
                break;
            case TRSXParser.CONCEPTREF:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 752;
                this.conceptrefAttr();
                }
                break;
            case TRSXParser.SOURCEREF:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 753;
                this.sourcerefAttr();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public typeAttr(): TypeAttrContext {
        let localContext = new TypeAttrContext(this.context, this.state);
        this.enterRule(localContext, 108, TRSXParser.RULE_typeAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 756;
            this.match(TRSXParser.TYPE);
            this.state = 757;
            this.match(TRSXParser.EQUALS);
            this.state = 758;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dictionaries(): DictionariesContext {
        let localContext = new DictionariesContext(this.context, this.state);
        this.enterRule(localContext, 110, TRSXParser.RULE_dictionaries);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 760;
            this.match(TRSXParser.OPEN);
            this.state = 761;
            this.match(TRSXParser.DICTIONARIES);
            this.state = 765;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 762;
                this.match(TRSXParser.S);
                }
                }
                this.state = 767;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 768;
            this.match(TRSXParser.CLOSE);
            this.state = 772;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 769;
                this.dictionary();
                }
                }
                this.state = 774;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 775;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 776;
            this.match(TRSXParser.DICTIONARIES);
            this.state = 777;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dictionary(): DictionaryContext {
        let localContext = new DictionaryContext(this.context, this.state);
        this.enterRule(localContext, 112, TRSXParser.RULE_dictionary);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 779;
            this.match(TRSXParser.OPEN);
            this.state = 780;
            this.match(TRSXParser.DICTIONARY);
            this.state = 784;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 74, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 781;
                    this.match(TRSXParser.S);
                    }
                    }
                }
                this.state = 786;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 74, this.context);
            }
            this.state = 788;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 50) {
                {
                this.state = 787;
                this.dictionaryAttrs();
                }
            }

            this.state = 793;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 790;
                this.match(TRSXParser.S);
                }
                }
                this.state = 795;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 796;
            this.match(TRSXParser.CLOSE);
            this.state = 800;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 797;
                this.dictionaryEntry();
                }
                }
                this.state = 802;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 803;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 804;
            this.match(TRSXParser.DICTIONARY);
            this.state = 805;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dictionaryAttrs(): DictionaryAttrsContext {
        let localContext = new DictionaryAttrsContext(this.context, this.state);
        this.enterRule(localContext, 114, TRSXParser.RULE_dictionaryAttrs);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 807;
            this.conceptrefAttr();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dictionaryEntry(): DictionaryEntryContext {
        let localContext = new DictionaryEntryContext(this.context, this.state);
        this.enterRule(localContext, 116, TRSXParser.RULE_dictionaryEntry);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 809;
            this.match(TRSXParser.OPEN);
            this.state = 810;
            this.match(TRSXParser.ENTRY);
            this.state = 814;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 78, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 811;
                    this.match(TRSXParser.S);
                    }
                    }
                }
                this.state = 816;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 78, this.context);
            }
            this.state = 820;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (((((_la - 44)) & ~0x1F) === 0 && ((1 << (_la - 44)) & 3585) !== 0)) {
                {
                {
                this.state = 817;
                this.dictionaryEntryAttrs();
                }
                }
                this.state = 822;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 826;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 823;
                this.match(TRSXParser.S);
                }
                }
                this.state = 828;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 829;
            this.match(TRSXParser.CLOSE_SLASH);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dictionaryEntryAttrs(): DictionaryEntryAttrsContext {
        let localContext = new DictionaryEntryAttrsContext(this.context, this.state);
        this.enterRule(localContext, 118, TRSXParser.RULE_dictionaryEntryAttrs);
        try {
            this.state = 835;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.LITERAL:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 831;
                this.literalAttr();
                }
                break;
            case TRSXParser.VALUE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 832;
                this.valueAttr();
                }
                break;
            case TRSXParser.PROTECTED:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 833;
                this.protectedAttr();
                }
                break;
            case TRSXParser.SOURCEREF:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 834;
                this.sourcerefAttr();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public literalAttr(): LiteralAttrContext {
        let localContext = new LiteralAttrContext(this.context, this.state);
        this.enterRule(localContext, 120, TRSXParser.RULE_literalAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 837;
            this.match(TRSXParser.LITERAL);
            this.state = 838;
            this.match(TRSXParser.EQUALS);
            this.state = 839;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public valueAttr(): ValueAttrContext {
        let localContext = new ValueAttrContext(this.context, this.state);
        this.enterRule(localContext, 122, TRSXParser.RULE_valueAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 841;
            this.match(TRSXParser.VALUE);
            this.state = 842;
            this.match(TRSXParser.EQUALS);
            this.state = 843;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public protectedAttr(): ProtectedAttrContext {
        let localContext = new ProtectedAttrContext(this.context, this.state);
        this.enterRule(localContext, 124, TRSXParser.RULE_protectedAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 845;
            this.match(TRSXParser.PROTECTED);
            this.state = 846;
            this.match(TRSXParser.EQUALS);
            this.state = 847;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public samples(): SamplesContext {
        let localContext = new SamplesContext(this.context, this.state);
        this.enterRule(localContext, 126, TRSXParser.RULE_samples);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 849;
            this.match(TRSXParser.OPEN);
            this.state = 850;
            this.match(TRSXParser.SAMPLES);
            this.state = 854;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 851;
                this.match(TRSXParser.S);
                }
                }
                this.state = 856;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 857;
            this.match(TRSXParser.CLOSE);
            this.state = 861;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 858;
                this.sample();
                }
                }
                this.state = 863;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 864;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 865;
            this.match(TRSXParser.SAMPLES);
            this.state = 866;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sample(): SampleContext {
        let localContext = new SampleContext(this.context, this.state);
        this.enterRule(localContext, 128, TRSXParser.RULE_sample);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 868;
            this.match(TRSXParser.OPEN);
            this.state = 869;
            this.match(TRSXParser.SAMPLE);
            this.state = 873;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 84, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 870;
                    this.match(TRSXParser.S);
                    }
                    }
                }
                this.state = 875;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 84, this.context);
            }
            this.state = 879;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (((((_la - 44)) & ~0x1F) === 0 && ((1 << (_la - 44)) & 31105) !== 0)) {
                {
                {
                this.state = 876;
                this.sampleAttrs();
                }
                }
                this.state = 881;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 885;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 882;
                this.match(TRSXParser.S);
                }
                }
                this.state = 887;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 888;
            this.match(TRSXParser.CLOSE);
            this.state = 894;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 416) !== 0)) {
                {
                this.state = 892;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case TRSXParser.TEXT:
                    {
                    this.state = 889;
                    this.match(TRSXParser.TEXT);
                    }
                    break;
                case TRSXParser.WS:
                    {
                    this.state = 890;
                    this.match(TRSXParser.WS);
                    }
                    break;
                case TRSXParser.OPEN:
                    {
                    this.state = 891;
                    this.annotation();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                this.state = 896;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 897;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 898;
            this.match(TRSXParser.SAMPLE);
            this.state = 899;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sampleAttrs(): SampleAttrsContext {
        let localContext = new SampleAttrsContext(this.context, this.state);
        this.enterRule(localContext, 130, TRSXParser.RULE_sampleAttrs);
        try {
            this.state = 908;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.DESCRIPTION:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 901;
                this.descriptionAttr();
                }
                break;
            case TRSXParser.COUNT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 902;
                this.countAttr();
                }
                break;
            case TRSXParser.INTENTREF:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 903;
                this.intentrefAttr();
                }
                break;
            case TRSXParser.EXCLUDED:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 904;
                this.excludedAttr();
                }
                break;
            case TRSXParser.FULLY_VERIFIED:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 905;
                this.fullyVerifiedAttr();
                }
                break;
            case TRSXParser.PROTECTED:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 906;
                this.protectedAttr();
                }
                break;
            case TRSXParser.SOURCEREF:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 907;
                this.sourcerefAttr();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public descriptionAttr(): DescriptionAttrContext {
        let localContext = new DescriptionAttrContext(this.context, this.state);
        this.enterRule(localContext, 132, TRSXParser.RULE_descriptionAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 910;
            this.match(TRSXParser.DESCRIPTION);
            this.state = 911;
            this.match(TRSXParser.EQUALS);
            this.state = 912;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public countAttr(): CountAttrContext {
        let localContext = new CountAttrContext(this.context, this.state);
        this.enterRule(localContext, 134, TRSXParser.RULE_countAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 914;
            this.match(TRSXParser.COUNT);
            this.state = 915;
            this.match(TRSXParser.EQUALS);
            this.state = 916;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public intentrefAttr(): IntentrefAttrContext {
        let localContext = new IntentrefAttrContext(this.context, this.state);
        this.enterRule(localContext, 136, TRSXParser.RULE_intentrefAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 918;
            this.match(TRSXParser.INTENTREF);
            this.state = 919;
            this.match(TRSXParser.EQUALS);
            this.state = 920;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public excludedAttr(): ExcludedAttrContext {
        let localContext = new ExcludedAttrContext(this.context, this.state);
        this.enterRule(localContext, 138, TRSXParser.RULE_excludedAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 922;
            this.match(TRSXParser.EXCLUDED);
            this.state = 923;
            this.match(TRSXParser.EQUALS);
            this.state = 924;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fullyVerifiedAttr(): FullyVerifiedAttrContext {
        let localContext = new FullyVerifiedAttrContext(this.context, this.state);
        this.enterRule(localContext, 140, TRSXParser.RULE_fullyVerifiedAttr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 926;
            this.match(TRSXParser.FULLY_VERIFIED);
            this.state = 927;
            this.match(TRSXParser.EQUALS);
            this.state = 928;
            this.match(TRSXParser.STRING);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public annotation(): AnnotationContext {
        let localContext = new AnnotationContext(this.context, this.state);
        this.enterRule(localContext, 142, TRSXParser.RULE_annotation);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 930;
            this.match(TRSXParser.OPEN);
            this.state = 931;
            this.match(TRSXParser.ANNOTATION);
            this.state = 935;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 90, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 932;
                    this.match(TRSXParser.S);
                    }
                    }
                }
                this.state = 937;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 90, this.context);
            }
            this.state = 941;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 50) {
                {
                {
                this.state = 938;
                this.annotationAttrs();
                }
                }
                this.state = 943;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 947;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 944;
                this.match(TRSXParser.S);
                }
                }
                this.state = 949;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 950;
            this.match(TRSXParser.CLOSE);
            this.state = 954;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 416) !== 0)) {
                {
                {
                this.state = 951;
                this.annotationContent();
                }
                }
                this.state = 956;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 957;
            this.match(TRSXParser.OPEN_SLASH);
            this.state = 958;
            this.match(TRSXParser.ANNOTATION);
            this.state = 959;
            this.match(TRSXParser.CLOSE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public annotationContent(): AnnotationContentContext {
        let localContext = new AnnotationContentContext(this.context, this.state);
        this.enterRule(localContext, 144, TRSXParser.RULE_annotationContent);
        try {
            this.state = 964;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case TRSXParser.TEXT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 961;
                this.match(TRSXParser.TEXT);
                }
                break;
            case TRSXParser.WS:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 962;
                this.match(TRSXParser.WS);
                }
                break;
            case TRSXParser.OPEN:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 963;
                this.annotation();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public annotationAttrs(): AnnotationAttrsContext {
        let localContext = new AnnotationAttrsContext(this.context, this.state);
        this.enterRule(localContext, 146, TRSXParser.RULE_annotationAttrs);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 966;
            this.conceptrefAttr();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public static readonly _serializedATN: number[] = [
        4,1,69,969,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,
        7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,39,
        2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,46,
        7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,52,7,52,
        2,53,7,53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,58,2,59,
        7,59,2,60,7,60,2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,2,65,7,65,
        2,66,7,66,2,67,7,67,2,68,7,68,2,69,7,69,2,70,7,70,2,71,7,71,2,72,
        7,72,2,73,7,73,1,0,1,0,1,1,3,1,152,8,1,1,1,1,1,1,1,1,2,1,2,1,2,1,
        2,1,3,4,3,162,8,3,11,3,12,3,163,1,4,1,4,1,4,3,4,169,8,4,1,5,1,5,
        1,5,1,5,1,6,1,6,1,6,1,6,1,7,1,7,1,7,1,7,1,8,1,8,1,8,1,8,1,9,1,9,
        1,9,1,9,1,10,1,10,1,10,1,10,1,11,1,11,1,11,5,11,198,8,11,10,11,12,
        11,201,9,11,1,11,5,11,204,8,11,10,11,12,11,207,9,11,1,11,5,11,210,
        8,11,10,11,12,11,213,9,11,1,11,1,11,5,11,217,8,11,10,11,12,11,220,
        9,11,1,11,1,11,1,11,1,11,1,12,1,12,1,12,1,12,1,12,3,12,231,8,12,
        1,13,1,13,1,13,1,13,1,13,3,13,238,8,13,1,14,1,14,1,14,1,14,1,15,
        1,15,1,15,1,15,1,16,1,16,1,16,1,16,1,17,1,17,1,17,1,17,1,18,1,18,
        1,18,1,18,1,19,1,19,1,19,5,19,263,8,19,10,19,12,19,266,9,19,1,19,
        1,19,5,19,270,8,19,10,19,12,19,273,9,19,1,19,1,19,1,19,1,19,1,20,
        1,20,1,20,5,20,282,8,20,10,20,12,20,285,9,20,1,20,5,20,288,8,20,
        10,20,12,20,291,9,20,1,20,5,20,294,8,20,10,20,12,20,297,9,20,1,20,
        1,20,5,20,301,8,20,10,20,12,20,304,9,20,1,20,1,20,1,20,1,20,1,21,
        1,21,1,22,1,22,1,23,1,23,1,23,1,23,1,24,1,24,1,24,5,24,321,8,24,
        10,24,12,24,324,9,24,1,24,1,24,5,24,328,8,24,10,24,12,24,331,9,24,
        1,24,1,24,1,24,1,24,1,25,1,25,1,25,5,25,340,8,25,10,25,12,25,343,
        9,25,1,25,5,25,346,8,25,10,25,12,25,349,9,25,1,25,5,25,352,8,25,
        10,25,12,25,355,9,25,1,25,1,25,1,25,1,25,5,25,361,8,25,10,25,12,
        25,364,9,25,1,25,5,25,367,8,25,10,25,12,25,370,9,25,1,25,5,25,373,
        8,25,10,25,12,25,376,9,25,1,25,1,25,3,25,380,8,25,1,25,1,25,1,25,
        3,25,385,8,25,1,26,1,26,1,26,1,26,1,26,1,26,3,26,393,8,26,1,27,1,
        27,1,27,1,27,1,28,1,28,1,28,1,28,1,29,1,29,1,29,1,29,1,30,1,30,1,
        30,1,30,1,31,1,31,1,31,5,31,414,8,31,10,31,12,31,417,9,31,1,31,5,
        31,420,8,31,10,31,12,31,423,9,31,1,31,5,31,426,8,31,10,31,12,31,
        429,9,31,1,31,1,31,3,31,433,8,31,1,31,3,31,436,8,31,1,31,1,31,1,
        31,1,31,1,32,1,32,1,33,1,33,1,33,1,33,1,34,1,34,1,34,5,34,451,8,
        34,10,34,12,34,454,9,34,1,34,1,34,5,34,458,8,34,10,34,12,34,461,
        9,34,1,34,1,34,1,34,1,34,1,35,1,35,1,35,5,35,470,8,35,10,35,12,35,
        473,9,35,1,35,4,35,476,8,35,11,35,12,35,477,1,35,5,35,481,8,35,10,
        35,12,35,484,9,35,1,35,1,35,1,35,1,35,1,35,5,35,491,8,35,10,35,12,
        35,494,9,35,1,35,4,35,497,8,35,11,35,12,35,498,1,35,5,35,502,8,35,
        10,35,12,35,505,9,35,1,35,1,35,3,35,509,8,35,1,35,1,35,1,35,1,35,
        3,35,515,8,35,1,36,1,36,3,36,519,8,36,1,37,1,37,1,37,5,37,524,8,
        37,10,37,12,37,527,9,37,1,37,1,37,5,37,531,8,37,10,37,12,37,534,
        9,37,1,37,1,37,1,37,1,37,1,38,1,38,1,38,5,38,543,8,38,10,38,12,38,
        546,9,38,1,38,5,38,549,8,38,10,38,12,38,552,9,38,1,38,5,38,555,8,
        38,10,38,12,38,558,9,38,1,38,1,38,1,39,1,39,3,39,564,8,39,1,40,1,
        40,1,40,5,40,569,8,40,10,40,12,40,572,9,40,1,40,1,40,5,40,576,8,
        40,10,40,12,40,579,9,40,1,40,1,40,1,40,1,40,1,41,1,41,1,41,5,41,
        588,8,41,10,41,12,41,591,9,41,1,41,5,41,594,8,41,10,41,12,41,597,
        9,41,1,41,5,41,600,8,41,10,41,12,41,603,9,41,1,41,1,41,1,41,1,41,
        5,41,609,8,41,10,41,12,41,612,9,41,1,41,5,41,615,8,41,10,41,12,41,
        618,9,41,1,41,5,41,621,8,41,10,41,12,41,624,9,41,1,41,1,41,5,41,
        628,8,41,10,41,12,41,631,9,41,1,41,1,41,1,41,3,41,636,8,41,1,42,
        1,42,3,42,640,8,42,1,43,1,43,1,43,1,43,1,43,1,43,3,43,648,8,43,1,
        44,1,44,1,44,1,44,1,45,1,45,1,45,1,45,1,46,1,46,1,46,1,46,1,47,1,
        47,1,47,1,47,1,48,1,48,1,48,5,48,669,8,48,10,48,12,48,672,9,48,1,
        48,1,48,5,48,676,8,48,10,48,12,48,679,9,48,1,48,1,48,1,48,1,48,1,
        49,1,49,1,49,5,49,688,8,49,10,49,12,49,691,9,49,1,49,5,49,694,8,
        49,10,49,12,49,697,9,49,1,49,5,49,700,8,49,10,49,12,49,703,9,49,
        1,49,1,49,1,50,1,50,3,50,709,8,50,1,51,1,51,1,51,5,51,714,8,51,10,
        51,12,51,717,9,51,1,51,1,51,5,51,721,8,51,10,51,12,51,724,9,51,1,
        51,1,51,1,51,1,51,1,52,1,52,1,52,5,52,733,8,52,10,52,12,52,736,9,
        52,1,52,5,52,739,8,52,10,52,12,52,742,9,52,1,52,5,52,745,8,52,10,
        52,12,52,748,9,52,1,52,1,52,1,53,1,53,1,53,3,53,755,8,53,1,54,1,
        54,1,54,1,54,1,55,1,55,1,55,5,55,764,8,55,10,55,12,55,767,9,55,1,
        55,1,55,5,55,771,8,55,10,55,12,55,774,9,55,1,55,1,55,1,55,1,55,1,
        56,1,56,1,56,5,56,783,8,56,10,56,12,56,786,9,56,1,56,3,56,789,8,
        56,1,56,5,56,792,8,56,10,56,12,56,795,9,56,1,56,1,56,5,56,799,8,
        56,10,56,12,56,802,9,56,1,56,1,56,1,56,1,56,1,57,1,57,1,58,1,58,
        1,58,5,58,813,8,58,10,58,12,58,816,9,58,1,58,5,58,819,8,58,10,58,
        12,58,822,9,58,1,58,5,58,825,8,58,10,58,12,58,828,9,58,1,58,1,58,
        1,59,1,59,1,59,1,59,3,59,836,8,59,1,60,1,60,1,60,1,60,1,61,1,61,
        1,61,1,61,1,62,1,62,1,62,1,62,1,63,1,63,1,63,5,63,853,8,63,10,63,
        12,63,856,9,63,1,63,1,63,5,63,860,8,63,10,63,12,63,863,9,63,1,63,
        1,63,1,63,1,63,1,64,1,64,1,64,5,64,872,8,64,10,64,12,64,875,9,64,
        1,64,5,64,878,8,64,10,64,12,64,881,9,64,1,64,5,64,884,8,64,10,64,
        12,64,887,9,64,1,64,1,64,1,64,1,64,5,64,893,8,64,10,64,12,64,896,
        9,64,1,64,1,64,1,64,1,64,1,65,1,65,1,65,1,65,1,65,1,65,1,65,3,65,
        909,8,65,1,66,1,66,1,66,1,66,1,67,1,67,1,67,1,67,1,68,1,68,1,68,
        1,68,1,69,1,69,1,69,1,69,1,70,1,70,1,70,1,70,1,71,1,71,1,71,5,71,
        934,8,71,10,71,12,71,937,9,71,1,71,5,71,940,8,71,10,71,12,71,943,
        9,71,1,71,5,71,946,8,71,10,71,12,71,949,9,71,1,71,1,71,5,71,953,
        8,71,10,71,12,71,956,9,71,1,71,1,71,1,71,1,71,1,72,1,72,1,72,3,72,
        965,8,72,1,73,1,73,1,73,0,0,74,0,2,4,6,8,10,12,14,16,18,20,22,24,
        26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,
        70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,108,
        110,112,114,116,118,120,122,124,126,128,130,132,134,136,138,140,
        142,144,146,0,1,1,0,7,8,1014,0,148,1,0,0,0,2,151,1,0,0,0,4,156,1,
        0,0,0,6,161,1,0,0,0,8,168,1,0,0,0,10,170,1,0,0,0,12,174,1,0,0,0,
        14,178,1,0,0,0,16,182,1,0,0,0,18,186,1,0,0,0,20,190,1,0,0,0,22,194,
        1,0,0,0,24,230,1,0,0,0,26,237,1,0,0,0,28,239,1,0,0,0,30,243,1,0,
        0,0,32,247,1,0,0,0,34,251,1,0,0,0,36,255,1,0,0,0,38,259,1,0,0,0,
        40,278,1,0,0,0,42,309,1,0,0,0,44,311,1,0,0,0,46,313,1,0,0,0,48,317,
        1,0,0,0,50,384,1,0,0,0,52,392,1,0,0,0,54,394,1,0,0,0,56,398,1,0,
        0,0,58,402,1,0,0,0,60,406,1,0,0,0,62,410,1,0,0,0,64,441,1,0,0,0,
        66,443,1,0,0,0,68,447,1,0,0,0,70,514,1,0,0,0,72,518,1,0,0,0,74,520,
        1,0,0,0,76,539,1,0,0,0,78,563,1,0,0,0,80,565,1,0,0,0,82,635,1,0,
        0,0,84,639,1,0,0,0,86,647,1,0,0,0,88,649,1,0,0,0,90,653,1,0,0,0,
        92,657,1,0,0,0,94,661,1,0,0,0,96,665,1,0,0,0,98,684,1,0,0,0,100,
        708,1,0,0,0,102,710,1,0,0,0,104,729,1,0,0,0,106,754,1,0,0,0,108,
        756,1,0,0,0,110,760,1,0,0,0,112,779,1,0,0,0,114,807,1,0,0,0,116,
        809,1,0,0,0,118,835,1,0,0,0,120,837,1,0,0,0,122,841,1,0,0,0,124,
        845,1,0,0,0,126,849,1,0,0,0,128,868,1,0,0,0,130,908,1,0,0,0,132,
        910,1,0,0,0,134,914,1,0,0,0,136,918,1,0,0,0,138,922,1,0,0,0,140,
        926,1,0,0,0,142,930,1,0,0,0,144,964,1,0,0,0,146,966,1,0,0,0,148,
        149,9,0,0,0,149,1,1,0,0,0,150,152,3,4,2,0,151,150,1,0,0,0,151,152,
        1,0,0,0,152,153,1,0,0,0,153,154,3,22,11,0,154,155,5,0,0,1,155,3,
        1,0,0,0,156,157,5,1,0,0,157,158,3,6,3,0,158,159,5,11,0,0,159,5,1,
        0,0,0,160,162,3,8,4,0,161,160,1,0,0,0,162,163,1,0,0,0,163,161,1,
        0,0,0,163,164,1,0,0,0,164,7,1,0,0,0,165,169,3,10,5,0,166,169,3,12,
        6,0,167,169,3,14,7,0,168,165,1,0,0,0,168,166,1,0,0,0,168,167,1,0,
        0,0,169,9,1,0,0,0,170,171,5,45,0,0,171,172,5,14,0,0,172,173,5,69,
        0,0,173,11,1,0,0,0,174,175,5,16,0,0,175,176,5,14,0,0,176,177,5,69,
        0,0,177,13,1,0,0,0,178,179,5,17,0,0,179,180,5,14,0,0,180,181,5,69,
        0,0,181,15,1,0,0,0,182,183,5,48,0,0,183,184,5,14,0,0,184,185,5,69,
        0,0,185,17,1,0,0,0,186,187,5,44,0,0,187,188,5,14,0,0,188,189,5,69,
        0,0,189,19,1,0,0,0,190,191,5,50,0,0,191,192,5,14,0,0,192,193,5,69,
        0,0,193,21,1,0,0,0,194,195,5,5,0,0,195,199,5,23,0,0,196,198,5,15,
        0,0,197,196,1,0,0,0,198,201,1,0,0,0,199,197,1,0,0,0,199,200,1,0,
        0,0,200,205,1,0,0,0,201,199,1,0,0,0,202,204,3,26,13,0,203,202,1,
        0,0,0,204,207,1,0,0,0,205,203,1,0,0,0,205,206,1,0,0,0,206,211,1,
        0,0,0,207,205,1,0,0,0,208,210,5,15,0,0,209,208,1,0,0,0,210,213,1,
        0,0,0,211,209,1,0,0,0,211,212,1,0,0,0,212,214,1,0,0,0,213,211,1,
        0,0,0,214,218,5,12,0,0,215,217,3,24,12,0,216,215,1,0,0,0,217,220,
        1,0,0,0,218,216,1,0,0,0,218,219,1,0,0,0,219,221,1,0,0,0,220,218,
        1,0,0,0,221,222,5,6,0,0,222,223,5,23,0,0,223,224,5,12,0,0,224,23,
        1,0,0,0,225,231,3,38,19,0,226,231,3,48,24,0,227,231,3,62,31,0,228,
        231,3,110,55,0,229,231,3,126,63,0,230,225,1,0,0,0,230,226,1,0,0,
        0,230,227,1,0,0,0,230,228,1,0,0,0,230,229,1,0,0,0,231,25,1,0,0,0,
        232,238,3,28,14,0,233,238,3,30,15,0,234,238,3,32,16,0,235,238,3,
        34,17,0,236,238,3,36,18,0,237,232,1,0,0,0,237,233,1,0,0,0,237,234,
        1,0,0,0,237,235,1,0,0,0,237,236,1,0,0,0,238,27,1,0,0,0,239,240,5,
        18,0,0,240,241,5,14,0,0,241,242,5,69,0,0,242,29,1,0,0,0,243,244,
        5,19,0,0,244,245,5,14,0,0,245,246,5,69,0,0,246,31,1,0,0,0,247,248,
        5,20,0,0,248,249,5,14,0,0,249,250,5,69,0,0,250,33,1,0,0,0,251,252,
        5,21,0,0,252,253,5,14,0,0,253,254,5,69,0,0,254,35,1,0,0,0,255,256,
        5,22,0,0,256,257,5,14,0,0,257,258,5,69,0,0,258,37,1,0,0,0,259,260,
        5,5,0,0,260,264,5,24,0,0,261,263,5,15,0,0,262,261,1,0,0,0,263,266,
        1,0,0,0,264,262,1,0,0,0,264,265,1,0,0,0,265,267,1,0,0,0,266,264,
        1,0,0,0,267,271,5,12,0,0,268,270,3,40,20,0,269,268,1,0,0,0,270,273,
        1,0,0,0,271,269,1,0,0,0,271,272,1,0,0,0,272,274,1,0,0,0,273,271,
        1,0,0,0,274,275,5,6,0,0,275,276,5,24,0,0,276,277,5,12,0,0,277,39,
        1,0,0,0,278,279,5,5,0,0,279,283,5,25,0,0,280,282,5,15,0,0,281,280,
        1,0,0,0,282,285,1,0,0,0,283,281,1,0,0,0,283,284,1,0,0,0,284,289,
        1,0,0,0,285,283,1,0,0,0,286,288,3,44,22,0,287,286,1,0,0,0,288,291,
        1,0,0,0,289,287,1,0,0,0,289,290,1,0,0,0,290,295,1,0,0,0,291,289,
        1,0,0,0,292,294,5,15,0,0,293,292,1,0,0,0,294,297,1,0,0,0,295,293,
        1,0,0,0,295,296,1,0,0,0,296,298,1,0,0,0,297,295,1,0,0,0,298,302,
        5,12,0,0,299,301,3,42,21,0,300,299,1,0,0,0,301,304,1,0,0,0,302,300,
        1,0,0,0,302,303,1,0,0,0,303,305,1,0,0,0,304,302,1,0,0,0,305,306,
        5,6,0,0,306,307,5,25,0,0,307,308,5,12,0,0,308,41,1,0,0,0,309,310,
        7,0,0,0,310,43,1,0,0,0,311,312,3,46,23,0,312,45,1,0,0,0,313,314,
        5,46,0,0,314,315,5,14,0,0,315,316,5,69,0,0,316,47,1,0,0,0,317,318,
        5,5,0,0,318,322,5,26,0,0,319,321,5,15,0,0,320,319,1,0,0,0,321,324,
        1,0,0,0,322,320,1,0,0,0,322,323,1,0,0,0,323,325,1,0,0,0,324,322,
        1,0,0,0,325,329,5,12,0,0,326,328,3,50,25,0,327,326,1,0,0,0,328,331,
        1,0,0,0,329,327,1,0,0,0,329,330,1,0,0,0,330,332,1,0,0,0,331,329,
        1,0,0,0,332,333,5,6,0,0,333,334,5,26,0,0,334,335,5,12,0,0,335,49,
        1,0,0,0,336,337,5,5,0,0,337,341,5,27,0,0,338,340,5,15,0,0,339,338,
        1,0,0,0,340,343,1,0,0,0,341,339,1,0,0,0,341,342,1,0,0,0,342,347,
        1,0,0,0,343,341,1,0,0,0,344,346,3,52,26,0,345,344,1,0,0,0,346,349,
        1,0,0,0,347,345,1,0,0,0,347,348,1,0,0,0,348,353,1,0,0,0,349,347,
        1,0,0,0,350,352,5,15,0,0,351,350,1,0,0,0,352,355,1,0,0,0,353,351,
        1,0,0,0,353,354,1,0,0,0,354,356,1,0,0,0,355,353,1,0,0,0,356,385,
        5,13,0,0,357,358,5,5,0,0,358,362,5,27,0,0,359,361,5,15,0,0,360,359,
        1,0,0,0,361,364,1,0,0,0,362,360,1,0,0,0,362,363,1,0,0,0,363,368,
        1,0,0,0,364,362,1,0,0,0,365,367,3,52,26,0,366,365,1,0,0,0,367,370,
        1,0,0,0,368,366,1,0,0,0,368,369,1,0,0,0,369,374,1,0,0,0,370,368,
        1,0,0,0,371,373,5,15,0,0,372,371,1,0,0,0,373,376,1,0,0,0,374,372,
        1,0,0,0,374,375,1,0,0,0,375,377,1,0,0,0,376,374,1,0,0,0,377,379,
        5,12,0,0,378,380,3,74,37,0,379,378,1,0,0,0,379,380,1,0,0,0,380,381,
        1,0,0,0,381,382,5,6,0,0,382,383,5,27,0,0,383,385,5,12,0,0,384,336,
        1,0,0,0,384,357,1,0,0,0,385,51,1,0,0,0,386,393,3,16,8,0,387,393,
        3,54,27,0,388,393,3,56,28,0,389,393,3,58,29,0,390,393,3,108,54,0,
        391,393,3,60,30,0,392,386,1,0,0,0,392,387,1,0,0,0,392,388,1,0,0,
        0,392,389,1,0,0,0,392,390,1,0,0,0,392,391,1,0,0,0,393,53,1,0,0,0,
        394,395,5,63,0,0,395,396,5,14,0,0,396,397,5,69,0,0,397,55,1,0,0,
        0,398,399,5,64,0,0,399,400,5,14,0,0,400,401,5,69,0,0,401,57,1,0,
        0,0,402,403,5,45,0,0,403,404,5,14,0,0,404,405,5,69,0,0,405,59,1,
        0,0,0,406,407,5,65,0,0,407,408,5,14,0,0,408,409,5,69,0,0,409,61,
        1,0,0,0,410,411,5,5,0,0,411,415,5,28,0,0,412,414,5,15,0,0,413,412,
        1,0,0,0,414,417,1,0,0,0,415,413,1,0,0,0,415,416,1,0,0,0,416,421,
        1,0,0,0,417,415,1,0,0,0,418,420,3,64,32,0,419,418,1,0,0,0,420,423,
        1,0,0,0,421,419,1,0,0,0,421,422,1,0,0,0,422,427,1,0,0,0,423,421,
        1,0,0,0,424,426,5,15,0,0,425,424,1,0,0,0,426,429,1,0,0,0,427,425,
        1,0,0,0,427,428,1,0,0,0,428,430,1,0,0,0,429,427,1,0,0,0,430,432,
        5,12,0,0,431,433,3,68,34,0,432,431,1,0,0,0,432,433,1,0,0,0,433,435,
        1,0,0,0,434,436,3,80,40,0,435,434,1,0,0,0,435,436,1,0,0,0,436,437,
        1,0,0,0,437,438,5,6,0,0,438,439,5,28,0,0,439,440,5,12,0,0,440,63,
        1,0,0,0,441,442,3,66,33,0,442,65,1,0,0,0,443,444,5,47,0,0,444,445,
        5,14,0,0,445,446,5,69,0,0,446,67,1,0,0,0,447,448,5,5,0,0,448,452,
        5,29,0,0,449,451,5,15,0,0,450,449,1,0,0,0,451,454,1,0,0,0,452,450,
        1,0,0,0,452,453,1,0,0,0,453,455,1,0,0,0,454,452,1,0,0,0,455,459,
        5,12,0,0,456,458,3,70,35,0,457,456,1,0,0,0,458,461,1,0,0,0,459,457,
        1,0,0,0,459,460,1,0,0,0,460,462,1,0,0,0,461,459,1,0,0,0,462,463,
        5,6,0,0,463,464,5,29,0,0,464,465,5,12,0,0,465,69,1,0,0,0,466,467,
        5,5,0,0,467,471,5,30,0,0,468,470,5,15,0,0,469,468,1,0,0,0,470,473,
        1,0,0,0,471,469,1,0,0,0,471,472,1,0,0,0,472,475,1,0,0,0,473,471,
        1,0,0,0,474,476,3,72,36,0,475,474,1,0,0,0,476,477,1,0,0,0,477,475,
        1,0,0,0,477,478,1,0,0,0,478,482,1,0,0,0,479,481,5,15,0,0,480,479,
        1,0,0,0,481,484,1,0,0,0,482,480,1,0,0,0,482,483,1,0,0,0,483,485,
        1,0,0,0,484,482,1,0,0,0,485,486,5,13,0,0,486,515,1,0,0,0,487,488,
        5,5,0,0,488,492,5,30,0,0,489,491,5,15,0,0,490,489,1,0,0,0,491,494,
        1,0,0,0,492,490,1,0,0,0,492,493,1,0,0,0,493,496,1,0,0,0,494,492,
        1,0,0,0,495,497,3,72,36,0,496,495,1,0,0,0,497,498,1,0,0,0,498,496,
        1,0,0,0,498,499,1,0,0,0,499,503,1,0,0,0,500,502,5,15,0,0,501,500,
        1,0,0,0,502,505,1,0,0,0,503,501,1,0,0,0,503,504,1,0,0,0,504,506,
        1,0,0,0,505,503,1,0,0,0,506,508,5,12,0,0,507,509,3,74,37,0,508,507,
        1,0,0,0,508,509,1,0,0,0,509,510,1,0,0,0,510,511,5,6,0,0,511,512,
        5,30,0,0,512,513,5,12,0,0,513,515,1,0,0,0,514,466,1,0,0,0,514,487,
        1,0,0,0,515,71,1,0,0,0,516,519,3,16,8,0,517,519,3,18,9,0,518,516,
        1,0,0,0,518,517,1,0,0,0,519,73,1,0,0,0,520,521,5,5,0,0,521,525,5,
        31,0,0,522,524,5,15,0,0,523,522,1,0,0,0,524,527,1,0,0,0,525,523,
        1,0,0,0,525,526,1,0,0,0,526,528,1,0,0,0,527,525,1,0,0,0,528,532,
        5,12,0,0,529,531,3,76,38,0,530,529,1,0,0,0,531,534,1,0,0,0,532,530,
        1,0,0,0,532,533,1,0,0,0,533,535,1,0,0,0,534,532,1,0,0,0,535,536,
        5,6,0,0,536,537,5,31,0,0,537,538,5,12,0,0,538,75,1,0,0,0,539,540,
        5,5,0,0,540,544,5,32,0,0,541,543,5,15,0,0,542,541,1,0,0,0,543,546,
        1,0,0,0,544,542,1,0,0,0,544,545,1,0,0,0,545,550,1,0,0,0,546,544,
        1,0,0,0,547,549,3,78,39,0,548,547,1,0,0,0,549,552,1,0,0,0,550,548,
        1,0,0,0,550,551,1,0,0,0,551,556,1,0,0,0,552,550,1,0,0,0,553,555,
        5,15,0,0,554,553,1,0,0,0,555,558,1,0,0,0,556,554,1,0,0,0,556,557,
        1,0,0,0,557,559,1,0,0,0,558,556,1,0,0,0,559,560,5,13,0,0,560,77,
        1,0,0,0,561,564,3,20,10,0,562,564,3,18,9,0,563,561,1,0,0,0,563,562,
        1,0,0,0,564,79,1,0,0,0,565,566,5,5,0,0,566,570,5,33,0,0,567,569,
        5,15,0,0,568,567,1,0,0,0,569,572,1,0,0,0,570,568,1,0,0,0,570,571,
        1,0,0,0,571,573,1,0,0,0,572,570,1,0,0,0,573,577,5,12,0,0,574,576,
        3,82,41,0,575,574,1,0,0,0,576,579,1,0,0,0,577,575,1,0,0,0,577,578,
        1,0,0,0,578,580,1,0,0,0,579,577,1,0,0,0,580,581,5,6,0,0,581,582,
        5,33,0,0,582,583,5,12,0,0,583,81,1,0,0,0,584,585,5,5,0,0,585,589,
        5,34,0,0,586,588,5,15,0,0,587,586,1,0,0,0,588,591,1,0,0,0,589,587,
        1,0,0,0,589,590,1,0,0,0,590,595,1,0,0,0,591,589,1,0,0,0,592,594,
        3,86,43,0,593,592,1,0,0,0,594,597,1,0,0,0,595,593,1,0,0,0,595,596,
        1,0,0,0,596,601,1,0,0,0,597,595,1,0,0,0,598,600,5,15,0,0,599,598,
        1,0,0,0,600,603,1,0,0,0,601,599,1,0,0,0,601,602,1,0,0,0,602,604,
        1,0,0,0,603,601,1,0,0,0,604,636,5,13,0,0,605,606,5,5,0,0,606,610,
        5,34,0,0,607,609,5,15,0,0,608,607,1,0,0,0,609,612,1,0,0,0,610,608,
        1,0,0,0,610,611,1,0,0,0,611,616,1,0,0,0,612,610,1,0,0,0,613,615,
        3,86,43,0,614,613,1,0,0,0,615,618,1,0,0,0,616,614,1,0,0,0,616,617,
        1,0,0,0,617,622,1,0,0,0,618,616,1,0,0,0,619,621,5,15,0,0,620,619,
        1,0,0,0,621,624,1,0,0,0,622,620,1,0,0,0,622,623,1,0,0,0,623,625,
        1,0,0,0,624,622,1,0,0,0,625,629,5,12,0,0,626,628,3,84,42,0,627,626,
        1,0,0,0,628,631,1,0,0,0,629,627,1,0,0,0,629,630,1,0,0,0,630,632,
        1,0,0,0,631,629,1,0,0,0,632,633,5,6,0,0,633,634,5,34,0,0,634,636,
        5,12,0,0,635,584,1,0,0,0,635,605,1,0,0,0,636,83,1,0,0,0,637,640,
        3,96,48,0,638,640,3,102,51,0,639,637,1,0,0,0,639,638,1,0,0,0,640,
        85,1,0,0,0,641,648,3,16,8,0,642,648,3,88,44,0,643,648,3,90,45,0,
        644,648,3,92,46,0,645,648,3,94,47,0,646,648,3,18,9,0,647,641,1,0,
        0,0,647,642,1,0,0,0,647,643,1,0,0,0,647,644,1,0,0,0,647,645,1,0,
        0,0,647,646,1,0,0,0,648,87,1,0,0,0,649,650,5,59,0,0,650,651,5,14,
        0,0,651,652,5,69,0,0,652,89,1,0,0,0,653,654,5,49,0,0,654,655,5,14,
        0,0,655,656,5,69,0,0,656,91,1,0,0,0,657,658,5,60,0,0,658,659,5,14,
        0,0,659,660,5,69,0,0,660,93,1,0,0,0,661,662,5,61,0,0,662,663,5,14,
        0,0,663,664,5,69,0,0,664,95,1,0,0,0,665,666,5,5,0,0,666,670,5,35,
        0,0,667,669,5,15,0,0,668,667,1,0,0,0,669,672,1,0,0,0,670,668,1,0,
        0,0,670,671,1,0,0,0,671,673,1,0,0,0,672,670,1,0,0,0,673,677,5,12,
        0,0,674,676,3,98,49,0,675,674,1,0,0,0,676,679,1,0,0,0,677,675,1,
        0,0,0,677,678,1,0,0,0,678,680,1,0,0,0,679,677,1,0,0,0,680,681,5,
        6,0,0,681,682,5,35,0,0,682,683,5,12,0,0,683,97,1,0,0,0,684,685,5,
        5,0,0,685,689,5,36,0,0,686,688,5,15,0,0,687,686,1,0,0,0,688,691,
        1,0,0,0,689,687,1,0,0,0,689,690,1,0,0,0,690,695,1,0,0,0,691,689,
        1,0,0,0,692,694,3,100,50,0,693,692,1,0,0,0,694,697,1,0,0,0,695,693,
        1,0,0,0,695,696,1,0,0,0,696,701,1,0,0,0,697,695,1,0,0,0,698,700,
        5,15,0,0,699,698,1,0,0,0,700,703,1,0,0,0,701,699,1,0,0,0,701,702,
        1,0,0,0,702,704,1,0,0,0,703,701,1,0,0,0,704,705,5,13,0,0,705,99,
        1,0,0,0,706,709,3,16,8,0,707,709,3,122,61,0,708,706,1,0,0,0,708,
        707,1,0,0,0,709,101,1,0,0,0,710,711,5,5,0,0,711,715,5,37,0,0,712,
        714,5,15,0,0,713,712,1,0,0,0,714,717,1,0,0,0,715,713,1,0,0,0,715,
        716,1,0,0,0,716,718,1,0,0,0,717,715,1,0,0,0,718,722,5,12,0,0,719,
        721,3,104,52,0,720,719,1,0,0,0,721,724,1,0,0,0,722,720,1,0,0,0,722,
        723,1,0,0,0,723,725,1,0,0,0,724,722,1,0,0,0,725,726,5,6,0,0,726,
        727,5,37,0,0,727,728,5,12,0,0,728,103,1,0,0,0,729,730,5,5,0,0,730,
        734,5,38,0,0,731,733,5,15,0,0,732,731,1,0,0,0,733,736,1,0,0,0,734,
        732,1,0,0,0,734,735,1,0,0,0,735,740,1,0,0,0,736,734,1,0,0,0,737,
        739,3,106,53,0,738,737,1,0,0,0,739,742,1,0,0,0,740,738,1,0,0,0,740,
        741,1,0,0,0,741,746,1,0,0,0,742,740,1,0,0,0,743,745,5,15,0,0,744,
        743,1,0,0,0,745,748,1,0,0,0,746,744,1,0,0,0,746,747,1,0,0,0,747,
        749,1,0,0,0,748,746,1,0,0,0,749,750,5,13,0,0,750,105,1,0,0,0,751,
        755,3,108,54,0,752,755,3,20,10,0,753,755,3,18,9,0,754,751,1,0,0,
        0,754,752,1,0,0,0,754,753,1,0,0,0,755,107,1,0,0,0,756,757,5,62,0,
        0,757,758,5,14,0,0,758,759,5,69,0,0,759,109,1,0,0,0,760,761,5,5,
        0,0,761,765,5,39,0,0,762,764,5,15,0,0,763,762,1,0,0,0,764,767,1,
        0,0,0,765,763,1,0,0,0,765,766,1,0,0,0,766,768,1,0,0,0,767,765,1,
        0,0,0,768,772,5,12,0,0,769,771,3,112,56,0,770,769,1,0,0,0,771,774,
        1,0,0,0,772,770,1,0,0,0,772,773,1,0,0,0,773,775,1,0,0,0,774,772,
        1,0,0,0,775,776,5,6,0,0,776,777,5,39,0,0,777,778,5,12,0,0,778,111,
        1,0,0,0,779,780,5,5,0,0,780,784,5,40,0,0,781,783,5,15,0,0,782,781,
        1,0,0,0,783,786,1,0,0,0,784,782,1,0,0,0,784,785,1,0,0,0,785,788,
        1,0,0,0,786,784,1,0,0,0,787,789,3,114,57,0,788,787,1,0,0,0,788,789,
        1,0,0,0,789,793,1,0,0,0,790,792,5,15,0,0,791,790,1,0,0,0,792,795,
        1,0,0,0,793,791,1,0,0,0,793,794,1,0,0,0,794,796,1,0,0,0,795,793,
        1,0,0,0,796,800,5,12,0,0,797,799,3,116,58,0,798,797,1,0,0,0,799,
        802,1,0,0,0,800,798,1,0,0,0,800,801,1,0,0,0,801,803,1,0,0,0,802,
        800,1,0,0,0,803,804,5,6,0,0,804,805,5,40,0,0,805,806,5,12,0,0,806,
        113,1,0,0,0,807,808,3,20,10,0,808,115,1,0,0,0,809,810,5,5,0,0,810,
        814,5,25,0,0,811,813,5,15,0,0,812,811,1,0,0,0,813,816,1,0,0,0,814,
        812,1,0,0,0,814,815,1,0,0,0,815,820,1,0,0,0,816,814,1,0,0,0,817,
        819,3,118,59,0,818,817,1,0,0,0,819,822,1,0,0,0,820,818,1,0,0,0,820,
        821,1,0,0,0,821,826,1,0,0,0,822,820,1,0,0,0,823,825,5,15,0,0,824,
        823,1,0,0,0,825,828,1,0,0,0,826,824,1,0,0,0,826,827,1,0,0,0,827,
        829,1,0,0,0,828,826,1,0,0,0,829,830,5,13,0,0,830,117,1,0,0,0,831,
        836,3,120,60,0,832,836,3,122,61,0,833,836,3,124,62,0,834,836,3,18,
        9,0,835,831,1,0,0,0,835,832,1,0,0,0,835,833,1,0,0,0,835,834,1,0,
        0,0,836,119,1,0,0,0,837,838,5,53,0,0,838,839,5,14,0,0,839,840,5,
        69,0,0,840,121,1,0,0,0,841,842,5,54,0,0,842,843,5,14,0,0,843,844,
        5,69,0,0,844,123,1,0,0,0,845,846,5,55,0,0,846,847,5,14,0,0,847,848,
        5,69,0,0,848,125,1,0,0,0,849,850,5,5,0,0,850,854,5,41,0,0,851,853,
        5,15,0,0,852,851,1,0,0,0,853,856,1,0,0,0,854,852,1,0,0,0,854,855,
        1,0,0,0,855,857,1,0,0,0,856,854,1,0,0,0,857,861,5,12,0,0,858,860,
        3,128,64,0,859,858,1,0,0,0,860,863,1,0,0,0,861,859,1,0,0,0,861,862,
        1,0,0,0,862,864,1,0,0,0,863,861,1,0,0,0,864,865,5,6,0,0,865,866,
        5,41,0,0,866,867,5,12,0,0,867,127,1,0,0,0,868,869,5,5,0,0,869,873,
        5,42,0,0,870,872,5,15,0,0,871,870,1,0,0,0,872,875,1,0,0,0,873,871,
        1,0,0,0,873,874,1,0,0,0,874,879,1,0,0,0,875,873,1,0,0,0,876,878,
        3,130,65,0,877,876,1,0,0,0,878,881,1,0,0,0,879,877,1,0,0,0,879,880,
        1,0,0,0,880,885,1,0,0,0,881,879,1,0,0,0,882,884,5,15,0,0,883,882,
        1,0,0,0,884,887,1,0,0,0,885,883,1,0,0,0,885,886,1,0,0,0,886,888,
        1,0,0,0,887,885,1,0,0,0,888,894,5,12,0,0,889,893,5,7,0,0,890,893,
        5,8,0,0,891,893,3,142,71,0,892,889,1,0,0,0,892,890,1,0,0,0,892,891,
        1,0,0,0,893,896,1,0,0,0,894,892,1,0,0,0,894,895,1,0,0,0,895,897,
        1,0,0,0,896,894,1,0,0,0,897,898,5,6,0,0,898,899,5,42,0,0,899,900,
        5,12,0,0,900,129,1,0,0,0,901,909,3,132,66,0,902,909,3,134,67,0,903,
        909,3,136,68,0,904,909,3,138,69,0,905,909,3,140,70,0,906,909,3,124,
        62,0,907,909,3,18,9,0,908,901,1,0,0,0,908,902,1,0,0,0,908,903,1,
        0,0,0,908,904,1,0,0,0,908,905,1,0,0,0,908,906,1,0,0,0,908,907,1,
        0,0,0,909,131,1,0,0,0,910,911,5,56,0,0,911,912,5,14,0,0,912,913,
        5,69,0,0,913,133,1,0,0,0,914,915,5,52,0,0,915,916,5,14,0,0,916,917,
        5,69,0,0,917,135,1,0,0,0,918,919,5,51,0,0,919,920,5,14,0,0,920,921,
        5,69,0,0,921,137,1,0,0,0,922,923,5,57,0,0,923,924,5,14,0,0,924,925,
        5,69,0,0,925,139,1,0,0,0,926,927,5,58,0,0,927,928,5,14,0,0,928,929,
        5,69,0,0,929,141,1,0,0,0,930,931,5,5,0,0,931,935,5,43,0,0,932,934,
        5,15,0,0,933,932,1,0,0,0,934,937,1,0,0,0,935,933,1,0,0,0,935,936,
        1,0,0,0,936,941,1,0,0,0,937,935,1,0,0,0,938,940,3,146,73,0,939,938,
        1,0,0,0,940,943,1,0,0,0,941,939,1,0,0,0,941,942,1,0,0,0,942,947,
        1,0,0,0,943,941,1,0,0,0,944,946,5,15,0,0,945,944,1,0,0,0,946,949,
        1,0,0,0,947,945,1,0,0,0,947,948,1,0,0,0,948,950,1,0,0,0,949,947,
        1,0,0,0,950,954,5,12,0,0,951,953,3,144,72,0,952,951,1,0,0,0,953,
        956,1,0,0,0,954,952,1,0,0,0,954,955,1,0,0,0,955,957,1,0,0,0,956,
        954,1,0,0,0,957,958,5,6,0,0,958,959,5,43,0,0,959,960,5,12,0,0,960,
        143,1,0,0,0,961,965,5,7,0,0,962,965,5,8,0,0,963,965,3,142,71,0,964,
        961,1,0,0,0,964,962,1,0,0,0,964,963,1,0,0,0,965,145,1,0,0,0,966,
        967,3,20,10,0,967,147,1,0,0,0,95,151,163,168,199,205,211,218,230,
        237,264,271,283,289,295,302,322,329,341,347,353,362,368,374,379,
        384,392,415,421,427,432,435,452,459,471,477,482,492,498,503,508,
        514,518,525,532,544,550,556,563,570,577,589,595,601,610,616,622,
        629,635,639,647,670,677,689,695,701,708,715,722,734,740,746,754,
        765,772,784,788,793,800,814,820,826,835,854,861,873,879,885,892,
        894,908,935,941,947,954,964
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!TRSXParser.__ATN) {
            TRSXParser.__ATN = new antlr.ATNDeserializer().deserialize(TRSXParser._serializedATN);
        }

        return TRSXParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(TRSXParser.literalNames, TRSXParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return TRSXParser.vocabulary;
    }

    private static readonly decisionsToDFA = TRSXParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class UnexpectedTokenContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_unexpectedToken;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterUnexpectedToken) {
             listener.enterUnexpectedToken(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitUnexpectedToken) {
             listener.exitUnexpectedToken(this);
        }
    }
}


export class DocumentContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public project(): ProjectContext {
        return this.getRuleContext(0, ProjectContext)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EOF, 0)!;
    }
    public xmlDecl(): XmlDeclContext | null {
        return this.getRuleContext(0, XmlDeclContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_document;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterDocument) {
             listener.enterDocument(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitDocument) {
             listener.exitDocument(this);
        }
    }
}


export class XmlDeclContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public XMLDeclOpen(): antlr.TerminalNode {
        return this.getToken(TRSXParser.XMLDeclOpen, 0)!;
    }
    public xmlDeclAttrs(): XmlDeclAttrsContext {
        return this.getRuleContext(0, XmlDeclAttrsContext)!;
    }
    public SPECIAL_CLOSE(): antlr.TerminalNode {
        return this.getToken(TRSXParser.SPECIAL_CLOSE, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_xmlDecl;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterXmlDecl) {
             listener.enterXmlDecl(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitXmlDecl) {
             listener.exitXmlDecl(this);
        }
    }
}


export class XmlDeclAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public xmlDeclAttr(): XmlDeclAttrContext[];
    public xmlDeclAttr(i: number): XmlDeclAttrContext | null;
    public xmlDeclAttr(i?: number): XmlDeclAttrContext[] | XmlDeclAttrContext | null {
        if (i === undefined) {
            return this.getRuleContexts(XmlDeclAttrContext);
        }

        return this.getRuleContext(i, XmlDeclAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_xmlDeclAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterXmlDeclAttrs) {
             listener.enterXmlDeclAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitXmlDeclAttrs) {
             listener.exitXmlDeclAttrs(this);
        }
    }
}


export class XmlDeclAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public versionAttr(): VersionAttrContext | null {
        return this.getRuleContext(0, VersionAttrContext);
    }
    public encodingAttr(): EncodingAttrContext | null {
        return this.getRuleContext(0, EncodingAttrContext);
    }
    public standaloneAttr(): StandaloneAttrContext | null {
        return this.getRuleContext(0, StandaloneAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_xmlDeclAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterXmlDeclAttr) {
             listener.enterXmlDeclAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitXmlDeclAttr) {
             listener.exitXmlDeclAttr(this);
        }
    }
}


export class VersionAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public VERSION(): antlr.TerminalNode {
        return this.getToken(TRSXParser.VERSION, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_versionAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterVersionAttr) {
             listener.enterVersionAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitVersionAttr) {
             listener.exitVersionAttr(this);
        }
    }
}


export class EncodingAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ENCODING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.ENCODING, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_encodingAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterEncodingAttr) {
             listener.enterEncodingAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitEncodingAttr) {
             listener.exitEncodingAttr(this);
        }
    }
}


export class StandaloneAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public STANDALONE(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STANDALONE, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_standaloneAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterStandaloneAttr) {
             listener.enterStandaloneAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitStandaloneAttr) {
             listener.exitStandaloneAttr(this);
        }
    }
}


export class NameAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NAME_ATTR(): antlr.TerminalNode {
        return this.getToken(TRSXParser.NAME_ATTR, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_nameAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterNameAttr) {
             listener.enterNameAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitNameAttr) {
             listener.exitNameAttr(this);
        }
    }
}


export class SourcerefAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SOURCEREF(): antlr.TerminalNode {
        return this.getToken(TRSXParser.SOURCEREF, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_sourcerefAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSourcerefAttr) {
             listener.enterSourcerefAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSourcerefAttr) {
             listener.exitSourcerefAttr(this);
        }
    }
}


export class ConceptrefAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CONCEPTREF(): antlr.TerminalNode {
        return this.getToken(TRSXParser.CONCEPTREF, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_conceptrefAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterConceptrefAttr) {
             listener.enterConceptrefAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitConceptrefAttr) {
             listener.exitConceptrefAttr(this);
        }
    }
}


export class ProjectContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public PROJECT(): antlr.TerminalNode[];
    public PROJECT(i: number): antlr.TerminalNode | null;
    public PROJECT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.PROJECT);
    	} else {
    		return this.getToken(TRSXParser.PROJECT, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public projectAttrs(): ProjectAttrsContext[];
    public projectAttrs(i: number): ProjectAttrsContext | null;
    public projectAttrs(i?: number): ProjectAttrsContext[] | ProjectAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ProjectAttrsContext);
        }

        return this.getRuleContext(i, ProjectAttrsContext);
    }
    public projectElements(): ProjectElementsContext[];
    public projectElements(i: number): ProjectElementsContext | null;
    public projectElements(i?: number): ProjectElementsContext[] | ProjectElementsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ProjectElementsContext);
        }

        return this.getRuleContext(i, ProjectElementsContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_project;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterProject) {
             listener.enterProject(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitProject) {
             listener.exitProject(this);
        }
    }
}


export class ProjectElementsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public metadata(): MetadataContext | null {
        return this.getRuleContext(0, MetadataContext);
    }
    public sources(): SourcesContext | null {
        return this.getRuleContext(0, SourcesContext);
    }
    public ontology(): OntologyContext | null {
        return this.getRuleContext(0, OntologyContext);
    }
    public dictionaries(): DictionariesContext | null {
        return this.getRuleContext(0, DictionariesContext);
    }
    public samples(): SamplesContext | null {
        return this.getRuleContext(0, SamplesContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_projectElements;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterProjectElements) {
             listener.enterProjectElements(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitProjectElements) {
             listener.exitProjectElements(this);
        }
    }
}


export class ProjectAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public xmlnsAttr(): XmlnsAttrContext | null {
        return this.getRuleContext(0, XmlnsAttrContext);
    }
    public xmlnsNuanceAttr(): XmlnsNuanceAttrContext | null {
        return this.getRuleContext(0, XmlnsNuanceAttrContext);
    }
    public xmlLangAttr(): XmlLangAttrContext | null {
        return this.getRuleContext(0, XmlLangAttrContext);
    }
    public nuanceVersionAttr(): NuanceVersionAttrContext | null {
        return this.getRuleContext(0, NuanceVersionAttrContext);
    }
    public nuanceEnginePackVersionAttr(): NuanceEnginePackVersionAttrContext | null {
        return this.getRuleContext(0, NuanceEnginePackVersionAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_projectAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterProjectAttrs) {
             listener.enterProjectAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitProjectAttrs) {
             listener.exitProjectAttrs(this);
        }
    }
}


export class XmlnsAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public XMLNS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.XMLNS, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_xmlnsAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterXmlnsAttr) {
             listener.enterXmlnsAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitXmlnsAttr) {
             listener.exitXmlnsAttr(this);
        }
    }
}


export class XmlnsNuanceAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public XMLNS_NUANCE(): antlr.TerminalNode {
        return this.getToken(TRSXParser.XMLNS_NUANCE, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_xmlnsNuanceAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterXmlnsNuanceAttr) {
             listener.enterXmlnsNuanceAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitXmlnsNuanceAttr) {
             listener.exitXmlnsNuanceAttr(this);
        }
    }
}


export class XmlLangAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public XML_LANG(): antlr.TerminalNode {
        return this.getToken(TRSXParser.XML_LANG, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_xmlLangAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterXmlLangAttr) {
             listener.enterXmlLangAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitXmlLangAttr) {
             listener.exitXmlLangAttr(this);
        }
    }
}


export class NuanceVersionAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NUANCE_VERSION(): antlr.TerminalNode {
        return this.getToken(TRSXParser.NUANCE_VERSION, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_nuanceVersionAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterNuanceVersionAttr) {
             listener.enterNuanceVersionAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitNuanceVersionAttr) {
             listener.exitNuanceVersionAttr(this);
        }
    }
}


export class NuanceEnginePackVersionAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NUANCE_ENGINE_PACK_VERSION(): antlr.TerminalNode {
        return this.getToken(TRSXParser.NUANCE_ENGINE_PACK_VERSION, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_nuanceEnginePackVersionAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterNuanceEnginePackVersionAttr) {
             listener.enterNuanceEnginePackVersionAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitNuanceEnginePackVersionAttr) {
             listener.exitNuanceEnginePackVersionAttr(this);
        }
    }
}


export class MetadataContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public METADATA(): antlr.TerminalNode[];
    public METADATA(i: number): antlr.TerminalNode | null;
    public METADATA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.METADATA);
    	} else {
    		return this.getToken(TRSXParser.METADATA, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public entry(): EntryContext[];
    public entry(i: number): EntryContext | null;
    public entry(i?: number): EntryContext[] | EntryContext | null {
        if (i === undefined) {
            return this.getRuleContexts(EntryContext);
        }

        return this.getRuleContext(i, EntryContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_metadata;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterMetadata) {
             listener.enterMetadata(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitMetadata) {
             listener.exitMetadata(this);
        }
    }
}


export class EntryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public ENTRY(): antlr.TerminalNode[];
    public ENTRY(i: number): antlr.TerminalNode | null;
    public ENTRY(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.ENTRY);
    	} else {
    		return this.getToken(TRSXParser.ENTRY, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public entryAttrs(): EntryAttrsContext[];
    public entryAttrs(i: number): EntryAttrsContext | null;
    public entryAttrs(i?: number): EntryAttrsContext[] | EntryAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(EntryAttrsContext);
        }

        return this.getRuleContext(i, EntryAttrsContext);
    }
    public entryContent(): EntryContentContext[];
    public entryContent(i: number): EntryContentContext | null;
    public entryContent(i?: number): EntryContentContext[] | EntryContentContext | null {
        if (i === undefined) {
            return this.getRuleContexts(EntryContentContext);
        }

        return this.getRuleContext(i, EntryContentContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_entry;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterEntry) {
             listener.enterEntry(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitEntry) {
             listener.exitEntry(this);
        }
    }
}


export class EntryContentContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TEXT(): antlr.TerminalNode | null {
        return this.getToken(TRSXParser.TEXT, 0);
    }
    public WS(): antlr.TerminalNode | null {
        return this.getToken(TRSXParser.WS, 0);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_entryContent;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterEntryContent) {
             listener.enterEntryContent(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitEntryContent) {
             listener.exitEntryContent(this);
        }
    }
}


export class EntryAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public keyAttr(): KeyAttrContext {
        return this.getRuleContext(0, KeyAttrContext)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_entryAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterEntryAttrs) {
             listener.enterEntryAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitEntryAttrs) {
             listener.exitEntryAttrs(this);
        }
    }
}


export class KeyAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public KEY(): antlr.TerminalNode {
        return this.getToken(TRSXParser.KEY, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_keyAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterKeyAttr) {
             listener.enterKeyAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitKeyAttr) {
             listener.exitKeyAttr(this);
        }
    }
}


export class SourcesContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public SOURCES(): antlr.TerminalNode[];
    public SOURCES(i: number): antlr.TerminalNode | null;
    public SOURCES(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.SOURCES);
    	} else {
    		return this.getToken(TRSXParser.SOURCES, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public source(): SourceContext[];
    public source(i: number): SourceContext | null;
    public source(i?: number): SourceContext[] | SourceContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SourceContext);
        }

        return this.getRuleContext(i, SourceContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_sources;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSources) {
             listener.enterSources(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSources) {
             listener.exitSources(this);
        }
    }
}


export class SourceContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public SOURCE(): antlr.TerminalNode[];
    public SOURCE(i: number): antlr.TerminalNode | null;
    public SOURCE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.SOURCE);
    	} else {
    		return this.getToken(TRSXParser.SOURCE, i);
    	}
    }
    public CLOSE_SLASH(): antlr.TerminalNode | null {
        return this.getToken(TRSXParser.CLOSE_SLASH, 0);
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public sourceAttrs(): SourceAttrsContext[];
    public sourceAttrs(i: number): SourceAttrsContext | null;
    public sourceAttrs(i?: number): SourceAttrsContext[] | SourceAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SourceAttrsContext);
        }

        return this.getRuleContext(i, SourceAttrsContext);
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode | null {
        return this.getToken(TRSXParser.OPEN_SLASH, 0);
    }
    public links(): LinksContext | null {
        return this.getRuleContext(0, LinksContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_source;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSource) {
             listener.enterSource(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSource) {
             listener.exitSource(this);
        }
    }
}


export class SourceAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public nameAttr(): NameAttrContext | null {
        return this.getRuleContext(0, NameAttrContext);
    }
    public sourceDisplayNameAttr(): SourceDisplayNameAttrContext | null {
        return this.getRuleContext(0, SourceDisplayNameAttrContext);
    }
    public sourceUriAttr(): SourceUriAttrContext | null {
        return this.getRuleContext(0, SourceUriAttrContext);
    }
    public sourceVersionAttr(): SourceVersionAttrContext | null {
        return this.getRuleContext(0, SourceVersionAttrContext);
    }
    public typeAttr(): TypeAttrContext | null {
        return this.getRuleContext(0, TypeAttrContext);
    }
    public sourceUseForOOVAttr(): SourceUseForOOVAttrContext | null {
        return this.getRuleContext(0, SourceUseForOOVAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_sourceAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSourceAttrs) {
             listener.enterSourceAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSourceAttrs) {
             listener.exitSourceAttrs(this);
        }
    }
}


export class SourceDisplayNameAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SOURCE_DISPLAY_NAME(): antlr.TerminalNode {
        return this.getToken(TRSXParser.SOURCE_DISPLAY_NAME, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_sourceDisplayNameAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSourceDisplayNameAttr) {
             listener.enterSourceDisplayNameAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSourceDisplayNameAttr) {
             listener.exitSourceDisplayNameAttr(this);
        }
    }
}


export class SourceUriAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SOURCE_URI(): antlr.TerminalNode {
        return this.getToken(TRSXParser.SOURCE_URI, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_sourceUriAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSourceUriAttr) {
             listener.enterSourceUriAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSourceUriAttr) {
             listener.exitSourceUriAttr(this);
        }
    }
}


export class SourceVersionAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public VERSION(): antlr.TerminalNode {
        return this.getToken(TRSXParser.VERSION, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_sourceVersionAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSourceVersionAttr) {
             listener.enterSourceVersionAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSourceVersionAttr) {
             listener.exitSourceVersionAttr(this);
        }
    }
}


export class SourceUseForOOVAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SOURCE_USE_FOR_OOV(): antlr.TerminalNode {
        return this.getToken(TRSXParser.SOURCE_USE_FOR_OOV, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_sourceUseForOOVAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSourceUseForOOVAttr) {
             listener.enterSourceUseForOOVAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSourceUseForOOVAttr) {
             listener.exitSourceUseForOOVAttr(this);
        }
    }
}


export class OntologyContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public ONTOLOGY(): antlr.TerminalNode[];
    public ONTOLOGY(i: number): antlr.TerminalNode | null;
    public ONTOLOGY(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.ONTOLOGY);
    	} else {
    		return this.getToken(TRSXParser.ONTOLOGY, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public ontologyAttrs(): OntologyAttrsContext[];
    public ontologyAttrs(i: number): OntologyAttrsContext | null;
    public ontologyAttrs(i?: number): OntologyAttrsContext[] | OntologyAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OntologyAttrsContext);
        }

        return this.getRuleContext(i, OntologyAttrsContext);
    }
    public intents(): IntentsContext | null {
        return this.getRuleContext(0, IntentsContext);
    }
    public concepts(): ConceptsContext | null {
        return this.getRuleContext(0, ConceptsContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_ontology;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterOntology) {
             listener.enterOntology(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitOntology) {
             listener.exitOntology(this);
        }
    }
}


export class OntologyAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public baseAttr(): BaseAttrContext {
        return this.getRuleContext(0, BaseAttrContext)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_ontologyAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterOntologyAttrs) {
             listener.enterOntologyAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitOntologyAttrs) {
             listener.exitOntologyAttrs(this);
        }
    }
}


export class BaseAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public BASE(): antlr.TerminalNode {
        return this.getToken(TRSXParser.BASE, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_baseAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterBaseAttr) {
             listener.enterBaseAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitBaseAttr) {
             listener.exitBaseAttr(this);
        }
    }
}


export class IntentsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public INTENTS(): antlr.TerminalNode[];
    public INTENTS(i: number): antlr.TerminalNode | null;
    public INTENTS(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.INTENTS);
    	} else {
    		return this.getToken(TRSXParser.INTENTS, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public intent(): IntentContext[];
    public intent(i: number): IntentContext | null;
    public intent(i?: number): IntentContext[] | IntentContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IntentContext);
        }

        return this.getRuleContext(i, IntentContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_intents;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterIntents) {
             listener.enterIntents(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitIntents) {
             listener.exitIntents(this);
        }
    }
}


export class IntentContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public INTENT(): antlr.TerminalNode[];
    public INTENT(i: number): antlr.TerminalNode | null;
    public INTENT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.INTENT);
    	} else {
    		return this.getToken(TRSXParser.INTENT, i);
    	}
    }
    public CLOSE_SLASH(): antlr.TerminalNode | null {
        return this.getToken(TRSXParser.CLOSE_SLASH, 0);
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public intentAttrs(): IntentAttrsContext[];
    public intentAttrs(i: number): IntentAttrsContext | null;
    public intentAttrs(i?: number): IntentAttrsContext[] | IntentAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IntentAttrsContext);
        }

        return this.getRuleContext(i, IntentAttrsContext);
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode | null {
        return this.getToken(TRSXParser.OPEN_SLASH, 0);
    }
    public links(): LinksContext | null {
        return this.getRuleContext(0, LinksContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_intent;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterIntent) {
             listener.enterIntent(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitIntent) {
             listener.exitIntent(this);
        }
    }
}


export class IntentAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public nameAttr(): NameAttrContext | null {
        return this.getRuleContext(0, NameAttrContext);
    }
    public sourcerefAttr(): SourcerefAttrContext | null {
        return this.getRuleContext(0, SourcerefAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_intentAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterIntentAttrs) {
             listener.enterIntentAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitIntentAttrs) {
             listener.exitIntentAttrs(this);
        }
    }
}


export class LinksContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public LINKS(): antlr.TerminalNode[];
    public LINKS(i: number): antlr.TerminalNode | null;
    public LINKS(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.LINKS);
    	} else {
    		return this.getToken(TRSXParser.LINKS, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public link(): LinkContext[];
    public link(i: number): LinkContext | null;
    public link(i?: number): LinkContext[] | LinkContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LinkContext);
        }

        return this.getRuleContext(i, LinkContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_links;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterLinks) {
             listener.enterLinks(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitLinks) {
             listener.exitLinks(this);
        }
    }
}


export class LinkContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public LINK(): antlr.TerminalNode {
        return this.getToken(TRSXParser.LINK, 0)!;
    }
    public CLOSE_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.CLOSE_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public linkAttrs(): LinkAttrsContext[];
    public linkAttrs(i: number): LinkAttrsContext | null;
    public linkAttrs(i?: number): LinkAttrsContext[] | LinkAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LinkAttrsContext);
        }

        return this.getRuleContext(i, LinkAttrsContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_link;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterLink) {
             listener.enterLink(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitLink) {
             listener.exitLink(this);
        }
    }
}


export class LinkAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public conceptrefAttr(): ConceptrefAttrContext | null {
        return this.getRuleContext(0, ConceptrefAttrContext);
    }
    public sourcerefAttr(): SourcerefAttrContext | null {
        return this.getRuleContext(0, SourcerefAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_linkAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterLinkAttrs) {
             listener.enterLinkAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitLinkAttrs) {
             listener.exitLinkAttrs(this);
        }
    }
}


export class ConceptsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public CONCEPTS(): antlr.TerminalNode[];
    public CONCEPTS(i: number): antlr.TerminalNode | null;
    public CONCEPTS(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CONCEPTS);
    	} else {
    		return this.getToken(TRSXParser.CONCEPTS, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public concept(): ConceptContext[];
    public concept(i: number): ConceptContext | null;
    public concept(i?: number): ConceptContext[] | ConceptContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ConceptContext);
        }

        return this.getRuleContext(i, ConceptContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_concepts;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterConcepts) {
             listener.enterConcepts(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitConcepts) {
             listener.exitConcepts(this);
        }
    }
}


export class ConceptContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public CONCEPT(): antlr.TerminalNode[];
    public CONCEPT(i: number): antlr.TerminalNode | null;
    public CONCEPT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CONCEPT);
    	} else {
    		return this.getToken(TRSXParser.CONCEPT, i);
    	}
    }
    public CLOSE_SLASH(): antlr.TerminalNode | null {
        return this.getToken(TRSXParser.CLOSE_SLASH, 0);
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public conceptAttrs(): ConceptAttrsContext[];
    public conceptAttrs(i: number): ConceptAttrsContext | null;
    public conceptAttrs(i?: number): ConceptAttrsContext[] | ConceptAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ConceptAttrsContext);
        }

        return this.getRuleContext(i, ConceptAttrsContext);
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode | null {
        return this.getToken(TRSXParser.OPEN_SLASH, 0);
    }
    public conceptElements(): ConceptElementsContext[];
    public conceptElements(i: number): ConceptElementsContext | null;
    public conceptElements(i?: number): ConceptElementsContext[] | ConceptElementsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ConceptElementsContext);
        }

        return this.getRuleContext(i, ConceptElementsContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_concept;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterConcept) {
             listener.enterConcept(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitConcept) {
             listener.exitConcept(this);
        }
    }
}


export class ConceptElementsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public settings(): SettingsContext | null {
        return this.getRuleContext(0, SettingsContext);
    }
    public relations(): RelationsContext | null {
        return this.getRuleContext(0, RelationsContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_conceptElements;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterConceptElements) {
             listener.enterConceptElements(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitConceptElements) {
             listener.exitConceptElements(this);
        }
    }
}


export class ConceptAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public nameAttr(): NameAttrContext | null {
        return this.getRuleContext(0, NameAttrContext);
    }
    public dataTypeAttr(): DataTypeAttrContext | null {
        return this.getRuleContext(0, DataTypeAttrContext);
    }
    public freetextAttr(): FreetextAttrContext | null {
        return this.getRuleContext(0, FreetextAttrContext);
    }
    public dynamicAttr(): DynamicAttrContext | null {
        return this.getRuleContext(0, DynamicAttrContext);
    }
    public ruleGrammarFileNameAttr(): RuleGrammarFileNameAttrContext | null {
        return this.getRuleContext(0, RuleGrammarFileNameAttrContext);
    }
    public sourcerefAttr(): SourcerefAttrContext | null {
        return this.getRuleContext(0, SourcerefAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_conceptAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterConceptAttrs) {
             listener.enterConceptAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitConceptAttrs) {
             listener.exitConceptAttrs(this);
        }
    }
}


export class DataTypeAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DATATYPE(): antlr.TerminalNode {
        return this.getToken(TRSXParser.DATATYPE, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_dataTypeAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterDataTypeAttr) {
             listener.enterDataTypeAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitDataTypeAttr) {
             listener.exitDataTypeAttr(this);
        }
    }
}


export class FreetextAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FREETEXT(): antlr.TerminalNode {
        return this.getToken(TRSXParser.FREETEXT, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_freetextAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterFreetextAttr) {
             listener.enterFreetextAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitFreetextAttr) {
             listener.exitFreetextAttr(this);
        }
    }
}


export class DynamicAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DYNAMIC(): antlr.TerminalNode {
        return this.getToken(TRSXParser.DYNAMIC, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_dynamicAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterDynamicAttr) {
             listener.enterDynamicAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitDynamicAttr) {
             listener.exitDynamicAttr(this);
        }
    }
}


export class RuleGrammarFileNameAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RULE_GRAMMAR_FILE(): antlr.TerminalNode {
        return this.getToken(TRSXParser.RULE_GRAMMAR_FILE, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_ruleGrammarFileNameAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterRuleGrammarFileNameAttr) {
             listener.enterRuleGrammarFileNameAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitRuleGrammarFileNameAttr) {
             listener.exitRuleGrammarFileNameAttr(this);
        }
    }
}


export class SettingsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public SETTINGS(): antlr.TerminalNode[];
    public SETTINGS(i: number): antlr.TerminalNode | null;
    public SETTINGS(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.SETTINGS);
    	} else {
    		return this.getToken(TRSXParser.SETTINGS, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public setting(): SettingContext[];
    public setting(i: number): SettingContext | null;
    public setting(i?: number): SettingContext[] | SettingContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SettingContext);
        }

        return this.getRuleContext(i, SettingContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_settings;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSettings) {
             listener.enterSettings(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSettings) {
             listener.exitSettings(this);
        }
    }
}


export class SettingContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public SETTING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.SETTING, 0)!;
    }
    public CLOSE_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.CLOSE_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public settingAttrs(): SettingAttrsContext[];
    public settingAttrs(i: number): SettingAttrsContext | null;
    public settingAttrs(i?: number): SettingAttrsContext[] | SettingAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SettingAttrsContext);
        }

        return this.getRuleContext(i, SettingAttrsContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_setting;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSetting) {
             listener.enterSetting(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSetting) {
             listener.exitSetting(this);
        }
    }
}


export class SettingAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public nameAttr(): NameAttrContext | null {
        return this.getRuleContext(0, NameAttrContext);
    }
    public valueAttr(): ValueAttrContext | null {
        return this.getRuleContext(0, ValueAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_settingAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSettingAttrs) {
             listener.enterSettingAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSettingAttrs) {
             listener.exitSettingAttrs(this);
        }
    }
}


export class RelationsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public RELATIONS(): antlr.TerminalNode[];
    public RELATIONS(i: number): antlr.TerminalNode | null;
    public RELATIONS(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.RELATIONS);
    	} else {
    		return this.getToken(TRSXParser.RELATIONS, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public relation(): RelationContext[];
    public relation(i: number): RelationContext | null;
    public relation(i?: number): RelationContext[] | RelationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(RelationContext);
        }

        return this.getRuleContext(i, RelationContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_relations;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterRelations) {
             listener.enterRelations(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitRelations) {
             listener.exitRelations(this);
        }
    }
}


export class RelationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public RELATION(): antlr.TerminalNode {
        return this.getToken(TRSXParser.RELATION, 0)!;
    }
    public CLOSE_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.CLOSE_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public relationAttrs(): RelationAttrsContext[];
    public relationAttrs(i: number): RelationAttrsContext | null;
    public relationAttrs(i?: number): RelationAttrsContext[] | RelationAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(RelationAttrsContext);
        }

        return this.getRuleContext(i, RelationAttrsContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_relation;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterRelation) {
             listener.enterRelation(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitRelation) {
             listener.exitRelation(this);
        }
    }
}


export class RelationAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public typeAttr(): TypeAttrContext | null {
        return this.getRuleContext(0, TypeAttrContext);
    }
    public conceptrefAttr(): ConceptrefAttrContext | null {
        return this.getRuleContext(0, ConceptrefAttrContext);
    }
    public sourcerefAttr(): SourcerefAttrContext | null {
        return this.getRuleContext(0, SourcerefAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_relationAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterRelationAttrs) {
             listener.enterRelationAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitRelationAttrs) {
             listener.exitRelationAttrs(this);
        }
    }
}


export class TypeAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TYPE(): antlr.TerminalNode {
        return this.getToken(TRSXParser.TYPE, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_typeAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterTypeAttr) {
             listener.enterTypeAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitTypeAttr) {
             listener.exitTypeAttr(this);
        }
    }
}


export class DictionariesContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public DICTIONARIES(): antlr.TerminalNode[];
    public DICTIONARIES(i: number): antlr.TerminalNode | null;
    public DICTIONARIES(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.DICTIONARIES);
    	} else {
    		return this.getToken(TRSXParser.DICTIONARIES, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public dictionary(): DictionaryContext[];
    public dictionary(i: number): DictionaryContext | null;
    public dictionary(i?: number): DictionaryContext[] | DictionaryContext | null {
        if (i === undefined) {
            return this.getRuleContexts(DictionaryContext);
        }

        return this.getRuleContext(i, DictionaryContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_dictionaries;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterDictionaries) {
             listener.enterDictionaries(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitDictionaries) {
             listener.exitDictionaries(this);
        }
    }
}


export class DictionaryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public DICTIONARY(): antlr.TerminalNode[];
    public DICTIONARY(i: number): antlr.TerminalNode | null;
    public DICTIONARY(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.DICTIONARY);
    	} else {
    		return this.getToken(TRSXParser.DICTIONARY, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public dictionaryAttrs(): DictionaryAttrsContext | null {
        return this.getRuleContext(0, DictionaryAttrsContext);
    }
    public dictionaryEntry(): DictionaryEntryContext[];
    public dictionaryEntry(i: number): DictionaryEntryContext | null;
    public dictionaryEntry(i?: number): DictionaryEntryContext[] | DictionaryEntryContext | null {
        if (i === undefined) {
            return this.getRuleContexts(DictionaryEntryContext);
        }

        return this.getRuleContext(i, DictionaryEntryContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_dictionary;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterDictionary) {
             listener.enterDictionary(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitDictionary) {
             listener.exitDictionary(this);
        }
    }
}


export class DictionaryAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public conceptrefAttr(): ConceptrefAttrContext {
        return this.getRuleContext(0, ConceptrefAttrContext)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_dictionaryAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterDictionaryAttrs) {
             listener.enterDictionaryAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitDictionaryAttrs) {
             listener.exitDictionaryAttrs(this);
        }
    }
}


export class DictionaryEntryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public ENTRY(): antlr.TerminalNode {
        return this.getToken(TRSXParser.ENTRY, 0)!;
    }
    public CLOSE_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.CLOSE_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public dictionaryEntryAttrs(): DictionaryEntryAttrsContext[];
    public dictionaryEntryAttrs(i: number): DictionaryEntryAttrsContext | null;
    public dictionaryEntryAttrs(i?: number): DictionaryEntryAttrsContext[] | DictionaryEntryAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(DictionaryEntryAttrsContext);
        }

        return this.getRuleContext(i, DictionaryEntryAttrsContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_dictionaryEntry;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterDictionaryEntry) {
             listener.enterDictionaryEntry(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitDictionaryEntry) {
             listener.exitDictionaryEntry(this);
        }
    }
}


export class DictionaryEntryAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public literalAttr(): LiteralAttrContext | null {
        return this.getRuleContext(0, LiteralAttrContext);
    }
    public valueAttr(): ValueAttrContext | null {
        return this.getRuleContext(0, ValueAttrContext);
    }
    public protectedAttr(): ProtectedAttrContext | null {
        return this.getRuleContext(0, ProtectedAttrContext);
    }
    public sourcerefAttr(): SourcerefAttrContext | null {
        return this.getRuleContext(0, SourcerefAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_dictionaryEntryAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterDictionaryEntryAttrs) {
             listener.enterDictionaryEntryAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitDictionaryEntryAttrs) {
             listener.exitDictionaryEntryAttrs(this);
        }
    }
}


export class LiteralAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LITERAL(): antlr.TerminalNode {
        return this.getToken(TRSXParser.LITERAL, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_literalAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterLiteralAttr) {
             listener.enterLiteralAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitLiteralAttr) {
             listener.exitLiteralAttr(this);
        }
    }
}


export class ValueAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public VALUE(): antlr.TerminalNode {
        return this.getToken(TRSXParser.VALUE, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_valueAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterValueAttr) {
             listener.enterValueAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitValueAttr) {
             listener.exitValueAttr(this);
        }
    }
}


export class ProtectedAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public PROTECTED(): antlr.TerminalNode {
        return this.getToken(TRSXParser.PROTECTED, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_protectedAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterProtectedAttr) {
             listener.enterProtectedAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitProtectedAttr) {
             listener.exitProtectedAttr(this);
        }
    }
}


export class SamplesContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public SAMPLES(): antlr.TerminalNode[];
    public SAMPLES(i: number): antlr.TerminalNode | null;
    public SAMPLES(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.SAMPLES);
    	} else {
    		return this.getToken(TRSXParser.SAMPLES, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public sample(): SampleContext[];
    public sample(i: number): SampleContext | null;
    public sample(i?: number): SampleContext[] | SampleContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SampleContext);
        }

        return this.getRuleContext(i, SampleContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_samples;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSamples) {
             listener.enterSamples(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSamples) {
             listener.exitSamples(this);
        }
    }
}


export class SampleContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public SAMPLE(): antlr.TerminalNode[];
    public SAMPLE(i: number): antlr.TerminalNode | null;
    public SAMPLE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.SAMPLE);
    	} else {
    		return this.getToken(TRSXParser.SAMPLE, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public sampleAttrs(): SampleAttrsContext[];
    public sampleAttrs(i: number): SampleAttrsContext | null;
    public sampleAttrs(i?: number): SampleAttrsContext[] | SampleAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SampleAttrsContext);
        }

        return this.getRuleContext(i, SampleAttrsContext);
    }
    public TEXT(): antlr.TerminalNode[];
    public TEXT(i: number): antlr.TerminalNode | null;
    public TEXT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.TEXT);
    	} else {
    		return this.getToken(TRSXParser.TEXT, i);
    	}
    }
    public WS(): antlr.TerminalNode[];
    public WS(i: number): antlr.TerminalNode | null;
    public WS(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.WS);
    	} else {
    		return this.getToken(TRSXParser.WS, i);
    	}
    }
    public annotation(): AnnotationContext[];
    public annotation(i: number): AnnotationContext | null;
    public annotation(i?: number): AnnotationContext[] | AnnotationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AnnotationContext);
        }

        return this.getRuleContext(i, AnnotationContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_sample;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSample) {
             listener.enterSample(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSample) {
             listener.exitSample(this);
        }
    }
}


export class SampleAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public descriptionAttr(): DescriptionAttrContext | null {
        return this.getRuleContext(0, DescriptionAttrContext);
    }
    public countAttr(): CountAttrContext | null {
        return this.getRuleContext(0, CountAttrContext);
    }
    public intentrefAttr(): IntentrefAttrContext | null {
        return this.getRuleContext(0, IntentrefAttrContext);
    }
    public excludedAttr(): ExcludedAttrContext | null {
        return this.getRuleContext(0, ExcludedAttrContext);
    }
    public fullyVerifiedAttr(): FullyVerifiedAttrContext | null {
        return this.getRuleContext(0, FullyVerifiedAttrContext);
    }
    public protectedAttr(): ProtectedAttrContext | null {
        return this.getRuleContext(0, ProtectedAttrContext);
    }
    public sourcerefAttr(): SourcerefAttrContext | null {
        return this.getRuleContext(0, SourcerefAttrContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_sampleAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterSampleAttrs) {
             listener.enterSampleAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitSampleAttrs) {
             listener.exitSampleAttrs(this);
        }
    }
}


export class DescriptionAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DESCRIPTION(): antlr.TerminalNode {
        return this.getToken(TRSXParser.DESCRIPTION, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_descriptionAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterDescriptionAttr) {
             listener.enterDescriptionAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitDescriptionAttr) {
             listener.exitDescriptionAttr(this);
        }
    }
}


export class CountAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public COUNT(): antlr.TerminalNode {
        return this.getToken(TRSXParser.COUNT, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_countAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterCountAttr) {
             listener.enterCountAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitCountAttr) {
             listener.exitCountAttr(this);
        }
    }
}


export class IntentrefAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INTENTREF(): antlr.TerminalNode {
        return this.getToken(TRSXParser.INTENTREF, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_intentrefAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterIntentrefAttr) {
             listener.enterIntentrefAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitIntentrefAttr) {
             listener.exitIntentrefAttr(this);
        }
    }
}


export class ExcludedAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EXCLUDED(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EXCLUDED, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_excludedAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterExcludedAttr) {
             listener.enterExcludedAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitExcludedAttr) {
             listener.exitExcludedAttr(this);
        }
    }
}


export class FullyVerifiedAttrContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FULLY_VERIFIED(): antlr.TerminalNode {
        return this.getToken(TRSXParser.FULLY_VERIFIED, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(TRSXParser.EQUALS, 0)!;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(TRSXParser.STRING, 0)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_fullyVerifiedAttr;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterFullyVerifiedAttr) {
             listener.enterFullyVerifiedAttr(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitFullyVerifiedAttr) {
             listener.exitFullyVerifiedAttr(this);
        }
    }
}


export class AnnotationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPEN(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN, 0)!;
    }
    public ANNOTATION(): antlr.TerminalNode[];
    public ANNOTATION(i: number): antlr.TerminalNode | null;
    public ANNOTATION(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.ANNOTATION);
    	} else {
    		return this.getToken(TRSXParser.ANNOTATION, i);
    	}
    }
    public CLOSE(): antlr.TerminalNode[];
    public CLOSE(i: number): antlr.TerminalNode | null;
    public CLOSE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.CLOSE);
    	} else {
    		return this.getToken(TRSXParser.CLOSE, i);
    	}
    }
    public OPEN_SLASH(): antlr.TerminalNode {
        return this.getToken(TRSXParser.OPEN_SLASH, 0)!;
    }
    public S(): antlr.TerminalNode[];
    public S(i: number): antlr.TerminalNode | null;
    public S(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(TRSXParser.S);
    	} else {
    		return this.getToken(TRSXParser.S, i);
    	}
    }
    public annotationAttrs(): AnnotationAttrsContext[];
    public annotationAttrs(i: number): AnnotationAttrsContext | null;
    public annotationAttrs(i?: number): AnnotationAttrsContext[] | AnnotationAttrsContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AnnotationAttrsContext);
        }

        return this.getRuleContext(i, AnnotationAttrsContext);
    }
    public annotationContent(): AnnotationContentContext[];
    public annotationContent(i: number): AnnotationContentContext | null;
    public annotationContent(i?: number): AnnotationContentContext[] | AnnotationContentContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AnnotationContentContext);
        }

        return this.getRuleContext(i, AnnotationContentContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_annotation;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterAnnotation) {
             listener.enterAnnotation(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitAnnotation) {
             listener.exitAnnotation(this);
        }
    }
}


export class AnnotationContentContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TEXT(): antlr.TerminalNode | null {
        return this.getToken(TRSXParser.TEXT, 0);
    }
    public WS(): antlr.TerminalNode | null {
        return this.getToken(TRSXParser.WS, 0);
    }
    public annotation(): AnnotationContext | null {
        return this.getRuleContext(0, AnnotationContext);
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_annotationContent;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterAnnotationContent) {
             listener.enterAnnotationContent(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitAnnotationContent) {
             listener.exitAnnotationContent(this);
        }
    }
}


export class AnnotationAttrsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public conceptrefAttr(): ConceptrefAttrContext {
        return this.getRuleContext(0, ConceptrefAttrContext)!;
    }
    public override get ruleIndex(): number {
        return TRSXParser.RULE_annotationAttrs;
    }
    public override enterRule(listener: TRSXParserListener): void {
        if(listener.enterAnnotationAttrs) {
             listener.enterAnnotationAttrs(this);
        }
    }
    public override exitRule(listener: TRSXParserListener): void {
        if(listener.exitAnnotationAttrs) {
             listener.exitAnnotationAttrs(this);
        }
    }
}
