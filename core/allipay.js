auto.waitFor();

console.log("设备宽度: " + device.width, "设备高度: " + device.height);
// setScreenMetrics(device.width, device.height);
if (!requestScreenCapture()) {
    toast("请求截屏权限失败");
    exit();
}

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
    if (text("明日可领").visibleToUser(true).findOnce()) {
        console.log("任务结束");
        sleep(1000);
        exit();
    } else if (text("开心收下").visibleToUser(true).findOnce()) {
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
