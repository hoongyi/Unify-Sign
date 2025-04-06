/**
 * 抖音商城签到
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
  let _package_name = 'com.ss.android.ugc.livelite'
  /**
   *  扩展exec代码 实现具体的签到逻辑
   */
  this.exec = function () {
    // ...
    // 在这里写签到执行的代码
    // ...
    let button = this.openApp()
    
    this.displayButtonAndClick(button, '找到了赚钱按钮')
    this.pushLog('收金币')
    let coin = widgetUtils.widgetGetOne('收金币', 3000)
    if (coin) {
      this.displayButtonAndClick(coin, '找到了收金币按钮')
    } else {
      this.pushLog('没有找到收金币按钮')
    }
    this.pushLog('看广告视频再得')
    let ad = widgetUtils.widgetGetOne(/^看广告视频再得.*?金币/, 3000)
    if (ad) {
      this.displayButtonAndClick(ad, '找到了看广告视频再得按钮')
    } else {
      this.pushLog('没有找到看广告视频再得按钮')
    }
    this.pushLog('领取金币')
    let receive = widgetUtils.widgetGetOne(/^领取成功/)
    if (receive) {
      this.displayButtonAndClick(receive, '找到了领取金币按钮')
    } else {
      this.pushLog('没有找到领取金币按钮')
    }
    while (true) {
      this.pushLog('继续收金币')
      let coin = widgetUtils.widgetGetOne('继续领奖励', 3000)
      if (coin) {
        this.displayButtonAndClick(coin, '找到了收金币按钮')
        let receive = widgetUtils.widgetGetOne(/^领取成功/)
        if (receive) {
          this.displayButtonAndClick(receive, '找到了领取金币按钮')
        } else {
          this.pushLog('没有找到领取金币按钮')
        }
      } else {
        this.pushLog('没有找到收金币按钮')
        break
      }
    }
    
    // 执行成功后触发 标记当前任务已完成 失败了请勿调用
    this.setExecuted()
  }

  /**
   * 打开抖音商城
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
    return widgetUtils.widgetGetOne('，按钮')
  }
  
}

SignRunner.prototype = Object.create(BaseSignRunner.prototype)
SignRunner.prototype.constructor = SignRunner
module.exports = new SignRunner()
