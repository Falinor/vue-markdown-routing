import * as path from 'path'
import * as fse from 'fs-extra'
import * as webpack from 'webpack'

import * as Plugin from '../src/webpack-plugin'

const resolve = (p: string) => path.resolve(__dirname, ...p.split('/').filter(p => !!p))

const compiler = (plugin: Plugin): webpack.Compiler => {
  return webpack({
    mode: 'none',
    entry: resolve('./fixtures/fake-router.js'),
    output: {
      path: resolve('./fixtures/out'),
      filename: 'main.js'
    },
    resolve: {
      alias: {
        '@': resolve('./fixtures/')
      }
    },
    plugins: [plugin]
  })
}

const matchOutputWithSnapshot = () => {
  const out = fse.readFileSync(resolve('./fixtures/out/main.js'), 'utf8')
  expect(out).toMatchSnapshot()
}

const addPage = (p: string, content: string = '') => {
  const to = resolve(path.join('fixtures/assets', p))
  fse.outputFileSync(to, content)
}

const removePage = (p: string) => {
  const to = resolve(path.join('fixtures/assets', p))
  fse.unlinkSync(to)
}

describe('webpack plugin', () => {
  beforeEach(() => {
    fse.removeSync(resolve('../index.js'))

    // reset assets
    fse.removeSync(resolve('fixtures/assets'))
    addPage('index.md')
    addPage('guides/foo.md')
    addPage('guides/index.md')
  })

  it('imports dynamically created routes', done => {
    const plugin = new Plugin({
      folders: [resolve('fixtures/assets')],
      importPrefix: '@/'
    })

    compiler(plugin).run(() => {
      matchOutputWithSnapshot()
      done()
    })
  })

  it('watches adding a page', done => {
    const plugin = new Plugin({
      folders: [resolve('fixtures/assets')],
      importPrefix: '@/',
      dynamicImport: true
    })

    let count = 0
    const watching = compiler(plugin).watch({}, () => {
      count++
      switch (count) {
        case 1:
          addPage('foo.md')
          break
        default:
          matchOutputWithSnapshot()
          watching.close(done)
      }
    })
  })

  it('watches changing route meta data', done => {
    const plugin = new Plugin({
      folders: [resolve('fixtures/assets')],
      importPrefix: '@/'
    })

    let count = 0
    const watching = compiler(plugin).watch({}, () => {
      count++
      switch (count) {
        case 1:
          addPage(
            'users/foo.vue',
            `
              <route-meta>
              {
                "requiresAuth": true
              }
              </route-meta>
            `
          )
          break
        default:
          matchOutputWithSnapshot()
          watching.close(done)
      }
    })
  })

  it('watches removing a page', done => {
    const plugin = new Plugin({
      folders: [resolve('fixtures/assets')],
      importPrefix: '@/'
    })

    let count = 0
    const watching = compiler(plugin).watch({}, () => {
      count++
      switch (count) {
        case 1:
          removePage('guides/foo.md')
          break
        default:
          matchOutputWithSnapshot()
          watching.close(done)
      }
    })
  })

  it('does not fire compilation when the route does not changed', done => {
    const plugin = new Plugin({
      folders: [resolve('fixtures/assets')],
      importPrefix: '@/'
    })

    let count = 0
    const watching = compiler(plugin).watch({}, () => {
      count++
      switch (count) {
        case 10:
          fail('webpack watcher seems to go infinite loop')
        default:
      }
    })

    setTimeout(() => {
      watching.close(done)
    }, 5000)
  }, 10000)

  it('should not stop watching after detecting route meta syntax errors', done => {
    const plugin = new Plugin({
      folders: [resolve('fixtures/assets')],
      importPrefix: '@/'
    })

    let count = 0
    const watching = compiler(plugin).watch({}, () => {
      count++
      switch (count) {
        case 1:
          addPage(
            'guides/foo.md',
            `---
title: Bar,
---
            `
          )
          break
        case 2:
          addPage(
            'guides/foo.md',
            `---
title: Bar
---
            `
          )
          break
        case 3:
          // Somehow, changing content triggers compilation twice.
          break
        default:
          matchOutputWithSnapshot()
          watching.close(done)
      }
    })
  })
})
