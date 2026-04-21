const { QUESTION_BANK, PAPER_TITLE } = require('../data/question-bank')

const PAPER_VERSION = 'v1'

function normalizeText(value) {
  return String(value || '').trim().replace(/\s+/g, '')
}

function normalizeProfile(profile = {}) {
  return {
    partition: normalizeText(profile.partition),
    name: normalizeText(profile.name),
    phone: normalizeText(profile.phone)
  }
}

function buildUserKey(profile) {
  const normalized = normalizeProfile(profile)
  return `${normalized.partition}__${normalized.name}__${normalized.phone}`
}

function validatePhone(phone) {
  return /^1\d{10}$/.test(String(phone || '').trim())
}

function formatTime(date = new Date()) {
  const yyyy = date.getFullYear()
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  const hh = `${date.getHours()}`.padStart(2, '0')
  const mi = `${date.getMinutes()}`.padStart(2, '0')
  const ss = `${date.getSeconds()}`.padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

function getOptionLabelByIndex(index) {
  return ['A', 'B', 'C', 'D'][index] || ''
}

function getOptionTextByIndex(question, selectedIndex) {
  const option = question.options[selectedIndex] || ''
  if (question.type === 'single') {
    return option.replace(/^[A-D]\.?\s*/, '')
  }
  return option
}

function normalizeAnswer(question, selectedIndex) {
  if (selectedIndex === undefined || selectedIndex === null) return ''
  if (question.type === 'judge') {
    return question.options[selectedIndex]
  }
  return getOptionLabelByIndex(selectedIndex)
}

function formatAnswerDisplay(question, selectedIndex) {
  if (selectedIndex === undefined || selectedIndex === null || selectedIndex < 0) {
    return '未作答'
  }
  const label = getOptionLabelByIndex(selectedIndex)
  const text = getOptionTextByIndex(question, selectedIndex)
  return `${label}. ${text}`
}

function getAnswerIndex(question, answer) {
  if (!answer) return -1
  if (question.type === 'judge') {
    return question.options.findIndex((item) => item === answer)
  }
  return ['A', 'B', 'C', 'D'].indexOf(answer)
}

function gradeAnswers(answerMap) {
  let total = 0
  let correctCount = 0
  const details = QUESTION_BANK.map((q) => {
    const idx = answerMap[q.id]
    const userAnswer = normalizeAnswer(q, idx)
    const userAnswerIndex = idx === undefined ? -1 : idx
    const correct = userAnswer === q.answer
    if (correct) {
      total += q.score
      correctCount += 1
    }

    const correctAnswerIndex = getAnswerIndex(q, q.answer)

    return {
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
      userAnswer,
      userAnswerIndex,
      userAnswerDisplay: formatAnswerDisplay(q, userAnswerIndex),
      answer: q.answer,
      answerIndex: correctAnswerIndex,
      answerDisplay: formatAnswerDisplay(q, correctAnswerIndex),
      score: q.score,
      correct
    }
  })

  const totalQuestions = QUESTION_BANK.length
  const wrongCount = totalQuestions - correctCount
  const accuracy = totalQuestions ? Number(((correctCount / totalQuestions) * 100).toFixed(2)) : 0

  return {
    paperTitle: PAPER_TITLE,
    paperVersion: PAPER_VERSION,
    totalQuestions,
    totalScore: QUESTION_BANK.reduce((sum, q) => sum + q.score, 0),
    score: total,
    correctCount,
    wrongCount,
    accuracy,
    details
  }
}

module.exports = {
  PAPER_VERSION,
  normalizeProfile,
  buildUserKey,
  validatePhone,
  formatTime,
  gradeAnswers,
  getOptionLabelByIndex,
  getOptionTextByIndex,
  formatAnswerDisplay,
  getAnswerIndex
}
