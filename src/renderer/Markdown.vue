<template>
  <div v-html="markdown"></div>
</template>
  
<script lang="ts">
import marked from 'marked';

export default {
  props: {
    content: {
      type: String,
      required: true
    }
  },
  computed: {
    markdown() {
      return marked(this.content);
    }
  }
}
</script>