addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 設置 CORS 頭
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://travel-planner-web.onrender.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }

  try {
    // 構建目標 URL
    const url = new URL(request.url)
    const targetUrl = new URL('https://travel-planner-api.onrender.com' + url.pathname + url.search)
    
    console.log('Request URL:', request.url)
    console.log('Target URL:', targetUrl.toString())
    console.log('Request method:', request.method)
    console.log('Request headers:', Object.fromEntries(request.headers))

    // 處理 OPTIONS 請求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      })
    }

    // 創建新的請求
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow',
    })

    // 發送請求到目標服務器
    const response = await fetch(proxyRequest)
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers))
    
    // 讀取響應內容
    const responseText = await response.text()
    console.log('Response text:', responseText.substring(0, 200))

    // 檢查響應狀態
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: 'API Error',
          status: response.status,
          message: response.statusText,
          details: responseText.substring(0, 200)
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // 嘗試解析為 JSON
    try {
      JSON.parse(responseText)
      return new Response(responseText, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      })
    } catch (e) {
      console.error('JSON parse error:', e)
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON',
          message: 'Failed to parse API response as JSON',
          data: responseText.substring(0, 200)
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }
  } catch (error) {
    console.error('Worker error:', error)
    return new Response(
      JSON.stringify({
        error: 'Worker Error',
        message: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
