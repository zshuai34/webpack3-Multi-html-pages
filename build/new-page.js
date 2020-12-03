#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const read = require('read')
require('colors')

const fileCharset = 'utf-8'
let pageTitle = ''
let pageName = null
let flagCount = 2

const waitForPageTitle = (prompt) => {
  read({
    prompt: prompt || '请输入新增页面标题 : ',
    timeout: 60000
  }, (error, result, isDefault) => {
    if (error) {
      if (error.message === 'canceled') {
        console.log('\n\n您已取消该操作!'.yellow)
        process.exit(0)
      } else if (error.message === 'timed out') {
        console.log('等待已超时, 请重新输入!'.yellow)
        process.exit(0)
      } else {
        throw error
      }
    }
    if (result && result !== '') {
      pageTitle = result
    }
    waitForPageName()
  })
}
waitForPageTitle()

const waitForPageName = (prompt) => {
  read({
    prompt: prompt || '请输入新增页面文件名: ',
    timeout: 60000
  }, (error, result, isDefault) => {
    if (error) {
      if (error.message === 'canceled') {
        console.log('\n\n您已取消该操作!')
        process.exit(0)
      } else if (error.message === 'timed out') {
        console.log('等待已超时, 请重新输入!')
        process.exit(0)
      } else {
        throw error
      }
    }
    if (!result || result === '') {
      waitForPageName('页面文件名不能为空,请重新输入: '.yellow)
    } else {
      pageName = result
      validPageName()
    }
  })
}

const validPageName = () => {
  const projectRoot = path.resolve(__dirname, '../')
  const pageDir = path.resolve(projectRoot, `./src/pages/${pageName}`)
  const exists = fs.existsSync(pageDir)
  if (exists) {
    console.log(`该页面已存在:  ${pageDir}`.yellow)
    waitForPageName('请重新输入新增页面文件名:')
  } else {
    fs.mkdirSync(pageDir)
    createPage(projectRoot, pageDir, pageName)
  }
}

const createPage = (projectRoot, pageDir, pageName) => {
  const sourceHtml = path.resolve(projectRoot, 'build/templates/page-new.html')
  const sourceJS = path.resolve(projectRoot, 'build/templates/page-new.js')
  const destHtml = path.resolve(pageDir, `${pageName}.html`)
  const destJS = path.resolve(pageDir, `${pageName}.js`)
  copyFile(sourceHtml, destHtml, (destFile) => {
    flagCount--
    ensureSuccess()
  })
  copyFile(sourceJS, destJS, (destFile) => {
    flagCount--
    ensureSuccess()
  })
}

const ensureSuccess = () => {
  if (flagCount === 0) {
    const tip = `${pageName} 页面新增成功! 标题为:  ${pageTitle}`
    console.log(tip.green)
    // 页面生成成功提示
    const tipConfig = '请在webpack.config.js中配置 pagesEntryHtml和 pagesEntryJs 来打包html和js'
    console.log(tipConfig.green)
    process.exit(0)
  }
}

const copyFile = (source, dest, cb) => {
  fs.readFile(source, fileCharset, (err, data) => {
    if (err) throw err
    data = data.replace(/\${TITLE}/g, pageTitle)
    fs.writeFile(dest, data, fileCharset, (err) => {
      if (err) throw err
      cb(dest)
    })
  })
}
