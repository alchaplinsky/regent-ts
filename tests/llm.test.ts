import { LLMBase, LLMResult } from '../src/llm/base';

describe('LLMBase', () => {
  class DummyLLM extends LLMBase {
    async invoke(_messages: any[]): Promise<LLMResult> {
      return { model: this.model, content: 'ok' };
    }
  }

  test('invoke returns provided result', async () => {
    const llm = new DummyLLM('dummy');
    const res = await llm.invoke([]);
    expect(res).toEqual({ model: 'dummy', content: 'ok' });
  });
});
