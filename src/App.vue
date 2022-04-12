<template>
  <div id="nav">
    <span>
      <router-link to="/" v-if="!isLogin()"> <UserOutlined /> </router-link>
    </span>
    <span @click="loginout()" v-if="isLogin()">
      <LoginOutlined />
    </span>
    <span>
      <router-link to="/setup"><SettingOutlined /></router-link>
    </span>
    <span>
      <router-link to="/help"><QuestionCircleOutlined /></router-link>
    </span>
  </div>
  <div id="container">
    <div id="container-content"><router-view /></div>
  </div>
  <div id="footer">
    <div class="system-wrap" style="text-align: left">
      <div class="system-tooltip">
        <a-tooltip placement="top">
          <template #title>关机 </template>
          <a-button
            shape="circle"
            @click.stop="handleOsCommand('shutdown')"
            :disabled="actionBtnDisable"
            type="link"
            style="background: none; color: black"
          >
            <template #icon
              ><MyIcon type="icon-poweroff" class="system-icon"
            /></template>
          </a-button>
        </a-tooltip>
      </div>
      <div class="system-tooltip">
        <a-tooltip placement="top">
          <template #title>重启 </template>
          <a-button
            shape="circle"
            @click.stop="handleOsCommand('reboot')"
            :disabled="actionBtnDisable"
            type="link"
            style="background: none; color: black"
          >
            <template #icon
              ><MyIcon type="icon-reboot" class="system-icon"
            /></template>
          </a-button>
        </a-tooltip>
      </div>
    </div>
    <div class="system-wrap" style="text-align: right">
      <div class="datetime">{{ datetimeCur }}</div>

      <div class="system-popover">
        <a-popover trigger="hover">
          <template #content>
            <p style="display: inline-block; height: 200px">
              <a-slider
                v-model:value="soundVal"
                vertical
                :autofocus="true"
                :afterChange="changeSound()"
              />
            </p>
          </template>
          <sound-outlined class="system-icon" />
        </a-popover>
      </div>
      <div class="system-popover">
        <a-popover trigger="hover">
          <template #content>
            IPv6: fe80::407:7baa:5d57:9eb0%8 <br />
            IPv4: 172.18.80.246<br />
            掩码: 255.255.255.0 <br />
            网关: 172.18.80.1
          </template>
          <MyIcon type="icon-neton" style="font-size: 36px" />
        </a-popover>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, onUnmounted, onMounted } from "vue";
import {
  SettingOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  LoginOutlined,
  SoundOutlined,
} from "@ant-design/icons-vue";
import { createFromIconfontCN } from "@ant-design/icons-vue";
const MyIcon = createFromIconfontCN({
  scriptUrl: "./iconfont.js", // 在 iconfont.cn 上生成
});
import { message, Modal } from "ant-design-vue";
import { isEmpty, timeFormate } from "@/utils/function";
import { useRouter } from "vue-router";
import { cloneDeep } from "lodash";
const configObj = require("@/../electron/configure.json");
//设置配置
export default defineComponent({
  components: {
    LoginOutlined,
    UserOutlined,
    SettingOutlined,
    SoundOutlined,
    QuestionCircleOutlined,
    MyIcon,
  },
  setup() {
    const state = reactive({
      actionBtnDisable: false,
      datetimeCur: timeFormate(),
      soundVal: 0,
    });

    const router = useRouter();

    //是否登录
    const isLogin = () => {
      return isEmpty(configObj.isLogin) || configObj.isLogin == 0
        ? false
        : true;
    };
    //是否登录
    const loginout = () => {
      let responeData = (window as any).ipcRender.sendSync("loginout", {});
      message.success(responeData["message"]);
      setTimeout(() => {
        router.push({ path: "/" });
      }, 3000);
    };
    //系统时间
    const timerDatetime = setInterval(() => {
      state.datetimeCur = timeFormate();
    }, 1000);
    onUnmounted(() => {
      //清除定时器
      clearInterval(timerDatetime);
    });

    //声音
    let soundValTemp = 0;
    onMounted(() => {
      //获取声音值
      let soundObj = (window as any).ipcRender.sendSync("getSound", {});
      state.soundVal = soundObj.data;
      soundValTemp = cloneDeep(soundObj.data);
      console.log(soundObj);
    });

    const changeSound = () => {
      if (soundValTemp != state.soundVal) {
        (window as any).ipcRender.send("setSound", state.soundVal);
      }
    };
    //关机和重启
    const handleOsCommand = (command: string) => {
      state.actionBtnDisable = true;
      if ("shutdown" === command || "reboot" === command) {
        let warningText = "确定要重启吗?";
        let okBtnText = "确定重启";
        let commandFun = "rebootOs";
        if ("shutdown" === command) {
          warningText = "确定要关机吗?";
          okBtnText = "确定关机";
          commandFun = "shutdownOs";
        }
        Modal.confirm({
          content: warningText,
          width: 230,
          icon: "",
          bodyStyle: {
            fontWeight: "bolder",
            textAlign: "center",
          },
          centered: true,
          onOk() {
            (window as any).ipcRender.send(commandFun, {});
          },
          okText: okBtnText,
          cancelText: "取消",
          onCancel() {
            Modal.destroyAll();
            state.actionBtnDisable = false;
          },
        });
      }
    };
    return {
      ...toRefs(state),
      isLogin,
      loginout,
      changeSound,
      handleOsCommand,
    };
  },
});
</script>

<style lang="less">
html,
body {
  background-color: rgba(0, 0, 0, 0);
  #app {
    background-image: linear-gradient(to top, #917d89, #eeba93);
    height: 100%;
    margin: 0;
    padding: 0;
    border-radius: 5px;
  }
}

#container {
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}
#container-content {
  // background: rgba(255, 255, 255, 0.5);
  margin: 0 auto 0;
  padding: 10px;
  min-height: 620px;
  width: 920px;
  border-radius: 10px;
  // border: #40a9ff 1px solid;
}
#footer {
  width: 100%;
  background: rgba(255, 255, 255, 0.3);
  padding: 3px 10px 0;
  min-height: 60px;
  position: absolute;
  bottom: 0;
  .system-wrap {
    width: 50%;
    display: inline-block;
    white-space: pre-line;
    .system-tooltip {
      float: left;
      width: 60px;
      text-align: center;
    }
    .system-icon {
      font-size: 30px;
    }
    .datetime {
      float: right;
      width: 130px;
      padding-left: 20px;
      text-align: left;
    }
    .system-popover {
      padding-top: 5px;
      float: right;
      width: 60px;
      text-align: center;
    }
  }
  .ant-modal-confirm-content {
    font-size: 50px;
  }
}
#nav {
  text-align: right;
  padding: 5px 10px 0;
  font-size: 28px;
  span {
    margin: 0 8px;
  }
  a {
    color: #000;
    &.router-link-exact-active {
      color: #40a9ff;
    }
  }
}
</style>
