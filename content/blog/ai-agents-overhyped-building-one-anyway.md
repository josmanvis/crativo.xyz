---
title: "AI Agents Are Overhyped But I'm Building One Anyway"
excerpt: Agent frameworks promise autonomous AI that solves complex problems. The reality? Fragile loops and hallucinated tool calls. But there's potential.
category: deep-dives
publishedAt: 2025-01-26
tags:
  - AI
  - Agents
  - LLMs
  - Automation
coverImage: /blog/ai-agents-overhyped-building-one-anyway.svg
featured: false
---

# AI Agents Are Overhyped But I'm Building One Anyway

Every AI company is shipping "agents" now. Autonomous AI that can browse the web, write code, book flights, and solve complex problems without human intervention!

The reality? I've been building agents for a year. Most of the time they:
- Loop infinitely on simple tasks
- Hallucinate tool calls that don't exist
- Confidently produce wrong answers
- Cost $50 to do what a human does in 5 minutes

And yet... I keep building them. Because when they work, they're magic. Here's my honest assessment of agent technology in 2025.

## What Agents Actually Are

Strip away the marketing and an "agent" is:

```
while not done:
    observation = perceive(environment)
    thought = think(observation, goal, memory)
    action = decide(thought, available_tools)
    result = execute(action)
    memory.update(result)
    done = check_if_complete(result, goal)
```

The AI observes, thinks, acts, and repeats. That's it. Everything else is implementation details and hype.

## The Hype vs Reality

### The Hype

"Our agent autonomously researches topics, synthesizes information from multiple sources, and produces publication-ready reports!"

### The Reality

```
Agent: I'll search for information about topic X
Agent: *calls search tool*
Agent: I found some results. Let me analyze them.
Agent: *analyzes results*
Agent: I need more information. Let me search again.
Agent: *calls search tool with same query*
Agent: I found some results. Let me analyze them.
Agent: I need more information. Let me search again.
[loops forever]
```

Or:

```
Agent: I'll use the database_query tool
Error: No tool named 'database_query' exists
Agent: I'll use the query_database tool  
Error: No tool named 'query_database' exists
Agent: I'll use the db.query tool
[gives up after 5 failed attempts]
```

## Why Agents Are Hard

### 1. Planning is Hard

Humans are good at breaking down complex tasks. LLMs... aren't.

"Book me a flight to Tokyo next week, cheapest option, prefer window seat"

Requires:
1. Determine what "next week" means
2. Search multiple flight providers
3. Compare prices (handling different currencies, layovers)
4. Check seat availability
5. Handle login/payment
6. Confirm booking

Each step has failure modes. The AI needs to handle all of them, recover from errors, and maintain state. Current LLMs struggle with step 1.

### 2. Tool Use is Fragile

```python
tools = [
    {
        "name": "web_search",
        "description": "Search the web for information",
        "parameters": {
            "query": {"type": "string", "description": "Search query"}
        }
    }
]
```

The AI must:
- Know which tool to use (often guesses wrong)
- Format parameters correctly (often doesn't)
- Handle errors gracefully (often can't)
- Know when NOT to use a tool (hardest part)

### 3. Context Window Limits

Agents need memory. Long tasks accumulate context:
- Previous observations
- Failed attempts
- Intermediate results
- Tool outputs

Eventually you hit context limits. Summarization helps but loses detail. There's no great solution.

### 4. Compounding Errors

If each step has 90% accuracy:
- 2 steps: 81% success
- 5 steps: 59% success
- 10 steps: 35% success

Multi-step tasks fail more than they succeed.

## What Actually Works (Sort Of)

Despite the problems, some agent patterns are genuinely useful:

### 1. Constrained Tool Use

Give the AI 2-3 well-defined tools, not 20:

```python
tools = [
    {
        "name": "search",
        "description": "Search documentation for information"
    },
    {
        "name": "answer",
        "description": "Provide final answer to user"
    }
]
```

Fewer choices = fewer mistakes.

### 2. Human-in-the-Loop

Don't aim for full autonomy. Instead:

```python
def agent_step(state):
    action = ai.decide(state)
    
    if action.confidence < 0.8 or action.is_destructive:
        action = human.review(action)
    
    return execute(action)
```

The AI proposes, human approves. Much more reliable.

### 3. Structured Workflows

Instead of "figure it out," define explicit steps:

```python
def research_agent(topic):
    # Step 1: Search (AI)
    search_results = ai.search(topic)
    
    # Step 2: Extract key points (AI)
    key_points = ai.extract(search_results)
    
    # Step 3: Synthesize (AI)
    summary = ai.synthesize(key_points)
    
    # Step 4: Format (deterministic)
    return format_report(summary)
```

Each step is scoped. Failures are isolated. Much more reliable than "go research X."

### 4. ReAct Pattern

The Reasoning + Acting pattern works reasonably well:

```python
prompt = """
You have access to these tools: {tools}

Use this format:
Thought: What I need to do next
Action: tool_name
Action Input: input for the tool
Observation: result from the tool
... (repeat as needed)
Thought: I have enough information
Final Answer: the answer

Question: {question}
"""
```

Explicit reasoning steps improve reliability.

## My Agent Architecture

Here's what I'm actually running:

```python
from dataclasses import dataclass
from typing import Callable, Any

@dataclass
class Tool:
    name: str
    description: str
    fn: Callable
    
@dataclass
class AgentState:
    goal: str
    history: list[dict]
    tools: list[Tool]
    max_steps: int = 10

class Agent:
    def __init__(self, model: str = "gpt-4-turbo"):
        self.model = model
        self.client = OpenAI()
    
    def run(self, state: AgentState) -> str:
        for step in range(state.max_steps):
            # Think
            response = self.think(state)
            
            # Check if done
            if response.get("final_answer"):
                return response["final_answer"]
            
            # Execute tool
            if response.get("tool"):
                result = self.execute_tool(
                    response["tool"],
                    response["tool_input"],
                    state.tools
                )
                state.history.append({
                    "thought": response["thought"],
                    "action": response["tool"],
                    "result": result
                })
            
            # Safety check
            if self.is_looping(state.history):
                return "Agent appears stuck. Stopping."
        
        return "Max steps reached without answer."
    
    def think(self, state: AgentState) -> dict:
        messages = self.build_messages(state)
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    
    def execute_tool(self, tool_name: str, tool_input: Any, tools: list[Tool]) -> str:
        tool = next((t for t in tools if t.name == tool_name), None)
        
        if not tool:
            return f"Error: Unknown tool '{tool_name}'"
        
        try:
            return str(tool.fn(tool_input))
        except Exception as e:
            return f"Error: {str(e)}"
    
    def is_looping(self, history: list[dict]) -> bool:
        if len(history) < 3:
            return False
        
        # Check for repeated actions
        recent_actions = [h["action"] for h in history[-3:]]
        return len(set(recent_actions)) == 1
```

### Key Design Decisions

**1. Max steps limit**
Never let agents run forever. 10-20 steps max.

**2. Loop detection**
If the agent does the same thing 3 times, stop it.

**3. JSON output**
Force structured output to make parsing reliable.

**4. Error messages as observations**
When tools fail, tell the agent why so it can adapt.

## What I'm Actually Using Agents For

### Use Case 1: Code Review Assistant

```python
tools = [
    Tool("read_file", "Read a file from the repo", read_file),
    Tool("search_code", "Search codebase for pattern", search_code),
    Tool("submit_review", "Submit review comments", submit_review)
]

agent.run(AgentState(
    goal="Review this PR for security issues and bugs",
    tools=tools
))
```

Works ~70% of the time. Catches real issues the other 30% is wasted.

### Use Case 2: Documentation Researcher

```python
tools = [
    Tool("search_docs", "Search documentation", search_docs),
    Tool("read_page", "Read a documentation page", read_page),
    Tool("answer", "Provide final answer", lambda x: x)
]

agent.run(AgentState(
    goal="How do I configure authentication in [product]?",
    tools=tools
))
```

Works well because scope is limited. Documentation is structured.

### Use Case 3: Data Analysis Pipeline

```python
tools = [
    Tool("query_db", "Execute SQL query", query_db),
    Tool("plot", "Create visualization", plot_data),
    Tool("summarize", "Summarize findings", summarize)
]

agent.run(AgentState(
    goal="Analyze user signups for last 30 days, identify trends",
    tools=tools
))
```

Surprisingly effective. SQL is well-defined. Hard to go too wrong.

## The Frameworks (Honest Review)

### LangChain

**Pros:** Lots of integrations, active community
**Cons:** Abstraction hell, hard to debug, changes constantly

I used LangChain for 6 months. Switched to custom code. No regrets.

### AutoGPT/AgentGPT

**Pros:** Cool demos
**Cons:** Useless for real work. Full autonomy doesn't work.

### CrewAI

**Pros:** Multi-agent coordination, nice API
**Cons:** Complexity doesn't add value for most tasks

### My recommendation

Build your own minimal framework. 100-200 lines of code. You'll understand what's happening and can debug it.

## What's Coming (My Predictions)

**2025:**
- Better tool use from foundation models
- More reliable reasoning (o1-style thinking)
- Standardized tool calling conventions
- Agents that know their limits

**2026:**
- Agents as products (not just tech demos)
- Self-correcting agents that learn from failures
- Multi-modal agents (vision + action)

**The dream (2027+):**
- Agents that can actually replace workflows
- Reliable enough for high-stakes tasks
- Continuous learning from experience

We're not there yet. But the progress is real.

## Should You Build Agents?

**Yes, if:**
- You have a well-defined, narrow task
- Human-in-the-loop is acceptable
- You're okay with 70-80% success rate
- The value justifies the complexity

**No, if:**
- You need 99%+ reliability
- The task requires true reasoning
- You're not willing to iterate extensively
- A simple script would work

## The Bottom Line

AI agents are overhyped. The demos are better than the reality. Full autonomy doesn't work. Most "agent" products are simple tool-calling loops with good marketing.

But.

The core idea—AI that can use tools and iterate—is powerful. With the right constraints, agents solve real problems. They're getting better quickly.

I'm building agents because the future is clearly agentic. The question isn't whether agents will work, it's when. I want to understand the failure modes now so I'm ready when the technology catches up to the vision.

Just don't believe the hype. Build simple, constrain scope, expect failures, and iterate.

The agents of 2027 will be amazing. The agents of 2025 are... educational.

---

*The best agents are the ones that know their limits. We're still teaching them where those limits are.*
