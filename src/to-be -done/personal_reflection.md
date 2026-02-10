`k-shot`, `CoT`, `Self-consistency`, `RAG`, `Tool-using`, `Reflexion` 这几个东西，以及一个有趣的场景，**而“审阅与重构”才是真正的核心竞争力。**
这个还真没有，我只练习了k-shot exampling,cot,self-consistency,rag,tool-using以及reflexion这几个东西，不过对于你提出来的这个问题，我们可以先写一个工具，然后通过工具调用+reflexion从而实现这个功能

进行了大量的尝试
1.assistant声明，添加大量的example,添加cot(实际上是类似于agent的动机，如果它可以使用python就好了)，但是最后䣌效果不敬人意
2.改变了形式，变成了
```c
apple:->a,p,p,l,e->e,l,p,p,a->elppa
```
效果略有好转，但是还是一般，长度上不对,但是至少字母上不会乱弄了，而且只有小写字母了

3.进一步明确了要求,效果为
Running test 1 of 5
Expected output: sutatsptth
Actual output: tatsuots
Running test 2 of 5
Expected output: sutatsptth
Actual output: status
Running test 3 of 5
Expected output: sutatsptth
Actual output: tsuatsotth
Running test 4 of 5
Expected output: sutatsptth
Actual output: statth
Running test 5 of 5
Expected output: sutatsptth
Actual output: tsatusp

4.进一步添加了一些小小的泄露: 使用答案中的那些字符去进行组合，效果为
PS D:\WesleyFei\Alpha-lab\0_Inbox\modern-software-dev-assignments\week1> python -u "d:\WesleyFei\Alpha-lab\0_Inbox\modern-software-dev-assignments\week1\k_shot_prompting.py"
Running test 1 of 5
Expected output: sutatsptth
Actual output: sttahsup
Running test 2 of 5
Expected output: sutatsptth
Actual output: tatshttsp
Running test 3 of 5
Expected output: sutatsptth
Actual output: sttahsputc
Running test 4 of 5
Expected output: sutatsptth
Actual output: tatushpt
Running test 5 of 5
Expected output: sutatsptth
Actual output: tsatush

5.加上了更多的泄露，以及10个字符的东西
Actual output: stautshttp
Running test 2 of 5
Expected output: sutatsptth
Actual output: tsaustpoth
Running test 3 of 5
Expected output: sutatsptth
Actual output: tsuatsptth
Running test 4 of 5
Expected output: sutatsptth
Actual output: tsuatsptth
Running test 5 of 5
Expected output: sutatsptth
Actual output: tsuatsptth，现在已经非常接近了

6.最后一个example非常非常的重要，对于整体的影响非常非常的大
# k-shot prompting.py——对于sample应该写什么，如何写

成功率大概有40%
最后的发现:
- 如果要教会模型一些东西，需要更多的包含子模块的example，而且需要更多的sub-example才可以教会(>1)
- 不要添加过多的cot,那只会搅乱
- 不要加入过多的和子问题太相似的东西，加入一些比较robust的东西反而是更好的决定
- 我们的指令的主题要是examples，不要放太多太多的rules反而添乱，简洁清晰


# cot.py——激发推理能力
这个的话感觉甚至都不需要添加过多的prompt,本身效果就挺不错的(test2)
可以加上please think step by step 这样可以大大提高模型的性能。

# tool_calling.py——让模型学会使用工具，工具的规范

**一遍成功** - 成功率: 100%

## 关键经验教训:

### 1. 结构化的工具说明最关键
- 清晰地列出所有可用工具及其功能说明
- 为每个工具的参数都做详细的类型和用途说明
- 工具说明的清晰度直接影响模型的理解能力

### 2. 精确的格式规范帮助大
- 工具调用必须使用特定的 JSON 格式
- 明确指定 JSON 结构中的字段名（如 "tool", "args"）
- 指定参数的数据类型和默认值

### 3. 示例优于长篇规则说明
- 提供 1-2 个具体的工具调用示例比多页的规则说明更有效
- 示例应该展示：正确的 JSON 结构、参数的使用、预期的格式
- 简洁的例子能显著提升模型的准确性

### 4. 明确的输出限制
- 强调必须"仅返回 JSON，没有其他文本"
- 这种强制性指令对 LLM 生成规范化输出很重要

### 5. 温度配置
- 使用较低的温度（0.3）因为工具调用需要精确性而非创意
- 这比 k-shot prompting（温度 0.5）更严格

## 最终成功的 Prompt 结构:
```
你有访问工具的权限。当被要求使用工具时，仅响应有效的 JSON。

TOOLS:
1. output_every_func_return_type: 分析 Python 文件并返回函数名及其返回类型。
   - 参数: file_path (字符串，可选)

FORMAT:
始终使用此精确格式响应有效 JSON:
{
  "tool": "<工具名>",
  "args": {
    "file_path": ""
  }
}

EXAMPLE:
用户: 分析当前文件
你的响应:
{
  "tool": "output_every_func_return_type",
  "args": {
    "file_path": ""
  }
}

RULES:
- 仅输出 JSON，没有解释
- JSON 必须有效且可解析
- 不要在 JSON 对象外包含任何文本
```

## 核心洞察:
- **工具调用** 不同于其他 prompting 技术，它不需要大量示例教学
- 关键是 **清晰的结构说明** + **格式示例** 的组合
- 模型本身已经理解 JSON，所以重点应该放在 **明确规范** 而非 **引导学习**
- 这与 k-shot prompting 的方法不同：k-shot 需要教学，tool calling 需要规范！

# self-consistency-prompting.py——自我反思以及修改的agent

第一遍先尝试一下think step by step and answering the following math problems

**问题的固有难度远比 prompt 工程更重要**

- 对于简单、确定的问题（数学、JSON 生成）：简单 prompt + 高温度采样 = 100% 成功
- 对于复杂、需要创意转移的任务（字母反转）：需要复杂的 prompt 工程 + 多个精心设计的例子


因此对于复杂的问题，直接用think step by step触发推理能力，但是没有过多细节，反而比复杂的详细的prompt有效

# rag.py
涉及到用户的个人信息的代码填写
此时我们的prompt就是不要添加任何的虚假信息

# reflexion.py——agent
感觉也挺容易的，也就是build an agent
声明ai的身份(debugger, developer)
输入的东西(previous implementation，以及具体的failure)

以及我们希望最后的目标(从failure中理解为什么，并且修改代码，以及我们对于ai修改代码的限制，以及最后的输出的格式)



识别问题类型 - 知道每类问题用什么技术
成本效益分析 - 最简单方案往往最有效
迭代设计 - 通过反馈不断改进
规范化思维 - 清晰规范比冗长指令更重要
Agent 设计 - 理解 LLM 的自我改进能力

总之就是将课程上的东西给变成了代码了，还是挺有意思的