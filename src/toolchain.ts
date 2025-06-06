import { Tool } from "./tool";

export class Toolchain {
  tools: Tool[];

  constructor(tools: Tool[]) {
    this.tools = tools;
  }

  find(name: string): Tool | undefined {
    return this.tools.find((t) => t.name.toLowerCase() === name.toLowerCase());
  }

  add(name: string, description: string, context: any) {
    if (typeof context[name] !== "function") {
      throw new Error(
        `A tool method '${name}' is missing in the ${context.constructor.name}`
      );
    }
    const tool = new Tool(name, description);
    tool.call = context[name].bind(context);
    this.tools.push(tool);
  }

  toString(): string {
    return this.tools.map((t) => t.toString()).join("\n");
  }
}
