/**
 * Every `var(--token)` must resolve to a token that exists.
 *
 * This exists because the same bug shipped three separate times and was
 * invisible in all three:
 *
 *   - `library.css` set `font: 400 14px/1.5 var(--body)`. That name was never
 *     defined anywhere, and a CSS shorthand containing an invalid value is
 *     discarded *whole* — so the Library's form fields silently fell back to
 *     the browser default.
 *   - `recovery.css` referenced two undefined faces across ten declarations.
 *     Every heading and body run in all five recovery activities was falling
 *     back to whatever it inherited. That typography had never once applied.
 *   - A first pass at `scene-kit.css` invented three `--pt-*` surface names.
 *     Those had literal fallbacks, so they rendered correctly while quietly
 *     not being theme-aware — the worst version, because nothing looked wrong.
 *
 * None of these throw, none log, and none fail a build. A missing custom
 * property just makes its declaration evaporate. This check is the only thing
 * that catches it.
 *
 * It lives here rather than in the vitest suite because Vitest stubs CSS
 * imports — `import.meta.glob('*.css', { query: '?raw' })` returns empty
 * strings under test, so the check would have passed while reading nothing.
 *
 *   node tools/check-tokens.mjs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = 'src'

function filesUnder(dir, ext) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory()
      ? filesUnder(full, ext)
      : ext.some((e) => full.endsWith(e)) ? [full] : []
  })
}

/** Comments are stripped first, or tokens merely *discussed* in prose count. */
const withoutComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')

const cssFiles = filesUnder(SRC, ['.css'])
const allCss = cssFiles.map((f) => withoutComments(readFileSync(f, 'utf8'))).join('\n')

/** Every `--name:` declaration in the stylesheets. */
const defined = new Set([...allCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))

/** Plus the ones components set inline: `style={{ '--atlas': ... }}`. */
for (const file of filesUnder(SRC, ['.ts', '.tsx'])) {
  if (/\.test\.tsx?$/.test(file)) continue
  for (const m of readFileSync(file, 'utf8').matchAll(/['"`](--[\w-]+)['"`]\s*:/g)) {
    defined.add(m[1])
  }
}

/** A reference *with* a fallback may name something undefined — that is the
 *  entire point of the fallback, so only bare references are checked. */
const bareReferences = (css) =>
  [...css.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map((m) => m[1])

const missing = []
for (const file of cssFiles) {
  const css = withoutComments(readFileSync(file, 'utf8'))
  for (const token of new Set(bareReferences(css))) {
    if (!defined.has(token)) {
      missing.push(`${relative('.', file).replace(/\\/g, '/')}  ->  var(${token})`)
    }
  }
}

// A glob that matched nothing would make this pass while checking zero files.
if (cssFiles.length < 10 || !defined.has('--pt-accent')) {
  console.error(`\n  check-tokens read ${cssFiles.length} stylesheets and did not find the`)
  console.error('  base theme tokens. That means it is not reading what it should be.\n')
  process.exit(2)
}

if (missing.length > 0) {
  console.error(`\n  ${missing.length} CSS custom propert${missing.length === 1 ? 'y is' : 'ies are'} referenced but never defined.`)
  console.error('  Each of these silently drops the declaration that uses it.\n')
  for (const line of missing) console.error(`    ${line}`)
  console.error('\n  Either define the token, or give the reference a fallback:')
  console.error('  var(--thing, <literal>).\n')
  process.exit(1)
}

console.log(`  check-tokens: ${defined.size} tokens defined, all references resolve across ${cssFiles.length} stylesheets.`)
