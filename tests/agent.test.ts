jest.mock("chalk", () => ({ bold: { blue: (s:any)=>s }, cyan:(s:any)=>s, magenta:(s:any)=>s, dim:(s:any)=>s, white:(s:any)=>s }));
jest.mock("ora", () => jest.fn(() => ({text:"",isSpinning:false,start:jest.fn(function(){this.isSpinning=true;return this;}),succeed:jest.fn(function(){this.isSpinning=false;}),fail:jest.fn(function(){this.isSpinning=false;})})));
import { Agent } from '../src/agent';
import { LLMBase, LLMResult } from '../src/llm/base';

class DummyLLM extends LLMBase {
  async invoke(): Promise<LLMResult> {
    return { model: this.model, content: 'ok' };
  }
}

const reasonSpy = jest.fn(async (_task: string) => 'done');
class MockEngine {
  reason = reasonSpy;
  constructor(
    public context: any,
    public model: LLMBase,
    public toolchain: any,
    public session: any,
    public maxIterations: number
  ) {}
}

describe('Agent', () => {
  test('run delegates to engine and manages session', async () => {
    const agent = new Agent('ctx', { model: new DummyLLM('dummy'), engine: MockEngine });
    const result = await agent.run('task');
    expect(result).toBe('done');
    expect(agent.sessions.length).toBe(1);
    const session = agent.sessions[0];
    expect(reasonSpy).toHaveBeenCalledWith("task");
    expect(session.active()).toBe(false);
    // can't easily capture instance when using new; instead check engine reason called
    expect((agent as any).engineClass).toBe(MockEngine);
  });

test('run throws on empty task', () => {
  const agent = new Agent('ctx', { model: new DummyLLM('dummy'), engine: MockEngine });
  expect(() => agent.run('')).toThrow('Task cannot be empty');
  expect(agent.sessions.length).toBe(0);
});
});
