import execa from 'execa'
import glob from 'glob'
import path from 'path'

const exec = (file: string, args?: readonly string[]) => {
  execa.sync(file, args, { stdio: 'inherit' })
}

export const audit = ({ fix }: { fix?: boolean } = {}) => {
  glob
    .sync('**/package.json', {
      ignore: '**/node_modules/**',
      absolute: true
    })
    .map(path.dirname)
    .forEach(dir => {
      process.chdir(dir)
      exec('npm', ['i'])
      exec('npm', ['audit', ...(fix ? ['fix'] : [])])
    })
}
