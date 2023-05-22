import {createRouter,createWebHashHistory} from 'vue-router'

import Demo from '../components/demo/index.vue'

const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes: [
        { 
            path: '/', 
            component: Demo 
        },
        { 
            path: '/hello', 
            component: () => import("../components/HelloWorld.vue") 
        },
    ], // `routes: routes` 的缩写
})

export default router