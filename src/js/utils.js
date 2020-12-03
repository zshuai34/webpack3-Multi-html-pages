const AJAX_URL_DEV = 'http://dev.aixiaodou.cn'
const AJAX_URL_TEST = 'http://test.aixiaodou.cn'
const AJAX_URL_PROD = 'http://www.aixiaodou.cn'

// webpack中定义的全局变量 当前的运行环境【生产/开发/测试】
console.log(`当前运行环境：${NODE_ENV_PUBLIC}`)
// 根据不同的运行环境配置不同的ajax请求地址
export const AJAX_URL = NODE_ENV_PUBLIC === 'production' ? AJAX_URL_PROD : (NODE_ENV_PUBLIC === 'test' ? AJAX_URL_TEST : AJAX_URL_DEV)
