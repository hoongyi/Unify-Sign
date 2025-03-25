/**
 * sdgun签到
 */

// 配置信息
let { config } = require('../config.js')(runtime, global)
// 单例require 必须引用
let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
// 悬浮窗组件 按需引用
let FloatyInstance = singletonRequire('FloatyUtil')
// 找控件专用 按需引用
let widgetUtils = singletonRequire('WidgetUtils')
// 自动执行专用 如点击等 按需引用
let automator = singletonRequire('Automator')
// 大部分的公共方法 按需引用
let commonFunctions = singletonRequire('CommonFunction')
// 日志打印 按需引用
let logUtils = singletonRequire('LogUtils')
// 本地OCR工具 按需引用
let localOcrUtil = require('../lib/LocalOcrUtil.js')

let BaseSignRunner = require('./BaseSignRunner.js')
function SignRunner () {
  BaseSignRunner.call(this)
  let _package_name = 'com.appbyme.app283982'
  /**
   *  扩展exec代码 实现具体的签到逻辑
   */
  this.exec = function () {
    // ...
    // 在这里写签到执行的代码
    // ...
    this.openApp()
    // 找到打卡签到
    this.pushLog('查找打卡签到')
    let sign = widgetUtils.widgetGetOne(/^打卡签到$/, 9000)
    if (sign) {
      this.displayButtonAndClick(sign, '找到了打卡签到')
    } else {
      this.pushLog('没有找到打卡签到')
    }
    // 等待加载完成
    sleep(5000)
    // 执行签到
    this.pushLog('查找签到按钮')
    let signBtn = widgetUtils.widgetGetOne(/^签到$/, 9000)
    if (signBtn) {
      this.displayButtonAndClick(signBtn, '找到了签到按钮')
      // 执行成功后触发 标记当前任务已完成 失败了请勿调用
      this.setExecuted()
      this.pushLog('签到完成')
    } else {
      this.pushLog('没有找到签到按钮')
    }
    sleep(1000)
    commonFunctions.minimize()
  }

  /**
   * 打开sdgun
   *
   * @returns 
   */
  this.openApp = function () {
    commonFunctions.launchPackage(_package_name)
    sleep(500)
    this.pushLog('校验是否有打开确认弹框')
    let confirm = widgetUtils.widgetGetOne(/^打开|允许$/, 3000)
    if (confirm) {
      this.displayButtonAndClick(confirm, '找到了打开按钮')
    } else {
      this.pushLog('没有打开确认弹框')
    }
    sleep(2000)
    // 跳过广告
    this.pushLog('ocr校验是否有跳过按钮')
    let skip = this.captureAndCheckByOcr('跳过')
    
    //let skip = widgetUtils.widgetGetOne('\\s*下次再说\\s*',5000)
    if (skip) {
      this.displayButtonAndClick(skip, '找到了跳过按钮')
    } else {
      this.pushLog('没有跳过按钮')
    }
  }
  
}

SignRunner.prototype = Object.create(BaseSignRunner.prototype)
SignRunner.prototype.constructor = SignRunner
module.exports = new SignRunner()
