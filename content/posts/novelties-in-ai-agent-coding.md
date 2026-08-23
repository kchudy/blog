---
title: What's New in AI Agent Coding
slug: novelties-in-ai-agent-coding
author: Kamil Chudy
tags: [ai, agents]
status: published
published_at: 2026-08-23
---

"AI agent" has gone from a research term to something you'll find wired into a CI pipeline,
a support inbox, or — as it happens — the workflow that helped write this post. This is a
tour of what's actually changed in how agents are built and used to write and maintain code,
framework-agnostic on purpose, since the specific names will keep turning over faster than
the underlying ideas.

## From autocomplete to agents

The first wave of AI coding tools worked one keystroke or one function at a time: suggest the
next line, complete the current one. That's still useful, but it's a fundamentally different
shape of tool than what's called an "agent" today. An agent doesn't just suggest text — it
takes an action, observes what happened, and decides what to do next in a loop, usually with
some ability to call tools (run a shell command, edit a file, query an API) rather than only
emit text a human has to act on.

That loop is the real novelty. A model that can read a test failure, edit the file that caused
it, and re-run the tests to check its own work is doing something categorically different from
one that predicts the next token in an editor buffer.

## Tool use as the load-bearing primitive

The mechanism that makes agent loops practical is structured tool use: the model doesn't
just produce prose, it emits a call to a defined function — `run_tests()`, `read_file(path)`,
`search(query)` — with arguments, gets a structured result back, and continues from there. This
sounds mundane, but it's what turned "a chat model with a system prompt" into "something that
can reliably drive a multi-step task."

The recent shift here is standardization. Rather than every framework inventing its own
tool-calling convention, protocols like MCP (Model Context Protocol) have emerged to let a
single tool implementation — say, "query this database" or "open this ticket in Plane" — be
exposed to any compliant agent, instead of being rewritten per framework. That matters
practically: it turns "give the agent access to your internal systems" from a bespoke
integration project into something closer to plugging in a cable.

## Longer, more autonomous loops

Early coding assistants operated on a short leash: one suggestion, one accept/reject. What's
new is agents that run for extended, mostly unsupervised stretches — reading a whole codebase,
making a multi-file change, running the test suite, and iterating on failures without a human
in the loop at every step. This is only viable because of a few things converging:

- **Bigger, cheaper context windows** mean an agent can hold "the relevant parts of a large
  repo" in view at once, instead of working file-by-file with no memory of the rest.
- **Sandboxed execution** (containers, ephemeral VMs, git worktrees) lets an agent actually run
  code, tests, and linters as part of its own feedback loop, safely isolated from anything that
  matters if it goes wrong.
- **Cheaper inference** makes a loop of "try something, check the result, try again" affordable
  at the scale of dozens or hundreds of iterations per task, where it used to be reserved for a
  single best-effort attempt.

The practical effect is a shift from "AI suggests, human verifies every line" toward "human
specifies intent and reviews the result," with the agent responsible for the steps in between —
including the ones that fail and need correcting.

## Multi-agent orchestration

A second theme is decomposition: instead of one agent doing everything, a task gets split
across agents with different roles — one drafts requirements, one designs an approach, one
implements, one reviews, one runs QA — each with a narrower job and its own context. This
mirrors how human teams work for a reason: a reviewer catches more when it isn't the same
"mind" that wrote the code and is anchored on its own assumptions.

This shows up as concrete patterns worth knowing by name, because they solve different
problems:

- **Pipelines**, where each stage's output feeds the next (requirements → design →
  implementation → review) — useful when the steps are genuinely sequential.
- **Fan-out/fan-in**, where several agents tackle independent pieces of a problem in parallel
  and their results get merged or compared — useful for breadth (searching a codebase several
  different ways) or for redundancy (having multiple agents attempt a fix and picking the best).
- **Adversarial verification**, where one or more agents are specifically prompted to try to
  disprove another agent's finding or claim, rather than rubber-stamp it — a direct response to
  the failure mode where a single agent is confidently wrong and nothing catches it.

None of this is unique to code, but code is a domain where it's unusually easy to check an
agent's work objectively — tests either pass or they don't — which is a big part of why coding
has become one of the more mature applications of multi-agent systems.

## Agents that read and write project memory

A subtler but practical novelty: agents increasingly maintain their own notes about a project
across sessions — conventions actually followed, known bugs deliberately left unfixed, past
decisions and why they were made — rather than starting from zero on every invocation or relying
entirely on what's baked into a prompt. This repository's own `.ai/` directory (conventions,
known issues, architecture decisions) is a small example of the pattern: a place for an agent to
record what it learns so the next agent — or the next human — doesn't have to rediscover it. It
is a very old idea in software engineering (write it down) applied to a very new kind of
teammate.

## What hasn't changed

It's worth being clear-eyed about what's still true despite all of this. Agents still make
mistakes, sometimes confidently. They still need scoped-down permissions, sandboxing, and human
review at the right checkpoints, not blind trust. Tests, code review, and CI remain how you know
a change is correct — an agent's self-report that something works is a claim to verify, not a
fact to accept. If anything, the more autonomous the loop, the more that verification step
matters, because there are more unsupervised steps for something to go wrong in before a human
looks at the result.

## Why this matters for a project like this one

None of the above is abstract for this blog: the workflow that turns a Plane issue into a
merged pull request here — requirements, architecture, implementation, review, QA, each as a
distinct agent role reading and writing to `.ai/` — is a small, concrete instance of exactly the
multi-agent pipeline described above. It's a reasonable bet that this pattern, not any single
model or framework, is the durable idea worth understanding: narrow, verifiable roles,
tool use as the interface to the real world, and a written record that outlives any one
session.
