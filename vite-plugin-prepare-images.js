// vite-plugin-prepare-images.js
import { readdirSync, mkdirSync, copyFileSync, rmSync } from 'fs'
import { resolve, join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const SIZES = {
  cover: {
    ratio: 2 / 3,
    sizes: {
      L: {
        width: 640,
        height: 960,
      },
      M: {
        width: 160,
        height: 240,
      },
      S: {
        width: 80,
        height: 120,
      },
    },
  },
  portrait: {
    ratio: 5 / 7,
    sizes: {
      L: {
        width: 450,
        height: 630,
      },
      M: {
        width: 150,
        height: 186,
      },
      S: {
        width: 75,
        height: 93,
      },
    },
  },
  landscape: {
    ratio: 16 / 9,
    sizes: {
      L: {
        width: 640,
        height: 360,
      },
      M: {
        width: 320,
        height: 180,
      },
      S: {
        width: 160,
        height: 90,
      },
    },
  },
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
        mkdirSync(outputImageDir, { recursive: true })
        copyFileSync(srcPath, destPath)
        console.log(`🖼 Copied image: ${srcPath} => ${destPath}`)
      }
    }
  })
}

// Deep walk return list of relative paths of files
function walkDir(baseDir, currentDir = '') {
  const fullPath = join(baseDir, currentDir)
  const entries = readdirSync(fullPath, { withFileTypes: true })

  let files = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue

    const relPath = join(currentDir, entry.name)

    if (entry.isDirectory()) {
      files.push(...walkDir(baseDir, relPath))
    } else if (entry.isFile()) {
      files.push(relPath)
    }
  }

  return files
}

const TYPES = Object.keys(SIZES)
const RATIOS = TYPES.map((type) => SIZES[type].ratio)

// ------
// Plugin
// ------
export default function prepareImagesPlugin(options = {}) {
  // Fill in default options
  const {
    inputDir = 'src/books',
    inputGenerics = 'src/images',
    tmpDir = 'tmp_images/books',
    outputDir = 'public/images/books',
    outputGenerics = 'public/images',
  } = options

  // Generate absolute paths
  const __dirname = fileURLToPath(new URL('.', import.meta.url))
  const pathInputDir = resolve(__dirname, inputDir) // path: book source folders
  const pathInputGenerics = resolve(__dirname, inputGenerics)
  const pathTmpDir = resolve(__dirname, tmpDir)
  const pathOutputDir = resolve(__dirname, outputDir)
  const pathOutputGenerics = resolve(__dirname, outputGenerics)

  // Plugin function: process book images
  let hasCollected = false
  async function runCollectImages() {
    if (hasCollected) return
    hasCollected = true

    // Clear output folders
    rmSync(pathTmpDir, { recursive: true, force: true })
    mkdirSync(pathTmpDir, { recursive: true })

    // Find all directories
    const bookIDs = readdirSync(pathInputDir, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith('.'))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    // Process all books
    bookIDs.forEach((bookID) =>
      _collectImages(join(pathInputDir, bookID), [], join(pathTmpDir, bookID)),
    )
  }

  // Loop through all folders, images and sizes
  let hasProcessed = false
  async function runProcessImages() {
    if (hasProcessed) return
    hasProcessed = true
    const bookIDs = readdirSync(pathTmpDir, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith('.'))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
    const allPathsFrom = [pathInputGenerics, ...bookIDs.map((id) => join(pathTmpDir, id))]
    const allPathsTo = [pathOutputGenerics, ...bookIDs.map((id) => join(pathOutputDir, id))]
    for (let index = 0; index < allPathsFrom.length; index++) {
      const from = allPathsFrom[index]
      let to = allPathsTo[index]
      const files = walkDir(from)
      for (const size of ['L', 'M', 'S', 'full']) {
        mkdirSync(join(to, size), { recursive: true })
      }
      for (const file of files) {
        const ext = extname(file).toLowerCase()
        if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue

        const inputFilePath = join(from, file)

        // ---- determine type (cover / portrait / landscape)
        const image = sharp(inputFilePath)
        const { width, height } = await image.metadata()
        if (!width || !height) continue

        const ar = width / height
        const fit = RATIOS.map((ratio) => Math.abs(1 - ratio / ar))
        const ix = fit.indexOf(Math.min(...fit))
        const type = TYPES[ix]

        // ---- paths
        const subDir = dirname(file) // e.g. "sub/folder"
        const outName = file.replace(ext, '.jpg') // keeps subDir in path

        // ---- ensure directories exist
        for (const size of ['L', 'M', 'S', 'full']) {
          mkdirSync(join(to, size, subDir), { recursive: true })
        }

        // ---- thumbnails
        for (const size of ['L', 'M', 'S']) {
          await sharp(inputFilePath)
            .resize({
              width: SIZES[type].sizes[size].width,
              height: SIZES[type].sizes[size].height,
            })
            .jpeg({ quality: 80 })
            .toFile(join(to, size, outName))
        }

        // ---- full size
        await sharp(inputFilePath)
          .jpeg({ quality: 80 })
          .toFile(join(to, 'full', outName))
      }
    }
  }

  // Flag to ensure we only run once
  let isBuild = false
  let hasProcessedOnce = false

  return {
    name: 'prepare-images-plugin',
    enforce: 'post',

    // Detect mode
    configResolved(config) {
      isBuild = config.command === 'build'
    },

    // Only run in build
    async buildStart() {
      if (isBuild) {
        await runCollectImages()
        rmSync(pathOutputGenerics, { recursive: true, force: true })
        await runProcessImages()
      }
    },

    // Only run in dev server
    async configureServer() {
      if (!isBuild) {
        if (!hasProcessedOnce) {
          await runCollectImages()
          rmSync(pathOutputGenerics, { recursive: true, force: true })
          await runProcessImages()
          hasProcessedOnce = true
        }
      }
    },
  }
}
