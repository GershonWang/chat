import { createApp } from 'vue'
import "./style.css"
import App from './App.vue'
import './samples/node-api'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)

// 注册挂载路由
app.use(router)
// 注册pinia
app.use(createPinia())

app
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
