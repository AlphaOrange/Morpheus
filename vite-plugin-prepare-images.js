// vite-plugin-prepare-images.js
import { readdirSync, mkdirSync } from 'fs'
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
    genericsDirFrom = 'src/images',
    booksDirFrom = 'tmp_images/books',
    genericsDir = 'public/images',
    booksDir = 'public/images/books',
  } = options

  // Generate absolute paths
  const __dirname = fileURLToPath(new URL('.', import.meta.url))
  const genericsPathFrom = resolve(__dirname, genericsDirFrom)
  const booksPathFrom = resolve(__dirname, booksDirFrom)
  const genericsPath = resolve(__dirname, genericsDir)
  const booksPath = resolve(__dirname, booksDir)

  // Loop through all folders, images and sizes
  async function runPrepareImages() {
    for (const path of [
      { from: genericsPathFrom, to: genericsPath },
      { from: booksPathFrom, to: booksPath },
    ]) {
      const files = walkDir(path.from)
      for (const size of ['L', 'M', 'S', 'full']) {
        mkdirSync(join(path.to, size), { recursive: true })
      }
      for (const file of files) {
        const ext = extname(file).toLowerCase()
        if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue

        const inputFilePath = join(path.from, file)

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
          mkdirSync(join(path.to, size, subDir), { recursive: true })
        }

        // ---- thumbnails
        for (const size of ['L', 'M', 'S']) {
          await sharp(inputFilePath)
            .resize({
              width: SIZES[type].sizes[size].width,
              height: SIZES[type].sizes[size].height,
            })
            .jpeg({ quality: 80 })
            .toFile(join(path.to, size, outName))
        }

        // ---- full size
        await sharp(inputFilePath)
          .jpeg({ quality: 80 })
          .toFile(join(path.to, 'full', outName))
      }
    }
  }

  let hasProcessedOnce = false

  return {
    name: 'prepare-images-plugin',
    enforce: 'post',

    configureServer() {
      // --- only called in dev ---
      if (!hasProcessedOnce) {
        runPrepareImages()
        hasProcessedOnce = true
      }
    },

    buildStart() {
      // --- only called in build ---
      runPrepareImages()
    },
  }
}
