<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  title?: string
  rightText?: string
}>()

const emits = defineEmits<{
  (e: 'click-right'): void
}>()

// 实现返回
const router = useRouter()
const onClickLeft = () => {
  // 如果有当前网站的上一个历史记录 可以执行back()返回
  // 没有记录跳转首页
  if (history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}
// 点击右侧文字按钮 执行的逻辑
const onClickRight = () => {
  emits('click-right')
}
</script>

<template>
  <van-nav-bar
    fixed
    left-arrow
    @click-left="onClickLeft"
    :title="title"
    :right-text="rightText"
    @click-right="onClickRight"
  />
</template>

<style lang="scss" scoped>
::v-deep() {
  .van-nav-bar {
    &__arrow {
      font-size: 18px;
      color: var(--cp-text1);
    }
    &__text {
      font-size: 15px;
    }
  }
}
</style>
