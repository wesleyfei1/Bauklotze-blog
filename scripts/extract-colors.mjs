import { readdir, readFile, writeFile } from 'fs/promises'
import { join, dirname, isAbsolute, resolve } from 'path'
import { fileURLToPath } from 'url'
import { Vibrant } from 'node-vibrant/node'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const BLOGS_DIR = join(__dirname, '../src/content/blogs')

// 递归获取所有 markdown 文件
async function getAllMarkdownFiles(dir) {
  const files = []
  const entries = await readdir(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await getAllMarkdownFiles(fullPath))
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  
  return files
}

// 从 frontmatter 提取 heroImage.src
function extractImagePath(content) {
  const match = content.match(/heroImage:\s*\n\s*src:\s*['"](.+?)['"]/m)
  return match ? match[1] : null
}

// 提亮颜色（与白色混合）
function lightenColor(hex, amount = 0.4) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  
  // 与白色混合
  const newR = Math.round(r + (255 - r) * amount)
  const newG = Math.round(g + (255 - g) * amount)
  const newB = Math.round(b + (255 - b) * amount)
  
  return '#' + ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')
}

// 提取颜色
async function extractColor(imagePath) {
  try {
    let palette
    try {
      palette = await Vibrant.from(imagePath).getPalette()
    } catch (error) {
      if (!String(error?.message || '').includes('Unsupported MIME type')) {
        throw error
      }
      const pngBuffer = await sharp(imagePath).png().toBuffer()
      palette = await Vibrant.from(pngBuffer).getPalette()
    }
    // 优先使用 Vibrant 颜色，其次是 DarkVibrant 或 Muted
    const swatch = palette.Vibrant || palette.DarkVibrant || palette.Muted
    const originalColor = swatch ? swatch.hex : '#D58388'
    // 提亮颜色
    return lightenColor(originalColor)
  } catch (error) {
    console.error(`  ❌ 提取颜色失败: ${error.message}`)
    return '#D58388' // 出错时使用默认颜色
  }
}

// 更新 frontmatter 中的 color
function updateColor(content, newColor) {
  // 检查是否已存在 color 字段
  if (content.includes('color:')) {
    return content.replace(
      /(heroImage:\s*\n(?:\s+\w+:\s*[^\n]+\n)*\s+color:\s*)['"]#[0-9A-Fa-f]{6}['"]/m,
      `$1'${newColor}'`
    )
  } else {
    // 如果没有 color 字段，添加到 heroImage 部分
    return content.replace(
      /(heroImage:\s*\n\s+src:\s*[^\n]+)/m,
      `$1\n  color: '${newColor}'`
    )
  }
}

async function processMarkdownFile(filePath) {
  const content = await readFile(filePath, 'utf-8')
  
  // 提取图片路径
  const imageSrc = extractImagePath(content)
  if (!imageSrc) {
    console.log(`⏭️  跳过 ${filePath} (无 heroImage)`)
    return
  }
  
  // 构建完整图片路径（支持相对路径和以 / 开头的内容根路径）
  const mdDir = dirname(filePath)
  const imagePath = resolveImagePath(imageSrc, mdDir)
  if (!imagePath) {
    console.log(`⏭️  跳过 ${filePath} (无法解析图片路径)`)
    return
  }
  
  // 提取颜色
  const color = await extractColor(imagePath)
  
  // 更新文件
  const updatedContent = updateColor(content, color)
  
  if (updatedContent !== content) {
    console.log(`🎨 处理: ${filePath.split('blogs')[1]}`)
    console.log(`   图片: ${imageSrc}`)
    console.log(`   颜色: ${color}`)
    await writeFile(filePath, updatedContent, 'utf-8')
    console.log(`   ✅ 已更新`)
    console.log('')
  } else {
    return
  }
}

function resolveImagePath(imageSrc, mdDir) {
  const normalizedSrc = imageSrc.trim().replace(/\\/g, '/')

  if (isAbsolute(normalizedSrc)) return normalizedSrc
  if (normalizedSrc.startsWith('/')) {
    return join(PROJECT_ROOT, 'src', 'content', normalizedSrc.slice(1))
  }
  if (normalizedSrc.startsWith('src/content/')) {
    return join(PROJECT_ROOT, normalizedSrc)
  }
  return resolve(mdDir, normalizedSrc)
}

async function main() {
  console.log('🚀 开始提取博客背景图片颜色...\n')
  
  const mdFiles = await getAllMarkdownFiles(BLOGS_DIR)
  console.log(`📝 找到 ${mdFiles.length} 个 Markdown 文件\n`)
  
  for (const file of mdFiles) {
    try {
      await processMarkdownFile(file)
    } catch (error) {
      console.error(`❌ 处理失败: ${file}`)
      console.error(`   错误: ${error.message}\n`)
    }
  }
  
  console.log('✨ 完成!')
}

main().catch(console.error)
