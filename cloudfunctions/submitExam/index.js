const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { payload, collections } = event
  const db = cloud.database()

  if (!payload || !payload.userKey) {
    return { success: false, code: 'INVALID_PAYLOAD', message: '参数不完整' }
  }

  const examRecordCol = collections?.examRecord || 'exam_record'
  const submitLockCol = collections?.submitLock || 'submit_lock'

  try {
    // 第一层：加锁，避免连续点击多次提交
    await db.collection(submitLockCol).add({
      data: {
        userKey: payload.userKey,
        createdAt: new Date()
      }
    })

    // 第二层：已提交校验
    const existing = await db.collection(examRecordCol).where({ userKey: payload.userKey }).limit(1).get()
    if (existing.data.length) {
      return { success: false, code: 'DUPLICATE_SUBMIT', message: '用户已提交' }
    }

    await db.collection(examRecordCol).add({ data: payload })
    return { success: true, data: payload }
  } catch (err) {
    const duplicate = String(err.errMsg || '').includes('duplicate')
    return {
      success: false,
      code: duplicate ? 'DUPLICATE_KEY' : 'SUBMIT_FAIL',
      message: err.errMsg || '提交失败'
    }
  }
}
