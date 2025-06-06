import { randomUUID } from "crypto";
import { Durationable } from "./concerns/durationable";
import { Span, SpanType } from "./span";
import { Logger } from "./logger";

export class Session extends Durationable {
  id: string = randomUUID();
  spans: Span[] = [];
  messages: Array<{ role: string; content: string }> = [];
  startTime?: number;
  endTime?: number;
  private logger = new Logger();

  start() {
    if (this.startTime) throw new Error("Session already started");
    this.startTime = Date.now();
  }

  exec(
    type: SpanType,
    args: Record<string, any>,
    fn: () => Promise<string>
  ): Promise<string> {
    if (!this.startTime || this.endTime)
      throw new Error("Cannot execute span in inactive session");
    const span = new Span(type, args, this.logger);
    this.spans.push(span);
    return span.run(fn);
  }

  addMessage(message: { role: string; content: string }) {
    if (!message || !message.content)
      throw new Error("Message cannot be empty");
    this.messages.push(message);
  }

  complete(): string | undefined {
    if (!this.startTime || this.endTime)
      throw new Error("Cannot complete inactive session");
    this.endTime = Date.now();
    return this.spans[this.spans.length - 1]?.output;
  }

  active(): boolean {
    return !!this.startTime && !this.endTime;
  }
}
