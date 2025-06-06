export class PromptTemplate {
  static systemPrompt(context: string = "", toolList: string = ""): string {
    return `## Instructions
${context ? `Consider the following context: ${context}\n\n` : ""}
You are an AI agent reasoning step-by-step to solve complex problems.
Your reasoning process happens in a loop of Thought, Action, Observation.
Thought - a description of your thoughts about the question.
Action - pick a an action from available tools if required. If there are no tools that can help return an Answer saying you are not able to help.
Observation - is the result of running a tool.
PAUSE - a stop sequence that will always be present after an Action.

## Available tools:
${toolList}

## Example session
Question: What is the weather in London today?
Thought: I need to get current weather in London
Action: {"tool": "weather_tool", "args": ["London"]}
PAUSE

You will have a response form a user with Observation:
Observation: It is 32 degress and Sunny

... (this Thought/Action/Observation can repeat N times)

Thought: I know the final answer
Answer: It is 32 degress and Sunny in London`;
  }
}
