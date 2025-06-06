import { Toolable, FunctionToolEntry } from "./concerns/toolable";
import { LLMBase } from "./llm/base";
import { Session } from "./session";
import { Toolchain } from "./toolchain";
import { ReactEngine } from "./engine/react";

export const DEFAULT_MAX_ITERATIONS = 10;

export class Agent extends Toolable {
  context: string;
  model: LLMBase;
  engineClass: any;
  sessions: Session[] = [];
  tools: Toolchain;
  maxIterations: number;

  constructor(
    context: string,
    options: {
      model: LLMBase;
      tools?: any[];
      engine?: any;
      maxIterations?: number;
    }
  ) {
    super();
    this.context = context;
    this.model = options.model;
    this.engineClass = options.engine || ReactEngine;
    this.maxIterations = options.maxIterations || DEFAULT_MAX_ITERATIONS;
    this.tools = this.buildToolchain(options.tools || []);
  }

  run(task: string): Promise<string> {
    if (!task.trim()) throw new Error("Task cannot be empty");
    this.startSession();
    const engine = new this.engineClass(
      this.context,
      this.model,
      this.tools,
      this.session!,
      this.maxIterations
    );
    return Promise.resolve(engine.reason(task)).finally(() =>
      this.completeSession()
    );
  }

  get session(): Session | undefined {
    return this.sessions[this.sessions.length - 1];
  }

  private startSession() {
    this.completeSession();
    const s = new Session();
    this.sessions.push(s);
    s.start();
  }

  private completeSession() {
    if (this.session && this.session.active()) this.session.complete();
  }

  private buildToolchain(tools: any[]): Toolchain {
    const chain = new Toolchain(tools as any);
    (this.constructor as typeof Agent).functionTools.forEach(
      (entry: FunctionToolEntry) => {
        chain.add(entry.name, entry.description, this);
      }
    );
    return chain;
  }
}
