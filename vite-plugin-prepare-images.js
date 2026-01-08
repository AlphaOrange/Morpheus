// vite-plugin-prepare-images.js
import { readdirSync, mkdirSync } from 'fs'
import { resolve, join, extname } from 'path'
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

const TYPES = Object.keys(SIZES)
const RATIOS = TYPES.map((type) => SIZES[type].ratio)

// ------
// Plugin
// ------
export default function prepareImagesPlugin(options = {}) {
  // Fill in default options
  const { genericsDir = 'public/images', booksDir = 'public/images/books' } = options

  // Generate absolute paths
  const __dirname = fileURLToPath(new URL('.', import.meta.url))
  const genericsPath = resolve(__dirname, genericsDir)
  const booksPath = resolve(__dirname, booksDir)

  // Loop through all folders, images and sizes
  async function runPrepareImages() {
    for (const inputPath of [genericsPath, booksPath]) {
      const files = readdirSync(inputPath, { withFileTypes: true, recursive: false }).filter(
        (entry) => !entry.name.startsWith('.'),
      )
      for (const size of ['L', 'M', 'S', 'full']) {
        mkdirSync(join(inputPath, size), { recursive: true })
      }
      for (const file of files) {
        if (!file.isFile()) continue
        const ext = extname(file.name).toLowerCase()
        const filePath = join(inputPath, file.name)
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
          // Load image file
          const image = sharp(filePath)

          // Determine type via aspect ratio
          const { width, height } = await image.metadata()
          const ar = width / height
          const fit = RATIOS.map((ratio) => Math.abs(1 - ratio / ar))
          const ix = fit.indexOf(Math.min(...fit))
          const type = TYPES[ix]

          // Create jpg filename
          const outName = file.name.replace(ext, '.jpg')

          // Generate thumbnails
          for (const size of ['L', 'M', 'S']) {
            const outputFilePath = join(inputPath, size, outName)
            await sharp(filePath)
              .resize({
                width: SIZES[type].sizes[size].width,
                height: SIZES[type].sizes[size].height,
              })
              .jpeg({ quality: 80 })
              .toFile(outputFilePath)
          }

          // Store original as 80% quality .jpg
          const outputFilePath = join(inputPath, 'full', outName)
          await sharp(filePath).jpeg({ quality: 80 }).toFile(outputFilePath)
        }
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
