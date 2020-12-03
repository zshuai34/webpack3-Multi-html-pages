
# webpack多页面应用

[https://blog.csdn.net/qq_32442967/article/details/108123294](https://blog.csdn.net/qq_32442967/article/details/108123294)

webpack基本使用，打包 html多页面 scss预处理器 autoprefixer浏览器前缀 使用jquery，代码压缩,命令行自动生成html和js

## 安装依赖
```
yarn
```

## 启动项目
```
yarn dev
```

## 构建项目
```
yarn build
```


## webpack.config.js
项目页面配置
```js
// pagesEntryList 数组为要进行打包的[html&js]文件,会打包 page/page.html  page/page.js
const pagesEntryList = ['index', 'about']
// 开发端口号
const devPort = '8081'
```


学习使用webpack打包 html多页面文件时，整理的webpack使用方法

- 打包单个js文件，生成hash文件名；
- 使用html-webpack-plugin打包html
- css-loader打包css，安装使用 scss预处理器，使用Autoprefixer添加浏览器css前缀
- webpack中使用jquery方法
- 命令行生成html&js
- 最后有完整的webpack配置
- 完整webpack.config.js 配置
- 完整的package.json
- postcss.config.js
