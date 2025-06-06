import { LLMBase } from "../llm/base";
import { Toolchain } from "../toolchain";
import { Session } from "../session";
import { SpanType } from "../span";
import { Tool } from "../tool";

export abstract class EngineBase {
  constructor(
    protected context: any,
    protected llm: LLMBase,
    protected toolchain: Toolchain,
    protected session: Session,
    protected maxIterations: number
  ) {}

  protected async withMaxIterations(
    fn: () => Promise<string | void> | string | void
  ): Promise<string> {
    for (let i = 0; i < this.maxIterations; i++) {
      const result = await fn();
      if (typeof result === "string") return result;
    }
    return await this.errorAnswer(
      "Max iterations reached without finding an answer."
    );
  }

  protected async llmCallResponse(args: Record<string, any>): Promise<string> {
    let llmResult: any = null;
    const output = this.session.exec(
      SpanType.LLM_CALL,
      {
        type: this.llm.model,
        message:
          this.session.messages[this.session.messages.length - 1]?.content,
      },
      async () => {
        llmResult = await this.llm.invoke(this.session.messages, args);
        return llmResult.content;
      }
    );
    const span = this.session.spans[this.session.spans.length - 1];
    if (span && llmResult) {
      span.meta = `${llmResult.inputTokens} → ${llmResult.outputTokens} tokens`;
    }
    return output;
  }

  protected async toolCallResponse(tool: Tool, args: any[]): Promise<string> {
    return this.session.exec(
      SpanType.TOOL_EXECUTION,
      { type: tool.name, message: args },
      () => Promise.resolve(tool.execute(...args))
    );
  }

  protected async findTool(toolName: string): Promise<Tool | undefined> {
    const tool = this.toolchain.find(toolName);
    if (!tool) {
      await this.session.exec(
        SpanType.ANSWER,
        { type: "failure", message: `No matching tool found for: ${toolName}` },
        () => Promise.resolve("")
      );
      return undefined;
    }
    return tool;
  }

  protected async successAnswer(content: string): Promise<string> {
    return this.session.exec(
      SpanType.ANSWER,
      {
        top_level: true,
        type: "success",
        message: content,
        duration: Number(this.session.duration().toFixed(2)),
      },
      () => Promise.resolve(content)
    );
  }

  protected async errorAnswer(content: string): Promise<string> {
    return this.session.exec(
      SpanType.ANSWER,
      {
        top_level: true,
        type: "failure",
        message: content,
        duration: Number(this.session.duration().toFixed(2)),
      },
      () => Promise.resolve(content)
    );
  }

  abstract reason(task: string): Promise<string> | string;
}
