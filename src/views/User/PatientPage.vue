<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Patient } from '@/types/user'
import { addPatient, editPatient, getPatientList, delPatient } from '@/services/user'
import { showConfirmDialog, showSuccessToast } from 'vant'
import type { FormInstance } from 'vant'
import { idCardRules, nameRules } from '@/utils/rules'

const list = ref<Patient[]>()
const getList = async () => {
  const res = await getPatientList()
  list.value = res.data
}
onMounted(() => {
  getList()
})
const options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 }
]

// 侧边栏弹出
const show = ref(false)
const showPopup = (item?: Patient) => {
  if (item) {
    // 如果点的是编辑，解构出后台需要的数据
    const { id, gender, name, idCard, defaultFlag } = item
    patient.value = { id, gender, name, idCard, defaultFlag }
  } else {
    // 重置表单
    patient.value = { ...initPatient }
  }
  show.value = true
}

// 表单数据
const initPatient: Patient = {
  name: '',
  idCard: '',
  gender: 1,
  defaultFlag: 0
}
const patient = ref<Patient>({ ...initPatient })
// 默认就诊人：选中是 1  不选中是 0
// 获取值：判断如果 defaultFlag 是1 绑定的值就是 true 否则是 false
// 设置值：如果复选框的值是 true defaultFlag的值就是1 否则是 0
const defaultFlag = computed({
  get() {
    return patient.value.defaultFlag === 1
  },
  set(newValue) {
    patient.value.defaultFlag = newValue ? 1 : 0
  }
})

// 保存表单
const formRef = ref<FormInstance>()
const submit = async () => {
  await formRef.value?.validate()
  // 身份证倒数第二位，单数是男，双数是女
  const gender = +patient.value.idCard.slice(-2, -1) % 2
  if (patient.value.gender !== gender) {
    await showConfirmDialog({
      title: '温馨提示',
      message: '填写的性别和身份证号中的不一致\n您确认提交吗？'
    })
  }
  // 添加数据 & 修改数据
  patient.value.id ? await editPatient(patient.value) : await addPatient(patient.value)
  show.value = false
  getList()
  showSuccessToast(patient.value.id ? '编辑成功' : '添加成功')
}

// 删除数据
const remove = async () => {
  await showConfirmDialog({
    title: '温馨提示',
    message: `您确认要删除 ${patient.value.name} 患者信息吗 ？`
  })
  await delPatient(patient.value.id as string)
  show.value = false
  getList()
  showSuccessToast('删除成功')
}
</script>

<template>
  <div class="patient-page">
    <cp-nav-bar title="家庭档案"></cp-nav-bar>
    <div class="patient-list" v-if="list">
      <div class="patient-item" v-for="item in list" :key="item.id">
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="id">{{ item.idCard.replace(/^(\w{6})\w*(\w{4})$/, '$1******$2') }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <div @click="showPopup(item)" class="icon">
          <cp-icon name="user-edit" />
        </div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <div class="patient-add" v-if="list.length < 6" @click="showPopup">
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
    </div>
    <!-- 弹出层 -->
    <!-- 侧边栏 -->
    <van-popup v-model:show="show" position="right">
      <cp-nav-bar
        :back="() => (show = false)"
        :title="patient.id ? '编辑患者' : '添加患者'"
        right-text="保存"
        @click-right="submit"
      ></cp-nav-bar>
      <van-form autocomplete="off" ref="formRef">
        <van-field
          v-model="patient.name"
          :rules="nameRules"
          label="真实姓名"
          placeholder="请输入真实姓名"
        />
        <van-field
          v-model="patient.idCard"
          :rules="idCardRules"
          label="身份证号"
          placeholder="请输入身份证号"
        />
        <van-field label="性别" class="pb4">
          <!-- 单选按钮组件 -->
          <template #input>
            <cp-radio-btn v-model="patient.gender" :options="options"></cp-radio-btn>
          </template>
        </van-field>
        <van-field label="默认就诊人">
          <template #input>
            <van-checkbox v-model="defaultFlag" :icon-size="18" round />
          </template>
        </van-field>
      </van-form>
      <van-action-bar v-if="patient.id">
        <van-action-bar-button @click="remove">删除</van-action-bar-button>
      </van-action-bar>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.patient-page {
  padding: 46px 0 80px;

  :deep() {
    .van-popup {
      width: 100%;
      height: 100%;
      padding-top: 46px;
      box-sizing: border-box;
    }
  }
}

// 底部操作栏
.van-action-bar {
  padding: 0 10px;
  margin-bottom: 10px;

  .van-button {
    color: var(--cp-price);
    background-color: var(--cp-bg);
  }
}

.patient-list {
  padding: 15px;
}

.patient-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--cp-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid var(--cp-bg);
  transition: all 0.3s;
  overflow: hidden;

  .info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;

    span {
      color: var(--cp-tip);
      margin-right: 20px;
      line-height: 30px;

      &.name {
        font-size: 16px;
        color: var(--cp-text1);
        width: 80px;
        margin-right: 0;
      }

      &.id {
        color: var(--cp-text2);
        width: 180px;
      }
    }
  }

  .icon {
    color: var(--cp-tag);
    width: 20px;
    text-align: center;
  }

  .tag {
    position: absolute;
    right: 60px;
    top: 21px;
    width: 30px;
    height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--cp-primary);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &.selected {
    border-color: var(--cp-primary);
    background-color: var(--cp-plain);

    .icon {
      color: var(--cp-primary);
    }
  }
}

.patient-add {
  background-color: var(--cp-bg);
  color: var(--cp-primary);
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;

  .cp-icon {
    font-size: 24px;
  }
}

.patient-tip {
  color: var(--cp-tag);
  padding: 12px 0;
}

.pb4 {
  padding-bottom: 4px;
}
</style>
