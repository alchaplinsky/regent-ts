import { randomUUID } from "crypto";
import { Durationable } from "./concerns/durationable";
import { Logger } from "./logger";

export enum SpanType {
  INPUT = "INPUT",
  LLM_CALL = "LLM",
  TOOL_EXECUTION = "TOOL",
  MEMORY_ACCESS = "MEMO",
  ANSWER = "ANSWER",
}

export class Span extends Durationable {
  id: string = randomUUID();
  arguments: Record<string, any>;
  type: SpanType;
  output?: string;
  meta?: string;
  logger: Logger;
  startTime?: number;
  endTime?: number;

  constructor(type: SpanType, args: Record<string, any>, logger: Logger) {
    super();
    this.type = type;
    this.arguments = args;
    this.logger = logger;
  }

  async run(fn: () => Promise<string>): Promise<string> {
    this.startTime = Date.now();
    this.logger.start({ label: this.type, ...this.arguments });
    try {
      this.output = await fn();
      return this.output;
    } catch (e: any) {
      this.logger.error({
        label: this.type,
        message: e.message,
        ...this.arguments,
      });
      throw e;
    } finally {
      this.endTime = Date.now();
      this.logger.success({
        label: this.type,
        duration: this.duration(),
        meta: this.meta,
        ...this.arguments,
      });
    }
  }

  replay(): string | undefined {
    this.logger.info({
      label: this.type,
      message: this.output || "",
      duration: this.duration(),
      meta: this.meta,
    });
    return this.output;
  }
}
