# FeathersJS Tip — On feathers transpilation, when using babel-register at server-side

If you look at the [Module loaders section in FeathersJS docs](https://docs.feathersjs.com/api/client#module-loaders), they recommend to transpile the packages under the `@feathersjs` scope, in the `node_modules` folder; as all of them are written in ES6

## Official Solution

> All modules in the `@feathersjs` namespace are using ES6. They must be transpiled to support browsers that don't completely support ES6. Most client-side module loaders exclude the node_modules folder from being transpiled and have to be configured to include modules in the @feathersjs namespace.
> ## webpack
> For webpack, the recommended `babel-loader` rule normally excludes everything in `node_modules`. It has to be adjusted to skip `node_modules/@feathersjs`. In the module rules in your `webpack.config.js`, update the `babel-loader` section to this:
> ```javascript
{
  test: /\.jsx?$/,
  exclude: /node_modules(\/|\\)(?!(@feathersjs))/,
  loader: 'babel-loader'
}
```

## Problem with `babel-register`

Since the `@feathersjs/feathers` package is client/server agnostic; it can be used at both front-end, and back-end; to make the feathers core available on both sides.

The problem occurs when we use something like `babel-register` at the server side.

Since the code is already transpiled, `babel-register` throws errors when trying to transpile the already transpiled code, during runtime.

## Solution

To solve this, do not transpile any module under `@feathersjs` scope; instead use the special already-transpiled-to-es5 [`@feathersjs\client` package](https://docs.feathersjs.com/api/client#feathersjsclient).

> ## @feathersjs/client
> ```
$ npm install @feathersjs/client --save
```
> @feathersjs/client is a module that bundles the separate Feathers client-side modules into one providing the code as ES5 which is compatible with modern browsers (IE10+). It can also be used directly int the browser through a `<script>` tag.
>
> Here is a table of which Feathers client modules are included:

| Feathers module                   | @feathersjs/client      |
| --------------------------------- | ----------------------- |
| @feathers/feathers                | feathers (default)      |
| @feathers/errors                  | feathers.errors         |
| @feathersjs/rest-client           | feathers.rest           |
| @feathersjs/socketio-client       | feathers.socketio       |
| @feathersjs/primus-client         | feathers.primus         |
| @feathersjs/authentication-client | feathers.authentication |