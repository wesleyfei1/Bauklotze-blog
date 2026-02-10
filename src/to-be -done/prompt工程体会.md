focus on skills: 工程，and so on
human agent engineering
**take-away**
- human agent engineering:主要是工程的能力
- llm和我们一样
- 阅读并且看大量的代码，学习评鉴什么是shit
- many workflows,我需要找到我自己最喜欢的
nowadays, llms are prabability predictors. so high quanlity prompts are very important
context windows
- 记忆力不太行，lost-in-middle effect
- latency: 
# **prompt**
just like language, like how we interact with out search engine
- zero-shot prompt: 直接让llm生成，没有support以及example
```
write a for-loop that iterage over the strings for every and print them out
```

- k-shot prompt: 给一些例子(in-context learning),适合那些没有**太多reasoning step**的tasks
  - benefit:domain-specific,没有用于训练的私密的东西
  - 以及让代码统一风格
  - 但是避免过渡的限制，以及general tasks
- cot prompting: 对于program以及math的任务，
  - lets think step by step
  - 显示的<reasoning> </reasoning>强制进行思考
  - **让模型写出推理步骤可以检查问题，同时可以生成更高质量的代码**
- self-consistency prompting: 多轮的采样可以最终收敛到一个统一的结果上
  - 比如prompt*5 最后take majority result
- tool-based ai:给ai提供一些可以使用的工具

```
Fix the IndexError. Ensure the CI tests still pass once you have made the fix. Here are the available tools. 

<tools>
pytest -s /path/to/unit_tests

pytest -v /path/to/integration_tests
</tools>

```

- retrieval augmented generation: 检索增强，提供资料进行学习，可以保持知识更新，**自带可解释性，减少幻觉**
- 引导模型批判自己,作为reflector的agent去进行干预措施。
- 使用system prompt：固定行为，防止跑偏
- **role prompt可以让system prompt更加有效**

```
**You are a helpful assistant that loves programming at the level of a senior software developer and is very detailed and pedantic in your answers.**
```

一些实用的技巧
- prompt应该structuer，而且我们的prompt应该更加的清晰。
- 可以考虑讲tasks进行分解




