Page({
  data: {
    record: null,
    submittedTip: false
  },

  onLoad(query) {
    this.setData({ submittedTip: query.submitted === '1' })
  },

  onShow() {
    const app = getApp()
    const record = app.globalData.examRecord || wx.getStorageSync('examRecord')
    if (!record) {
      wx.reLaunch({ url: '/pages/login/login' })
      return
    }
    this.setData({ record })
  }
})
