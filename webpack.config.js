var webpack = require('webpack');
var path = require('path');
var htmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var uglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');

const pagesPath = './src/pages/'
// pagesEntryList 数组为要进行打包的[html&js]文件,会打包 page/page.html  page/page.js
const pagesEntryList = ['index', 'about']
// 开发端口号
const devPort = '8081'

const publicPathTest = '//test.aixiaodou.cn/'
const publicPathProd = '//www.aixiaodou.cn/'
const publicPath = process.env.NODE_ENV === 'production' ? publicPathProd : process.env.NODE_ENV === 'test' ? publicPathTest : '/'

devWebpackConfig = {
  entry: { //入口
    app: './src/app.js',
    common: [
      './src/js/flexible75.js' // 建议 flexible 使用cdn在html中引入，加载会快，此处仅做演示
    ]
  },
  output: {//出口
    path: path.resolve(__dirname, 'dist'),
    publicPath,
    filename: 'js/[name].[hash].js'
  },
  devServer: { //服务
    contentBase: './dist', // 告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要。
    host: '0.0.0.0', // 局域网可以通过ip打开
    hot: true, // 启用 webpack 的模块热替换特性
    inline: true, //推荐使用模块热替换的内联模式
    progress: true,//显示打包速度
    port: devPort
  },
  devtool: process.env.NODE_ENV !== 'production' ? 'source-map': '', // 在测试环境和开发环境开启source-map 生产环境关闭 cheap-module-eval-source-map
  module: {
    rules: [
      {//css loader
        test: /\.(css|s[ac]ss)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: "css-loader", options: {
              sourceMap: true
            }
          }, {
            loader: "sass-loader", options: {
              sourceMap: true
            }
          }, 'postcss-loader']
        })
      },
      {//js loader
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {// img 压缩，，生成hash值
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              esModule: false,
              limit: 1024 * 50, // 50KB以上压缩
              outputPath: './img',
              name: '[name].[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(html)$/,
        loader: 'html-withimg-loader',
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']), //构建时清除dist目录
    process.env.NODE_ENV === 'production' ? new uglifyjsWebpackPlugin({
      // js只有在生产环境才进行压缩，测试和开发环境生成source-map便于开发
      uglifyOptions: {
        //删除注释
        output: {
          comments: false
        },
        //删除console 和 debugger 删除警告
        compress: {
          warnings: false,
          drop_debugger: true,
          drop_console: true
        }
      }
    }) : ()=> {},
    new ExtractTextPlugin({ //提取css
      filename: 'css/[name].[hash].css',
      disable: false,
      allChunks: true
    }),
    new webpack.optimize.CommonsChunkPlugin({ //打包公共js
      name: 'common',
      chunks: ['common'],
      // minChunks: 2
      minChunks: Infinity
    }),
    new webpack.HashedModuleIdsPlugin(),
    new OpenBrowserPlugin({url: `http://localhost:${devPort}`}) //自动打开浏览器
  ]
};
/**
 * pagesEntryList 数组为要进行打包的[html&js]文件
 * 公共js放到 app.js 中
 * 工具js放到 utils.js 中，在页面js通过import引入
 * 要添加页面私有js，添加后在htmlWebpackPlugin-chunks中添加即可
 * 如果需要添加样式，在私有js中require('xxx.scss')
 * @type {string[]}
 */
pagesEntryList.map(pJs => {
  devWebpackConfig.entry[pJs] = `${pagesPath + pJs}/${pJs}.js`
})

/**
 * 打包的页面 pagesEntryList
 * 会打包 page/page.html  page/page.js
 * 将公共的app.js打包进 page/page.html 中
 * 设计的是一个页面对应一个js，其它js方法，在本页面的js中通过import引入
 */
pagesEntryList.map(page => {
  let pageChunksJs = ['common', 'app', page]
  const plugin = new htmlWebpackPlugin({
    // title: page.title,
    filename: page + '.html',
    template: `${pagesPath + page}/${page}.html`,
    chunksSortMode: 'manual',
    chunks: pageChunksJs,
    cache: true, //只有在内容变化时才会生成新的html
    minify: {
      removeComments: false, //是否压缩时 去除注释  生产环境部署时，可以压缩去掉空格和注释
      collapseWhitespace: false // 压缩去除空格和换行符
    }
  })
  devWebpackConfig.plugins.push(plugin)
})

/*================下面方法 是js和page分开，更灵活使用 ===================*/
/**
 * 公共js放到 app.js 中
 * 要添加页面私有js，添加后在htmlWebpackPlugin-chunks中添加即可
 * 如果需要添加样式，在私有js中require
 * @type {string[]}
 */
// const pagesEntryJs = ['index', 'rank']
// pagesEntryJs.map(pJs => {
//   devWebpackConfig.entry[pJs] = `${pagesPath + pJs}/${pJs}.js`
// })
/**
 * pagesEntryHtml 数组为要进行打包的html文件
 * filename：文件名称
 * template：页面路径
 * chunks: [] 页面引入的私有js,需要在devWebpackConfig-entry中配置
 * title: 页面标题 <%= htmlWebpackPlugin.options.title %>
 * @type {({template: string, filename: string, chunks: [string], title: string}|{template: string, filename: string, chunks: [string, string], title: string})[]}
 */
// const pagesEntryHtml = [
//   {filename: 'index', template: 'index/index', chunks: ['app', 'index']}
// ]
// const pagesEntryHtml = [
//   {filename: 'index', template: 'index/index', chunks: ['app', 'index']}
// ]
// pagesEntryHtml.map(page => {
//   const plugin = new htmlWebpackPlugin({
//     // title: page.title,
//     filename: page.filename + '.html',
//     template: pagesPath + page.template + '.html',
//     chunksSortMode: 'manual',
//     chunks: page.chunks,
//     cache: true, //只有在内容变化时才会生成新的html
//     minify: {
//       removeComments: false, //是否压缩时 去除注释  生产环境部署时，可以压缩去掉空格和注释
//       collapseWhitespace: false // 压缩去除空格和换行符
//     }
//   })
//   devWebpackConfig.plugins.push(plugin)
// })


module.exports = devWebpackConfig
