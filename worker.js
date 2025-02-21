addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // API 基礎 URL
  const apiUrl = 'https://travel-planner-api.onrender.com'
  
  // 創建新的請求 URL
  const url = new URL(request.url)
  const targetUrl = new URL(url.pathname, apiUrl)
  
  // 複製原始請求
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow'
  })

  try {
    // 發送請求到目標 API
    const response = await fetch(modifiedRequest)
    
    // 創建新的響應頭
    const headers = new Headers(response.headers)
    headers.set('Access-Control-Allow-Origin', 'https://travel-planner-web.onrender.com')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID')
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Access-Control-Max-Age', '86400')
    headers.set('Content-Type', 'application/json')
    
    // 處理預檢請求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: headers
      })
    }

    // 讀取並解析響應數據
    let responseData
    try {
      responseData = await response.json()
    } catch (e) {
      // 如果無法解析為 JSON，返回原始文本
      responseData = { data: await response.text() }
    }

    // 確保響應數據是一個對象
    if (responseData === null || responseData === undefined) {
      responseData = { data: null }
    } else if (typeof responseData !== 'object') {
      responseData = { data: responseData }
    }
    
    // 返回修改後的響應
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    })
  } catch (error) {
    // 錯誤處理
    return new Response(JSON.stringify({
      error: 'Proxy Error',
      message: error.message,
      data: null
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://travel-planner-web.onrender.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
        'Access-Control-Allow-Credentials': 'true'
      }
    })
  }
}
