// vite-plugin-prepare-books.js
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs'
import { resolve, join, extname, basename } from 'path'
import { fileURLToPath } from 'url'
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
function _readDeepJson(inputPath, nesting) {
  const content = {}

  // Load folder content
  const entries = readdirSync(join(inputPath, ...nesting), { withFileTypes: true }).filter(
    (entry) => !entry.name.startsWith('.'),
  )

  // Loop through content
  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      // Call self for nested directory
      content[entry.name] = _readDeepJson(inputPath, [...nesting, entry.name])
    } else if (entry.isFile() && extname(entry.name) === '.json') {
      // Load data from json into content
      let entryPath = join(inputPath, ...nesting, entry.name)
      try {
        const bookJson = readFileSync(entryPath, 'utf-8')
        let parsed = JSON.parse(bookJson)
        parsed = _prefixImages(parsed, 'books/' + nesting.join('_') + '_')
        const id = basename(entry.name, '.json')
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
function _buildBook(inputPath, book) {
  // Read folder content
  let content = _readDeepJson(inputPath, [book])
  let base = {}

  // Store and lift book.json content
  if ('book' in content) {
    Object.assign(base, content.book)
    Object.assign(content, base)
    delete content.book
  } else {
    console.error(`❌ ${book} has no book.json`)
  }

  // Fix book id
  content['id'] = book
  base['id'] = book

  return { bookContent: content, bookBase: base }
}

// Copy images from books to public folder
function _collectImages(inputBookDir, trace, outputImageDir) {
  const inputDir = join(inputBookDir, ...trace)
  const entries = readdirSync(inputDir, { withFileTypes: true }).filter(
    (entry) => !entry.name.startsWith('.'),
  )

  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      _collectImages(inputBookDir, [...trace, entry.name], outputImageDir)
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase()
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const srcPath = join(inputDir, entry.name)
        const destFilename = [...trace, entry.name].join('_')
        const destPath = join(outputImageDir, destFilename)
        copyFileSync(srcPath, destPath)
        console.log(`🖼 Copied image: ${srcPath} => ${destPath}`)
      }
    }
  })
}

// ------
// Plugin
// ------
export default function prepareBooksPlugin(options = {}) {
  // Fill in default options
  const {
    inputDir = 'src/data/books',
    outputDir = 'public',
    outputDirImages = 'tmp_images',
    watch = true,
  } = options

  // Generate absolute paths
  const __dirname = fileURLToPath(new URL('.', import.meta.url))
  const inputPath = resolve(__dirname, inputDir)
  const outputPath = resolve(__dirname, outputDir)
  const outputPathImages = resolve(__dirname, outputDirImages)
  const outputDataDir = join(outputPath, 'books')
  const outputImageDir = join(outputPathImages, 'books')

  // Plugin function: process book Json data
  function runPrepareBooks() {
    mkdirSync(outputDataDir, { recursive: true })

    // Find all directories
    const books = readdirSync(inputPath, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith('.'))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    // Process all books
    const allBooksJson = {}
    books.forEach((book) => {
      // Process book
      const { bookContent, bookBase } = _buildBook(inputPath, book)

      // Store individual book
      const outFile = join(outputDataDir, `${book}.json`)
      writeFileSync(outFile, JSON.stringify(bookContent, null, 2), 'utf-8')
      console.log(`✅ Created book JSON for ${book}: ${outFile}`)

      // Store book base data
      allBooksJson[book] = bookBase
    })

    // Write combined books.json
    const booksFile = join(outputDataDir, '..', 'books.json')
    writeFileSync(booksFile, JSON.stringify(allBooksJson, null, 2), 'utf-8')
    console.log(`📚 Created combined books.json: ${booksFile}`)
  }

  // Plugin function: process book images
  function runPrepareBookImages() {
    mkdirSync(outputImageDir, { recursive: true })

    // Find all directories
    const books = readdirSync(inputPath, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith('.'))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    // Process all books
    books.forEach((book) => _collectImages(inputPath, [book], outputImageDir))
  }

  let hasProcessedOnce = false

  return {
    name: 'prepare-books-plugin',
    enforce: 'post',

    configureServer() {
      // --- only called in dev ---
      if (!hasProcessedOnce) {
        runPrepareBooks()
        runPrepareBookImages()
        hasProcessedOnce = true
      }

      if (watch) {
        const watcher = chokidar.watch(inputPath, { ignoreInitial: true })

        // Debounce rapid events
        let timeout
        const runAllPreprocessing = () => {
          clearTimeout(timeout)
          timeout = setTimeout(runPrepareBooks, 1000)
        }

        watcher.on('add', runAllPreprocessing)
        watcher.on('change', runAllPreprocessing)
        watcher.on('unlink', runAllPreprocessing)

        console.log(`👀 Watching for JSON changes in ${inputPath}...`)
      }
    },

    buildStart() {
      // --- only called in build ---
      runPrepareBooks()
      runPrepareBookImages()
    },
  }
}
