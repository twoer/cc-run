# ccx

**C**laude **C**ode e**X**ecutor — 轻松切换 Provider 和模型。

```
$ ccx

┌  ⚡ ccx — Claude Code eXecutor
│
│  5 providers from cc-switch · v0.1.0
│    ccx add   Add provider    ccx edit  Edit provider
│    ccx list  List providers   ccx rm    Remove provider
│    ccx -n    New window       ccx help  Show help
│
◆  Select provider
│  ● Zhipu GLM-5.1           glm-5.1
│  ○ Zhipu GLM-5 Turbo       glm-5-turbo
│  ○ Claude Official
└
```

## 安装

```bash
# 克隆并链接
git clone https://github.com/twoer/ccx.git ~/.ccx
cd ~/.ccx && npm install
ln -s ~/.ccx/bin/ccx.mjs /usr/local/bin/ccx
```

### 环境要求

- macOS
- Node.js >= 18
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

## 使用

```bash
# 交互选择，在当前终端运行
ccx

# 模糊匹配 provider 名称
ccx glm

# 在新终端窗口中打开
ccx --new
ccx -n glm
```

## 命令

```bash
# 管理 Provider
ccx add           # 交互式添加 provider
ccx list          # 列出所有 provider
ccx edit          # 编辑 provider
ccx rm            # 删除 provider

# 其他
ccx help          # 显示帮助
ccx --reset       # 重置所有配置
```

## Provider 数据源

ccx 会自动检测可用的数据源：

### 1. cc-switch（自动检测）

如果你使用 [cc-switch](https://github.com/nicepkg/cc-switch)，ccx 会直接读取 `~/.cc-switch/cc-switch.db`，无需额外配置。

### 2. JSON 文件（手动配置）

手动创建 `~/.config/ccx/providers.json`，或使用 `ccx add` 交互式创建：

```json
{
  "providers": [
    {
      "name": "My Provider",
      "model": "model-name",
      "env": {
        "ANTHROPIC_BASE_URL": "https://...",
        "ANTHROPIC_AUTH_TOKEN": "sk-...",
        "ANTHROPIC_MODEL": "model-name"
      }
    }
  ]
}
```

## 终端支持

使用 `ccx --new` 时，首次运行会自动检测已安装的终端：

- Ghostty
- iTerm2
- Warp
- kitty
- Terminal.app

配置文件：`~/.config/ccx/config.json`

## License

MIT
