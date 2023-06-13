import {createRouter,createWebHashHistory} from 'vue-router'

import Index from '../components/index.vue'
import Chat from '../components/chat/index.vue'

const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes: [
        { 
            path: '/', 
            component: Index 
        },
        { 
            path: '/chat', 
            component: Chat
        },
        {
            path: '/demo',
            component: () => import("../components/demo/index.vue")
        },
        { 
            path: '/helloWorld', 
            component: () => import("../components/demo/HelloWorld.vue") 
        },
        { 
            path: '/test_mark', 
            component: () => import("../components/demo/test_mark.vue") 
        },
        { 
            path: '/update', 
            component: () => import("../components/update/update.vue") 
        },
    ], // `routes: routes` 的缩写
})

export default router