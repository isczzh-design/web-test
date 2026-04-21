const { QUESTION_BANK } = require('../../data/question-bank')
const { formatAnswerDisplay, getAnswerIndex } = require('../../utils/index')

function buildDetailFallback(record) {
  const answers = record.answers || {}
  return QUESTION_BANK.map((q) => {
    const selectedIndex = answers[q.id] === undefined ? -1 : Number(answers[q.id])
    const answerIndex = getAnswerIndex(q, q.answer)
    const userAnswer = selectedIndex >= 0 ? (q.type === 'judge' ? q.options[selectedIndex] : ['A', 'B', 'C', 'D'][selectedIndex]) : ''
    const correct = userAnswer === q.answer
    return {
      id: q.id,
      question: q.question,
      userAnswer,
      answer: q.answer,
      correct,
      userAnswerDisplay: formatAnswerDisplay(q, selectedIndex),
      answerDisplay: formatAnswerDisplay(q, answerIndex)
    }
  })
}

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

    const detailList = record.detailList && record.detailList.length ? record.detailList : buildDetailFallback(record)
    const totalQuestions = record.totalQuestions || detailList.length
    const correctCount = record.correctCount !== undefined ? record.correctCount : detailList.filter((item) => item.correct).length
    const wrongCount = record.wrongCount !== undefined ? record.wrongCount : totalQuestions - correctCount
    const accuracy = record.accuracy !== undefined ? record.accuracy : Number(((correctCount / totalQuestions) * 100).toFixed(2))

    this.setData({
      record: {
        ...record,
        totalQuestions,
        correctCount,
        wrongCount,
        accuracy,
        detailList
      }
    })
  }
})
