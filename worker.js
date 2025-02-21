addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 允許的來源
  const ALLOWED_ORIGIN = 'https://travel-planner-web.onrender.com'
  
  // 檢查請求來源
  const origin = request.headers.get('Origin')
  
  // 如果是預檢請求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
        'Access-Control-Expose-Headers': 'Content-Type, X-Request-ID',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Cloudflare-CDN-Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  }

  try {
    // 發送請求到原始服務器
    const response = await fetch(request)
    
    // 創建新的響應頭部
    const headers = new Headers(response.headers)
    
    // 設置 CORS 頭部
    if (origin === ALLOWED_ORIGIN) {
      headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID')
      headers.set('Access-Control-Expose-Headers', 'Content-Type, X-Request-ID')
      headers.set('Access-Control-Allow-Credentials', 'true')
      headers.set('Access-Control-Max-Age', '86400')
    }
    
    // 設置內容類型和快取控制
    headers.set('Content-Type', 'application/json; charset=utf-8')
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    headers.set('CDN-Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    headers.set('Cloudflare-CDN-Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')
    headers.set('X-Content-Type-Options', 'nosniff')
    
    // 創建新的響應
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    })
  } catch (err) {
    // 錯誤處理
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: err.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Credentials': 'true'
      }
    })
  }
}
