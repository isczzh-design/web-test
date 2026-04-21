const PAPER_TITLE = '三级安全教育试题'

const QUESTION_BANK = [
  { id: 1, type: 'judge', question: '新员工必须参加三级安全教育，合格才能上岗。', options: ['对', '错'], answer: '对', score: 5 },
  { id: 2, type: 'judge', question: '进入货场、仓库可以不戴安全帽、不穿反光衣。', options: ['对', '错'], answer: '错', score: 5 },
  { id: 3, type: 'judge', question: '消防通道和安全出口不能堆放货物，必须保持畅通。', options: ['对', '错'], answer: '对', score: 5 },
  { id: 4, type: 'judge', question: '叉车、装卸车必须持证上岗，无证不能操作。', options: ['对', '错'], answer: '对', score: 5 },
  { id: 5, type: 'judge', question: '仓库内可以吸烟、可以给电动车飞线充电。', options: ['对', '错'], answer: '错', score: 5 },
  { id: 6, type: 'judge', question: '发现安全隐患要立即报告，不能冒险作业。', options: ['对', '错'], answer: '对', score: 5 },
  { id: 7, type: 'judge', question: '发生火灾先救人，再报警，再扑救初起火灾。', options: ['对', '错'], answer: '对', score: 5 },
  { id: 8, type: 'judge', question: '货物可以超高、超宽堆放，只要不倒塌就行。', options: ['对', '错'], answer: '错', score: 5 },
  { id: 9, type: 'single', question: '我国安全生产方针是（）', options: ['A. 安全第一、预防为主、综合治理', 'B. 先生产、后安全', 'C. 效益第一'], answer: 'A', score: 5 },
  { id: 10, type: 'single', question: '灭火器使用正确步骤是（）', options: ['A. 拔销→对准火焰根部→按压扫射', 'B. 直接喷火焰上部', 'C. 先对着地面喷'], answer: 'A', score: 5 },
  { id: 11, type: 'single', question: '有限空间作业要做到（）', options: ['A. 先通风、再检测、后作业', 'B. 直接进去干活', 'C. 边干边通风'], answer: 'A', score: 5 },
  { id: 12, type: 'single', question: '触电时第一步应该（）', options: ['A. 切断电源', 'B. 用手去拉人', 'C. 打电话找人'], answer: 'A', score: 5 },
  { id: 13, type: 'single', question: '装卸作业时货物应（）', options: ['A. 稳固整齐，不超高不堵通道', 'B. 随便堆', 'C. 堆在消防栓旁边'], answer: 'A', score: 5 }
]

module.exports = {
  PAPER_TITLE,
  QUESTION_BANK
}
