import { generateChangelog } from '@tanem/github-changelog-generator'
import { promises as fs } from 'fs'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require(path.join(process.cwd(), 'package.json'))

export const changelog = async () => {
  const result = await generateChangelog({
    futureRelease: `v${version}`
  })
  await fs.writeFile(path.join(process.cwd(), 'CHANGELOG.md'), result)
}
