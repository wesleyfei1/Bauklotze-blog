---
title: 'CS146S week2&4-IDE(Copilot)&&Claude Code'
publishDate: 2026-02-16
updatedDate: 2026-02-16
description: 'CS146S week2&4-IDE(Copilot)&&Claude Code'
category: tech
tags:
  - cs146s
  - vibe coding
language: zh
heroImage:
  src: '../../../../background/titan4.jpg'
  color: '#d5c1a4'
---

cs146S对我而言最重要的，就是教会了我如何使用ai ide&&cli工具(copilot以及claude code), 并且提出了一系列principle,从而可以大大提高我们的工作效率，接下来我们来整理一下下吧！！！

# Principle && Ability
ai工具在逐步的演变中，从本地开发(copilot,cursor)，到协作云智能体(claud code)，未来可能会有更多的形式，但是有些principle和ability是需要现在开始培养的

**Important principle**
基本的ai工具的响应可以分为
- sync工具:20-1.5min的响应，让注意力集中在单一的任务上(快速迭代)
- async工具:10min-h级别的东西，人可以进行多个任务之间的切换注意力(可以运行多个agent,提高自己的并行能力)
**principle**:减少semi-sync的状态，**sync or async!!!**

**Important Ability**
1. **委派与多线程处理 (Delegation & multi-threading)：** 学会同时管理多个并行任务 。这个能力非常非常的重要
2. **代码阅读 (Code reading)：** 因为大部分代码由 AI 生成，人类需要快速阅读和审查代码 。 
3. **规划与架构 (Planning, scoping, architecting)：** 定义问题和系统设计变得比写具体语法更重要 。

# AI IDE使用
## 从 Inline Infilling 到全库 Context 检索
- **基础模式**:inline,function,single file,multi file(cursor,copilot之类的)
inline代码补全上下文为附近的代码，加上infilling llm
而chat/agent功能：代码作为embedding,并且检索project中的相关代码块
- **ai-native**:后台代理，mcp,记忆学习，BugBot
## Act as a product manager
对于difficult tasks要学会像product manager一样去思考。直接将ai当成一个可以无限pua的员工，先规划好任务，然后给agent一份行动指南

对于复杂任务，不要随意提问，要像一个产品一样，先去思考以下几个问题 ：
- **目标 (Goal)**：变更的目的。
- **定义 (Definitions)**与**计划 (Plan)**：LLM 需要了解的前提条件、相关代码库部分、源文件变更计划。
- **测试用例 (Test cases)**：如何测试、边缘情况处理。
- **范围外 (Out-of-scope)**：哪些不应被修改。
- **扩展性 (Extensions)**：为未来设计预留空间

需要有好的repo,最好提供一份关于repo的介绍README.md，包括
```
- Repo orientation
- File structure
- Setup and environment
- Best practices
- Code style
- Access patterns
- APIs and contracts
- All of this should be thoroughly documented
```
同时配置好ai agent需要阅读的文档**LLM 需要遵守的原则和规范**
比如`CLAUDE.md` / `.cursorrules` / `AGENTS.md` / `llms.txt`
以及AGENTS.md(对于agent的readme.md文件),可以参考一些specs
https://drive.google.com/file/d/1MZ0Qx68Vzw4x5x_XcV8XiPLp7fFDe1LJ/view

---
以上是大致的使用ai ide工具的流程，需要思考的问题以及原则。接下来则是具体到ai ide工具。

# **copilot使用**
可以直接根据以上的原则，先交代任务，然后列plan，然后用agent模式一项项的去完成todo即可。在week2的assignment中，完成了一个**自动提取todo list的东西**，详细请见github:https://github.com/wesleyfei1/Stanford-CS146S-WesleyFei/tree/main/week2

# **Claude code使用**

![](./CS146S%20week2&4-IDE(Copilot)&&Claude%20Code.assets/CS146S%20week2&4-IDE(Copilot)&&Claude%20Code_2026-02-16-18.png)
- **安装**:对于安装(wsl以及claude code)的话就不细讲了，详细可见 https://axi404.top/blog/wsl-coding 这里有详细的介绍
- **api配置**: 显然直接使用claude的模型太贵了，所以接入第三方api就是非常好的选择。
在`~/.claude/settings.json`中设置
```json
{
  "env": {
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-chat",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-reasoner",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-reasoner",
    "ANTHROPIC_MODEL": "deepseek-chat",
    "ANTHROPIC_REASONING_MODEL": "deepseek-reasoner",
    "ANTHROPIC_AUTH_TOKEN": "你的api",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "includeCoAuthoredBy": false,
  "model": "deepseek-chat"
}
```
在这里我选择的是deepseek的api,大家有什么**便宜好用的plan/模型**可以在评论区留言推荐哈


claude code的最大好处就是**无论是工具，还是sub agent都非常容易配置，全部为md格式**，而且可以高度定制化。对于一个project,如果我们使用了/init命令后，在该project命令下可以进行配置
- /project/CLAUDE.md: 制定了整体claude在该project下运行时**遵从的行为准则，以及介绍项目大体的情况**，在书写时**简洁清晰，明确的角色以及项目结构，设定好语气**，比如
```
# Claude Project Guide
## Build & Test Commands
- Install: `pnpm install`
- Build: `pnpm build`
- Test single file: `pnpm test <path_to_file>`
- Full test suite: `pnpm test`
- Lint/Fix: `pnpm lint:fix`
## Coding Standards
- **Architecture**: Follow hexagonal architecture; keep logic in `/domain` and side effects in `/infrastructure`.
- **Types**: Always use strict TypeScript; interfaces are preferred over type aliases.
- **Naming**: Use PascalCase for components and camelCase for hooks.
- **Error Handling**: Use the `Result` pattern (success/failure objects) instead of throwing exceptions.
## Project Structure Highlights
- `/src/components`: UI-only shared components.
- `/src/hooks`: Custom React hooks for business logic.
- `/src/lib/api`: All Axios instances and API definitions.
## Important Context
- This project uses **Tailwind CSS** for styling; do not use CSS-in-JS.
- We use **Zustand** for state management (located in `/src/store`).
```
- /project/.claude/settings.local.json: 设定在该project中claude code的权限
- /project/.claude/commands: 添加各种你想要设定的工具，比如我想要添加一个自动进行测试，书写tests以及修复的工具，直接增加一个`super-fix.md`,从而直接使用**super-fix **触发
```md
# /super-fix
Automatically fix linting issues, format code, and run tests until they pass.
## Intent
Streamline the development loop by automating repetitive quality checks and iterative debugging.
## Steps
1. **Linting**: Run `make lint`. If it fails, analyze the ruff/black output and apply necessary fixes to the source code.
2. **Formatting**: Run `make format` to ensure the code adheres to the project's style guide.
3. **Testing**: Run `make test`.
4. **Iterative Debug**: If tests fail:
    - Capture the error message and traceback.
    - Analyze the relevant files in `backend/app/` to identify the bug.
    - Apply a fix and repeat from Step 1.
5. **Report**: Summarize the changes made and confirm the final status of the test suite.
```
- /project/.claude/agents: 当前的project中的一些子agent,可以手动设定，也可以根据claude自行制定agent,同样会以md格式存储。
---
以上就是我在cs146s的week2&4中得到的一些体会，copilot已经开始高强度使用了，但是claude code的使用还在初步的探索中，等到未来使用更加熟练后，应该会有不一样的体会。