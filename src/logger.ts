export interface LogOptions {
  label: string;
  message?: string;
  duration?: number;
  type?: string;
  meta?: string;
}

export class Logger {
  info(opts: LogOptions) {
    console.log(this.format(opts));
  }

  start(opts: LogOptions) {
    this.info(opts);
  }

  success(opts: LogOptions) {
    this.info(opts);
  }

  error(opts: LogOptions) {
    console.error(this.format(opts));
  }

  private format(opts: LogOptions) {
    const parts = [] as string[];
    parts.push(`[${opts.label}]`);
    if (opts.type) parts.push(`❯ ${opts.type}`);
    if (opts.meta) parts.push(`[${opts.meta}]`);
    if (opts.duration !== undefined)
      parts.push(`[${opts.duration.toFixed(2)}s]`);
    if (opts.message) parts.push(`: ${opts.message}`);
    return parts.join(" ");
  }
}
