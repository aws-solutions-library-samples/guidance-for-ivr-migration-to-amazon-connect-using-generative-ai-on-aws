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

export interface DialogAppDefinition {
	data: Project;
}

/**
 * Represents a Mix Dialog project specification
 * @see https://docs.nuance.com/mix/reference/app-spec/specification/project/
 */
export interface Project {
	/** Unique identifier of the project */
	id: string;

	/** Name of the project */
	name: string;

	/** Default locale used by the project */
	defaultLocale: string;

	/** List of locales supported by the project */
	supportedLocales: string[];

	/** @deprecated Color mappings for connectors in the visual editor */
	connectorColors: { [key: string]: string };

	/** Base service URL for the project */
	baseServiceUrl: string;

	/** Static project identifier */
	staticProjectId: string;

	/** Project version */
	version: string;

	/** List of channels supported by the project */
	supportedChannels: Channel[];

	/** @deprecated List of custom channels supported by the project */
	supportedCustomChannels: unknown[];

	/** @deprecated List of channels that support rich text */
	richTextChannels: unknown[];

	/** Global confirmation configurations */
	globalConfirmations: Confirmation[];

	/** List of dialog components in the project */
	components: Component[];

	/** Recovery configurations */
	recovery: RecoveryHandling[];

	/** List of project variables */
	variables: Variable[];

	/** List of complex variable type definitions */
	complexVariableTypes: Schema[];

	/** Messages used in the project */
	promptGroups: PromptGroup[];

	/** Parent project identifier */
	parentId: string;

	/** Ontology identifier */
	ontologyId: string;

	/** Project ontology configuration */
	ontology: Ontology;

	/** @deprecated Global settings for the project */
	globalSettings: any[];

	/** Backend configuration settings */
	backendConfig: BackendConnectionPreset[];

	/** Project upgrade version number */
	upgradeVersion: number;

	/** List of project events */
	events: Event[];

	/** Entity ID for global commands */
	globalCommandsEntityId: string;

	/** List of global commands */
	globalCommands: Command[];

	/** Dress aliases configurations */
	dressAliases: DataHostAlias[];

	/** List of global setting overrides */
	globalSettingOverrides: GlobalSettingOverride[];

	/** NDF version specification */
	ndfVersion: string;

	/** Project intent mappings */
	projectIntentMappings: ProjectIntentMapping[];

	/** Engine pack version */
	enginePackVersion: string;

	/** Environment-specific configurations */
	environmentConfigurations: EnvironmentConfiguration[];

	/** Timestamp of the version */
	versionTimestamp: string;

	/** Last modification timestamp */
	lastModified: string;
}

/**
 * Represents an environment configuration in the project.
 * Currently limited to specifying the default base URL for external grammars.
 */
export interface EnvironmentConfiguration {
	/**
	 * Label indicating the type of configuration.
	 * Will be "GRAMMAR_BASE_PATH" if the project is configured with a default base URL for external grammars.
	 */
	label: 'GRAMMAR_BASE_PATH';

	/**
	 * Default base URL for external grammars.
	 * Example: "http://myfileserver:9000"
	 */
	value: string;
}

/**
 * Represents a data host alias for server-side integration.
 */
export interface DataHostAlias {
	/**
	 * Numeric ID of the connection profile for the backend system.
	 */
	id: string;

	/**
	 * Alias name for a web service used for backend access in a server-side integration.
	 */
	alias: string;

	/**
	 * Default URL for the alias.
	 * @remarks This field is optional.
	 */
	defaultValue?: string;
}

/**
 * Represents a backend connection preset to be applied to a data access node for server-side integration.
 */
export interface BackendConnectionPreset {
	/**
	 * UUID of the preset.
	 */
	id: string;

	/**
	 * Name of the preset.
	 */
	name: string;

	/**
	 * URL extension (maximum 2000 characters).
	 */
	urlExtension: string;

	/**
	 * Fetch timeout in milliseconds.
	 * @default 0
	 */
	fetchTimeout: number;

	/**
	 * Connection timeout in milliseconds.
	 * @default 0
	 */
	connectTimeout: number;

	/**
	 * HTTP method used for the request.
	 * One of: "POST", "GET", "PUT", "DELETE", "PATCH", "NOT_SET".
	 * @default "NOT_SET"
	 */
	method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH' | 'NOT_SET';

	/**
	 * Deprecated: use `dressAliasId` instead.
	 */
	dressName?: string;

	/**
	 * Headers used to query the backend system.
	 */
	headers: Header[];

	/**
	 * Numeric ID of the connection profile for the backend system.
	 */
	dressAliasId: string;
}

/**
 * Represents a header in the backend connection data for a data access node,
 * or in a backend connection preset.
 */
export interface Header {
	/**
	 * Name of the header.
	 */
	key: string;

	/** Static header data (maximum 2048 characters) */
	constant?: string;

	/** Variable used as dynamic header data */
	variable?: Variable;

	/** Complex variable field, used as dynamic header data */
	variableExpression?: VariableExpression;

	/**
	 * Only present for headers of type `variable`.
	 * UUID of the variable (or `SYS_VAR_channel` if using the predefined variable channel).
	 */
	variableId?: string;

	/**
	 * Only present for headers of type `variableExpression`.
	 * UUID of the complex variable field.
	 */
	variableExpressionId?: string;
}

/**
 * Represent a global (default) or channel-specific error recovery handling.
 */
export interface RecoveryHandling {
	/** UUID of the recovery behavior */
	id: string;
	/** @deprecated */
	globalValue?: string;
	/** Error handling for the recovery behavior */
	recoveryBehaviors: RecoveryBehavior[];
	/** UUID of the channel */
	channelId: string;
}

/**
 * Represents a global confirmation behavior.
 */
export interface Confirmation {
	/** UUID of the confirmation behavior */
	id: string;

	/** @deprecated */
	globalValue?: string;

	/** Error handling for the confirmation behavior */
	confirmationRecoveryBehaviors: RecoveryBehavior[];

	/** Information type for this confirmation behavior—one of: DEFAULT, ALPHANUM, DIGITS, DATE, TIME, CURRENCY, YESNO */
	entityType: string;

	/** UUID of the channel */
	channelId: string;
}

/**
 * Represents a global or channel-specific recovery behavior for confirmation or error recovery handling.
 */
export interface RecoveryBehavior {
	/** Event ID—nomatch1-pre-prompt, nomatch1-prompt, yes-prompt, no-prompt, for example */
	event: string;

	/**  @deprecated event includes the escalation level */
	escalationLevel: number;

	/** Processing items to perform */
	processingItemsList: ProcessingItemGroup;

	/** true if the global recovery behavior is enabled; otherwise, false */
	enabled: boolean;
}

/**
 * Represents a communication channel used to interact with the system
 * (for example, IVR, Web, SMS).
 */
export interface Channel {
	/**
	 * Unique ID of the channel.
	 */
	id: string;

	/**
	 * Name of the channel.
	 * Default is a reserved name for the combination of all channels in a project.
	 */
	displayName: string;

	/**
	 * @deprecated.
	 */
	codeName?: string;

	/**
	 * @deprecated..
	 */
	modes?: unknown[];

	/**
	 * Indicates whether the channel is disabled.
	 * `true` if disabled; otherwise, `false`.
	 */
	disabled: boolean;

	/**
	 * Color code for the channel (e.g., "#31B96E").
	 */
	connectorColor: string;

	/**
	 * Modalities available for messages in this channel.
	 */
	channelModes: Modality[];

	/**
	 * Date and time of the last modification.
	 */
	lastModified: string;
}

/**
 * Represents a modality in a channel.
 */
export interface Modality {
	/**
	 * UUID of the modality.
	 */
	id: string;

	/**
	 * UUID of the channel this modality belongs to.
	 */
	channelId: string;

	/**
	 * One of the supported output or input modalities.
	 */
	name: string;

	/**
	 * Indicates whether the modality is disabled.
	 * `true` if disabled; otherwise, `false`.
	 */
	disabled: boolean;

	/**
	 * Date and time of the last modification.
	 */
	lastModified: string;
}

/**
 * Represents a group of nodes that make up a flow in the project.
 */
export interface Component {
	/**
	 * Unique ID of the component.
	 */
	id: string;

	/**
	 * Name of the component.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * "intent" if the component is an intent component; otherwise, empty.
	 */
	description: string;

	/**
	 * Nodes in the component.
	 */
	nodes: Node[];

	/**
	 * Global event handlers (if in Main), or component-level event handlers (in other components).
	 */
	eventHandlers: EventHandler[];

	/**
	 * UUID of the intent that is mapped to the component, if this is an intent component; otherwise, empty.
	 */
	intentId: string;

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents an event handler in the project.
 * It can be a global event handler (in Main), a component-level event handler,
 * or a node-level event handler.
 */
export interface EventHandler {
	/**
	 * UUID of the event handler.
	 */
	id: string;

	/**
	 * UUID of the event this handler responds to.
	 */
	eventId: string;

	/**
	 * Transition to perform when the specified event is thrown.
	 */
	transition: Transition;

	/**
	 * UUID of the transition to perform.
	 */
	transitionId: string;

	/**
	 * Indicates whether the handler is for a predefined event.
	 * `true` if reserved; `false` otherwise.
	 */
	reserved: boolean;

	/**
	 * UUID of the component where this event handler is defined (if global or component-level).
	 */
	componentId?: string;

	/**
	 * UUID of the node where this handler is defined (only for node-level handlers).
	 */
	nodeId?: string;
}

/**
 * Represents a node in a component.
 */
export interface Node {
	/**
	 * UUID of the node.
	 */
	id: string;

	/**
	 * UUID of the parent component to which this node belongs.
	 */
	parentComponentId: string;

	recognitionNode2?: QuestionAndAnswerNode;
	messageNode?: MessageNode;
	decisionNode?: DecisionNode;
	dataAccessNode?: DataAccessNode;
	controllerNode?: QuestionRouterNode;
	intentMapperNode2?: IntentMapperNode;
	componentNode?: ComponentCallNode;
	startNode?: StartOrEnterNode;
	externalactionNode?: ExternalActionsNode;

	/** @deprecated */
	endNode?: unknown;

	/** @deprecated */
	transferNode?: unknown;

	/**
	 * Node-level event handlers.
	 * These override component-level and global event handlers.
	 */
	eventHandlers: EventHandler[];
}

/**
 * Represents an external actions node used to end a conversation,
 * transfer to another system, or escalate to a live agent.
 * Identified by the key `externalactionNode` in a node object.
 */
export interface ExternalActionsNode {
	/**
	 * Name of the node.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * Description of the node (maximum 1000 characters).
	 */
	description: string;

	/**
	 * Type of external action to perform.
	 * Either "END" or "ESCALATE".
	 */
	actionType: 'END' | 'ESCALATE';

	/**
	 * Only present if `actionType` is "ESCALATE" and a specific type of transfer action is required.
	 * Applies to IVR applications only and requires engine pack 2.4 or later.
	 */
	escalationDetails?: EscalationDetails;

	/**
	 * Key-value pairs representing variables, entities, and other objects
	 * to pass on to the client application.
	 */
	inputVariablesConcepts: SupportedInputType[];

	/**
	 * One or more variables to be returned by the client application.
	 */
	outputVariables: Variable[];

	/**
	 * Only present if `actionType` is "ESCALATE".
	 * Transition to perform if the client returns with a success status.
	 */
	successTransition?: Transition;

	/**
	 * Only present if `actionType` is "ESCALATE".
	 * Transition to perform if the client returns with a failure status.
	 */
	failureTransition?: Transition;

	/**
	 * UUID of the success transition.
	 */
	successTransitionId?: string;

	/**
	 * UUID of the failure transition.
	 */
	failureTransitionId?: string;

	/**
	 * UUIDs of the variables to be returned by the client application.
	 * May include `SYS_VAR_channel` if using the predefined variable channel.
	 */
	outputVariableIds: string[];

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents a type of transfer action and its destination.
 * Applies to IVR applications only and requires engine pack 2.4 or later.
 */
export interface EscalationDetails {
	/**
	 * Type of escalation to perform.
	 * One of the supported transfer types (e.g., "WARM_TRANSFER", "COLD_TRANSFER", etc.).
	 */
	escalationType: string;

	/** Constant used as the transfer destination (maximum 255 characters) */
	destinationConstant?: string;

	/** Variable used as the transfer destination */
	destinationVariable?: Variable;
}

/**
 * Represents the Start or Enter node in a dialog flow.
 * The Start node marks the beginning of the application,
 * while the Enter node marks the beginning of a component.
 * Identified by the key `startNode` in a node object.
 */
export interface StartOrEnterNode {
	/**
	 * Name of the node.
	 * Always "start".
	 */
	name: string;

	/**
	 * Description of the node (maximum 1000 characters).
	 */
	description: string;

	/**
	 * Processing items to perform at the start of the application or component.
	 * Supports elements of type `action` only.
	 */
	processingItems: ProcessingItemGroup;

	/**
	 * UUID of the next node in the dialog flow.
	 */
	nodeId: string;

	/**
	 * UUID of the `processingItems` group.
	 */
	processingItemsId: string;

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents a component call node, which allows the dialog flow to
 * enter another component and defines the return point from that component.
 * Identified by the key `componentNode` in a node object.
 */
export interface ComponentCallNode {
	/**
	 * Name of the node.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * Description of the node (maximum 1000 characters).
	 */
	description: string;

	/**
	 * UUID of the component to invoke.
	 */
	componentId: string;

	/**
	 * Processing items to perform upon return from the invoked component.
	 * Supports elements of type `transition` only.
	 */
	processingItems: ProcessingItemGroup;

	/**
	 * UUID of the `processingItems` group.
	 */
	processingItemsId: string;

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents an intent mapper node, which handles data for NLU/call routing menus.
 * Identified by the key `intentMapperNode2` in a node object.
 */
export interface IntentMapperNode {
	/**
	 * Name of the node.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * Description of the node (maximum 1000 characters).
	 */
	description: string;

	/**
	 * Intent mappings specific to this node.
	 * These override any corresponding global intent mappings.
	 */
	intentMappings: NodeIntentMapping[];

	/**
	 * Transition to execute when returning from a mapped component
	 * after completing the interaction associated with an intent.
	 */
	transition: Transition;

	/**
	 * UUID of the transition to perform upon return.
	 */
	transitionId: string;

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents the local mapping of one intent to a component or node
 * within an intent mapper node.
 */
export interface NodeIntentMapping {
	/**
	 * UUID of the intent mapping.
	 */
	id: string;

	/**
	 * UUID of the intent mapper node this mapping belongs to.
	 */
	nodeId: string;

	/**
	 * UUID of the intent being mapped.
	 */
	intentId: string;

	/**
	 * Key-value pair that maps the intent to a destination.
	 * The destination can be a component or a specific node.
	 */
	destination: NodeIntentMappingDestination;
}

/**
 * Represents the destination for a node-level intent mapping override.
 * The destination can be either a component or a specific node.
 */
export type NodeIntentMappingDestination =
	| {
			/**
			 * UUID of the component to which the intent is mapped.
			 */
			componentId: string;
	  }
	| {
			/**
			 * UUID of the node to which the intent is mapped.
			 */
			nodeId: string;
	  };

/**
 * Represents a question router node, which collects multiple pieces of information
 * and determines the next node in the dialog flow based on what was collected.
 * Identified by the key `controllerNode` in a node object.
 */
export interface QuestionRouterNode {
	/**
	 * Name of the node.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * Description of the node (maximum 1000 characters).
	 */
	description: string;

	/**
	 * Optional transition to execute before collection begins.
	 */
	initialTransition?: ProcessingItemGroup;

	/**
	 * Mandatory transition specifying where to go after collection is completed.
	 */
	finalTransition: ProcessingItemGroup;

	/**
	 * List of entities (concepts) to handle in this router.
	 */
	concepts: EntityReference[];

	/**
	 * Indicates whether intent switching is disabled.
	 * `true` to disable; `false` (default) to allow.
	 */
	intentSwitchingDisabled: boolean;

	/**
	 * Transition to execute when intent switching is detected
	 * and `intentSwitchingDisabled` is `false`.
	 */
	intentSwitchTransition?: Transition;

	/**
	 * UUID of the `intentSwitchTransition` group.
	 */
	intentSwitchTransitionId?: string;

	/**
	 * UUID of the `initialTransition` group.
	 */
	initialTransitionId?: string;

	/**
	 * UUID of the `finalTransition` group.
	 */
	finalTransitionId: string;

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents an entity to handle in a question router node.
 */
export interface EntityReference {
	/**
	 * UUID of the entity.
	 */
	conceptId: string;

	/**
	 * Optional expression used to determine that collection should not be skipped for this entity.
	 */
	collectExpression?: Expression;

	/**
	 * UUID of the node to go to for collecting this entity.
	 */
	collectGotoNodeId: string;

	/**
	 * Optional expression to perform after entity collection.
	 */
	processExpression?: Expression;

	/**
	 * UUID of the node to go to after entity collection.
	 */
	processGotoNodeId: string;

	/**
	 * Optional expression to determine whether multiple mentions of the entity should be supported.
	 */
	multiConceptExpression?: Expression;

	/**
	 * UUID of `collectExpression`.
	 */
	collectExpressionId?: string;

	/**
	 * UUID of `processExpression`.
	 */
	processExpressionId?: string;

	/**
	 * UUID of `multiConceptExpression`.
	 */
	multiConceptExpressionId?: string;

	/**
	 * Legacy name of the entity.
	 * @deprecated Kept for backward compatibility.
	 */
	conceptName?: string;

	/**
	 * Indicates whether the entity must be manually marked as complete and confirmed.
	 * `true` if manual completion is required; `false` if handled automatically (default).
	 */
	manualComplete: boolean;
}

/**
 * Represents an expression used in the project.
 * Expressions can be used in conditions, assign actions, entity references, or nested within other expressions.
 * Composed of a left operand, an operator, and a right operand.
 */
export interface Expression {
	/**
	 * UUID of the expression.
	 */
	id: string;

	/**
	 * Left operand in the expression.
	 * A key-value pair representing one of the supported left operand types.
	 */
	leftOperand: Record<string, SupportedLeftOperand>;

	/**
	 * Operator used in the expression.
	 * A key-value pair representing one of the supported operator types.
	 */
	operator: Record<string, SupportedOperator>;

	/**
	 * Right operand in the expression.
	 * A key-value pair representing one of the supported right operand types.
	 */
	rightOperand: Record<string, SupportedRightOperand>;

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-10-17T20:55:38.488Z`).
	 */
	lastModified: string;

	/**
	 * UUID of the variable for left operand, if the type is `leftVariable`.
	 * May include `SYS_VAR_channel` for predefined variables.
	 */
	leftVariableId?: string;

	/**
	 * UUID of the element if the left operand is of type `leftVariableExpression`.
	 */
	leftVariableExpressionId?: string;

	/**
	 * UUID of a nested expression if the left operand is of type `leftExpression`.
	 */
	leftExpressionId?: string;

	/**
	 * UUID of the variable for right operand, if the type is `rightVariable`.
	 * May include `SYS_VAR_channel` for predefined variables.
	 */
	rightVariableId?: string;

	/**
	 * UUID of the element if the right operand is of type `rightVariableExpression`.
	 */
	rightVariableExpressionId?: string;

	/**
	 * UUID of a nested expression if the right operand is of type `rightExpression`.
	 */
	rightExpressionId?: string;
}

/**
 * Represents a supported left operand in an expression.
 */
export type SupportedLeftOperand =
	| {
			/**
			 * Variable used as the left operand.
			 */
			leftVariable: Variable;
	  }
	| {
			/**
			 * Complex variable field, or the result of a method on a variable.
			 */
			leftVariableExpression: VariableExpression;
	  }
	| {
			/**
			 * Nested expression used as the left operand.
			 */
			leftExpression: Expression;
	  }
	| {
			/**
			 * UUID of the entity whose value is used as the left operand.
			 */
			leftConceptId: string;
	  }
	| {
			/**
			 * UUID of the entity whose literal is used as the left operand.
			 */
			leftConceptIdLiteral: string;
	  }
	| {
			/**
			 * UUID of the entity whose formatted literal is used as the left operand.
			 */
			leftConceptIdFormattedLiteral: string;
	  }
	| {
			/**
			 * Intent-related property used as the left operand.
			 * One of:
			 * - INTENT_VALUE
			 * - INTENT_LITERAL
			 * - INTENT_FORMATTED_LITERAL
			 * - INTENT_CONFIDENCE
			 */
			leftIntent: 'INTENT_VALUE' | 'INTENT_LITERAL' | 'INTENT_FORMATTED_LITERAL' | 'INTENT_CONFIDENCE';
	  }
	| {
			/**
			 * Special operand used as the left operand.
			 * One of:
			 * - LAST_COLLECTION_INTERPRETATION
			 * - LAST_CONFIRMATION_INTERPRETATION
			 * - NULL
			 */
			leftSpecialOperand: 'LAST_COLLECTION_INTERPRETATION' | 'LAST_CONFIRMATION_INTERPRETATION' | 'NULL';
	  };

/**
 * Represents a supported operator in an expression.
 */
export type SupportedOperator =
	| {
			/**
			 * Logical operator used in the expression.
			 * One of:
			 * - NO_LOGICAL_OPERATOR
			 * - AND_OPERATOR
			 * - OR_OPERATOR
			 */
			logicalOperator: 'NO_LOGICAL_OPERATOR' | 'AND_OPERATOR' | 'OR_OPERATOR';
	  }
	| {
			/**
			 * Mathematical operator used in the expression.
			 * One of:
			 * - NO_OP
			 * - PLUS
			 * - MINUS
			 * - TIMES
			 * - DIVIDE
			 * - MOD
			 */
			mathematicalOperator: 'NO_OP' | 'PLUS' | 'MINUS' | 'TIMES' | 'DIVIDE' | 'MOD';
	  }
	| {
			/**
			 * Relational operator used in the expression.
			 * One of:
			 * - NO_RELATIONAL_OPERATOR
			 * - EQUAL_OPERATOR
			 * - NOT_EQUAL_OPERATOR
			 * - LESS_OPERATOR
			 * - GREATER_OPERATOR
			 * - LESS_EQUAL_OPERATOR
			 * - GREATER_EQUAL_OPERATOR
			 */
			relationalOperator:
				| 'NO_RELATIONAL_OPERATOR'
				| 'EQUAL_OPERATOR'
				| 'NOT_EQUAL_OPERATOR'
				| 'LESS_OPERATOR'
				| 'GREATER_OPERATOR'
				| 'LESS_EQUAL_OPERATOR'
				| 'GREATER_EQUAL_OPERATOR';
	  };

/**
 * Represents a supported right operand in an expression.
 */
export type SupportedRightOperand =
	| {
			/**
			 * Constant string value used as the right operand (max 255 characters).
			 */
			rightConstant: string;
	  }
	| {
			/**
			 * Variable used as the right operand.
			 */
			rightVariable: Variable;
	  }
	| {
			/**
			 * Complex variable field, or result of a method on a variable.
			 */
			rightVariableExpression: VariableExpression;
	  }
	| {
			/**
			 * Expression used as the right operand (can be nested).
			 */
			rightExpression: Expression;
	  }
	| {
			/**
			 * UUID of the entity whose value is used as the right operand.
			 */
			rightConceptId: string;
	  }
	| {
			/**
			 * UUID of the entity whose literal is used as the right operand.
			 */
			rightConceptIdLiteral: string;
	  }
	| {
			/**
			 * UUID of the entity whose formatted literal is used as the right operand.
			 */
			rightConceptIdFormattedLiteral: string;
	  }
	| {
			/**
			 * Intent-related value used as the right operand.
			 * One of:
			 * - INTENT_VALUE
			 * - INTENT_LITERAL
			 * - INTENT_FORMATTED_LITERAL
			 * - INTENT_CONFIDENCE
			 */
			rightIntent: 'INTENT_VALUE' | 'INTENT_LITERAL' | 'INTENT_FORMATTED_LITERAL' | 'INTENT_CONFIDENCE';
	  }
	| {
			/**
			 * Special operand used as the right operand.
			 * One of:
			 * - LAST_COLLECTION_INTERPRETATION
			 * - LAST_CONFIRMATION_INTERPRETATION
			 * - NULL
			 */
			rightSpecialOperand: 'LAST_COLLECTION_INTERPRETATION' | 'LAST_CONFIRMATION_INTERPRETATION' | 'NULL';
	  }
	| {
			/**
			 * UUID of the channel, only used when left operand is SYS_VAR_channel.
			 */
			rightChannelId: string;
	  };

/**
 * Represents a data access node that exchanges information with an external system,
 * typically by retrieving data from a backend service.
 * Identified by the key `dataAccessNode` in a node object.
 *
 * @remarks Client applications use the node name as an identifier.
 * It must not start with a number or contain spaces—use underscores if needed.
 */
export interface DataAccessNode {
	/**
	 * Name of the data access node.
	 * @remarks Must not start with a number or contain spaces.
	 */
	name: string;

	/**
	 * Description of the node (maximum 1000 characters).
	 */
	description: string;

	/**
	 * Variables to be returned by the backend system.
	 */
	outputVariables: Variable[];

	/**
	 * Latency message shown while data is being fetched.
	 * Limited to one static message (a single prompt group without annotations).
	 */
	processingItems: ProcessingItemGroup;

	/**
	 * @deprecated Use `backendConfig` or `externalFetchEnabled` logic instead.
	 */
	serviceName?: string;

	/**
	 * `true` if using client-side integration (external service call); `false` for server-side.
	 */
	externalFetchEnabled: boolean;

	/**
	 * UUID of the node to transition to if the query to the backend system succeeds.
	 */
	successNodeId: string;

	/**
	 * UUID of the node to transition to if the query to the backend system fails.
	 */
	failureNodeId: string;

	/**
	 * Key-value pairs representing inputs (variables, entities, or other objects)
	 * passed to the backend system.
	 */
	inputVariablesConcepts: SupportedInputType[];

	/**
	 * @deprecated No longer used.
	 */
	urlExtension?: string;

	/**
	 * @deprecated No longer used.
	 */
	fetchTimeout?: number;

	/**
	 * @deprecated No longer used.
	 */
	connectTimeout?: number;

	/**
	 * @deprecated No longer used.
	 */
	methodType?: string;

	/**
	 * @deprecated No longer used.
	 */
	sourceExpression?: string;

	/**
	 * @deprecated No longer used.
	 */
	headers?: string;

	/**
	 * Formatting information for latency messages (client-side usage).
	 */
	view: View;

	/**
	 * Server-side backend connection configuration.
	 * Used only when `externalFetchEnabled` is `false`.
	 */
	backendConfig?: BackendConnectionData;

	/**
	 * Node-level overrides to default global settings.
	 */
	nodeSettingOverride: NodeSettingOverride[];

	/**
	 * UUID of the `processingItems` group.
	 */
	processingItemsId: string;

	/**
	 * UUIDs of the variables to be returned (e.g., including `SYS_VAR_channel`).
	 */
	outputVariableIds: string[];

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents the information required to access a backend web service
 * from a data access node (server-side integration).
 */
export interface BackendConnectionData {
	/**
	 * Not used.
	 */
	id: string;

	/**
	 * URL extension for the backend service.
	 * @remarks Maximum 2000 characters.
	 */
	urlExtension: string;

	/**
	 * Fetch timeout in milliseconds.
	 * @default 0
	 */
	fetchTimeout: number;

	/**
	 * Connection timeout in milliseconds.
	 * @default 0
	 */
	connectTimeout: number;

	/**
	 * HTTP method used for the request.
	 * One of: "POST", "GET", "PUT", "DELETE", "PATCH", "NOT_SET".
	 * @default "NOT_SET"
	 */
	method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH' | 'NOT_SET';

	/**
	 * @deprecated Superseded by `dressAliasId`.
	 */
	dressName?: string;

	/**
	 * Headers used to query the backend system.
	 */
	headers: Header[];

	/**
	 * Numeric ID of the connection profile for the backend system.
	 */
	dressAliasId: string;
}

/**
 * Represents a decision node, which applies logic or conditions
 * to determine the next step without performing a data access call
 * or producing output for the user.
 * Identified by the key `decisionNode` in a node object.
 */
export interface DecisionNode {
	/**
	 * Name of the decision node.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * Description of the node (maximum 1000 characters).
	 */
	description: string;

	/**
	 * Processing items to perform within this node.
	 */
	processingItems: ProcessingItemGroup;

	/**
	 * UUID of the processing item group.
	 */
	processingItemsId: string;

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents a message node used to play or display a message.
 * Identified by the key `messageNode` in a node object.
 */
export interface MessageNode {
	/**
	 * Name of the message node.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * Description of the node (maximum 1000 characters).
	 */
	description: string;

	/**
	 * List of processing items to execute for this message node.
	 */
	processingItems: ProcessingItemGroup;

	/**
	 * Formatting information to pass to the client application for messages.
	 * Supported via Dialog gRPC API only.
	 */
	view: View;

	/**
	 * Node-level overrides to global settings.
	 * This includes settings like disabling barge-in.
	 */
	nodeSettingOverride: NodeSettingOverride[];

	/**
	 * UUID of the `processingItems` group.
	 */
	processingItemsId: string;

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ`
	 */
	timestamp: string;
}

/**
 * Represents a question and answer node in a dialog application.
 * Identified by the key `recognitionNode2` in a node object.
 */
export interface QuestionAndAnswerNode {
	/**
	 * Name of the node.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * Description of the node (maximum 1000 characters).
	 */
	description: string;

	/**
	 * Processing items to perform before recognition.
	 */
	initialMessage: ProcessingItemGroup;

	/**
	 * Type of data to collect.
	 * Example: "INTENT_TYPE", "CUSTOM_LIST_TYPE", "YES_NO", "NUANCE_ORDINAL_NUMBER".
	 * Empty string for a menu-type entity.
	 */
	collectionType: string;

	/**
	 * Processing items to perform for each entity value or ASR value
	 * of a menu-type, yes/no, or Boolean entity.
	 * Empty for list-type entities.
	 */
	actionConfigurations: ActionConfiguration[];

	/**
	 * UUID of the question router node for unrecognized input,
	 * if any; empty if `collectionType` is `INTENT_TYPE`.
	 */
	inputManagerReferenceId: string;

	/**
	 * UUID of the entity to collect, if any; empty if `collectionType` is `INTENT_TYPE`.
	 */
	entityId: string;

	/**
	 * Local recovery behaviors for handling collection events such as no match, max no match.
	 */
	recoRecoveryBehaviors: RecoveryBehavior[];

	/**
	 * Only present if `collectionType` is `INTENT_TYPE`.
	 * Processing items to perform after intent recognition.
	 */
	defaultIntentProcessingItem?: ProcessingItemGroup;

	/**
	 * Only present if `collectionType` is not `INTENT_TYPE`.
	 * Processing items to perform after entity recognition.
	 */
	defaultConceptProcessingItem?: ProcessingItemGroup;

	/**
	 * Only present if `collectionType` is empty, `YES_NO`, or `NUANCE_BOOLEAN`.
	 * Processing items to perform before the value-specific items.
	 */
	initialProcessingItem?: ProcessingItemGroup;

	/**
	 * Optional processing items to perform before recognition when dialog reenters this node.
	 */
	reentryMessage?: ProcessingItemGroup;

	/**
	 * Optional interactive elements for supported entity types.
	 */
	clickables: InteractiveElement[];

	/**
	 * Formatting information to pass to the client application.
	 */
	view: View;

	/**
	 * Key-value pairs of variables, entities, and objects to pass to the client.
	 */
	inputVariablesConcepts: SupportedInputType[];

	/**
	 * Overrides to the default global settings for this node.
	 */
	nodeSettingOverride: NodeSettingOverride[];

	/**
	 * Local confirmation behaviors (e.g., no match, confirmation yes/no responses).
	 */
	recoConfirmationBehaviors: LocalConfirmationBehavior[];

	/**
	 * Mappings between DTMF keys and values of the entity to collect (if applicable).
	 */
	dtmfToEntityValueMapping: DTMFMapping[];

	/**
	 * Local overrides for handling specified values of the global command entity.
	 */
	nodeCommandOverrides: LocalCommandOverride[];

	/**
	 * UUID of `defaultConceptProcessingItem`.
	 */
	defaultConceptProcessingId?: string;

	/**
	 * UUID of `defaultIntentProcessingItem`.
	 */
	defaultIntentProcessingId?: string;

	/**
	 * UUID of `initialProcessingItem`.
	 */
	initialProcessingId?: string;

	/**
	 * UUID of `reentryMessage`.
	 */
	reentryMessageId?: string;

	/**
	 * UUID of `initialMessage`.
	 */
	initialMessageProcessingItemId?: string;

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents the local handling for a value of the global command entity at this node.
 */
export interface LocalCommandOverride {
	/**
	 * UUID of the override.
	 */
	id: string;

	/**
	 * UUID of the node where this override is applied.
	 */
	nodeId: string;

	/**
	 * UUID of the global command entity.
	 * This should match `globalCommandsEntityId` from the project.
	 */
	entityId: string;

	/**
	 * Entity value from the global command entity that is being overridden.
	 */
	entityValue: string;

	/**
	 * Processing items to perform for this override.
	 */
	processingItems: ProcessingItemGroup;

	/**
	 * Indicates whether local handling is enabled for the specified value.
	 * `true` if enabled; `false` otherwise.
	 */
	enabled: boolean;

	/**
	 * UUID of the `processingItems`.
	 */
	processingItemsId: string;
}

/**
 * Represents the mapping between a DTMF key and a value of the entity to collect at this node,
 * or a value of the global command entity (for a local command override).
 */
export interface DTMFMapping {
	/**
	 * UUID of the DTMF mapping.
	 */
	id: string;

	/**
	 * UUID of the node where the mapping is defined.
	 */
	nodeId: string;

	/**
	 * UUID of the channel for which the mapping applies.
	 */
	channelId: string;

	/**
	 * DTMF key being mapped (e.g., "1", "2", "*", "#").
	 */
	dtmfValue: string;

	/**
	 * Entity value being mapped to the DTMF key.
	 */
	entityValue: string;

	/**
	 * UUID of the entity being collected at this node,
	 * or UUID of the global command entity if this is a local command override.
	 */
	entityId: string;
}

/**
 * Represents a local behavior for handling confirmation events,
 * such as no match, or positive/negative responses to a confirmation prompt.
 */
export interface LocalConfirmationBehavior {
	/**
	 * UUID of the local confirmation behavior.
	 */
	id: string;

	/**
	 * Event ID that triggers this behavior (e.g., "yes-prompt").
	 */
	event: string;

	/**
	 * Processing items to perform when the event occurs.
	 */
	processingItems: ProcessingItemGroup;

	/**
	 * UUIDs of the channels for which this behavior is disabled at this node for the specified event.
	 */
	disabledChannelIds: string[];

	/**
	 * UUID of the node to which this confirmation behavior belongs.
	 */
	nodeId: string;

	/**
	 * UUID of the `processingItems`.
	 */
	processingItemsId: string;
}

/**
 * Represents an override to the global settings defaults for a specific node,
 * which may be a question and answer node, a message node, or a data access node.
 */
export interface NodeSettingOverride {
	/**
	 * UUID of the setting override.
	 */
	id: string;

	/**
	 * UUID of the node this override applies to.
	 */
	nodeId: string;

	/**
	 * Setting category for the override.
	 * One of:
	 * - "COPILOT_SETTINGS" (preview feature, see Copilot in Mix)
	 * - "COLLECTION_SETTINGS"
	 * - "CONFIRMATION_SETTINGS"
	 * - "DTMF_SETTINGS"
	 * - "TTS_SETTINGS"
	 * - "SPEECH_SETTINGS"
	 * - "CONVERSATION_SETTINGS"
	 * - "AUDIO_SETTINGS"
	 * - "GRAMMAR_SETTINGS"
	 * - "DATA_ACCESS_SETTINGS"
	 * - "DATA_PRIVACY_SETTINGS"
	 */
	settingType:
		| 'COPILOT_SETTINGS'
		| 'COLLECTION_SETTINGS'
		| 'CONFIRMATION_SETTINGS'
		| 'DTMF_SETTINGS'
		| 'TTS_SETTINGS'
		| 'SPEECH_SETTINGS'
		| 'CONVERSATION_SETTINGS'
		| 'AUDIO_SETTINGS'
		| 'GRAMMAR_SETTINGS'
		| 'DATA_ACCESS_SETTINGS'
		| 'DATA_PRIVACY_SETTINGS';

	/**
	 * UUID of the channel to which this override applies.
	 */
	channelId: string;

	/**
	 * The override value.
	 */
	value: string;

	/**
	 * Name of the setting being overridden.
	 */
	settingName: string;

	/**
	 * Language code for the override (e.g., "en-US").
	 * @remarks Use a 4-letter language code—refer to Geographies for supported languages.
	 */
	language: string;
}

/**
 * Represents information to send to a backend system (from a data access node),
 * or to the client application (from an external actions node or a question and answer node).
 */
export interface SupportedInputType {
	/**
	 * Variable to pass on to the backend system.
	 */
	variable?: Variable;

	/**
	 * UUID of the variable.
	 * Only present for inputs of type `variable`.
	 * May be `SYS_VAR_channel` for predefined variable channels.
	 */
	variableId?: string;

	/**
	 * Entity (concept) to pass on to the backend system.
	 */
	concept?: Entity;

	/**
	 * UUID of the entity.
	 * Only present for inputs of type `concept`.
	 */
	conceptId?: string;

	/**
	 * Intent-related value to pass.
	 * One of:
	 * - `INTENT_VALUE`: active intent value
	 * - `INTENT_LITERAL`: active intent literal
	 * - `INTENT_FORMATTED_LITERAL`: formatted version of the active intent literal
	 * - `INTENT_CONFIDENCE`: active intent confidence score
	 */
	intent?: 'INTENT_VALUE' | 'INTENT_LITERAL' | 'INTENT_FORMATTED_LITERAL' | 'INTENT_CONFIDENCE';

	/**
	 * Special operand value to pass.
	 * One of:
	 * - `LAST_COLLECTION_INTERPRETATION`: last collection interpretation
	 * - `LAST_CONFIRMATION_INTERPRETATION`: last confirmation interpretation
	 * - `LAST_MESSAGE_OBJECT`: last message object from previous visited message or Q&A node
	 *
	 * @remarks Requires engine pack 2.3+ (Speech Suite) or 3.11+ (self-hosted Mix) for `LAST_MESSAGE_OBJECT`.
	 */
	specialOperand?: 'LAST_COLLECTION_INTERPRETATION' | 'LAST_CONFIRMATION_INTERPRETATION' | 'LAST_MESSAGE_OBJECT';
}

/**
 * Represents an element the user can click to answer a question.
 */
export interface InteractiveElement {
	/**
	 * UUID of the interactive element.
	 */
	id: string;

	/**
	 * Sequence number of the interactive element.
	 */
	order: number;

	/**
	 * Value collected for the entity when a user clicks this element.
	 */
	entityValue: string;

	/**
	 * Optional description of the interactive element.
	 */
	clickableDescription?: string;

	/**
	 * Optional image link (URL or relative path) shown on the interactive element.
	 * Required if `label` is not specified.
	 */
	imageUrl?: string;

	/**
	 * Optional text label for the interactive element.
	 * Required if `imageUrl` is not specified.
	 */
	label?: string;

	/**
	 * Channel where the interactive element is used.
	 */
	channel: string;

	/**
	 * Language of the interactive element, as a 4-letter language code (e.g., "en-US").
	 */
	language: string;

	/**
	 * Indicates whether the interactive element is enabled.
	 * `true` if enabled; otherwise, `false`.
	 */
	enabled: boolean;

	/**
	 * UUID of the global command entity (if this is for a local command override),
	 * or the UUID of the entity being collected at this Q&A node.
	 */
	entityId: string;
}

/**
 * Maps a specific entity value (or ASR value) to actions
 * to perform after that value is collected.
 */
export interface ActionConfiguration {
	/**
	 * Processing items to perform for the entity value (or ASR value).
	 */
	processingItems: ProcessingItemGroup;

	/**
	 * UUID of the `processingItems`.
	 */
	processingItemsId: string;

	/**
	 * Entity value associated with the processing items.
	 * Only one of `conceptValue` or `asrValue` will be present.
	 */
	conceptValue?: string;

	/**
	 * ASR (Automatic Speech Recognition) value associated with the processing items.
	 * Only one of `asrValue` or `conceptValue` will be present.
	 */
	asrValue?: string;
}

/**
 * Represents processing items to perform by channel.
 */
export interface ProcessingItemGroup {
	/** UUID of the processing item group */
	id: string;
	/** Key-value pairs where the key is a channel UUID and the value contains a processing item list for the specified channel */
	channelProcessingItemsMap: Record<string, ProcessingItemList>;
	/** Date and time of the last modification, in this format: YYYY-MM-DD hh:mm:ssZ—for example, 2019-08-21T08:34:27Z */
	lastModified: string;
	/** UUID of the parent node */
	parentNodeId: string;
}

/**
 * Represents the processing items to perform for a specific channel, in a processing item group.
 */
export interface ProcessingItemList {
	/** Processing items to perform */
	processingItems: ProcessingItem[];
}

/**
 * Represents a processing item in a processing item list.
 */
export interface ProcessingItem {
	/** Sets a condition (such as if, else if, else) to control the dialog flow */
	condition?: Condition;
	/** Performs one of these actions: assign a value to a variable or set a log message */
	action?: Action;
	/** Sets a prompt */
	promptGroup?: PromptGroup;
	/** Sets a transition to another node or throws an event */
	transition?: Transition;
	/** `note` for designer notes; `action` for an action that is not yet defined; `prompt_tts`, `prompt_text`, or `prompt_ttsAudio` for a message that is not yet defined */
	placeholderProcessingType?: 'note' | 'action' | 'prompt_tts' | 'prompt_text' | 'prompt_ttsAudio';
}

/**
 * Represents a condition in a processing item.
 */
export interface Condition {
	/**
	 * UUID of the condition.
	 */
	id: string;

	/**
	 * Type of the condition.
	 * One of:
	 * - NO_TYPE
	 * - IF_TYPE
	 * - ELSEIF_TYPE
	 * - ELSE_TYPE
	 * - ALWAYS_TYPE
	 */
	statementType: 'NO_TYPE' | 'IF_TYPE' | 'ELSEIF_TYPE' | 'ELSE_TYPE' | 'ALWAYS_TYPE';

	/**
	 * Expression to evaluate if the statementType is IF_TYPE or ELSEIF_TYPE.
	 */
	expression?: Expression;

	/**
	 * UUID of the expression to evaluate for IF_TYPE and ELSEIF_TYPE conditions.
	 */
	expressionId?: string;

	/**
	 * Processing items to perform if the condition is true.
	 */
	processingItems: ProcessingItem[];
}

/**
 * Represents an assign action, which assigns a value to a variable,
 * an entity, or the active intent.
 * Identified by the key `assign` in an action object.
 */
export interface Action {
	/**
	 * Represents the target (left-hand side) of an assign action.
	 * Variable being set.
	 */
	lhsVariable?: Variable;
	/**
	 * Field being set in a complex variable.
	 */
	lhsVariableExpression?: VariableExpression;
	/**
	 * UUID of the entity whose value is being set.
	 */
	lhsConceptId?: string;
	/**
	 * Represents the active intent being set.
	 * Always "INTENT_VALUE".
	 */
	lhsIntent?: 'INTENT_VALUE';

	/**
	 * Constant value to assign.
	 * Maximum 64,000 characters.
	 */
	constant?: string;

	/**
	 * Variable whose value is being assigned.
	 */
	variable?: Variable;

	/**
	 * Complex variable field or result of a method on a variable.
	 */
	variableExpression?: VariableExpression;

	/**
	 * Expression used to compute the value to assign.
	 */
	expression?: Expression;
	/**
	 * UUID of the entity whose value is being used.
	 */
	conceptId?: string;
	/**
	 * UUID of the entity whose literal is being used.
	 */
	conceptIdLiteral?: string;
	/**
	 * UUID of the entity whose formatted literal is being used.
	 */
	conceptIdFormattedLiteral?: string;
	/**
	 * Intent-related value to assign.
	 * One of:
	 * - INTENT_VALUE
	 * - INTENT_LITERAL
	 * - INTENT_FORMATTED_LITERAL
	 * - INTENT_CONFIDENCE
	 */
	intent?: 'INTENT_VALUE' | 'INTENT_LITERAL' | 'INTENT_FORMATTED_LITERAL' | 'INTENT_CONFIDENCE';
	/**
	 * Special operand to assign.
	 * One of the supported system values (e.g., LAST_COLLECTION_INTERPRETATION, etc.).
	 */
	specialOperand?: string;
	/**
	 * UUID of the channel to use as the right operand.
	 * Only used if `lhsVariableId` is `SYS_VAR_channel`.
	 */
	channelId?: string;

	/**
	 * UUID of the variable to assign to, if the target is of type `lhsVariable`.
	 * May include `SYS_VAR_channel` for predefined variable channels.
	 */
	lhsVariableId?: string;

	/**
	 * UUID of the complex variable field to assign to, if the target is of type `lhsVariableExpression`.
	 */
	lhsVariableExpressionId?: string;

	/**
	 * UUID of the variable to use as the value, if the right operand is of type `variable`.
	 */
	variableId?: string;

	/**
	 * UUID of the variable expression to use, if the right operand is of type `variableExpression`.
	 */
	VariableExpressionId?: string;

	/**
	 * UUID of the expression to use, if the right operand is of type `expression`.
	 */
	expressionId?: string;
}

/**
 * Represents a transition or a throw event action, in a processing item; the success or failure transition in a data access node, or external actions node; the transition in an event handler; or the intent switch transition in a question router node.
 */
export interface Transition {
	/** UUID of the transition */
	id: string;
	/** Type of transition; one of: GO_TO, GO_BACK_TO, RETURN,RETURN_TO_INTENT_MAPPER, THROW, NO_TRANSITION_TYPE */
	transitionType: 'GO_TO' | 'GO_BACK_TO' | 'RETURN' | 'RETURN_TO_INTENT_MAPPER' | 'THROW' | 'NO_TRANSITION_TYPE';
	/** For transition type THROW: event string to be thrown and then caught elsewhere */
	eventId?: string;
	/** For transition type THROW: description or text to be logged when the event is thrown */
	eventLog?: string;
	/** Descriptive label for the transition; limited to 63 characters */
	label: string;
	/** For transition type GO_TO and GO_BACK_TO: UUID of the destination node */
	nodeId?: string;
}

/** Represents a group of related prompts used in the project. */
export interface PromptGroup {
	/** UUID of the prompt group */
	id: string;
	/** Name of the prompt group (see Naming guidelines) */
	name: string;
	/** Prompts in the prompt group */
	prompts: Prompt[];
	/** Name of the audio file to play for the Audio Script modality (maximum 255 characters, see Naming guidelines)—the file extension is determined in the project settings */
	audioFileId: string;
	/** false if barge-in is enabled for this prompt group (default); otherwise true */
	bargeinDisabled: boolean;
	/** Date and time of the last modification, in this format: YYYY-MM-DD hh:mm:ssZ—for example, 2019-10-17T20:55:38.488Z */
	lastModified: string;
}

/**
 * Represents a prompt in a prompt group.
 */
export interface Prompt {
	/** Payload of the prompt */
	payload: PromptPayload;
	/** Locale of the prompt, as a 4-letter language code (for example, en-US)—refer to Geographies for the list of languages available in the current version of Mix */
	language: string;
	/** UUID of the channel */
	channel: string;
	/** Date and time of the last modification, in this format: YYYY-MM-DD hh:mm:ssZ—for example, 2019-10-17T20:55:38.488Z */
	lastModified: string;
}

/**
 * Represents the payload of a prompt.
 */
export interface PromptPayload {
	/** Text to display; the string may include dynamic placeholders in this format: [placeholder text|uuid of a variable], where the variables are listed in the displayTextAnnotations element */
	displayText: string;
	/** Text to render using text-to-speech; the string may include dynamic placeholders in this format: [placeholder text|uuid of a variable], where the variables are listed in the ttsTextAnnotations element */
	ttsText: string;
	/** @deprecated */
	audioFile?: string;
	/** Dynamic content to include in the text to display */
	displayTextAnnotations: Annotation[];
	/** Dynamic content to render using text-to-speech */
	ttsTextAnnotations: Annotation[];
	/** Backup text to render using text-to-speech when the specified audio file is unavailable; the string may include dynamic placeholders in this format: [placeholder text|uuid of a variable], where the variables are listed in the ttsAudioBackupAnnotations element */
	ttsAudioBackup: string;
	/** Dynamic content to include in the audio backup text */
	ttsAudioBackupAnnotations: Annotation[];
}

/**
 * Represents an dynamic placeholder in a prompt payload.
 */
export interface Annotation {
	/** Variable that contains dynamic content to include in the message */
	variable?: Variable;
	/** Complex variable field, or the result of a supported method against a variable, to include in the message */
	variableExpression?: VariableExpression;
	/** UUID of the entity that contains dynamic content to include in the message */
	conceptId?: string;
	/** UUID of the entity whose literal is to include in the message */
	conceptIdLiteral?: string;
	/** UUID of the entity whose formatted literal is to include in the message */
	conceptIdFormattedLiteral?: string;
	/** One of: ENTITY_VALUE, ENTITY_LITERAL, ENTITY_FORMATTED_LITERAL, to include in a global confirmation message—Mix.dialog only supports ENTITY_VALUE (current entity value from the last NLU interpretation result) */
	currentEntity?: 'ENTITY_VALUE' | 'ENTITY_LITERAL' | 'ENTITY_FORMATTED_LITERAL';
	/** One of: INTENT_VALUE (active intent value), INTENT_LITERAL (active intent literal), INTENT_FORMATTED_LITERAL (formatted version of the active intent literal),INTENT_CONFIDENCE (active intent confidence score), to include in the message */
	intent?: 'INTENT_VALUE' | 'INTENT_LITERAL' | 'INTENT_FORMATTED_LITERAL' | 'INTENT_CONFIDENCE';
}

/**
 * Represents a complex variable field, or the result of a supported method against a variable.
 */
export interface VariableExpression {
	/** UUID of the variable expression */
	id: string;
	/** Operations to be performed against the specified variable—multiple operations are chained, that is, each operation is applied to the result of the previous operation */
	operations: VariableOperation[];
	/** UUID of the variable */
	variableId: string;
	/** Date and time of the last modification, in this format: YYYY-MM-DD hh:mm:ssZ—for example, 2019-08-21T08:34:27Z */
	timestamp: string;
}

/**
 * Represents an operation in a variable expression.
 */
export interface VariableOperation {
	/** Key-value pair, where the key is fieldVariableId and the value is the UUID of a field in the schema of a complex variable—to select a deeply nested field, use the required number of selectField operations, to be performed in sequence */
	selectField: Record<string, string>;
	/** Method to be applied to the specified variable or field */
	callMethod: MethodCall;
}

/**
 * Represents a method call in a variable operation.
 */
export interface MethodCall {
	/** Name of the method to call (for example, length, random, getDay)—the available methods depend on the type of the variable to which the method is to be applied */
	methodName: string;
	/** Parameters to be passed to the method */
	parameters: MethodParameter[];
}

/**
 * Represents a parameter in a method call.
 */
export interface MethodParameter {
	/** Constant to be passed to the method */
	constant: string;
	/** UUID of a variable to be passed to the method (or SYS_VAR_channel if using the predefined variable channel) */
	variableId: string;
	/** UUID of an entity to be passed to the method */
	conceptId: string;
}

/**
 * Represents formatting information to pass to the client application
 * for messages and interactive elements in question and answer nodes,
 * message nodes, and data access nodes.
 */
export interface View {
	/**
	 * Type of message or interactive element.
	 * Examples: "Buttons", "List", "Carousel".
	 */
	name: string;

	/**
	 * Name of a class or inline CSS code to format the message or the interactive elements.
	 */
	style: string;
}

/**
 * Represents a variable used in the project.
 */
export interface Variable {
	/**
	 * UUID of the variable (or `SYS_VAR_channel` for the predefined variable channel).
	 */
	id: string;

	/**
	 * Name of the variable.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * Description of the variable (maximum 255 characters).
	 */
	description: string;

	/**
	 * Valid values for the variable.
	 * @remarks Not yet supported in Mix.dialog.
	 */
	possibleValues: string[];

	/**
	 * Value to be used during preview in Mix.dialog.
	 */
	uiDefaultValue: string;

	/**
	 * Indicates whether this is a reserved variable.
	 * `true` for reserved variables; otherwise, `false`.
	 */
	isReserved: boolean;

	/**
	 * Indicates whether this is a sensitive variable that should be masked in application logs.
	 * `true` for masked variables; otherwise, `false`.
	 */
	masked: boolean;

	/**
	 * One of the supported reporting properties.
	 */
	reportingType: string;

	/**
	 * Only present for defined simple variables.
	 * One of the supported variable types.
	 */
	simpleVariableType?: string;

	/**
	 * Only present when `simpleVariableType` is `LIST_TYPE`.
	 * Indicates the type of the items in the list.
	 */
	simpleGenericType?: string;

	/**
	 * Only present when `simpleVariableType` is `LIST_TYPE` and the list items are complex variables.
	 * UUID of the schema for the items in the list.
	 */
	complexGenericTypeId?: string;

	/**
	 * Only present for complex variables.
	 * UUID of the schema for this complex variable.
	 */
	complexVariableTypeId?: string;

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents a complex variable schema in the project.
 */
export interface Schema {
	/**
	 * UUID of the schema.
	 */
	id: string;

	/**
	 * Name of the schema.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * Description of the schema (maximum 255 characters).
	 */
	description: string;

	/**
	 * One or more variables that define the fields of the schema.
	 */
	fields: Variable[];

	/**
	 * Indicates whether this is a reserved schema (e.g., DynamicMessageReference).
	 * `true` for reserved schemas; otherwise, `false`.
	 */
	isReserved: boolean;
}

/**
 * Represents an event in the project.
 */
export interface Event {
	/**
	 * UUID of the event.
	 */
	id: string;

	/**
	 * The event string to throw.
	 * Example: "event.nuance.dialog.escalate".
	 */
	eventString: string;

	/**
	 * Display name of the event.
	 * Example: "Escalate".
	 * @remarks See naming guidelines for best practices.
	 */
	uiString: string;

	/**
	 * Indicates whether the event can be used in a throw action.
	 * `true` if throwable; otherwise, `false`.
	 */
	throwable: boolean;

	/**
	 * `true` for predefined (reserved) events; `false` for custom events.
	 */
	reserved: boolean;
}

/**
 * Represents a global command in the project.
 */
export interface Command {
	/**
	 * UUID of the command.
	 */
	id: string;

	/**
	 * Global command entity value used to invoke the command.
	 */
	entityValue: string;

	/**
	 * Event thrown when this command is invoked.
	 */
	event: Event;

	/**
	 * DTMF value used to invoke the command.
	 */
	dtmfValue: string;

	/**
	 * Indicates whether the command is enabled at the project level.
	 * `true` if enabled; otherwise, `false`.
	 */
	projectLevelEnabled: boolean;

	/**
	 * Nodes where this command is disabled.
	 * @remarks Reserved for future use.
	 */
	disabledNodeIds: string[];

	/**
	 * Components where this command is disabled.
	 * @remarks Reserved for future use.
	 */
	disabledComponentIds: string[];

	/**
	 * Date and time of the last modification.
	 * Format: `YYYY-MM-DDThh:mm:ssZ` (e.g., `2019-08-21T08:34:27Z`).
	 */
	timestamp: string;
}

/**
 * Represents an override to the global settings defaults in the project.
 */
export interface GlobalSettingOverride {
	/**
	 * UUID of the setting override.
	 */
	id: string;

	/**
	 * Name of the setting.
	 */
	settingName: string;

	/**
	 * Setting category.
	 * One of: "COPILOT_SETTINGS", "COLLECTION_SETTINGS", "CONFIRMATION_SETTINGS",
	 * "DTMF_SETTINGS", "TTS_SETTINGS", "SPEECH_SETTINGS", "CONVERSATION_SETTINGS",
	 * "AUDIO_SETTINGS", "GRAMMAR_SETTINGS", "DATA_ACCESS_SETTINGS", "INTERNAL_SETTINGS".
	 */
	settingType:
		| 'COPILOT_SETTINGS'
		| 'COLLECTION_SETTINGS'
		| 'CONFIRMATION_SETTINGS'
		| 'DTMF_SETTINGS'
		| 'TTS_SETTINGS'
		| 'SPEECH_SETTINGS'
		| 'CONVERSATION_SETTINGS'
		| 'AUDIO_SETTINGS'
		| 'GRAMMAR_SETTINGS'
		| 'DATA_ACCESS_SETTINGS'
		| 'INTERNAL_SETTINGS';

	/**
	 * UUID of the channel for the override.
	 */
	channelId: string;

	/**
	 * For an entity-level setting override, the type of entity.
	 * One of: "CUSTOM_LIST_TYPE", "REGEX", "FREE_FORM", "DATE", "TIME", "YES_NO",
	 * "NUANCE_AMOUNT", "NUANCE_BOOLEAN", "NUANCE_CARDINAL_NUMBER", "NUANCE_DISTANCE",
	 * "NUANCE_DOUBLE", "NUANCE_EXPIRY_DATE", "NUANCE_GENERIC_ORDER", "NUANCE_NUMBER",
	 * "NUANCE_ORDINAL_NUMBER", "NUANCE_TEMPERATURE", or "PREDEFINE_NOT_SET".
	 */
	predefinedName:
		| 'CUSTOM_LIST_TYPE'
		| 'REGEX'
		| 'FREE_FORM'
		| 'DATE'
		| 'TIME'
		| 'YES_NO'
		| 'NUANCE_AMOUNT'
		| 'NUANCE_BOOLEAN'
		| 'NUANCE_CARDINAL_NUMBER'
		| 'NUANCE_DISTANCE'
		| 'NUANCE_DOUBLE'
		| 'NUANCE_EXPIRY_DATE'
		| 'NUANCE_GENERIC_ORDER'
		| 'NUANCE_NUMBER'
		| 'NUANCE_ORDINAL_NUMBER'
		| 'NUANCE_TEMPERATURE'
		| 'PREDEFINE_NOT_SET';

	/**
	 * Override value.
	 */
	value: string;

	/**
	 * Language to which the override applies, as a 4-letter language code (e.g., "en-US").
	 */
	language: string;

	/**
	 * UUID of the entity to which the override applies (only for entity-level overrides); otherwise, empty.
	 */
	entityId: string;
}

/**
 * Represents the global mapping of one intent to a component.
 * Intent mapper nodes inherit these global mappings and can override them if needed.
 */
export interface ProjectIntentMapping {
	/**
	 * UUID of the mapping.
	 */
	id: string;

	/**
	 * UUID of the intent being mapped.
	 */
	intentId: string;

	/**
	 * Key-value pair where the key is `componentId` and the value is the UUID
	 * of the component to which the intent is mapped.
	 */
	destination: {
		componentId: string;
	};
}

/**
 * Represents the ontology used for this project.
 */
export interface Ontology {
	/**
	 * ID of the project.
	 */
	projectId: string;

	/**
	 * Intents in the project.
	 */
	intents: Intent[];

	/**
	 * Entities (concepts) in the project.
	 */
	concepts: Entity[];

	/**
	 * Reserved for future use.
	 */
	lastModified: string;
}

/**
 * Represents an intent in the project.
 */
export interface Intent {
	/**
	 * Unique ID of the intent.
	 */
	id: string;

	/**
	 * ID of the project this intent belongs to.
	 */
	projectId: string;

	/**
	 * Name of the intent.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * UUIDs of the entities (concepts) associated with this intent.
	 */
	conceptIds: string[];

	/**
	 * Indicates whether the intent is predefined.
	 * `true` for predefined (base ontology) intents; `false` for custom intents.
	 */
	isInBaseOntology: boolean;

	/**
	 * Not currently used.
	 */
	lastModified: string;
}

/**
 * Represents an entity in the project.
 */
export interface Entity {
	/**
	 * UUID of the entity.
	 */
	id: string;

	/**
	 * ID of the project this entity belongs to.
	 */
	projectId: string;

	/**
	 * Name of the entity.
	 * @remarks See naming guidelines for best practices.
	 */
	name: string;

	/**
	 * Indicates whether the entity is predefined.
	 * `true` for predefined (base ontology) entities; `false` for custom entities.
	 */
	isInBaseOntology: boolean;

	/**
	 * Number of values defined for this entity.
	 */
	valuesCount: number;

	/**
	 * Indicates whether the entity is a predefined dialog entity.
	 * `true` for dialog entities; otherwise, `false`.
	 */
	isDialogType: boolean;

	/**
	 * UUID of the highest-level parent entity,
	 * used for isA relationship entities of a predefined or dialog entity.
	 */
	predefinedConceptId?: string;

	/**
	 * Indicates whether the entity is deprecated.
	 * `true` for deprecated dialog entities; otherwise, `false`.
	 */
	isDeprecated: boolean;

	/**
	 * UUID of the parent entity.
	 * Only present for relationship entities.
	 */
	isA?: string;

	/**
	 * Not currently used.
	 */
	lastModified: string;
}
