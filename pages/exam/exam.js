const { QUESTION_BANK } = require('../../data/question-bank')
const { buildUserKey, gradeAnswers, formatTime } = require('../../utils/index')
const { getRecordByUserKey, submitExamRecord } = require('../../utils/service')

Page({
  data: {
    questions: QUESTION_BANK,
    currentIndex: 0,
    answerMap: {},
    submitting: false,
    progressText: ''
  },

  onLoad() {
    this.refreshProgress()
  },

  async onShow() {
    const app = getApp()
    const profile = app.globalData.userProfile || wx.getStorageSync('userProfile')
    if (!profile) {
      wx.reLaunch({ url: '/pages/login/login' })
      return
    }

    const userKey = buildUserKey(profile)
    const record = await getRecordByUserKey(userKey)
    if (record) {
      app.globalData.examRecord = record
      wx.setStorageSync('examRecord', record)
      wx.reLaunch({ url: '/pages/result/result?submitted=1' })
    }
  },

  refreshProgress() {
    this.setData({
      progressText: `${this.data.currentIndex + 1} / ${this.data.questions.length}`
    })
  },

  onPickOption(e) {
    const qid = Number(e.currentTarget.dataset.qid)
    const index = Number(e.currentTarget.dataset.index)
    this.setData({
      [`answerMap.${qid}`]: index
    })
  },

  onPrev() {
    if (this.data.currentIndex === 0) return
    this.setData({ currentIndex: this.data.currentIndex - 1 }, () => this.refreshProgress())
  },

  onNext() {
    if (this.data.currentIndex >= this.data.questions.length - 1) return
    this.setData({ currentIndex: this.data.currentIndex + 1 }, () => this.refreshProgress())
  },

  async onSubmit() {
    if (this.data.submitting) return

    const unanswered = this.data.questions.filter((q) => this.data.answerMap[q.id] === undefined)
    if (unanswered.length) {
      wx.showToast({ title: `还有 ${unanswered.length} 题未作答`, icon: 'none' })
      return
    }

    const confirm = await new Promise((resolve) => {
      wx.showModal({
        title: '确认提交',
        content: '提交后将无法再次答题，是否确认提交？',
        success: (res) => resolve(res.confirm),
        fail: () => resolve(false)
      })
    })
    if (!confirm) return

    const app = getApp()
    const profile = app.globalData.userProfile
    const userKey = buildUserKey(profile)

    this.setData({ submitting: true })
    try {
      const existing = await getRecordByUserKey(userKey)
      if (existing) {
        app.globalData.examRecord = existing
        wx.setStorageSync('examRecord', existing)
        wx.reLaunch({ url: '/pages/result/result?submitted=1' })
        return
      }

      const grading = gradeAnswers(this.data.answerMap)
      const record = {
        userKey,
        partition: profile.partition,
        name: profile.name,
        phone: profile.phone,
        answers: this.data.answerMap,
        score: grading.score,
        submittedAt: formatTime(),
        paperTitle: grading.paperTitle,
        totalQuestions: grading.totalQuestions,
        totalScore: grading.totalScore,
        detailList: grading.details
      }

      const saved = await submitExamRecord(record)
      app.globalData.examRecord = saved
      wx.setStorageSync('examRecord', saved)
      wx.reLaunch({ url: '/pages/result/result?submitted=1' })
    } catch (error) {
      const isDuplicate = error.code === 'DUPLICATE_SUBMIT' || error.code === 'DUPLICATE_KEY'
      wx.showToast({ title: isDuplicate ? '您已提交过试卷' : '提交失败，请重试', icon: 'none' })
      if (isDuplicate) {
        const latest = await getRecordByUserKey(userKey)
        if (latest) {
          app.globalData.examRecord = latest
          wx.setStorageSync('examRecord', latest)
          wx.reLaunch({ url: '/pages/result/result?submitted=1' })
        }
      }
    } finally {
      this.setData({ submitting: false })
    }
  }
})
