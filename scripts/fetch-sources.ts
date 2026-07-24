// Re-vendor the local source corpora at their pinned commits (data/sources/SOURCES.md).
// Local copies are the authority — this script exists so they are always
// reproducible, never API-dependent at build/check time.
// Usage: npm run fetch-sources   (network required; only needed to re-vendor)
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ROOT } from './lib.js'

const PINS = [
  {
    name: 'morphgnt',
    url: 'https://github.com/morphgnt/sblgnt.git',
    sha: 'aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d',
    copy: [{ glob: /(-morphgnt\.txt|^LICENSE\.md|^README\.md)$/, from: '.', to: 'data/sources/morphgnt' }],
  },
  {
    name: 'oshb',
    url: 'https://github.com/openscriptures/morphhb.git',
    sha: '3d15126fb1ef74867fc1434be1942e837932691f',
    copy: [
      { glob: /\.xml$/, from: 'wlc', to: 'data/sources/oshb/wlc' },
      { glob: /^README\.md$/, from: '.', to: 'data/sources/oshb' },
    ],
  },
]

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim()

for (const pin of PINS) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `charis-${pin.name}-`))
  console.log(`fetching ${pin.name} @ ${pin.sha.slice(0, 7)} ...`)
  git(tmp, 'init', '-q')
  git(tmp, 'remote', 'add', 'origin', pin.url)
  git(tmp, 'fetch', '-q', '--depth', '1', 'origin', pin.sha)
  git(tmp, 'checkout', '-q', 'FETCH_HEAD')
  for (const c of pin.copy) {
    const srcDir = path.join(tmp, c.from)
    const destDir = path.join(ROOT, c.to)
    fs.mkdirSync(destDir, { recursive: true })
    let n = 0
    for (const f of fs.readdirSync(srcDir)) {
      if (!c.glob.test(f)) continue
      fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f))
      n++
    }
    console.log(`  ${c.to}: ${n} files`)
  }
  fs.rmSync(tmp, { recursive: true, force: true })
}
console.log('fetch-sources: done — now run: npm run build-lemmas')
