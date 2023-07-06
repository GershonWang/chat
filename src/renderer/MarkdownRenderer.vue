<!-- markdown的样式功能组件 -->
<template>
  <div v-html="renderedMarkdown"></div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import { shell } from 'electron';
import MarkdownIt from 'markdown-it';
import Clipboard from 'clipboard'
import 'highlight.js/styles/atom-one-dark.css';
import hljs from 'highlight.js';

export default defineComponent({
  props: {
    markdown: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      renderedMarkdown: '',
      clipboard: null
    };
  },
  mounted() {
    this.renderMarkdown();
    this.creatCopyBtn();
    this.copy();
  },
  watch: {
    markdown() {
      this.renderMarkdown();
    },
    openDefaultBrower() {
      document.addEventListener('click', (event: MouseEvent) => {
        if (event.target != null) {
          const target = event.target as HTMLAnchorElement;
          if (target.tagName === 'A' && target.href.startsWith('http')) {
            event.preventDefault()
            shell.openExternal(target.href)
          }
        }
      })
    }
  },
  methods: {
    renderMarkdown() {
      const md = new MarkdownIt({
        html: true,  // 在源码中启用 HTML 标签
        linkify: true,  // 将类似 URL 的文本自动转换为链接。
        typographer: true,
        breaks: true,  // 转换段落里的 '\n' 到 <br>。
      });
      console.log('this.markdown', this.markdown);
      this.renderedMarkdown = md.render(this.markdown);
      this.$nextTick(() => {
        // 拿取所有的a标签元素，增加跳转默认浏览器，不使用内置浏览器打开  target="_blank"
        document.querySelectorAll('a').forEach((el) => {
          if (el.hasAttribute("href")) {
            el.setAttribute('target', '_blank');
          }
        });
        // 拿取所有的code代码元素，进行赋值高亮模式
        document.querySelectorAll("code").forEach(function (ele) {
          let classArr = ele.className.split(' ');
          console.log('classArr', classArr);
          let languageArr = classArr[0].split('-');
          console.log('languageArr', languageArr);
          if (languageArr.length !== 2) {
            hljs.highlightElement(ele);
            return true;
          }
          let language = languageArr[1].trim();
          console.log('language', language);
          if (hljs.getLanguage(language)) {
            hljs.highlightElement(ele);
            return true;
          }
          hljs.highlightElement(ele);
        });
      })
    },
    creatCopyBtn() {
      const codeDoms = document.querySelectorAll('pre')
      let i = document.createElement("i")
      i.setAttribute('class', 'el-icon-copy-document hljs-copy')
      i.setAttribute('data-clipboard-action', 'copy')
      Array.from(codeDoms).forEach((item, index) => {
        let dom = i.cloneNode(false)
        let i_text = document.createTextNode("复制");
        (dom as unknown as HTMLElement).appendChild(i_text);
        (dom as unknown as HTMLElement).setAttribute('data-clipboard-target', '#copy' + index);
        item.appendChild(dom);
        let child = item.children[0];
        child.setAttribute('id', "copy" + index);

        // 行号
        let num = item.innerText.split('\n').length - 1
        let ul = document.createElement("ul");
        ul.setAttribute('class', 'hljs-code-number')
        for (let i = 0; i < num; i++) {
          let n = i+1
          let childLi = document.createElement("li")
          let li_text = document.createTextNode(<string><unknown>n);
          childLi.appendChild(li_text)
          ul.appendChild(childLi)
        }
        item.appendChild(ul)
      })
    },
    copy() {
      this.$nextTick(() => {
        (this.clipboard as unknown as Clipboard) = new Clipboard('.hljs-copy');
        (this.clipboard as unknown as Clipboard).on('success', e => {
          this.$message.success('复制成功')
          e.clearSelection();  // 清除文本的选中状态
        });
        (this.clipboard as unknown as Clipboard).on('error', e => {
          this.$message.error('复制失败')
          e.clearSelection();  // 清除文本的选中状态
        });
      })
    }
  },
  destroyed() {
    (this.clipboard as unknown as Clipboard)!.destroy()
  }
});
</script>
<style scoped>
/* 语法高亮 */
.hljs-container {
  position: relative;
  display: block;
  display: flex;
  width: max-content;
  margin-left: 100px;
  padding: 30px 10px 2px 0;
  overflow-x: hidden;
  font-size: 14px;
  line-height: 24px;
  text-align: left;
  background: #21252b;
  box-shadow: 0 10px 30px 0 rgb(0 0 0 / 40%);
}

/** 3个点 */
.hljs-container::before {
  position: absolute;
  top: 10px;
  left: 15px;
  width: 12px;
  height: 12px;
  overflow: visible;
  font-weight: 700;
  font-size: 16px;
  line-height: 12px;
  white-space: nowrap;
  text-indent: 75px;
  background-color: #fc625d;
  border-radius: 16px;
  box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
  content: attr(codetype);
}

/** 滚动条 */
:deep(.hljs) {
  overflow-x: auto;
}

:deep(.hljs::-webkit-scrollbar) {
  width: 12px !important;
  height: 12px !important;
}

:deep(.hljs::-webkit-scrollbar-thumb) {
  height: 30px !important;
  background: #d1d8e6;
  background-clip: content-box;
  border: 2px solid transparent;
  border-radius: 19px;
  opacity: 0.8;
}

:deep(.hljs::-webkit-scrollbar-thumb:hover) {
  background: #a5b3cf;
  background-clip: content-box;
  border: 2px solid transparent;
}

:deep(.hljs::-webkit-scrollbar-track-piece) {
  width: 30px;
  height: 30px;
  background: #333;
}

::-webkit-scrollbar-button {
  display: none;
}

/** 行数样式 */
.hljs-code-number {
  padding: 17px 10px 0;
  color: #d1d8e6;
  font-size: 12px;
  list-style: none;
  border-right: 1px solid #d1d8e6;
}

/** 复制样式 */
.hljs-copy {
  position: absolute;
  top: 50px;
  right: 30px;
  display: none;
  padding: 0 10px;
  color: #66a9ff;
  font-size: 10px;
  background-color: #ecf5ff;
  border-radius: 3px;
  cursor: pointer;
}
</style>
  