import ora, { Ora } from "ora";
import chalk from "chalk";

export interface LogOptions {
  label: string;
  message?: string;
  duration?: number;
  type?: string;
  meta?: string;
  top_level?: boolean;
}

export class Logger {
  private spinner: Ora;
  private nestedSpinner: Ora;

  constructor() {
    this.spinner = ora({ color: "cyan" });
    this.nestedSpinner = ora({ prefixText: chalk.dim(" ├──"), color: "cyan" });
  }

  private current(opts: LogOptions): Ora {
    return opts.top_level ? this.spinner : this.nestedSpinner;
  }

  info(opts: LogOptions) {
    const sp = this.current(opts);
    const text = this.format(opts);
    if (sp.isSpinning) {
      sp.text = text;
    } else {
      console.log(text);
    }
  }

  start(opts: LogOptions) {
    const sp = this.current(opts);
    sp.text = this.format(opts);
    if (!sp.isSpinning) sp.start();
  }

  success(opts: LogOptions) {
    const sp = this.current(opts);
    const text = this.format(opts);
    if (sp.isSpinning) {
      sp.succeed(text);
    } else {
      console.log(text);
    }
  }

  error(opts: LogOptions) {
    const sp = this.current(opts);
    const text = this.format(opts);
    if (sp.isSpinning) {
      sp.fail(text);
    } else {
      console.error(text);
    }
  }

  private format(opts: LogOptions) {
    const parts = [] as string[];
    parts.push(chalk.bold.blue(`[${opts.label}]`));
    if (opts.type) parts.push(chalk.cyan(`❯ ${opts.type}`));
    if (opts.meta) parts.push(chalk.magenta(`[${opts.meta}]`));
    if (opts.duration !== undefined)
      parts.push(chalk.dim(`[${opts.duration.toFixed(2)}s]`));
    const base = parts.join(" ");
    return opts.message ? `${base}: ${chalk.white(opts.message)}` : base;
  }
}
