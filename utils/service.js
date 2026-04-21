const { getConfig } = require('./config')

const config = getConfig()
const mockDBKey = 'mockExamRecords'

function getMockRecords() {
  return wx.getStorageSync(mockDBKey) || {}
}

function setMockRecords(records) {
  wx.setStorageSync(mockDBKey, records)
}

async function getRecordByUserKey(userKey) {
  if (!config.useCloud) {
    const records = getMockRecords()
    return records[userKey] || null
  }

  const db = wx.cloud.database()
  try {
    const { data } = await db.collection(config.collections.examRecord).doc(userKey).get()
    return data || null
  } catch (error) {
    const notFound = String(error.errMsg || '').includes('document.get:fail')
    if (notFound) return null
    throw error
  }
}

async function submitExamRecord(payload) {
  if (!config.useCloud) {
    const records = getMockRecords()
    if (records[payload.userKey]) {
      const err = new Error('DUPLICATE_SUBMIT')
      err.code = 'DUPLICATE_SUBMIT'
      throw err
    }
    records[payload.userKey] = payload
    setMockRecords(records)
    return payload
  }

  const res = await wx.cloud.callFunction({
    name: 'submitExam',
    data: {
      payload,
      collections: config.collections
    }
  })

  if (!res.result.success) {
    const err = new Error(res.result.message || 'SUBMIT_FAIL')
    err.code = res.result.code || 'SUBMIT_FAIL'
    throw err
  }
  return res.result.data
}

module.exports = {
  getRecordByUserKey,
  submitExamRecord
}
