const { QUESTION_BANK } = require('../../data/question-bank')

Page({
  data: {
    userProfile: null,
    totalQuestions: QUESTION_BANK.length,
    totalScore: QUESTION_BANK.length * 5
  },

  onShow() {
    const app = getApp()
    const profile = app.globalData.userProfile || wx.getStorageSync('userProfile')
    if (!profile) {
      wx.reLaunch({ url: '/pages/login/login' })
      return
    }
    this.setData({ userProfile: profile })
  },

  startExam() {
    wx.navigateTo({ url: '/pages/exam/exam' })
  }
})
