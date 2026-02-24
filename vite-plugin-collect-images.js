// vite-plugin-collect-images.js
import { readdirSync, mkdirSync, copyFileSync, rmSync } from 'fs'
import { resolve, join, extname } from 'path'
import { fileURLToPath } from 'url'

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
        mkdirSync(outputImageDir, { recursive: true })
        copyFileSync(srcPath, destPath)
        console.log(`🖼 Copied image: ${srcPath} => ${destPath}`)
      }
    }
  })
}

// ------
// Plugin
// ------
export default function collectImagesPlugin(options = {}) {
  // Load options
  const { inputDir, outputDir } = options

  // Generate absolute paths
  const __dirname = fileURLToPath(new URL('.', import.meta.url))
  const inputPath = resolve(__dirname, inputDir) // path: book source folders
  const outputImageDir = resolve(__dirname, outputDir) // path: image collection for further processing

  // Flag to ensure we only run once
  let hasRun = false
  let isBuild = false

  // Plugin function: process book images
  function runPrepareBookImages() {
    if (hasRun) return
    hasRun = true

    // Clear output folders
    rmSync(outputImageDir, { recursive: true, force: true })
    mkdirSync(outputImageDir, { recursive: true })

    // Find all directories
    const bookIDs = readdirSync(inputPath, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith('.'))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    // Process all books
    bookIDs.forEach((bookID) =>
      _collectImages(join(inputPath, bookID), [], join(outputImageDir, bookID)),
    )
  }

  return {
    name: 'collect-images-plugin',
    enforce: 'post',

    // Detect mode
    configResolved(config) {
      isBuild = config.command === 'build'
    },

    // Only run in build
    buildStart() {
      if (isBuild) {
        runPrepareBookImages()
      }
    },

    // Only run in dev server
    configureServer() {
      if (!isBuild) {
        runPrepareBookImages()
      }
    },
  }
}
