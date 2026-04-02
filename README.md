# ccx

Claude Code launcher - switch providers and models with ease.

```
$ ccx

  Select provider: (↑/↓ move, Enter confirm, q quit)
  ────────────────────────────────────────
  ▸ Zhipu GLM-5 Turbo         [glm-5-turbo]
    Zhipu GLM-5.1              [glm-5.1]
    Claude Official            [claude-sonnet-4-20250514]
  ────────────────────────────────────────
```

## Install

```bash
curl -sL https://raw.githubusercontent.com/twoer/ccx/main/install.sh | zsh
```

### Requirements

- macOS
- zsh (pre-installed on macOS)
- [jq](https://jqlang.org/) (`brew install jq`)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

## Usage

```bash
# Interactive selection, run in current terminal
ccx

# Fuzzy match provider name
ccx glm

# Open in a new terminal window
ccx --new
ccx -n glm

# Show help
ccx --help

# Reset config
ccx --reset
```

## Provider Sources

ccx auto-detects available provider sources:

### 1. cc-switch (auto-detected)

If you use [cc-switch](https://github.com/nicepkg/cc-switch), ccx reads providers directly from `~/.cc-switch/cc-switch.db`. No extra configuration needed.

### 2. JSON file (manual)

Create `~/.config/ccx/providers.json`:

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

See [config.example.json](config.example.json) for a full example.

## Configuration

Config file: `~/.config/ccx/config.json`

```json
{
  "terminal": "Ghostty"
}
```

The terminal is auto-detected on first `ccx --new`. Supported terminals:

- Ghostty
- iTerm2
- Warp
- kitty
- Terminal.app

## License

MIT
