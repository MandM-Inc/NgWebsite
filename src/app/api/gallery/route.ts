import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'gallery')
    let files: string[] = []

    try {
      files = fs.readdirSync(publicDir)
    } catch {
      // Directory doesn't exist or cannot be read
      return NextResponse.json({ images: [] }, { status: 200 })
    }

    const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
    const images = files
      .filter((f) => exts.has(path.extname(f).toLowerCase()))
      .map((f) => `/gallery/${f}`)

    return NextResponse.json({ images }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ images: [], error: 'Failed to list gallery' }, { status: 500 })
  }
}


