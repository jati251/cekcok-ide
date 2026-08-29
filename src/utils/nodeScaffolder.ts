import { safeInvoke } from './tauriBridge'

export type NodeFileType =
  | 'react-component'
  | 'react-hook'
  | 'express-route'
  | 'nestjs-controller'
  | 'nestjs-service'
  | 'next-route'
  | 'next-page'
  | 'ts-interface'
  | 'unit-test'

export interface NodeScaffoldOptions {
  name: string
  fileType: NodeFileType
  targetDir: string
}

export function generateNodeBoilerplate(name: string, fileType: NodeFileType): { fileName: string; content: string } {
  const cleanName = name.replace(/\.(tsx|ts|jsx|js)$/, '').trim()

  switch (fileType) {
    case 'react-component':
      return {
        fileName: `${cleanName}.tsx`,
        content: `import React from 'react'

export interface ${cleanName}Props {
  className?: string
  children?: React.ReactNode
}

export const ${cleanName}: React.FC<${cleanName}Props> = ({
  className = '',
  children,
}) => {
  return (
    <div className={\`\${className}\`}>
      <h3>${cleanName} Component</h3>
      {children}
    </div>
  )
}
`,
      }

    case 'react-hook': {
      const hookName = cleanName.startsWith('use') ? cleanName : `use${cleanName}`
      return {
        fileName: `${hookName}.ts`,
        content: `import { useState, useEffect } from 'react'

export function ${hookName}() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Hook side-effects
  }, [])

  return { data, loading }
}
`,
      }
    }

    case 'express-route':
      return {
        fileName: `${cleanName}.ts`,
        content: `import { Router, Request, Response } from 'express'

export const ${cleanName.toLowerCase()}Router = Router()

${cleanName.toLowerCase()}Router.get('/', async (req: Request, res: Response) => {
  res.json({ message: 'GET ${cleanName} list' })
})

${cleanName.toLowerCase()}Router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  res.json({ message: \`GET \${id}\` })
})

${cleanName.toLowerCase()}Router.post('/', async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Created', data: req.body })
})

${cleanName.toLowerCase()}Router.delete('/:id', async (req: Request, res: Response) => {
  res.status(204).send()
})
`,
      }

    case 'nestjs-controller':
      return {
        fileName: `${cleanName}.controller.ts`,
        content: `import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common'

@Controller('${cleanName.toLowerCase().replace('controller', '')}s')
export class ${cleanName} {

  @Get()
  findAll() {
    return []
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { id }
  }

  @Post()
  create(@Body() createDto: any) {
    return createDto
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { id, deleted: true }
  }
}
`,
      }

    case 'nestjs-service':
      return {
        fileName: `${cleanName}.service.ts`,
        content: `import { Injectable } from '@nestjs/common'

@Injectable()
export class ${cleanName} {
  // Business logic methods
}
`,
      }

    case 'next-route':
      return {
        fileName: 'route.ts',
        content: `import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'success',
    timestamp: Date.now(),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ status: 'created', data: body }, { status: 201 })
}
`,
      }

    case 'next-page':
      return {
        fileName: 'page.tsx',
        content: `import React from 'react'

export default function ${cleanName}Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">${cleanName} Page</h1>
      <p className="text-gray-500">Next.js App Router Page</p>
    </main>
  )
}
`,
      }

    case 'ts-interface':
      return {
        fileName: `${cleanName}.ts`,
        content: `export interface ${cleanName} {
  id: string
  createdAt: Date
  updatedAt: Date
}
`,
      }

    case 'unit-test':
    default:
      return {
        fileName: `${cleanName}.test.ts`,
        content: `import { describe, it, expect } from 'vitest'

describe('${cleanName}', () => {
  it('should work as expected', () => {
    expect(true).toBe(true)
  })
})
`,
      }
  }
}

/**
 * Creates the TypeScript / React / Node file on disk.
 */
export async function createNodeFile(options: NodeScaffoldOptions): Promise<string> {
  const { name, fileType, targetDir } = options
  const { fileName, content } = generateNodeBoilerplate(name, fileType)

  const filePath = `${targetDir}/${fileName}`
  await safeInvoke('write_file', { path: filePath, content })
  return filePath
}
