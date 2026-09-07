/**
 * Every asset path the code asks for must exist, and every shipped asset
 * should be reachable from the code.
 *
 * This exists because I deleted four live sprite atlases.
 *
 * They looked dead: grepping the source for `gentle-ripples-leaves-v5` found
 * nothing, so I removed it along with three siblings and wrote a commit
 * message explaining how carefully I had checked. The reference is built at
 * runtime —
 *
 *     `url(/game/recovery/atlases/gentle-ripples-${kind}-v5.png)`
 *
 * — so no literal basename appears anywhere. Gentle Ripples was broken until
 * a teammate restored them. `tools/css-coverage.mjs` in this same directory
 * opens by warning about exactly this trap for CSS classes; the same trap
 * applies to files, and a plain grep is not evidence of deadness.
 *
 * So this check understands interpolation. A template literal becomes a
 * pattern, with `${...}` standing for one path segment's worth of anything.
 *
 * Be clear about what that can and cannot prove. It catches a reference that
 * resolves to nothing, which is a 404 waiting to happen. It does *not* catch
 * deleting one file out of an interpolated family: the siblings still match
 * the pattern, so every check here passes. That was verified by deleting the
 * same atlas again and watching this script stay green. Catching it properly
 * means resolving the union type behind the interpolation, and claiming to
 * catch it without that would make this file worse than useless.
 *
 * What it does instead is name the files where grep is not evidence — which
 * is the signal that would have stopped the original mistake.
 *
 * Three outcomes, and only one of them fails:
 *
 *   - A reference matching no file at all: a 404. Fails, unless the line
 *     carries an `asset-optional` marker — some references are deliberate
 *     seams for a file the repository does not ship, and the code already
 *     handles their absence.
 *   - A file reached only through an interpolated path: reported loudly, so
 *     that nobody reasons about it with a search.
 *   - A file matched by nothing: reported, never failed, because this
 *     matching is a heuristic and a false positive would invite exactly the
 *     deletion this file exists to prevent.
 *
 *   node tools/check-assets.mjs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const PUBLIC_DIR = join('assets', 'app-runtime-v1')
const SRC = 'src'

/** Files the browser can request, as the paths it would request them by. */
function servedAssets(dir = PUBLIC_DIR) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return servedAssets(full)
    return ['/' + relative(PUBLIC_DIR, full).replace(/\\/g, '/')]
  })
}

/** Extensions worth checking. Ignores README, service worker, manifest. */
const ASSET_RE = /\.(webp|png|jpe?g|gif|svg|mp3|ogg|wav|woff2?)$/i

function sourceFiles(dir = SRC) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.(ts|tsx|css|html)$/.test(full) ? [full] : []
  })
}

/* Not everything that references an asset lives in src/: the icons are named
   by index.html and the web manifest, and the service worker precaches by
   path. Miss these and every icon reads as dead. */
const EXTRA_SOURCES = [
  'index.html',
  join(PUBLIC_DIR, 'manifest.webmanifest'),
  join(PUBLIC_DIR, 'sw.js'),
]

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Comments out, before anything is read as a reference.
 *
 * Several files name an asset in prose — `layout.ts` opens by saying which
 * illustration the world is drawn from — and a path mentioned in a sentence
 * is documentation, not a request the browser will ever make. Line comments
 * are only stripped when `//` is not preceded by a colon, so a `https://`
 * inside a string survives.
 */
function withoutComments(source) {
  return source
    // Newlines are kept so line numbers still line up afterwards — the
    // `asset-optional` markers are read from the original, and their line
    // numbers have to mean the same thing in both copies.
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, before) => before + ' '.repeat(m.length - before.length))
}

/**
 * Pull every asset-looking path out of a source file, as regexes.
 *
 * A quoted or backticked run containing `/` and an asset extension counts.
 * `${...}` inside a template becomes `[^/'"\`)]*` — anything except a path
 * separator or a string terminator, so one interpolation cannot silently
 * match across directories.
 */
function referencePatterns(original) {
  const out = []

  /* Lines opted out with `asset-optional`, and the few lines after it — wide
     enough that the marker can sit inside the doc comment above the
     declaration it excuses, which is where a reader will actually look for
     it, rather than trailing the line itself.

     Read from the original, because the marker lives in a comment and the
     scan below runs on a comment-stripped copy. */
  const OPTIONAL_REACH = 6
  const optionalLines = new Set()
  original.split('\n').forEach((line, i) => {
    if (!line.includes('asset-optional')) return
    for (let n = 0; n <= OPTIONAL_REACH; n += 1) optionalLines.add(i + n)
  })

  /* Paths mentioned in prose are documentation, not requests the browser will
     make. Blanked rather than removed, so the line numbers above still hold. */
  const source = withoutComments(original)
  const lineOf = (index) => source.slice(0, index).split('\n').length - 1

  /* The path *inside* the string, not the whole string. A CSS reference is
     `url(/game/...png)` and a JSX one may be `${base}/x.png`, so treating the
     literal as a path made every wrapped reference look like a miss — which
     is the same false-negative that caused the deletion in the first place.
     A run starts at `/` and continues through anything that can appear in a
     path, interpolations included. */
  const PATH_RE = /\/(?:\$\{[^}]*\}|[^\s'"`()<>,;])*\.(?:webp|png|jpe?g|gif|svg|mp3|ogg|wav|woff2?)/gi

  const strings = source.match(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g) ?? []
  let cursor = 0
  for (const raw of strings) {
    const at = source.indexOf(raw, cursor)
    cursor = at + raw.length
    const optional = optionalLines.has(lineOf(at))
    const body = raw.slice(1, -1)
    for (const path of body.match(PATH_RE) ?? []) {
      const pattern = path
        .split(/\$\{[^}]*\}/)
        .map(escape)
        .join('[^/\'"`)]*')
      out.push({ literal: path, optional, re: new RegExp('(^|/)' + pattern.replace(/^\//, '') + '$') })
    }
  }
  return out
}

const assets = servedAssets().filter((p) => ASSET_RE.test(p))
const files = [...sourceFiles(), ...EXTRA_SOURCES.filter((f) => {
  try { return statSync(f).isFile() } catch { return false }
})]
const patterns = []
for (const file of files) {
  for (const p of referencePatterns(readFileSync(file, 'utf8'))) {
    patterns.push({ ...p, file: relative('.', file).replace(/\\/g, '/') })
  }
}

// Guard against the check quietly reading nothing.
if (assets.length < 10 || patterns.length < 10) {
  console.error(`\n  check-assets found ${assets.length} assets and ${patterns.length} references.`)
  console.error('  That is too few to be right — it is not reading what it should be.\n')
  process.exit(2)
}

const broken = []
for (const { literal, re, file, optional } of patterns) {
  // Only judge references that look like they point into the public root.
  if (!literal.startsWith('/') || optional) continue
  if (literal.includes('${')) {
    // An interpolated path is satisfied if it can match at least one file.
    if (!assets.some((a) => re.test(a))) broken.push({ file, literal })
  } else if (!assets.includes(literal)) {
    broken.push({ file, literal })
  }
}

/**
 * Classify each file by *how* it is reached, which matters more than whether.
 *
 * A file named by a literal path is safe to reason about with grep. A file
 * reached only through an interpolated path is not: its name never appears
 * anywhere, and its siblings matching the same pattern means removing it
 * leaves every check here passing. That is precisely what happened — the
 * pattern was still satisfied by the three atlases I had not yet deleted.
 *
 * So this cannot be enforced, and pretending otherwise would be worse than
 * saying so. What it can do is name the files where grep is not evidence.
 */
const staticLiterals = new Set(
  patterns.filter((p) => !p.literal.includes('${')).map((p) => p.literal),
)
const dynamicOnly = assets.filter((a) =>
  !staticLiterals.has(a) && patterns.some((p) => p.literal.includes('${') && p.re.test(a)))
const unreferenced = assets.filter((a) => !patterns.some((p) => p.re.test(a)))

if (broken.length > 0) {
  console.error(`\n  ${broken.length} asset reference${broken.length === 1 ? '' : 's'} point at nothing.`)
  console.error('  Each of these is a 404 the moment that code path runs.\n')
  for (const b of broken) console.error(`    ${b.file}\n      -> ${b.literal}`)
  console.error('')
  process.exit(1)
}

console.log(`  check-assets: ${assets.length} assets, ${patterns.length} references, all resolve.`)

if (dynamicOnly.length > 0) {
  console.log(`\n  ${dynamicOnly.length} file${dynamicOnly.length === 1 ? ' is' : 's are'} reached only through an interpolated path.`)
  console.log('  Their names appear nowhere in the source, so grep says nothing about')
  console.log('  them and removing one leaves every check here still passing. Do not')
  console.log('  judge these by search — read the code that builds the path.\n')
  for (const a of dynamicOnly) console.log(`    ${a}`)
}

if (unreferenced.length > 0) {
  console.log(`\n  ${unreferenced.length} file${unreferenced.length === 1 ? ' is' : 's are'} matched by no reference at all.`)
  console.log('  Reported, never failed: this matching is a heuristic, and deleting a')
  console.log('  file on its say-so is the mistake this tool exists to prevent.\n')
  for (const a of unreferenced) console.log(`    ${a}`)
}
console.log('')
