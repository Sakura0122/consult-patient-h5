<script setup lang="ts">
import type { Message, Prescription } from '@/types/room'
import { MsgType, PrescriptionStatus } from '@/enums'
import { getIllnessTimeText, getConsultFlagText } from '@/utils/filter'
import type { Image } from '@/types/consult'
import { showImagePreview, showToast } from 'vant'
import { useUserStore } from '@/stores'
import dayjs from 'dayjs'
import { useShowPrescription } from '@/hooks'
import { useRouter } from 'vue-router'
import EvaluateCard from '@/views/Room/components/EvaluateCard.vue'

defineProps<{ list: Message[] }>()

// 预览图片
const previewImg = (pictures?: Image[]) => {
  if (pictures && pictures.length) {
    showImagePreview(pictures.map((item) => item.url))
  }
}

const userStore = useUserStore()
const formatTime = (time: string) => dayjs(time).format('HH:mm')

// 图片加载成功
const loadSuccess = (notScroll?: boolean) => {
  // 判断是聊天记录的图片，那就不去滚动
  if (notScroll === true) return
  window.scrollTo(0, document.body.scrollHeight)
}

// 查看处方
const { showPrescription } = useShowPrescription()

// 点击处方的跳转
const router = useRouter()
const buy = (pre?: Prescription) => {
  if (pre) {
    if (pre.status === PrescriptionStatus.Invalid) return showToast('处方已失效')
    if (pre.status === PrescriptionStatus.NotPayment && !pre.orderId)
      return router.push(`/order/pay?id=${pre.id}`)
    router.push(`/order/${pre.orderId}`)
  }
}

// 评价
// 1. 把 未评价  和 已评价的  卡片封装在一个组件
// 2. 渲染组件的时候，把消息中的评价信息，传入组件
// 3. 根据是否有  评价内容，展示对应的卡片
// 3.1. 有数据，展示
// 3.2. 无数据，绑定表单数据，收集表单数据，提交评价
// 3.3. 评价成功，修改评价消息状态和数据，切换卡片展示
</script>

<template>
  <!-- 患者卡片 -->
  <template v-for="{ msgType, id, msg, from, createTime, fromAvatar, notScroll } in list" :key="id">
    <!-- 病情描述 -->
    <div class="msg msg-illness" v-if="msgType === MsgType.CardPat">
      <div class="patient van-hairline--bottom" v-if="msg.consultRecord">
        <p>
          {{ msg.consultRecord.patientInfo.name }}
          {{ msg.consultRecord.patientInfo.genderValue }}
          {{ msg.consultRecord.patientInfo.age }}岁
        </p>
        <p>
          {{ getIllnessTimeText(msg.consultRecord?.illnessTime) }} |
          {{ getConsultFlagText(msg.consultRecord?.consultFlag) }}
        </p>
      </div>
      <van-row>
        <van-col span="6">病情描述</van-col>
        <van-col span="18">{{ msg.consultRecord?.illnessDesc }}</van-col>
        <van-col span="6">图片</van-col>
        <van-col span="18" @click="previewImg(msg.consultRecord?.pictures)"> 点击查看 </van-col>
      </van-row>
    </div>
    <!-- 温馨提示 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.NotifyTip">
      <div class="content">
        <span class="green">温馨提示：</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <!-- 通用通知 -->
    <div class="msg msg-tip" v-if="msgType === 31">
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <!-- 发消息-文字 -->
    <div class="msg msg-to" v-if="msgType === MsgType.MsgText && from === userStore.user?.id">
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
      <van-image :src="userStore.user?.avatar" />
    </div>
    <!-- 发消息-图片 -->
    <div class="msg msg-to" v-if="msgType === MsgType.MsgImage && from === userStore.user?.id">
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <van-image @load="loadSuccess(notScroll)" fit="contain" :src="msg.picture?.url" />
      </div>
      <van-image :src="userStore.user?.avatar" />
    </div>
    <!-- 收消息-文字 -->
    <div class="msg msg-from" v-if="msgType === MsgType.MsgText && from !== userStore.user?.id">
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
    </div>
    <!-- 收消息-图片 -->
    <div class="msg msg-from" v-if="msgType === MsgType.MsgImage && from !== userStore.user?.id">
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <van-image @load="loadSuccess(notScroll)" fit="contain" :src="msg.picture?.url" />
      </div>
    </div>
    <!-- 处方消息 -->
    <div class="msg msg-recipe" v-if="msgType === MsgType.CardPre">
      <div class="content">
        <div class="head van-hairline--bottom">
          <div class="head-tit">
            <h3>电子处方</h3>
            <p @click="showPrescription(msg.prescription?.id)">
              原始处方 <van-icon name="arrow"></van-icon>
            </p>
          </div>
          <p>
            {{ msg.prescription?.name }}
            {{ msg.prescription?.genderValue }}
            {{ msg.prescription?.age }}岁
            {{ msg.prescription?.diagnosis }}
          </p>
          <p>开方时间：{{ msg.prescription?.createTime }}</p>
        </div>
        <div class="body">
          <div class="body-item" v-for="med in msg.prescription?.medicines" :key="med.id">
            <div class="durg">
              <p>{{ med.name }} {{ med.specs }}</p>
              <p>{{ med.usageDosag }}</p>
            </div>
            <div class="num">x{{ med.quantity }}</div>
          </div>
        </div>
        <div class="foot"><span @click="buy(msg.prescription)">购买药品</span></div>
      </div>
    </div>
    <!-- 订单取消 -->
    <div class="msg msg-tip msg-tip-cancel" v-if="msgType === MsgType.NotifyCancel">
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <div class="msg" v-if="msgType === MsgType.CardEva || msgType === MsgType.CardEvaForm">
      <evaluate-card :evaluateDoc="msg.evaluateDoc" />
    </div>
  </template>
</template>

<style lang="scss" scoped>
@import '@/styles/room.scss';
</style>
