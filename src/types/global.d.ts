interface Window {
  _AMapSecurityConfig: {
    securityJsCode: string
  }
  QC: {
    Login: {
      // 检查是否qq登录
      check(): boolean
      // 获取个人信息
      getMe(cb: (openId: string) => void): void
    }
  }
}
