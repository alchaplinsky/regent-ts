import { LLMBase, LLMResult } from "./base";

export class Ollama extends LLMBase {
  host: string;

  constructor(model: string, host: string = "http://localhost:11434") {
    super(model);
    this.host = host;
  }

  async invoke(
    messages: Array<{ role: string; content: string }>
  ): Promise<LLMResult> {
    const body = { model: this.model, messages, stream: false };

    const response = await fetch(`${this.host}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    const json: any = await response.json();
    if (response.status !== 200) throw new Error(json.error);

    return { model: json.model, content: json.message.content.trim() };
  }
}
