import { intro, outro, select, cancel, isCancel, log, spinner } from '@clack/prompts'
import pc from 'picocolors'
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawn } from 'node:child_process'
import { loadProviders } from './providers/index.mjs'
import { detectTerminals, getTerminal } from './terminals/index.mjs'
import * as config from './config.mjs'

const VERSION = '0.1.0'

function parseArgs(argv) {
  const flags = { newWindow: false, help: false, version: false, reset: false }
  let query = ''

  for (const arg of argv) {
    switch (arg) {
      case '--new': case '-n': flags.newWindow = true; break
      case '--help': case '-h': flags.help = true; break
      case '--version': case '-v': flags.version = true; break
      case '--reset': flags.reset = true; break
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`)
          process.exit(1)
        }
        query = arg
    }
  }

  return { flags, query }
}

function showHelp() {
  console.log(`
  ${pc.cyan(pc.bold('⚡ ccx'))} ${pc.dim(`v${VERSION}`)}
  ${pc.dim('Claude Code launcher')}

  ${pc.bold('Usage:')} ccx [options] [provider-name]

  ${pc.bold('Options:')}
    ${pc.cyan('-n')}, ${pc.cyan('--new')}      Open in a new terminal window
    ${pc.cyan('-h')}, ${pc.cyan('--help')}     Show this help
    ${pc.cyan('-v')}, ${pc.cyan('--version')}  Show version
    ${pc.cyan('--reset')}        Reset all configuration

  ${pc.bold('Examples:')}
    ${pc.dim('$')} ccx              ${pc.dim('# Interactive select, current terminal')}
    ${pc.dim('$')} ccx glm          ${pc.dim('# Fuzzy match provider name')}
    ${pc.dim('$')} ccx --new        ${pc.dim('# Interactive select, new window')}
    ${pc.dim('$')} ccx -n glm       ${pc.dim('# Fuzzy match + new window')}

  ${pc.bold('Providers:')}
    ${pc.cyan('cc-switch')}  ${pc.dim('auto-detected from ~/.cc-switch/cc-switch.db')}
    ${pc.cyan('JSON file')}  ${pc.dim('configure at ~/.config/ccx/providers.json')}

  ${pc.bold('Config:')} ${pc.dim('~/.config/ccx/config.json')}
`)
}

function writeTempSettings(env) {
  const dir = mkdtempSync(join(tmpdir(), 'ccx-'))
  const file = join(dir, 'settings.json')
  writeFileSync(file, JSON.stringify({ env }, null, 2))
  return file
}

async function selectTerminal() {
  const saved = config.get('terminal')
  if (saved) {
    const t = getTerminal(saved)
    if (t) return t
  }

  const available = detectTerminals()
  if (available.length === 1) {
    config.set('terminal', available[0].name)
    return available[0]
  }

  const result = await select({
    message: 'Select default terminal for new windows',
    options: available.map(t => ({ value: t.name, label: t.name })),
  })

  if (isCancel(result)) {
    cancel('Cancelled')
    process.exit(0)
  }

  config.set('terminal', result)
  return getTerminal(result)
}

export async function run(argv) {
  const { flags, query } = parseArgs(argv)

  if (flags.version) {
    console.log(`ccx ${VERSION}`)
    return
  }

  if (flags.help) {
    showHelp()
    return
  }

  if (flags.reset) {
    config.reset()
    log.success('Config reset')
    return
  }

  // Load providers
  intro(pc.cyan(pc.bold('⚡ ccx')))
  log.message(`${pc.dim('Switch Claude Code providers and models with ease.')}`)
  const { providers, source } = await loadProviders()
  log.message(pc.dim(`${providers.length} providers from ${source || 'none'} · v${VERSION}`))

  if (providers.length === 0) {
    log.error('No providers found')
    log.message('')
    log.message(`  ${pc.cyan('cc-switch')}  ${pc.dim('auto-detected from ~/.cc-switch/cc-switch.db')}`)
    log.message(`  ${pc.cyan('JSON file')}  ${pc.dim('configure at ~/.config/ccx/providers.json')}`)
    log.message('')
    cancel('Setup a provider source first')
    return
  }

  // Select provider
  let selected

  if (query) {
    const lowerQuery = query.toLowerCase()
    selected = providers.find(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.model.toLowerCase().includes(lowerQuery),
    )

    if (!selected) {
      log.warn(`No match for "${query}"`)
    }
  }

  if (!selected) {
    const result = await select({
      message: 'Select provider',
      options: providers.map(p => ({
        value: p.id,
        label: p.name,
        hint: pc.dim(p.model),
      })),
    })

    if (isCancel(result)) {
      cancel('Cancelled')
      process.exit(0)
    }

    selected = providers.find(p => p.id === result)
  }

  // Write temp settings
  const settingsFile = writeTempSettings(selected.env)

  if (flags.newWindow) {
    const terminal = await selectTerminal()
    const cwd = process.cwd()
    const cmd = `cd '${cwd}'; echo '=== Claude Code [${selected.name}] ==='; echo; claude --settings '${settingsFile}'; rm -f '${settingsFile}'; exec bash`
    terminal.open(cmd)
    outro(`${pc.green('⚡')} ${selected.name} ${pc.dim(`(${selected.model})`)} → ${pc.dim(terminal.name)}`)
  } else {
    outro(`${pc.green('⚡')} ${selected.name} ${pc.dim(`(${selected.model})`)}`)

    // Replace current process with claude
    const child = spawn('claude', ['--settings', settingsFile], {
      stdio: 'inherit',
      env: { ...process.env },
    })

    child.on('exit', (code) => {
      try { rmSync(settingsFile, { force: true }) } catch {}
      process.exit(code ?? 0)
    })
  }
}
