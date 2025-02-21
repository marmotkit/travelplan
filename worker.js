addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // API 基礎 URL
  const apiUrl = 'https://travel-planner-api.onrender.com'
  
  // 創建新的請求 URL
  const url = new URL(request.url)
  const targetUrl = new URL(url.pathname + url.search, apiUrl)
  
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
    const headers = new Headers({
      'Access-Control-Allow-Origin': 'https://travel-planner-web.onrender.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    })
    
    // 處理預檢請求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: headers
      })
    }

    // 克隆響應以便多次讀取
    const clonedResponse = response.clone()

    try {
      // 嘗試解析為 JSON
      const data = await clonedResponse.json()
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: headers
      })
    } catch (e) {
      // 如果不是 JSON，返回文本
      const text = await response.text()
      return new Response(JSON.stringify({ data: text }), {
        status: response.status,
        headers: headers
      })
    }
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
