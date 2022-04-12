<template>
  <div style="display: flex; justify-content: center; align-items: center">
    <div class="login-box">
      <div class="login-logo">
        <SlackOutlined style="font-size: 70px; color: #26919d" />
      </div>
      <a-form
        layout="horizontal"
        :model="formLogin"
        @submit.prevent="handleSubmit"
      >
        <a-form-item>
          <a-input
            v-model:value="formLogin.username"
            size="large"
            placeholder="请输入账号"
          >
            <template #prefix>
              <UserOutlined class="input-icon" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input-password
            v-model:value="formLogin.password"
            size="large"
            type="password"
            placeholder="请输入密码"
          >
            <template #prefix>
              <LockOutlined class="input-icon" />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="formLogin.ip" size="large">
            <template #suffixIcon>
              <DatabaseOutlined class="input-icon" />
            </template>
            <a-select-option
              value="centerObj.ip"
              v-for="(centerObj, centerIndex) in dataCenterList"
              :key="centerIndex"
              >{{ centerObj.ip }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <a-form-item>
          <div style="display: inline-block; width: 50%">
            <a-switch
              checkedValue="1"
              unCheckedValue="0"
              checked-children="记住密码"
              un-checked-children="不记住密码"
              v-model:checked="formLogin.remember"
            />
          </div>
          <div style="display: inline-block; text-align: right; width: 50%">
            <a-switch
              checkedValue="1"
              unCheckedValue="0"
              checked-children="自动登录"
              un-checked-children="不自动登录"
              v-model:checked="formLogin.autologin"
            />
          </div>
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loadingLogin"
            block
          >
            {{ loadingLoginText }}
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRaw, toRefs } from "vue";
import { message } from "ant-design-vue";
import { isEmpty } from "@/utils/function";
import { cloneDeep } from "lodash-es";

import {
  UserOutlined,
  LockOutlined,
  SlackOutlined,
  DatabaseOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
const configObj = require("@/../electron/configure.json");
export default defineComponent({
  name: "Login",
  components: {
    UserOutlined,
    LockOutlined,
    SlackOutlined,
    DatabaseOutlined,
  },
  setup() {
    const state = reactive({
      loadingLogin: false,
      loadingLoginText: "登录",
      dataCenterList: {} as any,
      formLogin: {
        username: "",
        password: "",
        ip: "",
        autologin: "0",
        remember: "0",
      },
    });

    const router = useRouter();
    const handleSubmit = async () => {
      if (
        isEmpty(state.formLogin.username) ||
        isEmpty(state.formLogin.ip) ||
        isEmpty(state.formLogin.password)
      ) {
        return message.warning("账号或密码不能为空");
      }
      state.loadingLogin = true;
      state.loadingLoginText = "登录中";
      //登录
      let responeData = (window as any).ipcRender.sendSync(
        "loginvalidate",
        toRaw(state.formLogin)
      );
      console.log(responeData);
      if (responeData["status"] === false) {
        message.error(responeData["message"]);
      } else {
        router.push({ path: "/vmlist" });
      }
      state.loadingLogin = false;
      state.loadingLoginText = "登录";
    };
    onMounted(async () => {
      console.log("login-mounted", configObj);
      if (isEmpty(configObj.centerinfo[0])) {
        message.warning("请先添加数据中心");
        router.push({ path: "/setup" });
        return;
      }
      //数据中心
      state.dataCenterList = cloneDeep(configObj.centerinfo);
      //自动登录
      if (!isEmpty(configObj.loginstatusdata)) {
        if (configObj.loginstatusdata.remember === "1") {
          state.formLogin = cloneDeep(configObj.loginstatusdata);
        }
        if (configObj.loginstatusdata.autologin === "1") {
          handleSubmit();
        }
      }
    });
    return {
      ...toRefs(state),
      handleSubmit,
    };
  },
});
</script>

<style lang="less" scoped>
.login-box {
  margin-top: 20px;
  align-items: center;
  justify-content: center;
  .login-logo {
    text-align: center;
    margin-bottom: 30px;
    align-items: center;
  }

  .input-icon {
    padding-right: 10px;
  }
  :deep(.ant-form) {
    width: 350px;
  }
}
</style>
