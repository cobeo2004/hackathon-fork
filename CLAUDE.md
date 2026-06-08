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

## Engineering Guidance

Detailed engineering guidance (principles, workflow, implementation, architecture, product workflow, testing, communication, MVP, and the decision framework) is extracted for progressive disclosure. Read the relevant doc when the work calls for it:

@docs/claude/index.md

## Security

- Treat all inputs as untrusted.
- Never expose secrets.
- Do not commit API keys.
- Use environment variables for optional third-party APIs.
- Ensure the app can still run in demo mode without secrets when practical.

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
