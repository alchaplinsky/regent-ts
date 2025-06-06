import { LLMBase, LLMResult } from "./base";

export class Gemini extends LLMBase {
  apiKey: string;
  baseUrl: string;

  constructor(
    model: string,
    apiKey: string,
    baseUrl: string = "https://generativelanguage.googleapis.com/v1beta"
  ) {
    super(model);
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async invoke(
    messages: Array<{ role: string; content: string }>,
    options: Record<string, any> = {}
  ): Promise<LLMResult> {
    const formatted = messages.map((m) => ({
      role: m.role === "system" ? "user" : m.role,
      parts: [{ text: m.content }],
    }));
    const body = {
      contents: formatted,
      generation_config: {
        temperature: options.temperature ?? 0,
        stop_sequences: options.stop ?? [],
      },
    };

    const response = await fetch(
      `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const data: any = await response.json();
      throw new Error(data.error?.message || response.statusText);
    }

    const json: any = await response.json();
    return {
      model: this.model,
      content: json.candidates[0].content.parts[0].text.trim(),
      inputTokens: json.usageMetadata?.promptTokenCount,
      outputTokens: json.usageMetadata?.candidatesTokenCount,
    };
  }
}
