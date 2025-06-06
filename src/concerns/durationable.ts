export class Durationable {
  protected startTime?: number;
  protected endTime?: number;

  duration(): number {
    if (!this.startTime) return 0;
    const end = this.endTime ?? Date.now();
    return (end - this.startTime) / 1000;
  }
}
