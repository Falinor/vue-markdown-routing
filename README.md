# vue-markdown-routing

Generate Vue Router routing automatically.

## Installation

```bash
$ npm install -D vue-markdown-routing
```

## Requirements

- webpack >= v4.0.0

## Usage

To use this, you import `vue-markdown-routing` and pass it into Vue Router constructor options.

```js
// Import generated routes
import routes from 'vue-md-auto-routing'

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  // Pass the generated routes into the routes option
  routes
})
```

You also need to add a webpack plugin vue-auto-routing provides. The plugin options are the same as [vue-route-generator options](https://github.com/ktsn/vue-route-generator#references)

```js
// webpack.config.js
const path = require('path')
const VueAutoRoutingPlugin = require('vue-auto-routing/lib/webpack-plugin')

module.exports = {
  // ... other options ...

  plugins: [
    new VueAutoRoutingPlugin({
      // Directories to load markdown assets from
      folders: [
        path.resolve(__dirname, 'src', 'assets', 'guides'),
        path.resolve(__dirname, 'src', 'assets', 'articles')
      ],
      // A string that will be added to importing component path (defaults to @/assets/).
      importPrefix: '@/assets/'
    })
  ]
}
```

## Related Projects

* [vue-md-route-generator](https://github.com/Falinor/vue-md-route-generator): Low-level utility generating routes based on a markdown arborescence.

## License

MIT

## Thanks

Thanks to [ktsn](https://github.com/ktsn) for the initial code!
