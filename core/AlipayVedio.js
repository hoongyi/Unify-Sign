/**
 * 支付宝视频领红包
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
  let _package_name = 'com.eg.android.AlipayGphone'
  /**
   *  扩展exec代码 实现具体的签到逻辑
   */
  this.exec = function () {
    // ...
    // 在这里写签到执行的代码
    // ...
    this.openApp()
    // 开始执行任务
    this.pushLog('开始执行任务')
    this.pushLog('今日任务是否执行完')
    let finnish = widgetUtils.widgetCheck(/^明日可领$/, 3000)
    if (!finnish) {
      this.doTask()
    } else {
      this.pushLog('今日任务已完成')
      // 执行成功后触发 标记当前任务已完成 失败了请勿调用
      this.setExecuted()
    }
    sleep(1000)
    commonFunctions.minimize()
  }

  this.doTask = function () {
    const nextVideo = () => {
      const fromX = device.width / 2 + Math.random() * 50 - 25;
      const fromY = device.height / 5 + Math.random() * 50 - 25;
      const toX = device.width / 2 + Math.random() * 50 - 25;
      const toY = device.height * 4 / 5 + Math.random() * 50 - 25;
      swipe(toX, toY, fromX, fromY, Math.random() * 100 + 500);
    }
    
    const captureCom = (node) => {
        
        var img = captureScreen();
        if (img) {
            const bounds = node.bounds();
            // 根据控件的位置和大小裁剪图片
            const widgetImg = images.clip(img, bounds.left, bounds.top, bounds.width(), bounds.height());
            img.recycle();
            return widgetImg;
        } else {
            console.log("截图失败");
        }
    }
    
    const checkComColor = (img, x, y, color) => {
        var pixel = images.pixel(img, x, y);
        var r = colors.red(pixel);
        var g = colors.green(pixel);
        var b = colors.blue(pixel);
        var a = colors.alpha(pixel);
        // console.log("r: " + r, "g: " + g, "b: " + b, "a: " + a);
        return r > color.r && g > color.g && b > color.b;
    }
    
    const clickCom = (type, name) => {
        console.log('clickCom', type, name);
        let component;
        if (type === 'text') {
            component = text(name).visibleToUser(true).findOne(300);
        } else if (type === 'desc') {
            component = desc(name).visibleToUser(true).findOne(300);
        } else {
            console.log(`${type} ${name}按钮未找到`);
            return
        }
        if (!component.clickable || !component.enabled) {
            console.log(`${name}按钮不可点击或未启用`);
            return
        }
        let rect = component.bounds();
        let x = rect.left;
        let y = rect.top;
        let width = rect.right - rect.left;
        let height = rect.bottom - rect.top;
    
        console.log(name, `尝试点击：(${rect.centerX()}, ${rect.centerY()})`);
        click(rect.centerX(), rect.centerY());
        // 创建一个悬浮窗，这里以红色半透明背景为例
        let floatyWindow = floaty.rawWindow(
            <frame gravity="left|top" bg="#80ff0000">
            </frame>
        );
    
        floatyWindow.setSize(width, height);
        // 设置悬浮窗的位置和尺寸，使其与组件完全重合
        floatyWindow.setPosition(x, y);
    
        threads.start(function() {
            sleep(1900);
            floatyWindow.close();
        })
        
        sleep(1000);
        let newComponent;
        if (type === 'text') {
            newComponent = text(name).visibleToUser(true).findOnce(300);
        } else if (type === 'desc') {
            newComponent = desc(name).visibleToUser(true).findOnce(300);
        }
        if (newComponent) {
            console.log(`点击${name}无效`);
        }
    }
    
    // 进度条是否已填充
    const isFilled = () => {
        const node = className("android.widget.SeekBar").visibleToUser(true).findOnce();
        if (!node) {
            return false;
        }
        const img = captureCom(node);
        if (!img) {
            return false;
        }
        const num = 150;
        const result = checkComColor(img, img.getWidth() / 2, img.getHeight() - 2, { r: num, g: num, b: num, a: 255 });
        return result;
    }
    
    // 用来与当前进度条是否已填充做对比
    let lastFilled = false;
    let delay = 0
    setInterval(() => {
        delay -= 1000;
        if (text("开心收下").visibleToUser(true).findOnce()) {
            sleep(1000);
            clickCom('text', '开心收下');
        } else if (desc("关闭").visibleToUser(true).findOnce()) {
            sleep(1000);
            clickCom('desc', '关闭');
        } else if (text("领取今日红包").visibleToUser(true).findOnce()) {
            sleep(1000);
            clickCom('text', '领取今日红包');
        } else if (text("点击进入直播间").visibleToUser(true).findOnce()) {
            lastFilled = false;
            delay = Math.random() * 3000 + 10000;
            nextVideo();
        } else if (textContains("当前视频的红包已领完").visibleToUser(true).findOnce()) {
            lastFilled = false;
            delay = Math.random() * 3000 + 10000;
            nextVideo();
        } else if (text("请在下图依次点击").visibleToUser(true).findOnce()) {
            device.vibrate(500);
        } else if (text("为保障您的正常访问请进行验证").visibleToUser(true).findOnce()) {
            device.vibrate(500);
        } else if (delay <= 0) {
            lastFilled = false;
            delay = Math.random() * 3000 + 10000;
            nextVideo();
        } else {
            const filled = isFilled();
            if (lastFilled && !filled) {
                // 视频已播放完 换下一个
                lastFilled = false;
                delay = Math.random() * 3000 + 10000;
                nextVideo();
            } else {
                // 记录本次进度条是否已填充
                lastFilled = filled;
            }
        }
    }, 1000);
    
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
    this.pushLog('查找视频菜单')
    // let skip = this.captureAndCheckByOcr('视频')
    let skip = widgetUtils.widgetGetOne(/^视频$/, 5000)
    if (skip) {
      this.displayButtonAndClick(skip, '找到了视频菜单')
    } else {
      this.pushLog('没有找到视频菜单')
    }
  }
  
}

SignRunner.prototype = Object.create(BaseSignRunner.prototype)
SignRunner.prototype.constructor = SignRunner
module.exports = new SignRunner()
