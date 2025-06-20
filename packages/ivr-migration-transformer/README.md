# ivr-migration-transformer

## Lex bot definition zip structure

```
bot.zip/
├── Bot/
│   └── Bot.json
├── BotLocales/
│   └── en_US/
│       ├── BotLocale.json
│       ├── Intents/
│       │   ├── Intent1/
│       │   │   └── Intent.json
│       │   │   └── Slots/
│       │   │       └── Slot1.json
│       │   └── Intent2/
│       │       └── Intent.json
│       └── SlotTypes/
│           └── CustomSlotType1.json
└── CustomVocabulary/
    └── en_US.json
```

Key points to remember:

- All files must be valid JSON
- File names are case-sensitive
- The directory structure must be exactly as shown
- Each intent and slot must have its own directory/file
- The locale identifier (e.g., en_US) must match in the directory structure and configuration
- You can include multiple locales under BotLocales/
- Custom vocabularies are optional

When creating the zip file, make sure to:

- Maintain the exact directory structure
- Include all required JSON files
- Zip the contents at the root level (not the containing folder)
- Ensure all JSON files are properly formatted and validated

**Example Bot.json**

```json
{
    "name": "MyBot",
    "identifier": "UNIQUE_ID",
    "version": "1.0",
    "description": "Bot description",
    "dataPrivacy": {
        "childDirected": false
    },
    "idleSessionTTLInSeconds": 300
}
```

**Example BotLocale.json**

```json
{
    "identifier": "en_US",
    "name": "English (US)",
    "description": "US English locale",
    "nluConfidenceThreshold": 0.40,
    "voiceSettings": {
        "voiceId": "Joanna"
    }
}
```

**Example Intent.json***

```json
{
    "name": "OrderPizza",
    "description": "Intent to order pizza",
    "sampleUtterances": [
        {
            "utterance": "I want to order a pizza"
        },
        {
            "utterance": "Can I get a pizza"
        }
    ],
    "fulfillmentCodeHook": {
        "enabled": true
    },
    "intentClosingSetting": {
        "closingResponse": {
            "messageGroups": [
                {
                    "message": {
                        "plainTextMessage": {
                            "value": "Your order is confirmed"
                        }
                    }
                }
            ]
        }
    }
}
```

**Example Slot.json**

```json
{
    "name": "PizzaSize",
    "description": "Size of the pizza",
    "slotTypeName": "PizzaSizeType",
    "valueElicitationSetting": {
        "promptSpecification": {
            "messageGroups": [
                {
                    "message": {
                        "plainTextMessage": {
                            "value": "What size pizza would you like?"
                        }
                    }
                }
            ]
        }
    }
}
```

**Example CustomSlotType.json**

```json
{
    "name": "PizzaSizeType",
    "description": "Available pizza sizes",
    "slotTypeValues": [
        {
            "sampleValue": {
                "value": "small"
            }
        },
        {
            "sampleValue": {
                "value": "medium"
            }
        },
        {
            "sampleValue": {
                "value": "large"
            }
        }
    ],
    "valueSelectionSetting": {
        "resolutionStrategy": "TOP_RESOLUTION"
    }
}
```

