lexer grammar TRSXLexer;

// =============================================
// XML Declaration and Processing Instructions
// =============================================
XMLDeclOpen : '<?xml' -> pushMode(INSIDE);
COMMENT : '<!--' .*? '-->' -> skip;
CDATA : '<![CDATA[' .*? ']]>' -> skip;
DTD : '<!' .*? '>' -> skip;

// =============================================
// Tag Delimiters
// =============================================
OPEN : '<' -> pushMode(INSIDE);
OPEN_SLASH : '</' -> pushMode(INSIDE);

// =============================================
// Content Handling
// =============================================
// TEXT matches any non-whitespace content between tags
// WS is used for whitespace handling between elements
TEXT : ~[<&\r\n\t ]+ | [ \t]+;
WS : [ \t\r\n]+ -> skip;

// =============================================
// Entity and Character References
// =============================================
EntityRef : '&' [a-zA-Z]+ ';';
CharRef : '&#' [0-9]+ ';' | '&#x' [0-9a-fA-F]+ ';';

// =============================================
// INSIDE Mode - Handles content within tags
// =============================================
mode INSIDE;
// Tag closing delimiters
SPECIAL_CLOSE : '?>' -> popMode;  // For XML declaration
CLOSE : '>' -> popMode;           // For regular tags
CLOSE_SLASH : '/>' -> popMode;    // For self-closing tags
EQUALS : '=' -> pushMode(ATTVALUE);
S : [ \t\r\n]+ -> skip;

// =============================================
// XML Declaration Attributes
// =============================================
ENCODING : 'encoding';
STANDALONE : 'standalone';

// =============================================
// Project-level Attributes
// =============================================
XMLNS : 'xmlns';
XMLNS_NUANCE : 'xmlns:nuance';
XML_LANG : 'xml:lang';
NUANCE_VERSION : 'nuance:version';
NUANCE_ENGINE_PACK_VERSION : 'nuance:enginePackVersion';

// =============================================
// Element Names
// =============================================
PROJECT : 'project';
METADATA : 'metadata';
ENTRY : 'entry';
SOURCES : 'sources';
SOURCE : 'source';
ONTOLOGY : 'ontology';
INTENTS : 'intents';
INTENT : 'intent';
LINKS : 'links';
LINK : 'link';
CONCEPTS : 'concepts';
CONCEPT : 'concept';
SETTINGS: 'settings';
SETTING: 'setting';
RELATIONS: 'relations';
RELATION: 'relation';
DICTIONARIES : 'dictionaries';
DICTIONARY : 'dictionary';
SAMPLES : 'samples';
SAMPLE : 'sample';
ANNOTATION : 'annotation';
SOURCEREF : 'sourceref';

// =============================================
// Common Attributes
// =============================================
VERSION : 'version';
KEY : 'key';
BASE : 'base';
NAME_ATTR : 'name';
FREETEXT : 'freetext';
CONCEPTREF : 'conceptref';
INTENTREF : 'intentref';
COUNT : 'count';
LITERAL : 'literal';
VALUE : 'value';
PROTECTED: 'protected';
DESCRIPTION: 'description';
EXCLUDED: 'excluded';
FULLY_VERIFIED: 'fullyVerified';
DATATYPE: 'dataType';
DYNAMIC: 'dynamic';
RULE_GRAMMAR_FILE: 'ruleGrammarFileName';
TYPE: 'type';

// =============================================
// Source Attributes
// =============================================
SOURCE_DISPLAY_NAME : 'displayName';
SOURCE_URI : 'uri';
SOURCE_USE_FOR_OOV : 'useForOOV';


// =============================================
// Name Patterns
// =============================================
// Must come after all keywords to avoid conflicts
PREFIXED_NAME : [a-zA-Z]+ ':' [a-zA-Z]+;
NAME : [a-zA-Z]+;

// =============================================
// ATTVALUE Mode - Handles attribute values
// =============================================
mode ATTVALUE;
ATTVALUE_WS : [ \t\r\n]+ -> skip;
// STRING matches both single and double quoted values
STRING : ('"' (~[<&"])* '"' | '\'' (~[<&'])* '\'') -> popMode;
