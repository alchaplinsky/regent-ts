import { EngineBase } from "./base";
import { SpanType } from "../span";
import { PromptTemplate } from "./react/promptTemplate";

const SEQUENCES = {
  answer: "Answer:",
  action: "Action:",
  observation: "Observation:",
  stop: "PAUSE",
};

export class ReactEngine extends EngineBase {
  async reason(task: string): Promise<string> {
    await this.session.exec(
      SpanType.INPUT,
      { top_level: true, message: task },
      () => Promise.resolve(task)
    );
    this.session.addMessage({
      role: "system",
      content: PromptTemplate.systemPrompt(
        this.context,
        this.toolchain.toString()
      ),
    });
    this.session.addMessage({ role: "user", content: task });

    return this.withMaxIterations(async () => {
      const content = await this.llmCallResponse({ stop: [SEQUENCES.stop] });
      this.session.addMessage({ role: "assistant", content });

      if (this.answerPresent(content)) {
        return this.extractAnswer(content);
      }

      if (this.actionPresent(content)) {
        const [toolName, args] = this.parseToolSignature(content);
        if (!toolName) return;
        const tool = await this.findTool(toolName);
        if (!tool) return;
        const result = await this.toolCallResponse(tool, args);
        this.session.addMessage({
          role: "user",
          content: `${SEQUENCES.observation} ${result}`,
        });
      }
    });
  }

  private answerPresent(content: string): boolean {
    return content.includes(SEQUENCES.answer);
  }

  private actionPresent(content: string): boolean {
    return content.includes(SEQUENCES.action);
  }

  private extractAnswer(content: string): Promise<string> {
    const answer = content.split(SEQUENCES.answer)[1]?.trim() || "";
    return this.successAnswer(answer);
  }

  private parseToolSignature(content: string): [string | null, any[]] {
    const match = content.match(/Action:.*?\{.*"tool".*\}/s);
    if (!match) return [null, []];
    try {
      const json = JSON.parse(match[0].match(/\{.*\}/s)![0]);
      return [json.tool, json.args || []];
    } catch {
      return [null, []];
    }
  }
}
