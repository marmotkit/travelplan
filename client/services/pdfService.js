// 先引入核心功能
import pdfMake from "pdfmake/build/pdfmake";
// 再引入字型
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// 設定虛擬檔案系統和字型
if (pdfMake.vfs === undefined) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

// 定義字型配置
const fonts = {
  NotoSansTC: {
    normal: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Regular.otf',
    bold: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Bold.otf',
    italics: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Regular.otf',
    bolditalics: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Bold.otf'
  }
};

// 建立文件定義
const docDefinition = {
  footer: function(currentPage, pageCount) {
    return {
      text: `${currentPage} / ${pageCount}`,
      alignment: 'center',
      margin: [0, 10, 0, 0],
      style: 'footer'
    };
  },
  defaultStyle: {
    font: 'NotoSansTC',
    fontSize: 12
  }
};

// 初始化 pdfMake 配置
if (pdfMake.fonts === undefined) {
  Object.assign(pdfMake, { fonts });
}

// 新增日期檢查和格式化函數
const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// 定義圖標映射
const ICONS = {
  'TopGolf': '🏌️‍♂️',
  '移動': '🚖',
  '夜市': '🌆',
  '台北': '✈️',
  '曼谷': '✈️',
  '觀光': '🎭',
  'Golf': '⛳',
  '按摩': '💆‍♂️',
  'BBQ': '🍽',
  'Spa': '💆‍♂️',
  '水上市場': '🛶'
};

// 獲取活動圖標
const getActivityIcon = () => '•';

// 更嚴格的文字處理函數
const formatText = (text) => {
  if (!text) return '';
  return text
    // 先移除所有表情符號
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]/gu, '')
    // 移除所有特殊符號和空白
    .replace(/^[•\s.：:：\s🏌️‍♂️🚖🌆✈️🎭⛳💆‍♂️🍽🛶☕🐘]+/g, '')
    // 移除開頭的點和空白
    .replace(/^[\s.。・·•●○◆◇□■]+/g, '')
    // 合併多個空白為一個
    .replace(/\s+/g, ' ')
    // 最後再次清理前後空白
    .trim();
};

// 處理費用文字
const formatCost = (cost) => {
  if (!cost) return '';
  const cleanedCost = formatText(cost)
    // 移除費用文字中的特定前綴
    .replace(/^(約|約：|：)/g, '')
    // 確保冒號前後只有一個空格
    .replace(/\s*[:：]\s*/g, ': ');
  
  return cleanedCost ? `• ${cleanedCost}` : '';
};

export const generateActivityPDF = async (activity, tripItems, accommodations, budgets, travelInfo) => {
  // 格式化日期
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '未設定';
      console.log('Formatting date:', dateString);
      
      // 如果是自定義格式（例如：2/26（Day 1）曼谷 & 芭達雅）
      if (typeof dateString === 'string' && dateString.includes('（Day')) {
        // 只取日期部分（例如：2/26）
        const datePart = dateString.split('（')[0];
        // 添加年份
        return `2025/${datePart}`;
      }

      // 如果是日期範圍（例如：2/26 - 3/1）
      if (typeof dateString === 'string' && dateString.includes(' - ')) {
        const [start, end] = dateString.split(' - ');
        return `2025/${start} - 2025/${end}`;
      }

      // 如果只有單一日期（例如：3/1）
      if (typeof dateString === 'string' && /^\d{1,2}\/\d{1,2}$/.test(dateString)) {
        return `2025/${dateString}`;
      }

      // 其他格式保持不變
      if (typeof dateString === 'string' && dateString.includes('T')) {
        return format(new Date(dateString), 'yyyy/MM/dd', { locale: zhTW });
      }
      
      if (dateString instanceof Date) {
        return format(dateString, 'yyyy/MM/dd', { locale: zhTW });
      }
      
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return format(new Date(dateString), 'yyyy/MM/dd', { locale: zhTW });
      }

      return dateString;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString; // 如果無法格式化，直接返回原始字串
    }
  };

  // 格式化金額
  const formatAmount = (amount) => {
    try {
      if (!amount) return '0';
      const num = parseFloat(amount.toString().replace(/[^0-9.-]+/g, ''));
      return isNaN(num) ? '0' : num.toLocaleString();
    } catch (error) {
      console.error('Error formatting amount:', amount, error);
      return '0';
    }
  };

  // 計算總金額
  const calculateTotal = (items) => {
    try {
      if (!Array.isArray(items)) return 0;
      return items.reduce((sum, item) => {
        const amount = parseFloat(item.amount.toString().replace(/[^0-9.-]+/g, ''));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    } catch (error) {
      console.error('Error calculating total:', error);
      return 0;
    }
  };

  try {
    console.log('Generating PDF with data:', {
      activity,
      tripItems: tripItems.length,
      accommodations: accommodations.length,
      budgets: budgets.length,
      travelInfo: !!travelInfo
    });

    // 檢查資料
    console.log('Trip items sample:', tripItems[0]);
    console.log('Accommodations sample:', accommodations[0]);

    // 確保 budgets 是陣列
    const budgetItems = Array.isArray(budgets) ? budgets : [];
    console.log('Processing budgets:', budgetItems);

    // 將行程按日期分組
    const groupedTripItems = tripItems.reduce((groups, item) => {
      const date = item.date.split('（')[0]; // 取得日期部分（例如：2/26）
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});

    // 建立文件定義
    const docDefinition = {
      footer: function(currentPage, pageCount) {
        return {
          text: `${currentPage} / ${pageCount}`,
          alignment: 'center',
          margin: [0, 10, 0, 0],
          style: 'footer'
        };
      },
      defaultStyle: {
        font: 'NotoSansTC',
        fontSize: 12
      },
      content: [
        // 標題
        {
          text: activity.title || '未命名活動',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        // 活動日期
        {
          text: [
            '活動日期：',
            `${formatDate(activity.startDate)} - ${formatDate(activity.endDate)}`
          ],
          style: 'subheader',
          margin: [0, 0, 0, 20]
        },

        // 行程管理
        {
          text: '行程管理',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          layout: {
            hLineWidth: function(i, node) {
              const rowsPerDay = Object.values(groupedTripItems).map(items => items.length);
              let totalRows = 0;
              const dayBreakRows = rowsPerDay.map(count => {
                totalRows += count;
                return totalRows;
              });
              if (i === 0) return 1;  // 表頭上線
              if (i === 1) return 1;  // 表頭下線
              if (dayBreakRows.includes(i - 1)) return 1;  // 每個日期組的底線
              return 0;
            },
            vLineWidth: function(i, node) {
              return 1;
            },
            hLineColor: function(i, node) {
              return '#dddddd';
            },
            vLineColor: function(i, node) {
              return '#dddddd';
            },
            paddingLeft: function(i, node) { return 8; },
            paddingRight: function(i, node) { return 8; },
            paddingTop: function(i, node) { return 3; },     // 減少行高
            paddingBottom: function(i, node) { return 3; },  // 減少行高
          },
          table: {
            headerRows: 1,
            widths: [80, '*', 'auto'],
            body: [
              [
                { text: '日期', style: 'tableHeader', fillColor: '#f5f5f5' },
                { text: '活動', style: 'tableHeader', fillColor: '#f5f5f5' },
                { text: '費用預估 ( TWD/THB )', style: 'tableHeader', fillColor: '#f5f5f5' }
              ],
              ...Object.entries(groupedTripItems).flatMap(([date, items]) => {
                const firstRow = [
                  {
                    text: items[0].date.split('（')[0],
                    style: 'tableCell',
                    rowSpan: items.length,
                    verticalAlignment: 'middle'
                  },
                  {
                    text: [
                      { text: '• ', style: 'bullet' },
                      { 
                        text: formatText(items[0].activity)
                          // 確保移除所有前置符號
                          .replace(/^[•\s.。・·•●○◆◇□■]+/, '')
                          // 移除可能殘留的表情符號
                          .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]/gu, ''),
                        style: 'tableCell' 
                      }
                    ],
                    margin: [0, 0, 0, 0]
                  },
                  {
                    text: formatCost(items[0].cost),
                    style: 'tableCell',
                    alignment: 'left'
                  }
                ];

                const otherRows = items.slice(1).map(item => [
                  {}, // 這個會被 rowSpan 覆蓋
                  {
                    text: [
                      { text: '• ', style: 'bullet' },
                      { 
                        text: formatText(item.activity)
                          // 確保移除所有前置符號
                          .replace(/^[•\s.。・·•●○◆◇□■]+/, '')
                          // 移除可能殘留的表情符號
                          .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]/gu, ''),
                        style: 'tableCell' 
                      }
                    ],
                    margin: [0, 0, 0, 0]
                  },
                  {
                    text: formatCost(item.cost),
                    style: 'tableCell',
                    alignment: 'left'
                  }
                ]);

                return [firstRow, ...otherRows];
              })
            ]
          }
        },

        // 住宿管理
        {
          text: '住宿管理',
          style: 'sectionHeader',
          pageBreak: 'before',
          margin: [0, 0, 0, 10]
        },
        ...(accommodations || []).map(acc => {
          console.log('Processing accommodation:', acc);
          return {
            stack: [
              { text: acc.hotel || '未命名住宿', style: 'itemTitle' },
              { text: `入住日期：${acc.dateRange || '未設定'}`, style: 'itemContent' },
              { text: `地址：${acc.address || '無地址'}`, style: 'itemContent' },
              { text: `備註：${acc.note || '無'}`, style: 'itemContent' },
              { text: '', margin: [0, 0, 0, 10] }
            ]
          };
        }),

        // 預算管理
        {
          text: '預算管理',
          style: 'sectionHeader',
          pageBreak: 'before',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['項目', '金額', '幣別', '狀態'],
              ...budgetItems.map(budget => [
                budget.item || '未命名項目',
                formatAmount(budget.amount),
                budget.currency || 'TWD',
                budget.status === 'paid' ? '已付款' : '待付款'
              ])
            ]
          }
        },
        {
          text: `總計：${formatAmount(calculateTotal(budgetItems))} TWD`,
          style: 'totalAmount',
          margin: [0, 10, 0, 20]
        },

        // 需要攜帶的費用
        {
          text: '需要攜帶的費用',
          style: 'sectionHeader',
          pageBreak: 'before',
          margin: [0, 0, 0, 10]
        },
        {
          stack: [
            { text: '現金：', style: 'itemTitle' },
            { 
              text: travelInfo?.expenses?.cash?.note ? 
                travelInfo?.expenses?.cash?.note.split('\n').map(line => `• ${line.trim()}`).join('\n') : 
                '無', 
              style: 'itemContent' 
            },
            { text: '', margin: [0, 0, 0, 10] },
            { text: '信用卡：', style: 'itemTitle' },
            ...(travelInfo?.expenses?.creditCard?.recommendations || []).map(rec => ({
              text: `• ${formatText(rec)}`,
              style: 'itemContent'
            }))
          ]
        },

        // 注意事項
        {
          text: '注意事項',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10]
        },
        {
          text: travelInfo?.notices ? 
            travelInfo.notices.split('\n').map(line => `• ${line.trim()}`).join('\n') : 
            '無',
          style: 'itemContent'
        }
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          font: 'NotoSansTC'
        },
        subheader: {
          fontSize: 16,
          bold: true,
          font: 'NotoSansTC'
        },
        sectionHeader: {
          fontSize: 18,
          bold: true,
          color: '#2196F3',
          font: 'NotoSansTC'
        },
        dateHeader: {
          fontSize: 16,
          bold: true,
          color: '#2196F3',
          font: 'NotoSansTC',
          margin: [0, 10, 0, 5]
        },
        bullet: {
          fontSize: 10,
          font: 'NotoSansTC',
          color: '#666666'
        },
        itemTitle: {
          fontSize: 14,
          bold: true,
          font: 'NotoSansTC',
          margin: [0, 2, 0, 2]
        },
        itemContent: {
          fontSize: 12,
          color: '#666666',
          font: 'NotoSansTC',
          margin: [0, 1, 0, 1],  // 減小段落間距
          lineHeight: 1.3
        },
        totalAmount: {
          fontSize: 14,
          bold: true,
          alignment: 'right',
          font: 'NotoSansTC'
        },
        tableHeader: {
          fontSize: 11,
          bold: true,
          color: '#333333',
          font: 'NotoSansTC',
          alignment: 'center'
        },
        tableCell: {
          fontSize: 10,
          font: 'NotoSansTC',
          color: '#333333',
          lineHeight: 1.2  // 減小行高
        },
        icon: {
          fontSize: 10,
          font: 'NotoSansTC',
          color: '#333333'
        },
        footer: {
          fontSize: 10,
          color: '#666666',
          font: 'NotoSansTC'
        }
      }
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        resolve({
          download: async (filename) => {
            return new Promise((downloadResolve, downloadReject) => {
              try {
                pdfDoc.download(filename);
                downloadResolve();
              } catch (error) {
                console.error('Error downloading PDF:', error);
                downloadReject(error);
              }
            });
          }
        });
      } catch (error) {
        console.error('Error creating PDF:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in generateActivityPDF:', error);
    throw error;
  }
};