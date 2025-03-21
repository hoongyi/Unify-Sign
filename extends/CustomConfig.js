
module.exports = {
  // 配置自定义的签到任务定义信息
  supported_signs: [
    {
      name: 'sdgun签到',
      taskCode: 'sdgun',
      script: 'sd.js',
      enabled: true
    },
    {
      name: '抖音商城签到',
      taskCode: 'douyinShop',
      script: 'DouyinShop.js',
      enabled: true
    },
    {
      name: '支付宝视频领红包',
      taskCode: 'alipayVedio',
      script: 'AlipayVedio.js',
      enabled: true
    }
  ]
}
