<!-- markdown的样式功能组件 -->
<template>
  <div v-html="renderedMarkdown"></div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import MarkdownIt from 'markdown-it';
import Clipboard from 'clipboard'
import { ElMessage } from 'element-plus'
import 'highlight.js/styles/atom-one-dark.css';
import hljs from 'highlight.js';

export default defineComponent({
  props: {
    markdown: {
      type: String,
      required: true,
    },
    num: {
      type: Number,
      required: true,
    }
  },
  data() {
    return {
      renderedMarkdown: '',
      clipboard: null
    };
  },
  mounted() {
    this.renderMarkdown();
  },
  watch: {
    markdown() {
      this.renderMarkdown();
    }
  },
  methods: {
    renderMarkdown() {
      const md = new MarkdownIt({
        html: true,  // 在源码中启用 HTML 标签
        linkify: true,  // 将类似 URL 的文本自动转换为链接。
        typographer: true,
        breaks: true,  // 转换段落里的 '\n' 到 <br>。
        highlight: (str, lang) => {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(lang, str, true).value;
            } catch (__) {}
          }
          return md.utils.escapeHtml(str);
        }
      });
      // markdown核心文本转换方法
      this.renderedMarkdown = md.render(this.markdown);
      // 后续处理
      this.$nextTick(() => {
        // 拿取所有的a标签元素，增加跳转默认浏览器，不使用内置浏览器打开  target="_blank"
        document.querySelectorAll('a').forEach((el) => {
          if (el.hasAttribute("href")) {
            el.setAttribute('target', '_blank');
          }
        });
        // 给所有的pre标签添加hljs的class样式
        document.querySelectorAll('pre').forEach(((ele) => {
          ele.setAttribute('class','hljs');
          ele.setAttribute('style','position: relative;');
        }));
        // 拿取所有的code代码元素，追加hljs的class样式
        document.querySelectorAll("code").forEach((ele) => {
          ele.classList.add('hljs');
        });
        // 生成代码块的一键复制按钮和代码类型
        if (this.markdown.endsWith('（BPE）')) {
          const elem = (document.querySelectorAll(".containMain")[0].children)[this.num - 1];
          const codeDomes = elem.querySelectorAll('pre');
          Array.from(codeDomes).forEach((item, index) => {
            if (item.children && item.children.length > 0) {
              // 一键复制标签元素
              let i = document.createElement("i")
              i.setAttribute('class', 'el-icon-copy-document hljs-copy' + this.num + index)
              i.setAttribute('data-clipboard-action', 'copy')
              let dom = i.cloneNode(false)
              let i_text = document.createTextNode("一键复制");
              (dom as unknown as HTMLElement).appendChild(i_text);
              (dom as unknown as HTMLElement).setAttribute('data-clipboard-target', '#copy' + this.num + index);
              item.appendChild(dom);
              let child = item.children[0];
              child.setAttribute('id', "copy" + this.num + index);
              // 添加复制响应事件
              (this.clipboard as unknown as Clipboard) = new Clipboard('.hljs-copy' + this.num + index);
              (this.clipboard as unknown as Clipboard).on('success', e => {
                ElMessage.success("复制成功");
                e.clearSelection();  // 清除文本的选中状态
              });
              (this.clipboard as unknown as Clipboard).on('error', e => {
                ElMessage.success("复制失败");
                e.clearSelection();  // 清除文本的选中状态
              });
              // 代码类型标签元素
              const className = item.children[0].className;
              const classArr = className.split(' ');
              Array.from(classArr).forEach((name:String) => {
                if (name.includes('language-') && name.split('-').length > 1) {
                  const langName = name.split('-')[1];
                  let langI = document.createElement("a")
                  let langDom = langI.cloneNode(false)
                  let lang = document.createTextNode(langName);
                  (langDom as unknown as HTMLElement).appendChild(lang);
                  (langDom as unknown as HTMLElement).setAttribute('class', 'lang-cols');
                  item.appendChild(langDom);
                }
              })
            }
          })
        }
      })
    }
  },
  destroyed() {
    (this.clipboard as unknown as Clipboard)!.destroy()
  }
});
</script>
<style>
/** 复制标签的样式 */
.el-icon-copy-document {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0 10px;
  color: blueviolet;
  font-size: 10px;
  font-weight: bold;
  opacity: 0.7;
  background-color: #ecf5ff;
  border-radius: 3px;
  cursor: pointer;
}
/** 代码类型的样式 */
.lang-cols {
  position: absolute;
  top: 8px;
  right: 80px;
  color: blueviolet;
  user-select: none;
  cursor: default;
}
</style>
  