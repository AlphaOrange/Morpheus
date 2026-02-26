// vite-plugin-prepare-books-data.js
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, join, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'
import chokidar from 'chokidar'

// Prefix images in json
function _prefixImages(json, prefix) {
  // If the value is an array → recurse on each element
  if (Array.isArray(json)) {
    return json.map((item) => _prefixImages(item, prefix))
  }

  // If the value is an object → recurse on each property
  if (json && typeof json === 'object') {
    const result = {}
    for (const key in json) {
      result[key] = _prefixImages(json[key], prefix)
    }
    return result
  }

  // If the value is a string → check if it's an image filename
  if (typeof json === 'string') {
    if (json.match(/\.(jpg|jpeg|png)$/i)) {
      return prefix + json
    }
  }

  // Otherwise return the value unchanged
  return json
}

// Read nested directories of json files into one nested object
function _readDeepYaml(inputPath, nesting) {
  const content = {}

  // Load folder content
  const entries = readdirSync(join(inputPath, ...nesting), { withFileTypes: true }).filter(
    (entry) => !entry.name.startsWith('.'),
  )

  // Loop through content
  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      // Call self for nested directory
      content[entry.name] = _readDeepYaml(inputPath, [...nesting, entry.name])
    } else if (entry.isFile() && extname(entry.name) === '.yaml') {
      // Load data from yaml into content
      let entryPath = join(inputPath, ...nesting, entry.name)
      try {
        const bookYaml = readFileSync(entryPath, 'utf-8')
        let parsed = yaml.load(bookYaml)
        // Prefix images from deeper files
        if (nesting.length > 1) {
          parsed = _prefixImages(parsed, nesting.slice(1).join('_') + '_')
        }
        const id = basename(entry.name, '.yaml')
        if (id !== nesting.slice(-1)[0]) {
          content[id] = parsed
          content[id]['id'] = id
        } else {
          Object.assign(content, parsed) // if entry has folder name include content directly
          content['id'] = id
        }
      } catch (err) {
        console.error(`❌ Error parsing ${entryPath}:`, err)
      }
    }
  })

  return content
}

// Read and preprocess a book source directory
function _buildBook(inputPath, bookID) {
  // Read folder content
  let content = _readDeepYaml(inputPath, [bookID]) // content: all book information
  let base = {} // base: top-level description of book

  // Store and lift book.json content
  if ('book' in content) {
    Object.assign(base, content.book)
    Object.assign(content, base)
    delete content.book
  } else {
    console.error(`❌ ${bookID} has no book.json`)
  }

  // Fix book id
  content['id'] = bookID
  base['id'] = bookID

  return { bookContent: content, bookBase: base }
}

// ------
// Plugin
// ------
export default function prepareBooksDataPlugin(options = {}) {
  // Load options
  const { inputDir, outputDir, watch = true } = options

  // Generate absolute paths
  const __dirname = fileURLToPath(new URL('.', import.meta.url))
  const inputPath = resolve(__dirname, inputDir) // path: book source folders
  const outputDataDir = resolve(__dirname, outputDir) // path: book game data folders

  // Flag to ensure we only run once
  let isBuild = false

  // Plugin function: process book Json data
  function runPrepareBooks() {
    mkdirSync(outputDataDir, { recursive: true })

    // Find all directories (book IDs)
    const bookIDs = readdirSync(inputPath, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith('.'))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    // Process all books
    const allBooksJson = {}
    bookIDs.forEach((bookID) => {
      // Process book
      const { bookContent, bookBase } = _buildBook(inputPath, bookID)

      // Store individual book
      const outFile = join(outputDataDir, bookID, 'book.json')
      mkdirSync(join(outputDataDir, bookID), { recursive: true })
      writeFileSync(outFile, JSON.stringify(bookContent, null, 2), 'utf-8')
      console.log(`✅ Created book JSON for ${bookID}: ${outFile}`)

      // Store book base data
      allBooksJson[bookID] = bookBase
    })

    // Write combined books.json
    const booksFile = join(outputDataDir, 'books.json')
    writeFileSync(booksFile, JSON.stringify(allBooksJson, null, 2), 'utf-8')
    console.log(`📚 Created combined books.json: ${booksFile}`)
  }

  let hasProcessedOnce = false

  return {
    name: 'prepare-books-data-plugin',
    enforce: 'post',

    // Detect mode
    configResolved(config) {
      isBuild = config.command === 'build'
    },

    // Only run in build
    buildStart() {
      if (isBuild) {
        runPrepareBooks()
      }
    },

    // Only run in dev server
    configureServer() {
      if (!isBuild) {
        if (!hasProcessedOnce) {
          runPrepareBooks()
          hasProcessedOnce = true
        }

        if (watch) {
          const watcher = chokidar.watch(inputPath, { ignoreInitial: true })

          // Debounce rapid events
          let timeout
          const runHotPreprocessing = () => {
            clearTimeout(timeout)
            timeout = setTimeout(runPrepareBooks, 1000)
          }

          watcher.on('add', runHotPreprocessing)
          watcher.on('change', runHotPreprocessing)
          watcher.on('unlink', runHotPreprocessing)

          console.log(`👀 Watching for JSON changes in ${inputPath}...`)
        }
      }
    },
  }
}
