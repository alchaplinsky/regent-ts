import { LLMBase, LLMResult } from "./base";

export class Anthropic extends LLMBase {
  apiKey: string;
  baseUrl: string;

  constructor(
    model: string,
    apiKey: string,
    baseUrl: string = "https://api.anthropic.com/v1"
  ) {
    super(model);
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async invoke(
    messages: Array<{ role: string; content: string }>,
    options: Record<string, any> = {}
  ): Promise<LLMResult> {
    const body = {
      model: this.model,
      max_tokens: options.max_tokens ?? 1000,
      messages,
      temperature: options.temperature ?? 0,
      stop_sequences: options.stop ?? [],
    };

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "content-type": "application/json",
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
      content: json.content[0].text,
      inputTokens: json.usage?.input_tokens,
      outputTokens: json.usage?.output_tokens,
    };
  }
}
