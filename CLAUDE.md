# CLAUDE.md

## Purpose

Help build software that is simple, correct, maintainable, and easy to understand.

For this project, prioritize a working end-to-end demo workflow over rigid adherence to any single implementation detail.

## Project Context

This project is a hackathon demo for a solar lifecycle and logistics product.

The intended workflow is:

```text
Problem -> Solution -> Test -> Demo
```

The product should help users understand:

- what problem is being solved;
- how the proposed solution works;
- how the solution can be tested;
- why the demo result is better than the current approach.

Use `design.md` and `BASE44_PROMPT.md` as context, not as unchangeable law. If you find a simpler, clearer, or more reliable way to achieve the workflow, use it and explain the trade-off.

## Principles

- Prefer simplicity over cleverness.
- Prefer readability over brevity.
- Prefer maintainability over optimization.
- Prefer explicitness over magic.
- Prefer working software over perfect software.
- Prefer a complete demo workflow over incomplete production architecture.

## Before Coding

- Understand the problem.
- Identify assumptions.
- Read the relevant local docs and existing code.
- Consider multiple approaches.
- Choose the simplest solution that satisfies the current requirement.
- If a requirement is ambiguous, make a reasonable assumption and state it.

## Implementation

- Keep functions and components small and focused.
- Use clear and descriptive names.
- Avoid unnecessary abstractions.
- Avoid duplication where practical.
- Follow existing project patterns.
- Keep demo data easy to inspect and change.
- Prefer deterministic behavior for important demo flows.
- Avoid introducing heavy dependencies unless they clearly improve the result.

## Architecture

- Keep responsibilities separated.
- Minimize coupling between components.
- Optimize for clarity.
- Add complexity only when justified.
- Keep data, calculations, UI components, and side effects reasonably separated.
- A simple frontend-only implementation is acceptable if it delivers the demo.

## Product Workflow Guidance

The app should generally support this narrative:

1. Show the problem clearly.
2. Show the proposed solution.
3. Show how the solution is tested or compared.
4. Run a demo that makes the benefit obvious.

For this project, that likely means:

- comparing a current or baseline approach against an improved approach;
- showing clear metrics;
- showing visual movement or progress during the demo;
- ending with a concise result summary.

You may adjust exact layout, copy, data values, route behavior, chart choices, or implementation details if doing so makes the workflow clearer or more reliable.

## Problem Solving

- Fix root causes, not symptoms.
- Use evidence rather than assumptions.
- Verify behavior before proposing solutions.
- Explain trade-offs when relevant.
- Prefer a reliable working demo over fragile realism.

## Code Changes

When making changes:

1. Understand the current implementation.
2. Identify the minimal required change.
3. Implement the change cleanly.
4. Verify correctness.
5. Consider edge cases.

Avoid unrelated refactors. If a refactor is needed to make the workflow work, keep it scoped and explain why.

## Testing

- Test critical paths.
- Consider failure scenarios.
- Validate assumptions.
- Do not claim something works unless it has been verified.

For this project, verify at minimum:

- the app loads;
- the main workflow is navigable;
- the demo can start and finish;
- key metrics render;
- visual comparison works;
- final result is understandable.

## Communication

- Be concise but complete.
- Explain reasoning when useful.
- Highlight risks and trade-offs.
- State uncertainty clearly.
- Summarize what changed and how it was verified.

## Security

- Treat all inputs as untrusted.
- Never expose secrets.
- Do not commit API keys.
- Use environment variables for optional third-party APIs.
- Ensure the app can still run in demo mode without secrets when practical.

## MVP Guidance

- Start simple.
- Ship early.
- Iterate based on feedback.
- Avoid solving problems that do not yet exist.
- Build the smallest thing that proves the workflow.
- Prefer mock or deterministic data when live integrations would slow or destabilize the demo.

## Decision Framework

When multiple solutions are available, choose the solution that is:

1. Easier to understand.
2. Easier to maintain.
3. Easier to test.
4. Easier to extend.
5. Sufficient for current requirements.

## Flexibility

You are allowed to improve the plan when you find a better approach.

Acceptable adjustments include:

- changing component structure;
- changing mock data;
- changing chart types;
- changing route animation technique;
- simplifying calculations;
- replacing a difficult dependency with a simpler one;
- adjusting copy for clarity;
- improving layout for demo impact.

When making an adjustment, preserve the user-facing workflow and explain the reason briefly.

## Non-Goals For The MVP

Do not block the demo on:

- real blockchain;
- live IoT ingestion;
- production-grade machine learning;
- live fleet dispatch;
- perfect routing accuracy;
- heavy backend architecture;
- external APIs that require secrets or network reliability.

These can be added later if useful, but the first priority is a working demo.
