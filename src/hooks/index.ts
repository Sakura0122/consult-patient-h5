import type { ConsultOrderItem, FollowType } from '@/types/consult'
import { ref } from 'vue'
import { cancelOrder, deleteOrder, followOrUnfollow, getPrescriptionPic } from '@/services/consult'
import { showFailToast, showImagePreview, showSuccessToast } from 'vant'
import { OrderType } from '@/enums'

// 关注功能
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  const follow = async (item: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true
    try {
      await followOrUnfollow(item.id, type)
      item.likeFlag = item.likeFlag === 1 ? 0 : 1
    } finally {
      loading.value = false
    }
  }
  return { loading, follow }
}

// 查看处方
export const useShowPrescription = () => {
  const showPrescription = async (id?: string) => {
    if (id) {
      const res = await getPrescriptionPic(id)
      showImagePreview([res.data.url])
    }
  }
  return { showPrescription }
}

// 取消订单逻辑
export const useCancelOrder = () => {
  const loading = ref(false)
  const onCancelOrder = async (item: ConsultOrderItem) => {
    loading.value = true
    try {
      await cancelOrder(item.id)
      // 修改订单状态
      item.status = OrderType.ConsultCancel
      item.statusValue = '已取消'
      showSuccessToast('取消成功')
    } catch (e) {
      showFailToast('取消失败')
    } finally {
      loading.value = false
    }
  }
  return { loading, onCancelOrder }
}

// 删除订单 删除成功做的事情不确定 可以通过传入函数实现
export const useDeleteOrder = (callback: (id: string) => void) => {
  const loading = ref(false)
  const deleteConsultOrder = async (item: ConsultOrderItem) => {
    loading.value = true
    try {
      await deleteOrder(item.id)
      // 成功，通知父组件删除这条信息 详情：跳转列表页面
      callback && callback(item.id)
      showSuccessToast('删除成功')
    } catch (e) {
      showFailToast('删除失败')
    } finally {
      loading.value = false
    }
  }
  return { loading, deleteConsultOrder }
}
