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
    // 第一层：锁定同一身份重复并发提交（userKey 作为文档 _id）
    await db.collection(submitLockCol).add({
      data: {
        _id: payload.userKey,
        userKey: payload.userKey,
        createdAt: new Date()
      }
    })

    // 第二层：同一身份是否已有记录（后端再次校验）
    const existing = await db.collection(examRecordCol).doc(payload.userKey).get()
    if (existing.data) {
      return { success: false, code: 'DUPLICATE_SUBMIT', message: '用户已提交' }
    }

    // 第三层：提交记录使用 userKey 作为 _id，数据库层强制唯一
    await db.collection(examRecordCol).add({
      data: {
        _id: payload.userKey,
        ...payload
      }
    })

    return { success: true, data: payload }
  } catch (err) {
    const duplicate = String(err.errMsg || '').includes('duplicate')
    const notFound = String(err.errMsg || '').includes('document.get:fail')
    if (notFound) {
      try {
        await db.collection(examRecordCol).add({
          data: {
            _id: payload.userKey,
            ...payload
          }
        })
        return { success: true, data: payload }
      } catch (error) {
        const isDuplicate = String(error.errMsg || '').includes('duplicate')
        return {
          success: false,
          code: isDuplicate ? 'DUPLICATE_KEY' : 'SUBMIT_FAIL',
          message: error.errMsg || '提交失败'
        }
      }
    }

    return {
      success: false,
      code: duplicate ? 'DUPLICATE_KEY' : 'SUBMIT_FAIL',
      message: err.errMsg || '提交失败'
    }
  }
}
