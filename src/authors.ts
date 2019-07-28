import generateAuthors from '@tanem/authors'
import { promises as fs } from 'fs'
import path from 'path'

export const authors = async () => {
  const result = await generateAuthors()
  await fs.writeFile(path.join(process.cwd(), 'AUTHORS'), result)
}
