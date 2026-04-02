import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const PROVIDERS_FILE = join(
  process.env.XDG_CONFIG_HOME || join(homedir(), '.config'),
  'ccx',
  'providers.json',
)

export function detect() {
  return existsSync(PROVIDERS_FILE)
}

export function list() {
  const data = JSON.parse(readFileSync(PROVIDERS_FILE, 'utf-8'))
  const providers = data.providers || []

  return providers.map((p, i) => ({
    id: `json:${i}`,
    name: p.name,
    model: p.model || p.env?.ANTHROPIC_MODEL || 'unknown',
    env: p.env || {},
  }))
}

export const source = 'json'
export const filePath = PROVIDERS_FILE
