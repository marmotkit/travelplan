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

  // 處理 OPTIONS 請求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // 構建目標 URL
    const url = new URL(request.url)
    const targetUrl = new URL('https://travel-planner-api.onrender.com' + url.pathname + url.search)
    
    console.log('Proxying request to:', targetUrl.toString())

    // 創建新的請求
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow',
    })

    // 發送請求到目標服務器
    const response = await fetch(proxyRequest)
    
    // 檢查響應狀態
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText)
      return new Response(
        JSON.stringify({
          error: 'API Error',
          status: response.status,
          message: response.statusText
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

    // 讀取響應內容
    const contentType = response.headers.get('Content-Type') || ''
    const responseText = await response.text()

    // 如果是 JSON 響應
    if (contentType.includes('application/json')) {
      try {
        // 嘗試解析 JSON
        JSON.parse(responseText)
        // 如果成功解析，直接返回原始響應
        return new Response(responseText, {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        })
      } catch (e) {
        console.error('Failed to parse JSON response:', e)
        return new Response(
          JSON.stringify({
            error: 'Invalid JSON',
            message: 'Failed to parse API response as JSON',
            data: responseText.substring(0, 100) + '...' // 只返回前 100 個字符
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

    // 如果不是 JSON 響應，返回錯誤
    console.error('Unexpected content type:', contentType)
    return new Response(
      JSON.stringify({
        error: 'Invalid Content Type',
        message: `Expected application/json but got ${contentType}`,
        data: responseText.substring(0, 100) + '...' // 只返回前 100 個字符
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Worker error:', error)
    return new Response(
      JSON.stringify({
        error: 'Worker Error',
        message: error.message
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
