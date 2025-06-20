parser grammar TRSXParser;

options { tokenVocab=TRSXLexer; }

// =============================================
// Error Handling and Recovery
// =============================================
// Catch-all rule for unexpected tokens
unexpectedToken : . ;

// =============================================
// Document Structure
// =============================================
// Root rule: A document consists of an optional XML declaration followed by a project element
// Example:
// <?xml version="1.0" encoding="UTF-8"?>
// <project xmlns="..." xmlns:nuance="..." xml:lang="en" nuance:version="1.0">
//   ...
// </project>
document : xmlDecl? project EOF;

// =============================================
// XML Declaration
// =============================================
// XML declaration with optional attributes (version, encoding, standalone)
// version is required, encoding and standalone are optional
// Example: <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
xmlDecl : XMLDeclOpen xmlDeclAttrs SPECIAL_CLOSE;
xmlDeclAttrs : xmlDeclAttr+;
xmlDeclAttr : versionAttr | encodingAttr | standaloneAttr;
versionAttr : VERSION EQUALS STRING;
encodingAttr : ENCODING EQUALS STRING;
standaloneAttr : STANDALONE EQUALS STRING;

// =============================================
// Common attributes
// =============================================
nameAttr : NAME_ATTR EQUALS STRING;
sourcerefAttr : SOURCEREF EQUALS STRING;
conceptrefAttr: CONCEPTREF EQUALS STRING;

// =============================================
// Project Structure
// =============================================
// Project element with optional metadata, ontology, dictionaries, and samples
// Required attributes: xmlns:nuance, xml:lang, nuance:version
// Example:
// <project xmlns:nuance="https://developer.nuance.com/mix/nlu/trsx"
//          xml:lang="eng-USA"
//          nuance:version="2.6"
//          nuance:enginePackVersion="hosted">
project : OPEN PROJECT S* projectAttrs* S* CLOSE projectElements* OPEN_SLASH PROJECT CLOSE;
projectElements: metadata | sources | ontology | dictionaries | samples;
projectAttrs : xmlnsAttr | xmlnsNuanceAttr | xmlLangAttr | nuanceVersionAttr | nuanceEnginePackVersionAttr;
xmlnsAttr : XMLNS EQUALS STRING;
xmlnsNuanceAttr : XMLNS_NUANCE EQUALS STRING;
xmlLangAttr : XML_LANG EQUALS STRING;
nuanceVersionAttr : NUANCE_VERSION EQUALS STRING;
nuanceEnginePackVersionAttr : NUANCE_ENGINE_PACK_VERSION EQUALS STRING;

// =============================================
// Metadata Structure
// =============================================
// Metadata section containing multiple entries
// Each entry must have a key attribute
// Example:
// <metadata>
//   <entry key="created_at">2020-02-12 16:42:44+00:00</entry>
//   <entry key="description">Sample model for demonstration</entry>
// </metadata>
metadata : OPEN METADATA S* CLOSE entry* OPEN_SLASH METADATA CLOSE;
entry : OPEN ENTRY S* entryAttrs* S* CLOSE entryContent* OPEN_SLASH ENTRY CLOSE;
entryContent : TEXT | WS;
entryAttrs : keyAttr;
keyAttr: KEY EQUALS STRING;

// =============================================
// Sources Structure
// =============================================
// Sources section containing multiple source definitions
// Each source must have a name attribute
// Example:
// <sources>
//   <source name="nuance_custom_data" displayName="nuance_custom_data" version="1.0" type="CUSTOM" useForOOV="true"/>
// </sources>
sources : OPEN SOURCES S* CLOSE source* OPEN_SLASH SOURCES CLOSE;
source : OPEN SOURCE S* sourceAttrs* S* CLOSE_SLASH
       | OPEN SOURCE S* sourceAttrs* S* CLOSE links? OPEN_SLASH SOURCE CLOSE;
sourceAttrs : nameAttr | sourceDisplayNameAttr | sourceUriAttr | sourceVersionAttr | typeAttr | sourceUseForOOVAttr;
sourceDisplayNameAttr : SOURCE_DISPLAY_NAME EQUALS STRING;
sourceUriAttr : SOURCE_URI EQUALS STRING;
sourceVersionAttr : VERSION EQUALS STRING;
sourceUseForOOVAttr : SOURCE_USE_FOR_OOV EQUALS STRING;

// Ontology Structure
// =============================================
// Ontology section containing intents and concepts
// Must have a base attribute
// Example:
// <ontology base="http://example.com/ontology">
//   <intents>...</intents>
//   <concepts>...</concepts>
// </ontology>
ontology : OPEN ONTOLOGY S* ontologyAttrs* S* CLOSE intents? concepts? OPEN_SLASH ONTOLOGY CLOSE;
ontologyAttrs : baseAttr;
baseAttr: BASE EQUALS STRING;

// =============================================
// Intents Structure
// =============================================
// Intents section containing multiple intent definitions
// Each intent must have a name attribute
// Example:
// <intents>
//   <intent name="greeting">
//     <links>...</links>
//   </intent>
// </intents>
intents : OPEN INTENTS S* CLOSE intent* OPEN_SLASH INTENTS CLOSE;
intent : OPEN INTENT S* intentAttrs+  S* CLOSE_SLASH
       | OPEN INTENT S* intentAttrs+  S* CLOSE links? OPEN_SLASH INTENT CLOSE;
intentAttrs: nameAttr | sourcerefAttr;



// =============================================
// Links Structure
// =============================================
// Links section containing concept references
// Each link must have a conceptref attribute
// Example:
// <links>
//   <link conceptref="greeting_phrase"/>
// </links>
links : OPEN LINKS S* CLOSE link* OPEN_SLASH LINKS CLOSE;
link : OPEN LINK S* linkAttrs* S* CLOSE_SLASH;
linkAttrs : conceptrefAttr | sourcerefAttr;

// =============================================
// Concepts Structure
// =============================================
// Concepts section containing concept definitions
// Each concept must have either name or freetext attribute
// Example:
// <concepts>
//   <concept name="greeting_phrase"/>
//   <concept freetext="true"/>
// </concepts>
concepts : OPEN CONCEPTS S* CLOSE concept* OPEN_SLASH CONCEPTS CLOSE;
concept : OPEN CONCEPT S* conceptAttrs* S* CLOSE_SLASH
		| OPEN CONCEPT S* conceptAttrs* S* CLOSE conceptElements* OPEN_SLASH CONCEPT CLOSE;
conceptElements: settings | relations;

conceptAttrs : nameAttr | dataTypeAttr | freetextAttr | dynamicAttr | ruleGrammarFileNameAttr | sourcerefAttr;
dataTypeAttr : DATATYPE EQUALS STRING;
freetextAttr : FREETEXT EQUALS STRING;
dynamicAttr : DYNAMIC EQUALS STRING;
ruleGrammarFileNameAttr : RULE_GRAMMAR_FILE EQUALS STRING;

settings: OPEN SETTINGS S* CLOSE setting* OPEN_SLASH SETTINGS CLOSE;
setting :  OPEN SETTING S* settingAttrs* S*  CLOSE_SLASH;
settingAttrs : nameAttr | valueAttr;

relations: OPEN RELATIONS S* CLOSE relation* OPEN_SLASH RELATIONS CLOSE;
relation : OPEN RELATION S* relationAttrs* S* CLOSE_SLASH;
relationAttrs : typeAttr | conceptrefAttr | sourcerefAttr;
typeAttr: TYPE EQUALS STRING;

// =============================================
// Dictionaries Structure
// =============================================
// Dictionaries section containing dictionary definitions and entries
// Each dictionary must have a conceptref attribute
// Each entry must have literal and value attributes
// Example:
// <dictionaries>
//   <dictionary conceptref="eCity">
//     <entry literal="Atlanta" value="Atlanta"/>
//     <entry literal="New York" value="New York City"/>
//   </dictionary>
// </dictionaries>
dictionaries : OPEN DICTIONARIES S* CLOSE dictionary* OPEN_SLASH DICTIONARIES CLOSE;
dictionary : OPEN DICTIONARY S* dictionaryAttrs? S* CLOSE dictionaryEntry* OPEN_SLASH DICTIONARY CLOSE;
dictionaryAttrs : conceptrefAttr;

dictionaryEntry : OPEN ENTRY S* dictionaryEntryAttrs* S* CLOSE_SLASH;
dictionaryEntryAttrs : literalAttr | valueAttr | protectedAttr | sourcerefAttr;
literalAttr : LITERAL EQUALS STRING;
valueAttr : VALUE EQUALS STRING;
protectedAttr : PROTECTED EQUALS STRING;

// =============================================
// Samples Structure
// =============================================
// Samples section containing sample text with annotations
// Each sample must have intentref and count attributes
// Example:
// <samples>
//   <sample intentref="greeting" count="1">
//     Hello, how are you?
//     <annotation conceptref="greeting_phrase">Hello</annotation>
//   </sample>
// </samples>
samples : OPEN SAMPLES S* CLOSE sample* OPEN_SLASH SAMPLES CLOSE;
sample : OPEN SAMPLE S* sampleAttrs* S* CLOSE (TEXT | WS | annotation)* OPEN_SLASH SAMPLE CLOSE;
sampleAttrs : descriptionAttr | countAttr | intentrefAttr | excludedAttr | fullyVerifiedAttr | protectedAttr | sourcerefAttr;
descriptionAttr : DESCRIPTION EQUALS STRING;
countAttr : COUNT EQUALS STRING;
intentrefAttr : INTENTREF EQUALS STRING;
excludedAttr : EXCLUDED EQUALS STRING;
fullyVerifiedAttr : FULLY_VERIFIED EQUALS STRING;

// =============================================
// Annotation Structure
// =============================================
// Nested annotations within samples
// Each annotation must have a conceptref attribute
// Example:
// <annotation conceptref="greeting_phrase">Hello</annotation>
annotation : OPEN ANNOTATION S* annotationAttrs* S* CLOSE annotationContent* OPEN_SLASH ANNOTATION CLOSE;
annotationContent : TEXT | WS | annotation;
annotationAttrs : conceptrefAttr;
