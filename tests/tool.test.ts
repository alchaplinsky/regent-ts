import { Tool } from '../src/tool';

describe('Tool', () => {
  class EchoTool extends Tool {
    call(...args: any[]): string {
      return args.join(' ');
    }
  }

  test('execute should call tool implementation', () => {
    const tool = new EchoTool('echo', 'echoes input');
    expect(tool.execute('a', 'b')).toBe('a b');
  });

  test('execute should rethrow errors from call', () => {
    class ErrTool extends Tool {
      call(): string { throw new Error("boom"); }
    }
    const tool = new ErrTool('err', 'throws');
    expect(() => tool.execute()).toThrow('boom');
  });

  test('toString returns name and description', () => {
    const tool = new EchoTool('echo', 'desc');
    expect(tool.toString()).toBe('echo - desc');
  });
});
