export interface FunctionToolEntry {
  name: string;
  description: string;
}

export class Toolable {
  static functionTools: FunctionToolEntry[] = [];

  static tool(name: string, description: string) {
    this.functionTools.push({ name, description });
  }
}
