const { QUESTION_BANK, PAPER_TITLE } = require('../data/question-bank')

function buildUserKey({ partition, name, phone }) {
  return `${partition}__${name}__${phone}`
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

function normalizeAnswer(question, selectedIndex) {
  if (question.type === 'judge') {
    return question.options[selectedIndex]
  }
  const label = ['A', 'B', 'C', 'D'][selectedIndex]
  return label || ''
}

function gradeAnswers(answerMap) {
  let total = 0
  const details = QUESTION_BANK.map((q) => {
    const idx = answerMap[q.id]
    const userAnswer = idx === undefined ? '' : normalizeAnswer(q, idx)
    const correct = userAnswer === q.answer
    if (correct) total += q.score
    return {
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
      userAnswer,
      answer: q.answer,
      score: q.score,
      correct
    }
  })

  return {
    paperTitle: PAPER_TITLE,
    totalQuestions: QUESTION_BANK.length,
    totalScore: QUESTION_BANK.reduce((sum, q) => sum + q.score, 0),
    score: total,
    details
  }
}

module.exports = {
  buildUserKey,
  validatePhone,
  formatTime,
  gradeAnswers
}
