addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // API 基礎 URL
  const apiUrl = 'https://travel-planner-api.onrender.com'
  
  // 創建新的請求 URL
  const url = new URL(request.url)
  
  // 檢查是否是 API 請求
  if (!url.pathname.startsWith('/api/')) {
    return new Response('Not Found', { status: 404 })
  }
  
  // 移除 /api 前綴並創建目標 URL
  const apiPath = url.pathname.replace('/api', '')
  const targetUrl = new URL(apiPath + url.search, apiUrl)
  
  // 創建新的請求頭
  const headers = new Headers(request.headers)
  headers.set('Origin', 'https://travel-planner-web.onrender.com')
  headers.set('Host', new URL(apiUrl).host)
  
  // 複製原始請求
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: 'follow'
  })

  try {
    // 處理預檢請求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': 'https://travel-planner-web.onrender.com',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400'
        }
      })
    }

    // 發送請求到目標 API
    const response = await fetch(modifiedRequest)
    
    // 創建新的響應頭
    const responseHeaders = new Headers({
      'Access-Control-Allow-Origin': 'https://travel-planner-web.onrender.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json'
    })

    // 如果響應不成功，返回錯誤
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: 'API Error',
        message: `API returned status ${response.status}`,
        data: null
      }), {
        status: response.status,
        headers: responseHeaders
      })
    }

    // 讀取響應數據
    const text = await response.text()
    
    try {
      // 嘗試解析為 JSON
      const data = JSON.parse(text)
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: responseHeaders
      })
    } catch (e) {
      // 返回解析錯誤
      return new Response(JSON.stringify({
        error: 'Invalid JSON',
        message: 'Failed to parse API response as JSON',
        data: text
      }), {
        status: 500,
        headers: responseHeaders
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
