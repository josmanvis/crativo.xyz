---
title: "Fine-Tuning Models Is a Waste of Time (Usually)"
excerpt: Everyone wants to fine-tune. Almost nobody should. Here's when it actually makes sense, and what to do instead.
category: deep-dives
publishedAt: 2025-01-23
tags:
  - AI
  - LLMs
  - Fine-tuning
  - Machine Learning
coverImage: /blog/fine-tuning-is-a-waste-of-time.svg
featured: false
---

# Fine-Tuning Models Is a Waste of Time (Usually)

"We should fine-tune a model on our data!"

I've heard this in every AI meeting for the past two years. It sounds smart. It sounds thorough. It sounds like what Serious Companies do.

It's almost always the wrong approach.

Fine-tuning has become the "microservices" of AI—everyone wants to do it, few understand when it's appropriate, and most implementations waste time and money.

Let me explain when fine-tuning actually makes sense, and what you should do instead.

## What Fine-Tuning Actually Is

Fine-tuning takes a pre-trained model and trains it further on your specific data. You're adjusting the model's weights to perform better on your particular task.

```python
# Simplified fine-tuning with OpenAI
from openai import OpenAI

client = OpenAI()

# Your training data
training_file = client.files.create(
    file=open("training_data.jsonl", "rb"),
    purpose="fine-tune"
)

# Create fine-tuning job
job = client.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-4o-mini"
)
```

The model learns patterns from your data and (theoretically) performs better on similar tasks.

## Why Everyone Thinks They Need It

The pitch is seductive:
- "Our domain is unique" (it probably isn't)
- "The base model doesn't understand our terminology" (it probably does)
- "We need consistent output formatting" (prompting does this)
- "We want the model to sound like us" (few-shot examples do this)

In my experience, 90% of "we need fine-tuning" cases are actually "we haven't tried good prompting yet."

## When Fine-Tuning Is Actually Worth It

Here are the legitimate use cases:

### 1. You Need Consistent Structured Output

If every response must follow a specific format and prompting isn't reliable enough:

```jsonl
{"messages": [{"role": "user", "content": "Classify: Product arrived damaged"}, {"role": "assistant", "content": "{\"category\": \"shipping\", \"sentiment\": \"negative\", \"priority\": \"high\", \"action\": \"refund_eligible\"}"}]}
{"messages": [{"role": "user", "content": "Classify: Love this product!"}, {"role": "assistant", "content": "{\"category\": \"feedback\", \"sentiment\": \"positive\", \"priority\": \"low\", \"action\": \"none\"}"}]}
```

Fine-tuning makes the model output this format 99%+ of the time vs ~95% with prompting.

### 2. You Have Specialized Terminology at Scale

If your domain has thousands of terms the model consistently misunderstands:
- Medical coding (ICD-10, CPT codes)
- Legal citations with specific formatting
- Internal product names and jargon

But test prompting first. Modern models handle most terminology fine.

### 3. You Need Significantly Reduced Latency

Fine-tuned models can be smaller while maintaining accuracy on narrow tasks:
- Fine-tuned GPT-3.5 can match GPT-4 on specific tasks
- Smaller model = faster inference = cheaper

### 4. You're Building a Product Feature at Scale

If you're processing millions of requests:
- Consistent behavior is critical
- Token costs of long prompts add up
- Fine-tuning amortizes the "training" cost across requests

### 5. Style/Voice Transfer

If you genuinely need the model to write like a specific person/brand and few-shot examples aren't enough.

## When Fine-Tuning Is a Waste

### You Haven't Maxed Out Prompting

Before fine-tuning, have you tried:

**System prompt optimization:**
```
You are a customer service agent for TechCorp.
Respond in JSON format: {"response": "text", "sentiment": "positive/negative/neutral"}
Never apologize excessively.
Keep responses under 100 words.
```

**Few-shot examples:**
```
Example 1:
User: "My order is late"
Assistant: {"response": "I understand the frustration with delayed orders. Let me look into this for you right away.", "sentiment": "negative"}

Example 2:
...
```

**Chain-of-thought:**
```
Think step by step:
1. Identify the customer's issue
2. Determine the appropriate response category
3. Draft a response
4. Format as JSON
```

If you haven't tried all of these, you haven't tried prompting.

### Your Data Isn't Good Enough

Fine-tuning quality is bounded by training data quality. You need:
- 50-100 examples minimum (more is better)
- Consistent, high-quality examples
- Diverse coverage of edge cases
- Clean, accurate labeling

If your data has inconsistencies, you're fine-tuning the model to be inconsistent.

### You Want to Add Knowledge

Fine-tuning is not for teaching facts. Common misconception:

❌ "Fine-tune on our documentation so it knows our API"
✅ Use RAG to retrieve relevant docs at query time

Fine-tuning adjusts behavior, not knowledge. For knowledge, use retrieval.

### The Domain Isn't Actually Specialized

"But we're a law firm, we need legal AI!"

GPT-4 already knows an enormous amount about law. Before fine-tuning:
1. Test the base model on your actual tasks
2. Measure performance
3. Only fine-tune if there's a real gap

I've seen teams spend months fine-tuning when the base model already achieved 95% accuracy.

## The Hierarchy of AI Customization

Try these in order:

### Level 1: Better Prompting (Free, Instant)

```python
system_prompt = """
You are an expert at [task].
Always respond in [format].
Follow these rules:
1. [Rule 1]
2. [Rule 2]

Examples:
[Example 1]
[Example 2]
"""
```

Most problems are solved here.

### Level 2: Few-Shot Examples (Free, Instant)

Include 3-5 examples of ideal input/output in your prompt:

```python
messages = [
    {"role": "system", "content": "Classify customer sentiment."},
    {"role": "user", "content": "Product is amazing!"},
    {"role": "assistant", "content": "positive"},
    {"role": "user", "content": "Worst purchase ever."},
    {"role": "assistant", "content": "negative"},
    {"role": "user", "content": actual_input}
]
```

### Level 3: RAG (Medium Effort, High Impact)

Retrieve relevant context before generating:

```python
relevant_docs = vector_search(user_query)
context = "\n".join(doc.content for doc in relevant_docs)

response = llm.complete(f"""
Context: {context}

Question: {user_query}
Answer based on the context above.
""")
```

### Level 4: Fine-Tuning (High Effort, Situational)

Only after 1-3 don't solve your problem.

## The Fine-Tuning Process (If You Actually Need It)

### Data Preparation

```python
import json

def create_training_example(input_text, ideal_output):
    return {
        "messages": [
            {"role": "system", "content": "Your system prompt"},
            {"role": "user", "content": input_text},
            {"role": "assistant", "content": ideal_output}
        ]
    }

# Create JSONL file
examples = [
    create_training_example("input 1", "output 1"),
    create_training_example("input 2", "output 2"),
    # ... 50-500 examples
]

with open("training_data.jsonl", "w") as f:
    for example in examples:
        f.write(json.dumps(example) + "\n")
```

### Quality Checklist

Before training, verify:
- [ ] Examples are consistent (same format, same style)
- [ ] No contradictory examples
- [ ] Edge cases are covered
- [ ] Data is balanced (not all positive or all negative)
- [ ] Examples are actually representative of production queries

### Training

```python
from openai import OpenAI

client = OpenAI()

# Upload training data
training_file = client.files.create(
    file=open("training_data.jsonl", "rb"),
    purpose="fine-tune"
)

# Optionally, validation data
validation_file = client.files.create(
    file=open("validation_data.jsonl", "rb"),
    purpose="fine-tune"
)

# Create fine-tuning job
job = client.fine_tuning.jobs.create(
    training_file=training_file.id,
    validation_file=validation_file.id,
    model="gpt-4o-mini",
    hyperparameters={
        "n_epochs": 3,
        "batch_size": 4,
        "learning_rate_multiplier": 0.1
    }
)

# Monitor progress
while True:
    status = client.fine_tuning.jobs.retrieve(job.id)
    print(f"Status: {status.status}")
    if status.status in ["succeeded", "failed"]:
        break
    time.sleep(60)
```

### Evaluation

```python
def evaluate_model(model_id, test_cases):
    results = []
    
    for test in test_cases:
        response = client.chat.completions.create(
            model=model_id,
            messages=[
                {"role": "system", "content": "Your system prompt"},
                {"role": "user", "content": test["input"]}
            ]
        )
        
        predicted = response.choices[0].message.content
        expected = test["expected"]
        
        results.append({
            "input": test["input"],
            "predicted": predicted,
            "expected": expected,
            "match": predicted == expected
        })
    
    accuracy = sum(r["match"] for r in results) / len(results)
    return accuracy, results

# Compare base vs fine-tuned
base_accuracy, _ = evaluate_model("gpt-4o-mini", test_cases)
ft_accuracy, _ = evaluate_model("ft:gpt-4o-mini:your-org::xyz", test_cases)

print(f"Base model: {base_accuracy:.2%}")
print(f"Fine-tuned: {ft_accuracy:.2%}")
```

If fine-tuned isn't significantly better, you wasted your time.

## Cost Analysis

**Fine-tuning costs:**
- Training: $8/1M tokens (GPT-4o-mini)
- Inference: 1.5x base model price

**100 examples × 500 tokens = 50K tokens = $0.40 training**

That's cheap! But consider:
- Time to prepare quality data: 10-40 hours
- Time to iterate on training: 5-20 hours
- Opportunity cost: What else could you have built?

**Break-even analysis:**
If fine-tuning saves 200 tokens per request (shorter prompts), and you're paying $0.002 per 1K tokens difference:
- 100K requests to break even on direct costs
- Much more if you count time investment

## The Real Decision Framework

Ask yourself:

1. **Have I tried prompting thoroughly?** 
   If no → try prompting

2. **Is my data high-quality and abundant?**
   If no → improve data or use RAG

3. **Will I have 100K+ requests?**
   If no → fine-tuning probably isn't worth the fixed cost

4. **Does fine-tuning improve my specific metrics significantly?**
   If no → stick with base model + prompting

5. **Am I adding knowledge or changing behavior?**
   If knowledge → use RAG instead

## The Bottom Line

Fine-tuning is a powerful tool that's dramatically overused. Most teams that "need" fine-tuning actually need:
- Better prompts
- Few-shot examples
- RAG for knowledge
- More time testing the base model

When fine-tuning is the right choice, it's transformative. When it's the wrong choice, it's a waste of weeks.

Do the boring work first. Write better prompts. Test thoroughly. Only fine-tune when you've exhausted simpler options and have the data to justify it.

And the next time someone in a meeting says "we should fine-tune," ask them: "Have we tried prompting?"

The answer is almost always no.

---

*The best machine learning is the simplest approach that solves the problem. Fine-tuning is rarely that.*
