import { defineStore } from 'pinia'

// 第一个参数是应用程序中 store 的唯一 id
export const useCounterStore = defineStore('counterStore', {
  state: () => {
    return {
      // 所有这些属性都将自动推断其类型
      counter: 0,
      token: '',
    }
  },
  actions: {
    // 自增
    increment(){
      this.counter ++ 
    },
    async add100():Promise<number>{
      const result = <number>await new Promise((resove) => {
        setTimeout(() => {
          resove(100)
        }, 2000);
      })

      this.counter += result
      return this.counter
    }
  },
  getters: {
    doubleCount: (state) => state.counter * 2
  }
})