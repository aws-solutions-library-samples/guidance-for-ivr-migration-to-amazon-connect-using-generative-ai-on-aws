import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type LLMOutputComponent } from "@llm-ui/react";
import type { CodeToHtmlOptions } from "@llm-ui/code";
import { loadHighlighter, useCodeBlockToHtml, allLangs, allLangsAlias } from "@llm-ui/code";
import { bundledThemes } from "shiki/themes";
import parseHtml from "html-react-parser";
import { bundledLanguagesInfo } from "shiki/langs";
import getWasm from "shiki/wasm";
import { getHighlighterCore } from "shiki/core";

// Customize this component with your own styling
export const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
	const markdown = blockMatch.output;
	return <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>;
};

const highlighter = loadHighlighter(
	getHighlighterCore({
		langs: allLangs(bundledLanguagesInfo),
		langAlias: allLangsAlias(bundledLanguagesInfo),
		themes: Object.values(bundledThemes),
		loadWasm: getWasm,
	})
);

const codeToHtmlOptions: CodeToHtmlOptions = {
	theme: "night-owl",
};

// Customize this component with your own styling
export const CodeBlock: LLMOutputComponent = ({ blockMatch }) => {
	const { html, code } = useCodeBlockToHtml({
		markdownCodeBlock: blockMatch.output,
		highlighter,
		codeToHtmlOptions,
	});
	if (!html) {
		return (
			<pre className="shiki">
				<code>{code}</code>
			</pre>
		);
	}
	return <>{parseHtml(html)}</>;
};
