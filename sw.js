// self: 表示Service Worker作用域,也是全局变量
// caches: 表示缓存
// skipWaiting: 表示强制当前处在waiting状态的脚本进入activate状态
// clients: 表示Service Worker接管的页面

var cacheStorageKey = 'pwa-test1'

var cacheList = [
  '/',
  "index.html",
  "app.css",
  "favicon.ico"
]

// 借助Service Worker,可以在注册完成安装Service Worker时, 抓取资源写入缓存:
// 调用self.skipWaiting()方法是为了在页面更新的过程当中,新的Service Worker脚本能立即激活和生效。
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheStorageKey)
    .then(cache => cache.addAll(cacheList))
    .then(() => self.skipWaiting())
  )
})

// 处理动态缓存：网页抓取资源的过程中,
// 在Service Worker可以捕获到fetch事件,可以编写代码决定如何响应资源的请求
// 真实的项目当中,可以根据资源的类型,站点的特点,可以专门设计复杂的策略。
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response != null) {
        return response
      }
      return fetch(e.request.url)
    })
  )
})

// 更新静态资源：缓存的资源随着版本的更新会过期,
// 所以会根据缓存的字符串名称(这里变量为cacheStorageKey, 值用了 "pwa-test1")清除旧缓存,
// 可以遍历所有的缓存名称逐一判断决决定是否清除
// 在新安装的Service Worker中通过调用self.clients.claim()取得页面的控制权,
// 这样之后打开页面都会使用版本更新的缓存。旧的Service Worker脚本不再控制着页面之后会被停止。
self.addEventListener('activate', function(e) {
  e.waitUntil(
    e.waitUntil(
    // Promise.all(
    //   caches.keys().then(cacheNames => {
    //     return cacheNames.map(name => {
    //       if (name !== cacheStorageKey) {
    //         return caches.delete(name)
    //       }
    //     })
    //   })
    // ).then(() => {
    //   return self.clients.claim()
    // })
    Promise.all(
      cacheNames.filter(name => {
        return name !== cacheStorageKey
      }).map(name => {
        return caches.delete(name)
      })
    ).then(() => self.clients.claim())
  )
})
