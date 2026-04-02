import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'

const PROVIDERS_FILE = join(
  process.env.XDG_CONFIG_HOME || join(homedir(), '.config'),
  'ccx',
  'providers.json',
)

function ensureFile() {
  const dir = dirname(PROVIDERS_FILE)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(PROVIDERS_FILE)) {
    writeFileSync(PROVIDERS_FILE, JSON.stringify({ providers: [] }, null, 2) + '\n')
  }
}

function load() {
  ensureFile()
  return JSON.parse(readFileSync(PROVIDERS_FILE, 'utf-8'))
}

function save(data) {
  ensureFile()
  writeFileSync(PROVIDERS_FILE, JSON.stringify(data, null, 2) + '\n')
}

export function getAll() {
  return load().providers || []
}

export function add(provider) {
  const data = load()
  data.providers = data.providers || []
  data.providers.push(provider)
  save(data)
}

export function remove(index) {
  const data = load()
  data.providers.splice(index, 1)
  save(data)
}

export function update(index, provider) {
  const data = load()
  data.providers[index] = provider
  save(data)
}

export const filePath = PROVIDERS_FILE
