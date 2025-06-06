export class Tool {
  name: string;
  description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  call(...args: any[]): string {
    throw new Error(`Tool ${this.name} has not implemented the call method`);
  }

  execute(...args: any[]): string {
    try {
      return this.call(...args);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  toString(): string {
    return `${this.name} - ${this.description}`;
  }
}
