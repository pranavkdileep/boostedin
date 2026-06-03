"use server";

import type { Post } from "@/lib/types/post";

interface LLMGeneratedContent {
  title: string;
  post: string;
}

interface GeneratePostResult {
  title: string;
  postBody: string;
  error?: string;
}

function getOpenAIConfig() {
  const baseUrl = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_MODEL;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!baseUrl || !model || !apiKey) {
    throw new Error(
      "OPENAI_BASE_URL, OPENAI_MODEL, or OPENAI_API_KEY is not defined in .env.local"
    );
  }

  return { baseUrl, model, apiKey };
}

const SYSTEM_PROMPT = `You are an expert LinkedIn content writer.

Write a LinkedIn post from the following topic/content.

Requirements:
- Respond with valid JSON only.
- Do not include text before or after the JSON.
- JSON must contain exactly these keys: "title" and "post".
- "title" should be short, clear, and LinkedIn-friendly.
- "post" should contain the full LinkedIn post text.
- Output plain text inside the JSON values, not Markdown.
- Do not use Markdown symbols like ##, **, -, *, or backticks.
- Do not use Unicode bold text such as 𝐓𝐡𝐢𝐬.
- Do not use em dashes or the character "\u2014".
- Use normal readable headings only when useful.
- Use bullet points with this symbol: \u2022
- Use third-person/report-style writing.
- Make the post professional, natural, and engaging for LinkedIn.
- Start with a strong hook in the first 1 to 2 lines.
- Avoid making the first visible preview too long before the main value.
- Add 8 to 12 relevant hashtags at the bottom of the "post" value.
- Put hashtags on the final lines only.
- Do not include explanations about the formatting.

Respond with valid JSON only containing "title" and "post" keys.`;

function buildUserMessage(prompt: string): string {
  return `Topic/content:\n${prompt}`;
}

function parseLLMOutput(raw: string): LLMGeneratedContent {
  const trimmed = raw.trim();
  const cleaned = trimmed.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleaned);

  if (typeof parsed.title !== "string" || typeof parsed.post !== "string") {
    throw new Error("LLM response missing required title or post fields");
  }

  if (!parsed.title.trim() || !parsed.post.trim()) {
    throw new Error("LLM returned empty title or post");
  }

  return { title: parsed.title.trim(), post: parsed.post.trim() };
}

export async function generatePost(post: Post): Promise<GeneratePostResult> {
  if (!post.prompt || !post.prompt.trim()) {
    return { title: "", postBody: "", error: "Post prompt is empty" };
  }

  let config;

  try {
    config = getOpenAIConfig();
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM not configured";
    return { title: "", postBody: "", error: message };
  }

  const userMessage = buildUserMessage(post.prompt);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        title: "",
        postBody: "",
        error: `OpenAI API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      return { title: "", postBody: "", error: "Empty response from OpenAI" };
    }

    const parsed = parseLLMOutput(content);

    return {
      title: parsed.title,
      postBody: parsed.post,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate post";
    return { title: "", postBody: "", error: message };
  }
}
