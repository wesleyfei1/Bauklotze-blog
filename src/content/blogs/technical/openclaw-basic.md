---
title: 'openclaw部署'
publishDate: 2026-02-28
updatedDate: 2026-02-28
description: 'openclaw'
category: 'research'
tags:
  - music
language: zh
heroImage:
  src: 'src\content\background\cz2.webp'
  color: '#f4736a'
---

1. skill-1: 配置了一个github-monitor 工具：
自定义了一个脚本，从而直接在对话框中输入:使用github-monitor监控github3天内的用户信息，包括stars, commit等，然后就会自动调用工具去实现功能

GITHUB_TOKEN=...

1. skill-2: 网页搜索工具,使用tavily-api
TAVILY_API_KEY=...

==openclaw部署中的东西==
```linux
# 更新node.js
 nvm install --lts
wesle@fwh:~$ openclaw channels add 添加channels
wesle@fwh:~$ openclaw pairing list telegram 进行和telegram bot的链接
```
https://zhuanlan.zhihu.com/p/2002522071650018395  添加deepseek api

==openclaw init==
- 更新node.js
- 模型api配置: z.ai,默认使用的是zai/glm-4.5-air,以及deepseek模型(通过修改settings.json文件)
deepseek: 

```
"providers": {
  "zai": { ... }, // 保留你原来的 GLM 配置
  "deepseek": {
    "baseUrl": "https://api.deepseek.com/v1",
    "api": "deepseek-api",
    "models": [
      {
        "id": "deepseek-chat",
        "name": "DeepSeek V3.2-chat",
        "reasoning": false,
        "input": ["text"],
        "contextWindow": 65536,
        "maxTokens": 4096
      },
      {
        "id": "deepseek-reasoner",
        "name": "DeepSeek V3.2-reason",
        "reasoning": true,
        "input": ["text"],
        "contextWindow": 65536,
        "maxTokens": 4096
      }
    ]
  }
}
```
- channel: telegram personal bot配置
- openclaw启动:
```
openclaw gateway
openclaw dashboard # 配置的密钥，共享密钥
```
 
使用了token校验机制，也就是对称密钥

==Telegram bot api==:
<!--8358290261:AAHeUuyUomLy1K8QiEH9pS8S9ZmwskuLWIQ -->
==Username==:
wesleyfei_personal_bot
==name==:
韩吉
