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

export const slotTypePrompt = `Here are some guideline to use when resolving error:
1. regexFilter only valid if "parentSlotTypeSignature" is specified. Remove "regexFilter" field if parentSlotTypeSignature is not specified.
2. Use the following rule for slot type with AMAZON.AlphaNumeric as its parent:
    a. The following regular expression operators are not supported:
        a. Infinite repeaters: *, +, or {x,} with no upper bound.
        b. Wild card (.)
    b. Use a standard regular expression. Amazon Lex V2 supports the following characters in the regular expression:
        a. A-Z, a-z
        b. 0-9`;

export const slotPrompt = `Here are some guideline to use when resolving error:
1. If slot optional, remove the 'slotCaptureSetting' parameter and careful not to delete 'slotConstraint' parameter.
2. Make sure your sample utterances include context words
    a. Bad Example:
        - {eArrivalCity}
    b. Good Example:
        - My destination is {eArrivalCity}
        - I want to fly to {eArrivalCity}
        - I'm traveling to {eArrivalCity}
3. Separate the slot from the other text with a whitespace character. For example:
    a. Bad Example:
        - Flight from {eDepartureCity}?
    b. Good Example:
        - When is my flight from {eDepartureCity} ?
        - I am flying from {eArrivalCity} ? 
`;

export const intentPrompt = `Here are some guideline to use when resolving error:
1. Should reference the slot directly in Conditional Expression, e.g. {age} instead of intent.slot.age
2. List of method that you can reference in Conditional Expression are  "fn.COUNT()", "fn.IS_SET()". Do not make up method in condition expression.
3. List of boolean operator that you can reference in Conditional Expression are "AND", "OR" and "NOT".
4. User double quote and not single quote in Conditional Expression.
5. In response message you can only reference slot but not perform Conditional Expression.InvokeDialogCodeHook
6. Amazon Lex V2 supports the following comparison operators for Conditional Expression:
    a. Equals (=)
    b. Not equals (!=)
    c. Less than (<)
    d. Less than or equals (<=)
    e. Greater than (>)
    f. Greater than or equals (>=)
7. Make sure your sample utterances include context words
    a. Bad Example:
        - {eArrivalCity}
    b. Good Example:
        - My destination is {eArrivalCity}
        - I want to fly to {eArrivalCity}
        - I'm traveling to {eArrivalCity}
8. Separate the slot from the other text with a whitespace character. For example:
    a. Bad Example:
        - flight from {eDepartureCity}?
    b. Good Example:
        - When is my flight from {eDepartureCity} ?
        - I am flying from {eArrivalCity} ? 
9. If you're using Built-in intents, you can't do the following:
    a. Add or remove sampleUtterances from the base intent
    b. Configure slots
10. Here are the list of build in intents
    a. AMAZON.CancelIntent
    b. AMAZON.FallbackIntent
    c. AMAZON.HelpIntent
    d. AMAZON.KendraSearchIntent
    e. AMAZON.PauseIntent
    f. AMAZON.QnAIntent
    g. AMAZON.QnAIntent (multiple use support)
    h. AMAZON.QinConnectIntent
    i. AMAZON.RepeatIntent
    j. AMAZON.ResumeIntent
    k. AMAZON.StartOverIntent
    l. AMAZON.StopIntent
11. Do not use "InvokeDialogCodeHook"
12. When referencing slot in sampleUtterances use the slotName in <AvailableSlots>
`

    ;
