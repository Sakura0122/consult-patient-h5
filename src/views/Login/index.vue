<script setup lang="ts">
import { ref } from 'vue'
import { codeRules, mobileRules, passwordRules } from '@/utils/rules'
import { showToast } from 'vant'
import { loginByMobile, loginByPassword } from '@/services/user'
import { useUserStore } from '@/stores'
import { useRouter, useRoute } from 'vue-router'
import { useMobileCode } from '@/hooks'

// 用户协议勾选
const agree = ref(false)
// 控制密码是否显示
const show = ref(false)
// 表单数据
const mobile = ref('')
const password = ref('')

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 点击登陆 同时支持密码登陆和验证码登录
const login = async () => {
  if (!agree.value) return showToast('请勾选我已同意')
  const res = isPass.value
    ? await loginByPassword(mobile.value, password.value)
    : await loginByMobile(mobile.value, code.value)
  userStore.setUser(res.data)
  // 如果有回跳地址就进行回跳，没有跳转到个人中心
  router.replace((route.query.returnUrl as string) || '/user')
  showToast('登陆成功')
}

// 短信登录页面切换
const isPass = ref(true)
const code = ref('')
// 发送短信验证码
// 1. API接口调用函数
// 2. 发送短信验证码： 判断是否正在倒计时 校验输入框  调用短信接口
// 3. 接口成功，倒计时，组件销毁要清理定时器
const { formRef, time, send } = useMobileCode(mobile, 'login')

// const time = ref(0)
// const formRef = ref<FormInstance>()
// let timerId: number
// const send = async () => {
//   if (time.value > 0) return
//   await formRef.value?.validate('mobile')
//   // 上面校验成功发送验证码
//   await sendMobileCode(mobile.value, 'login')
//   showToast('发送成功')
//   // 开启倒计时
//   time.value = 60
//   if (timerId) clearInterval(timerId)
//   timerId = setInterval(() => {
//     time.value--
//     if (time.value <= 0) clearInterval(timerId)
//   }, 1000)
// }
//
// // 组件销毁
// onUnmounted(() => {
//   clearInterval(timerId)
// })

const qqUrl = `https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=${encodeURIComponent(
  import.meta.env.VITE_APP_CALLBACK + '/login/callback'
)}`
</script>

<template>
  <div class="login-page">
    <cp-nav-bar title="登录" right-text="注册" @click-right="$router.push('/register')" />
    <!-- 头部 -->
    <div class="login-head">
      <h3>{{ isPass ? '密码登录' : '短信验证码登录' }}</h3>
      <a href="javascript:" @click="isPass = !isPass">
        <span>{{ !isPass ? '密码登录' : '短信验证码登录' }}</span>
        <van-icon name="arrow"></van-icon>
      </a>
    </div>
    <!-- 表单 -->
    <van-form ref="formRef" autocomplete="off" @submit="login">
      <van-field
        name="mobile"
        v-model="mobile"
        placeholder="请输入手机号"
        type="tel"
        :rules="mobileRules"
      ></van-field>
      <van-field
        v-if="isPass"
        v-model="password"
        :type="show ? 'text' : 'password'"
        placeholder="请输入密码"
        :rules="passwordRules"
      >
        <template #button>
          <cp-icon @click="show = !show" :name="`login-eye-${show ? 'on' : 'off'}`" />
        </template>
      </van-field>
      <van-field v-else :rules="codeRules" v-model="code" placeholder="请输入验证码">
        <template #button>
          <span class="btn-send" :class="{ active: time > 0 }" @click="send">{{
            time > 0 ? `${time}秒后发送验证码` : '发送验证码'
          }}</span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-checkbox v-model="agree">
          <span>我已同意</span>
          <a href="javascript:">用户协议</a>
          <span>及</span>
          <a href="javascript:">隐私条款</a>
        </van-checkbox>
      </div>
      <div class="cp-cell">
        <van-button block round type="primary" native-type="submit">登 录</van-button>
      </div>
      <div class="cp-cell">
        <a href="javascript:">忘记密码？</a>
      </div>
    </van-form>
    <!-- 底部 -->
    <div class="login-other">
      <van-divider>第三方登录</van-divider>
      <div class="icon">
        <a @click="userStore.setReturnUrl($route.query.returnUrl as string)" :href="qqUrl">
          <img src="@/assets/qq.svg" alt="" />
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  &-page {
    padding-top: 46px;
  }
  &-head {
    display: flex;
    padding: 30px 30px 50px;
    justify-content: space-between;
    align-items: flex-end;
    line-height: 1;
    h3 {
      font-weight: normal;
      font-size: 24px;
    }
    a {
      font-size: 15px;
    }
  }
  &-other {
    margin-top: 60px;
    padding: 0 30px;
    .icon {
      display: flex;
      justify-content: center;
      img {
        width: 36px;
        height: 36px;
        padding: 4px;
      }
    }
  }
}
.van-form {
  padding: 0 14px;
  .cp-cell {
    height: 52px;
    line-height: 24px;
    padding: 14px 16px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    .van-checkbox {
      a {
        color: var(--cp-primary);
        padding: 0 5px;
      }
    }
  }
  .btn-send {
    color: var(--cp-primary);
    &.active {
      color: rgba(22, 194, 163, 0.5);
    }
  }
}
</style>
