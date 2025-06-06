export interface LLMResult {
  model: string;
  content: string;
  inputTokens?: number;
  outputTokens?: number;
}

export abstract class LLMBase {
  model: string;

  constructor(model: string) {
    this.model = model;
  }

  abstract invoke(
    messages: Array<{ role: string; content: string }>,
    options?: Record<string, any>
  ): Promise<LLMResult>;
}
