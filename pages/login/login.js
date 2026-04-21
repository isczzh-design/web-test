const { validatePhone, buildUserKey, normalizeProfile } = require('../../utils/index')
const { getRecordByUserKey } = require('../../utils/service')

Page({
  data: {
    form: {
      partition: '',
      name: '',
      phone: ''
    },
    loading: false
  },

  onShow() {
    const app = getApp()
    const profile = app.globalData.userProfile
    if (profile) {
      this.setData({ form: profile })
    }
  },

  onInput(e) {
    const { key } = e.currentTarget.dataset
    this.setData({
      [`form.${key}`]: e.detail.value
    })
  },

  async onSaveProfile() {
    if (this.data.loading) return

    const form = normalizeProfile(this.data.form)

    if (!form.partition || !form.name || !form.phone) {
      wx.showToast({ title: '请完整填写信息', icon: 'none' })
      return
    }

    if (!validatePhone(form.phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }

    const userKey = buildUserKey(form)
    const app = getApp()

    this.setData({ loading: true })
    try {
      const record = await getRecordByUserKey(userKey)
      app.globalData.userProfile = form
      wx.setStorageSync('userProfile', form)

      if (record) {
        app.globalData.examRecord = record
        wx.setStorageSync('examRecord', record)
        wx.reLaunch({ url: '/pages/result/result?submitted=1' })
        return
      }

      app.globalData.examRecord = null
      wx.removeStorageSync('examRecord')
      wx.reLaunch({ url: '/pages/home/home' })
    } catch (error) {
      wx.showToast({ title: '查询失败，请重试', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
