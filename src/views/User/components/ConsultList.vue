<script setup lang="ts">
import ConsultItem from './ConsultItem.vue'
import { ref } from 'vue'
import { ConsultType } from '@/enums'
import type { ConsultOrderItem, ConsultOrderParams } from '@/types/consult'
import { getConsultOrderList } from '@/services/consult'

// 1. 准备好查询参数
// 2. 实现加载更多效果
// 3. 触发加载更多操作的时候，发请求获取数据
// 4. 拿到数据后：追加列表，结束加载状态
// 4.1 有数据，页码加1
// 4.2 无数据，置为完成
// 5. 渲染
const props = defineProps<{ type: ConsultType }>()
const params = ref<ConsultOrderParams>({
  type: props.type,
  current: 1,
  pageSize: 5
})
const loading = ref(false)
const finished = ref(false)
const list = ref<ConsultOrderItem[]>([])
const onLoad = async () => {
  const res = await getConsultOrderList(params.value)
  list.value.push(...res.data.rows)
  if (params.value.current < res.data.pageTotal) {
    params.value.current++
  } else {
    finished.value = true
  }
  loading.value = false
}

// 删除一条订单
const onDelete = (id: string) => {
  // const index = list.value.find((item) => item.id === id)
  // list.value.splice(index, 1)
  list.value = list.value.filter((item) => item.id !== id)
}
</script>

<template>
  <div class="consult-list">
    <div class="consult-list">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <consult-item
          @on-delete="onDelete"
          v-for="item in list"
          :key="item.id"
          :item="item"
        ></consult-item>
      </van-list>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.consult-list {
  padding: 10px 15px;
}
</style>
