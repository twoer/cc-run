import * as ccSwitch from './cc-switch.mjs'
import * as jsonFile from './json-file.mjs'

const sources = [ccSwitch, jsonFile]

export async function loadProviders() {
  for (const source of sources) {
    if (source.detect()) {
      try {
        const providers = await source.list()
        if (providers.length > 0) {
          return { providers, source: source.source }
        }
      } catch {
        // Try next source
      }
    }
  }
  return { providers: [], source: null }
}
