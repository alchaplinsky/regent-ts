jest.mock("chalk", () => ({ bold: { blue: (s:any)=>s }, cyan:(s:any)=>s, magenta:(s:any)=>s, dim:(s:any)=>s, white:(s:any)=>s }));

jest.mock('ora', () => {
  return jest.fn(() => {
    let spinner = {
      text: '',
      isSpinning: false,
      start: jest.fn(function(){ this.isSpinning = true; return this; }),
      succeed: jest.fn(function(){ this.isSpinning = false; }),
      fail: jest.fn(function(){ this.isSpinning = false; }),
    };
    return spinner;
  });
});
import { Logger } from "../src/logger";

describe('Logger', () => {
  const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('start uses spinner.start', () => {
    const logger = new Logger();
    logger.start({ label: 'TEST' });
    const ora = require('ora');
    expect(ora).toHaveBeenCalled();
    const spinner = ora.mock.results[1].value;
    expect(spinner.start).toHaveBeenCalled();
    expect(spinner.isSpinning).toBe(true);
  });

  test('success calls spinner.succeed when spinning', () => {
    const logger = new Logger();
    logger.start({ label: 'TEST' });
    const spinner = require('ora').mock.results[1].value;
    logger.success({ label: 'TEST' });
    expect(spinner.succeed).toHaveBeenCalled();
    expect(spinner.isSpinning).toBe(false);
  });

  test('error calls spinner.fail when spinning', () => {
    const logger = new Logger();
    logger.start({ label: 'TEST' });
    const spinner = require('ora').mock.results[1].value;
    logger.error({ label: 'TEST' });
    expect(spinner.fail).toHaveBeenCalled();
  });

  test('info logs when not spinning', () => {
    const logger = new Logger();
    logger.info({ label: 'TEST' });
    expect(consoleLog).toHaveBeenCalled();
  });
});
