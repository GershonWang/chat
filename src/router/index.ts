import {createRouter,createWebHashHistory} from 'vue-router'

const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes: [
        { 
            path: '/', 
            component: () => import("../components/index.vue")
        },
        { 
            path: '/chat', 
            component: () => import("../components/chat/index.vue")
        },
        {
            path: '/demo',
            component: () => import("../components/demo/index.vue")
        },
        { 
            path: '/helloWorld', 
            component: () => import("../components/demo/helloWorld.vue")
        },
        { 
            path: '/test_mark', 
            component: () => import("../components/demo/test_mark.vue") 
        },
    ], // `routes: routes` 的缩写
})

export default router