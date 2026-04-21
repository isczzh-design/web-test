const { QUESTION_BANK } = require('../../data/question-bank')
const { buildUserKey, gradeAnswers, formatTime } = require('../../utils/index')
const { getRecordByUserKey, submitExamRecord } = require('../../utils/service')

Page({
  data: {
    questions: QUESTION_BANK,
    currentIndex: 0,
    answerMap: {},
    submitting: false,
    progressText: '',
    answeredCount: 0,
    unansweredCount: QUESTION_BANK.length,
    showAnswerCard: false,
    totalQuestions: QUESTION_BANK.length
  },

  onLoad() {
    this.refreshProgress()
    this.enableLeaveAlert()
  },

  async onShow() {
    const app = getApp()
    const profile = app.globalData.userProfile || wx.getStorageSync('userProfile')
    if (!profile) {
      wx.reLaunch({ url: '/pages/login/login' })
      return
    }

    const userKey = buildUserKey(profile)
    this.userKey = userKey

    const record = await getRecordByUserKey(userKey)
    if (record) {
      app.globalData.examRecord = record
      wx.setStorageSync('examRecord', record)
      this.disableLeaveAlert()
      wx.reLaunch({ url: '/pages/result/result?submitted=1' })
      return
    }

    const savedState = wx.getStorageSync(`examState_${userKey}`)
    if (savedState && savedState.answerMap) {
      this.setData({
        answerMap: savedState.answerMap,
        currentIndex: savedState.currentIndex || 0
      }, () => this.refreshProgress())
    }
  },

  onUnload() {
    this.saveExamState()
  },

  onBackPress() {
    if (this.data.submitting) return true
    wx.showModal({
      title: '离开确认',
      content: '当前试卷尚未提交，已作答内容会保留，确定离开吗？',
      success: (res) => {
        if (res.confirm) {
          this.disableLeaveAlert()
          wx.navigateBack()
        }
      }
    })
    return true
  },

  enableLeaveAlert() {
    if (wx.enableAlertBeforeUnload) {
      wx.enableAlertBeforeUnload({
        message: '当前试卷尚未提交，已作答内容会保留，确定离开吗？'
      })
    }
  },

  disableLeaveAlert() {
    if (wx.disableAlertBeforeUnload) {
      wx.disableAlertBeforeUnload()
    }
  },

  saveExamState() {
    if (!this.userKey) return
    wx.setStorageSync(`examState_${this.userKey}`, {
      answerMap: this.data.answerMap,
      currentIndex: this.data.currentIndex,
      updatedAt: Date.now()
    })
  },

  clearExamState() {
    if (!this.userKey) return
    wx.removeStorageSync(`examState_${this.userKey}`)
  },

  refreshProgress() {
    const answeredCount = this.data.questions.filter((q) => this.data.answerMap[q.id] !== undefined).length
    const unansweredCount = this.data.questions.length - answeredCount
    this.setData({
      answeredCount,
      unansweredCount,
      progressText: `${this.data.currentIndex + 1} / ${this.data.questions.length}`
    })
  },

  getOptionLabel(index) {
    return ['A', 'B', 'C', 'D'][index] || ''
  },

  onPickOption(e) {
    const qid = Number(e.currentTarget.dataset.qid)
    const index = Number(e.currentTarget.dataset.index)
    this.setData({
      [`answerMap.${qid}`]: index
    }, () => {
      this.saveExamState()
      this.refreshProgress()
    })
  },

  onPrev() {
    if (this.data.currentIndex === 0) return
    this.setData({ currentIndex: this.data.currentIndex - 1 }, () => {
      this.saveExamState()
      this.refreshProgress()
    })
  },

  onNext() {
    if (this.data.currentIndex >= this.data.questions.length - 1) return
    this.setData({ currentIndex: this.data.currentIndex + 1 }, () => {
      this.saveExamState()
      this.refreshProgress()
    })
  },

  toggleAnswerCard() {
    this.setData({ showAnswerCard: !this.data.showAnswerCard })
  },

  goQuestion(e) {
    const index = Number(e.currentTarget.dataset.index)
    this.setData({
      currentIndex: index,
      showAnswerCard: false
    }, () => {
      this.saveExamState()
      this.refreshProgress()
    })
  },

  async onSubmit() {
    if (this.data.submitting) return

    const unansweredIds = this.data.questions
      .filter((q) => this.data.answerMap[q.id] === undefined)
      .map((q) => q.id)

    if (unansweredIds.length) {
      const firstUnansweredIndex = this.data.questions.findIndex((q) => q.id === unansweredIds[0])
      wx.showModal({
        title: '未完成作答',
        content: `您还有 ${unansweredIds.join('、')} 题未作答，请先完成后再提交。`,
        confirmText: '去作答',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.setData({ currentIndex: firstUnansweredIndex }, () => {
              this.saveExamState()
              this.refreshProgress()
            })
          }
        }
      })
      return
    }

    const confirm = await new Promise((resolve) => {
      wx.showModal({
        title: '确认提交',
        content: '确认提交试卷吗？提交后将不可修改。',
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
        this.disableLeaveAlert()
        this.clearExamState()
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
        paperVersion: grading.paperVersion,
        totalQuestions: grading.totalQuestions,
        totalScore: grading.totalScore,
        correctCount: grading.correctCount,
        wrongCount: grading.wrongCount,
        accuracy: grading.accuracy,
        detailList: grading.details
      }

      const saved = await submitExamRecord(record)
      app.globalData.examRecord = saved
      wx.setStorageSync('examRecord', saved)
      this.disableLeaveAlert()
      this.clearExamState()
      wx.reLaunch({ url: '/pages/result/result?submitted=1' })
    } catch (error) {
      const isDuplicate = error.code === 'DUPLICATE_SUBMIT' || error.code === 'DUPLICATE_KEY'
      wx.showToast({ title: isDuplicate ? '您已提交过试卷' : '提交失败，请重试', icon: 'none' })
      if (isDuplicate) {
        const latest = await getRecordByUserKey(userKey)
        if (latest) {
          app.globalData.examRecord = latest
          wx.setStorageSync('examRecord', latest)
          this.disableLeaveAlert()
          this.clearExamState()
          wx.reLaunch({ url: '/pages/result/result?submitted=1' })
        }
      }
    } finally {
      this.setData({ submitting: false })
    }
  }
})
