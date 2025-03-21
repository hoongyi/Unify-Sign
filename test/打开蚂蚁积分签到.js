function openSignPage () {
  let _package_name = 'com.eg.android.AlipayGphone'
  let url = 'alipays://platformapi/startapp?appId=20000067&url=https%3A%2F%2Frender.alipay.com%2Fp%2Fyuyan%2F180020380000000023%2Fpoint-sign-in.html%3FchInfo%3D&launchKey=3755a1a6-6b02-4508-8714-cd2d393b08e9-1704164626631'
  // console.log('url:', url)
  // app.startActivity({
  //   action: 'android.intent.action.VIEW',
  //   data: url,
  //   packageName: _package_name
  // })

  // 直接打开支付宝会员积分页面
  url = 'alipays://platformapi/startapp?appId=20000160&url=%2Fwww%2FmyPoints.html'
  console.log('url:', url)
  app.startActivity({
    action: 'VIEW',
    data: url,
    packageName: _package_name
  })
}



openSignPage()