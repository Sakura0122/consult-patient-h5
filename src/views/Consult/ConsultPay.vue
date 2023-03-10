<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ConsultOrderPreData, PartialConsult } from '@/types/consult'
import { getConsultOrderPre, getPatientDetail, createConsultOrder } from '@/services/consult'
import { useConsultStore } from '@/stores/consult'
import type { Patient } from '@/types/user'
import { showConfirmDialog, showDialog, showToast } from 'vant'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

// 获取订单相关信息
const consultStore = useConsultStore()
const payInfo = ref<ConsultOrderPreData>()
const loadPayInfo = async () => {
  const res = await getConsultOrderPre({
    type: consultStore.consult.type,
    illnessType: consultStore.consult.illnessType
  })
  payInfo.value = res.data
  // 存储优惠券信息
  consultStore.setCoupon(res.data.couponId)
}

// 获取患者信息
const patient = ref<Patient>()
const loadPatient = async () => {
  if (consultStore.consult.patientId) {
    const res = await getPatientDetail(consultStore.consult.patientId)
    patient.value = res.data
  }
}
onMounted(() => {
  loadPayInfo()
  loadPatient()
})

const agree = ref(false)
const loading = ref(false)
// 生成订单 展示支付方式抽屉
const show = ref(false)
// const paymentMethod = ref<0 | 1>()
const orderId = ref<string>()
const openSheet = async () => {
  if (!agree.value) return showToast('请勾选用户支付协议')
  loading.value = true
  // 生成订单
  const res = await createConsultOrder(consultStore.consult)
  orderId.value = res.data.id
  loading.value = false
  consultStore.clear()
  // 展示抽屉
  show.value = true
}

// 进行支付
// 1. 隐藏抽屉的关闭按钮
// 2. 再关闭抽屉的时候，确认框提示，仍要关闭 问诊记录  继续支付 关闭确认框。
// 3. 如果已经生成订单了回退的时候拦截
// 4. 生成支付地址然后跳转：掉后台的接口
// 5. 刷新页面的时候，判断是否问诊记录是否存在，不存在就alert提示，确认之后回到首页。
const router = useRouter()
const onClose = () => {
  return showConfirmDialog({
    title: '关闭支付',
    message: '取消支付将无法获得医生回复，医生接诊名额有限，是否确认关闭？',
    cancelButtonText: '仍要关闭',
    confirmButtonText: '继续支付'
  })
    .then(() => {
      // 不想关闭抽屉
      return false
    })
    .catch(() => {
      // 防止有orderId后，onBeforeRouteLeave 会拦截跳转
      orderId.value = ''
      router.push('/user/consult')
      return true
    })
}
onBeforeRouteLeave(() => {
  if (orderId.value) return false
})

// 支付
// const pay = async () => {
//   if (paymentMethod.value === undefined) return showToast('请选择支付方式')
//   showLoadingToast('跳转支付')
//   if (orderId.value) {
//     const res = await getConsultOrderPayUrl({
//       paymentMethod: paymentMethod.value,
//       orderId: orderId.value,
//       payCallback: 'http://localhost:5173/room'
//     })
//     location.href = res.data.payUrl
//   }
// }

type Key = keyof PartialConsult

onMounted(() => {
  const validKeys: Key[] = [
    'type',
    'illnessType',
    'depId',
    'illnessDesc',
    'illnessTime',
    'consultFlag',
    'patientId'
  ]
  const valid = validKeys.every((key) => consultStore.consult[key] !== undefined)
  if (!valid) {
    return showDialog({
      title: '温馨提示',
      message: '问诊信息不完整请重新填写，如有未支付的问诊订单可在问诊记录中继续支付！',
      closeOnPopstate: false
    }).then(() => {
      router.push('/')
    })
  }

  loadPayInfo()
  loadPatient()
})
</script>

<template>
  <div class="consult-pay-page" v-if="payInfo && patient">
    <cp-nav-bar title="支付" />
    <div class="pay-info">
      <p class="tit">图文问诊 {{ payInfo.payment }} 元</p>
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p class="desc">
        <span>极速问诊</span>
        <span>自动分配医生</span>
      </p>
    </div>
    <van-cell-group>
      <van-cell title="优惠券" :value="`-¥${payInfo.couponDeduction}`" />
      <van-cell title="积分抵扣" :value="`-¥${payInfo.pointDeduction}`" />
      <van-cell title="实付款" :value="`¥${payInfo.actualPayment}`" class="pay-price" />
    </van-cell-group>
    <div class="pay-space"></div>
    <van-cell-group>
      <van-cell
        title="患者信息"
        :value="`${patient.name} | ${patient.genderValue} | ${patient.age}岁`"
      ></van-cell>
      <van-cell title="病情描述" :label="consultStore.consult.illnessDesc"></van-cell>
    </van-cell-group>
    <div class="pay-schema">
      <van-checkbox v-model="agree">我已同意 <span class="text">支付协议</span></van-checkbox>
    </div>
    <van-submit-bar
      button-type="primary"
      :price="payInfo.actualPayment * 100"
      button-text="立即支付"
      text-align="left"
      @click="openSheet"
      :loading="loading"
    />
    <!-- 抽屉组件 -->
    <cp-pay-sheet
      :actualPayment="payInfo.actualPayment"
      :orderId="orderId"
      :onClose="onClose"
      v-model:show="show"
      pay-callback="/room"
    ></cp-pay-sheet>
  </div>
  <div class="consult-pay-page" v-else>
    <van-skeleton title :row="4" />
    <van-skeleton title :row="5" />
    <van-skeleton title :row="3" />
  </div>
</template>

<style lang="scss" scoped>
.consult-pay-page {
  padding: 46px 0 50px 0;
}
.pay-info {
  display: flex;
  padding: 15px;
  flex-wrap: wrap;
  align-items: center;
  .tit {
    width: 100%;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .img {
    margin-right: 10px;
    width: 38px;
    height: 38px;
    border-radius: 4px;
    overflow: hidden;
  }
  .desc {
    flex: 1;
    > span {
      display: block;
      color: var(--cp-tag);
      &:first-child {
        font-size: 16px;
        color: var(--cp-text2);
      }
    }
  }
}
.pay-price {
  ::v-deep() {
    .vam-cell__title {
      font-size: 16px;
    }
    .van-cell__value {
      font-size: 16px;
      color: var(--cp-price);
    }
  }
}
.pay-space {
  height: 12px;
  background-color: var(--cp-bg);
}
.pay-schema {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  .text {
    color: var(--cp-primary);
  }
}
::v-deep() {
  .van-submit-bar__button {
    font-weight: normal;
    width: 160px;
  }
}
.pay-type {
  .amount {
    padding: 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
  .btn {
    padding: 15px;
  }
  .van-cell {
    align-items: center;
    .cp-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .van-checkbox :deep(.van-checkbox__icon) {
      font-size: 16px;
    }
  }
}
</style>
