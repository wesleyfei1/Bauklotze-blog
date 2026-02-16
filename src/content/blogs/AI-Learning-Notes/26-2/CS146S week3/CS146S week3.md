---
title: 'CS146S week3-Modern Agent&&MCP介绍'
publishDate: 2026-02-16
updatedDate: 2026-02-16
description: 'CS146S week3-Modern Agent&&MCP introduction'
category: tech
tags:
  - cs146s
  - prompt
language: zh
heroImage:
  src: '../../../../background/titan4.jpg'
  color: '#d5c1a4'
---


现代的agent肯定不只是对话，还会使用工具与现实世界进行交互，而交互"协议”就是MCP，CS146s week3的课程以及assignment是介绍MCP的概念以及如何设计自己的MCP，下面来进行一些梳理。

# Modern Agent
## Agent底层架构
用户与server交互时，会运行一个带有底层LLM的循环，在每一轮对话中，用户输入提示词，LLM发出工具调用，执行完工具后返回给LLM,最后将结果呈现给用户。
- **LLM输入包括:** System Prompt，User prompt,assistant prompt(模型过去的回答)
**一般的流程为**
- **读取与对话管理**：从终端读取输入，并不断追加到对话历史中 。
- **工具声明**：告知 LLM 有哪些工具可用 。
- **工具调用请求**：LLM 在适当的时候请求使用工具 。
- **工具执行**：在离线状态下执行工具，并将结果返回给 LLM

显然，像上下文过长，遗忘等问题都是会出现的，因此可以考虑一些小tips
- 前置context重置：将前面的内容总结成一个tiny prompt
- system reminder:适当的加入一些别的内容(prompt)来防止遗忘
- sub agent以及结构化的输出
## Why MCP
MCP出现前LLM和各种工具的api调用非常混乱，需要M8n的配置，过于的麻烦。因此MCP是一种开放协议，类似于计算机网络中的协议，只要LLM有调用工具的需求，就发出"query",而工具端在收到"query"之后做出应答，避免混乱。

- **核心术语**：
    - Host (主机)：如 Cursor, Claude Desktop 。
    - MCP Client (客户端)：嵌入在主机中的库，维持与服务器的有状态会话 。
    - MCP Server (服务端)：工具前的轻量级封装 。
    - Tool (工具)：可调用的函数（数据源或 API） 。
- **工作流程**：
    1. 客户端向 MCP 服务端请求工具列表 (`tools/list`) 。
    2. 服务端返回描述每个工具的 JSON（名称、摘要、JSON Schema） 。
    3. 主机将 JSON 注入模型的上下文中 。
    4. 用户提示触发模型，输出结构化的工具调用 。
    5. MCP 服务端执行操作，对话继续 。
- **传输层**：MCP 提供 stdio(标准输入和输出) 和 SSE (Server-Sent Events，基于HTTP的更加长时的协议) 传输层 。
![](./CS146S%20week3-Modern%20Agent&&MCP介绍.assets/现代Agent，MCP设计与使用_2026-02-16-09.png)

## An MCP example

```python
from pathlib import Path
from typing import Any, Dict, List
from fastmcp import FastMCP

mcp = FastMCP(name="SimpleMCPTestServer")


def resolve_abs_path(path_str: str) -> Path:
    """
    file.py -> /Users/home/mihail/modern-software-dev-lectures/file.py
    """
    path = Path(path_str).expanduser()
    if not path.is_absolute():
        path = (Path.cwd() / path).resolve()
    return path

@mcp.tool
def read_file_tool(filename: str) -> Dict[str, Any]:
    """
    Gets the full content of a file provided by the user.
    :param filename: The name of the file to read.
    :return: The full content of the file.
    """
    full_path = resolve_abs_path(filename)
    print(full_path)
    # TODO (mihail): Be more defensive in the file reading here
    with open(str(full_path), "r") as f:
        content = f.read()
    return {
        "file_path": str(full_path),
        "content": content
    }

@mcp.tool
def list_files_tool(path: str) -> Dict[str, Any]:
    """
    Lists the files in a directory provided by the user.
    :param path: The path to the directory to list files from.
    :return: A list of files in the directory.
    """
    full_path = resolve_abs_path(path)
    all_files = []
    for item in full_path.iterdir():
        all_files.append({
            "filename": item.name,
            "type": "file" if item.is_file() else "dir"
        })
    return {
        "path": str(full_path),
        "files": all_files
    }

@mcp.tool
def edit_file_tool(path: str, old_str: str, new_str: str) -> Dict[str, Any]:
    """
    Replaces first occurrence of old_str with new_str in file. If old_str is empty, creates/overwrites file with new_str.
    :param path: The path to the file to edit.
    :param old_str: The string to replace.
    :param new_str: The string to replace with.
    :return: A dictionary with the path to the file and the action taken.
    """
    full_path = resolve_abs_path(path)
    p = Path(full_path)
    if old_str == "":
        p.write_text(new_str, encoding="utf-8")
        return {
            "path": str(full_path),
            "action": "created_file"
        }
    original = p.read_text(encoding="utf-8")
    if original.find(old_str) == -1:
        return {
            "path": str(full_path),
            "action": "old_str not found"
        }
    edited = original.replace(old_str, new_str, 1)
    p.write_text(edited, encoding="utf-8")
    return {
        "path": str(full_path),
        "action": "edited"
    }

if __name__ == "__main__":
    mcp.run()
```
比如上一个程序的话
当你运行这段代码并将其集成到 Cursor 后，流程如下 ：
1. **注册**: 客户端（如 Cursor）启动该脚本，调用 `tools/list` 获取这三个工具的说明 。  
2. **触发**: 你对 AI 说：“帮我看看 `README.md` 里写了什么。”
3. **调用**: 模型识别出需要调用 `read_file_tool`，并传入参数 `filename="README.md"` 。
4. **执行**: 你的 Python 脚本运行 `read()`，通过 stdio 将文件内容传回 。
5. **回复**: AI 读取到内容，在聊天框里为你总结


# Assignment Practice
## MCP设计
**Tasks requirement**: 要求设计一个MCP工具，在claude desktop中进行调用
**构思**: 一个可以获取当天某一只股票信息的mcp,使用finnhub调股票信息
**实现步骤**： copilot列计划，然后一条条实现，并且分别写unit test
`week3/server/`:
- config.py: 加载.env并且进行查看是否会有报错，将.env中的东西转换成可以进行传输的
- finnhub_client.py: finnhub api封装，进行一堆的异常的处理,以及进行拉取网页信息和调用
- main.py:MCP服务器入口，将信息转换成stdio的格式，验证，请求，格式化，最后封装成一个个的工具

具体数据流程为
```
用户（Claude Desktop）
  ↓ "Get quote for AAPL"
MCP 协议
  ↓ get_stock_quote("AAPL")
main.py
  ↓ _normalize_symbol → _build_client → client.get_quote
finnhub_client.py
  ↓ _request("quote", {"symbol": "AAPL"})
Finnhub API
  ↓ 返回 {"c": 123.45, "d": 1.2, ...}
main.py
  ↓ _format_quote
Claude Desktop
  ← {"status": "ok", "price": 123.45, ...}
```
## Claude Desktop部署
设计好之后，部署到claude desktop。在`C:\Users\{username}\AppData\Roaming\Claude`下的`claude_desktop_config.json中`,添加这一段
```json
{
  "mcpServers": {
    "finnhub-stock": {
      "command": "D:\\conda_env\\envs\\cs146s\\python.exe", //因为我是在cs146s环境下使用
      "args": [
        "-m",
        "week3.server.main"
      ],
      "env": {
        "FINNHUB_API_KEY": "your-api",
        "PYTHONPATH": "D:\\WesleyFei\\Alpha-lab\\0_Inbox\\modern-software-dev-assignments"
      }
    }
  },
  "preferences": {
    "sidebarMode": "chat",
    "coworkScheduledTasksEnabled": false
  }
}
```
这样你就能看到
![](./CS146S%20week3-Modern%20Agent&&MCP介绍.assets/现代Agent，MCP设计与使用_2026-02-16-35.png)
![](./CS146S%20week3-Modern%20Agent&&MCP介绍.assets/现代Agent，MCP设计与使用_2026-02-16-37.png)
具体程序参考我的github仓库 https://github.com/wesleyfei1/Stanford-CS146S-WesleyFei/tree/main/week3
