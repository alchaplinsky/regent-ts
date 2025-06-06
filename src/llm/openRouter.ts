import { LLMBase, LLMResult } from "./base";

export class OpenRouter extends LLMBase {
  apiKey: string;
  baseUrl: string;

  constructor(
    model: string,
    apiKey: string,
    baseUrl: string = "https://openrouter.ai/api/v1"
  ) {
    super(model);
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async invoke(
    messages: Array<{ role: string; content: string }>,
    options: Record<string, any> = {}
  ): Promise<LLMResult> {
    const body = { model: this.model, messages, ...options };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data: any = await response.json();
      throw new Error(data.error?.message || response.statusText);
    }

    const json: any = await response.json();
    return {
      model: this.model,
      content: json.choices[0].message.content,
      inputTokens: json.usage?.prompt_tokens,
      outputTokens: json.usage?.completion_tokens,
    };
  }
}
