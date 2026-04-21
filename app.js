const { getConfig } = require('./utils/config')

App({
  globalData: {
    config: getConfig(),
    userProfile: null,
    examRecord: null
  },

  onLaunch() {
    const { useCloud, envId } = this.globalData.config
    if (useCloud) {
      if (!wx.cloud) {
        console.error('请使用 2.2.3 及以上基础库以支持云开发')
        return
      }
      wx.cloud.init({
        env: envId,
        traceUser: true
      })
    }

    const profile = wx.getStorageSync('userProfile')
    const record = wx.getStorageSync('examRecord')
    if (profile) this.globalData.userProfile = profile
    if (record) this.globalData.examRecord = record
  }
})
