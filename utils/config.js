function getConfig() {
  return {
    // 填入你的云开发环境ID后改为 true
    useCloud: false,
    envId: 'your-cloud-env-id',
    collections: {
      examRecord: 'exam_record',
      submitLock: 'submit_lock'
    }
  }
}

module.exports = {
  getConfig
}
