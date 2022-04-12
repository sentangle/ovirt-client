<template>
  <div>
    <a-carousel arrows>
      <template #prevArrow>
        <div class="custom-slick-arrow" style="left: 10px; z-index: 999">
          <LeftCircleOutlined />
        </div>
      </template>
      <template #nextArrow>
        <div class="custom-slick-arrow" style="right: 10px">
          <RightCircleOutlined />
        </div>
      </template>
      <div
        v-for="page in Math.ceil(vmlist.length / 3)"
        :key="page"
        class="carouselWrap"
      >
        <a-card
          hoverable
          class="cardWrap"
          v-for="(vmObj, vmIndex) in vmlist.slice((page - 1) * 3, page * 3)"
          :key="page * 3 + vmIndex"
        >
          <template #cover>
            <a-tooltip placement="top">
              <template #title>点击图标连接电脑</template>
              <div
                @click="cardOpen(vmObj.id, vmObj.os)"
                style="text-align: center; cursor: pointer"
              >
                <MyIcon
                  :type="vmObj.osIcon"
                  :style="{ fontSize: '80px', marginTop: '20px' }"
                />
                <a-tag
                  color="blue"
                  v-if="vmObj.osX64Flag.length > 0"
                  class="os-x64-flag"
                  >{{ vmObj.osX64Flag }}</a-tag
                >
              </div>
            </a-tooltip>
          </template>
          <template class="ant-card-actions" #actions>
            <a-tooltip placement="top">
              <template #title>开关机 </template>
              <a-button
                type="primary"
                shape="circle"
                :disabled="vmObj.actionBtnDisable"
                @click.stop="handleVMCommand(vmObj, vmIndex, 'updownvm')"
              >
                <template #icon><PoweroffOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip placement="top">
              <template #title>断电 </template>
              <a-button
                type="primary"
                :disabled="vmObj.actionBtnDisable"
                shape="circle"
                @click.stop="handleVMCommand(vmObj, vmIndex, 'stopvm')"
              >
                <template #icon><close-outlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip placement="top">
              <template #title>重启 </template>
              <a-button
                type="primary"
                :disabled="vmObj.actionBtnDisable"
                shape="circle"
                @click.stop="handleVMCommand(vmObj, vmIndex, 'reboot')"
              >
                <template #icon><ReloadOutlined /></template>
              </a-button>
            </a-tooltip>
          </template>
          <a-card-meta style="pointer: none">
            <template #title>
              <p>
                {{ vmObj.name }}
                <a-tag :color="vmObj.statusColor">{{ vmObj.statusText }}</a-tag>
              </p>
            </template>
            <template #description>
              <p style="margin-bottom: 8px">
                系统配置: {{ vmObj.description }}
              </p>
              <p style="margin-bottom: 5px">运行时间: {{ vmObj.run_time }}</p>
            </template>
          </a-card-meta>
        </a-card>
      </div>
    </a-carousel>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  onUnmounted,
  createVNode,
} from "vue";
import { message, Modal } from "ant-design-vue";
import { createFromIconfontCN } from "@ant-design/icons-vue";
const MyIcon = createFromIconfontCN({
  scriptUrl: "./iconfont.js", // 在 iconfont.cn 上生成
});
import {
  PoweroffOutlined,
  ReloadOutlined,
  CloseOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
} from "@ant-design/icons-vue";

export default defineComponent({
  name: "vmlist",
  components: {
    PoweroffOutlined,
    ReloadOutlined,
    CloseOutlined,
    LeftCircleOutlined,
    RightCircleOutlined,
    MyIcon,
  },
  setup() {
    const state = reactive({
      loading: false,
      actionBtnDisable: false,
      vmlist: [] as any,
    });

    //链接主机
    const cardOpen = (vmid: string, systemName: string) => {
      console.log(vmid, systemName);
      let rs = (window as any).ipcRender.sendSync("openvmspiceconnect", {
        vmid: vmid,
        name: systemName,
        action: "start",
      });
      console.log(rs);
      if (!rs.status) {
        message.error(rs.message);
      } else {
        message.success(rs.message);
      }
    };
    //操作vm
    const handleVMCommand = (vminfo: any, vmIndex: number, command: string) => {
      state.vmlist[vmIndex].actionBtnDisable = true;
      let result = { status: false, message: "错误操作虚拟机", isshow: true };
      if ("updownvm" === command) {
        if ("down" === vminfo.status) {
          //开机
          let rs = (window as any).ipcRender.sendSync("actionvm", {
            vmid: vminfo.id,
            name: vminfo.name,
            action: "start",
          });
          result.status = rs.status;
          result.message = rs.message;
          console.log(rs);
          // this.action_button_style("开机中...", true);
        } else if ("up" === vminfo.status || "powering_up" === vminfo.status) {
          // 只有在虚拟机开机或启动中,才能关机
          let rs = (window as any).ipcRender.sendSync("actionvm", {
            vmid: vminfo.id,
            name: vminfo.name,
            action: "shutdown",
          });
          console.log(rs);
          result.status = rs.status;
          result.message = rs.message;
        }
      } else if ("stopvm" === command) {
        result.isshow = false;
        Modal.confirm({
          // icon: "",
          title: "确定要切断虚拟机电源吗?",
          content: createVNode(
            "div",
            { style: "color:red;" },
            "切断电源将导致未保存的工作丢失!"
          ),
          onOk() {
            let rs = (window as any).ipcRender.sendSync("actionvm", {
              vmid: vminfo.id,
              name: vminfo.name,
              action: "stop",
            });
            console.log(rs);
            result.isshow = true;
            result.status = rs.status;
            result.message = rs.message;
          },
          okText: "确认断电",
          cancelText: "取消",
          onCancel() {
            Modal.destroyAll();
          },
        });
      } else if ("reboot" === command) {
        let rs = (window as any).ipcRender.sendSync("actionvm", {
          vmid: vminfo.id,
          name: vminfo.name,
          action: "reboot",
        });
        console.log(rs);
        result.status = rs.status;
        result.message = rs.message;
      }
      if (result.isshow) {
        if (!result.status) {
          message.error(result.message);
        } else {
          message.success(result.message);
        }
      }
    };
    //定时更新token
    const timerUpdateToken = setInterval(() => {
      (window as any).ipcRender.send("timeupdatetoken", {});
    }, 1000 * 60 * 2);
    //定时更新状态
    const timerUpdateVmList = setInterval(() => {
      initVmList();
    }, 3000);
    //初始化vm列表
    const initVmList = () => {
      //获取vmlist
      let rs = (window as any).ipcRender.sendSync("getallvminfo", {});
      console.log(rs);
      if (!rs.status) {
        message.error(rs.message);
        return;
      }
      rs.data.forEach((itemVm: any) => {
        itemVm.actionBtnDisable = true;
        if ("up" === itemVm.status) {
          itemVm.statusText = "开机中";
          itemVm.statusColor = "green";
          itemVm.actionBtnDisable = false;
        } else if ("down" === itemVm.status) {
          itemVm.statusText = "已关机";
          itemVm.statusColor = "pink";
          itemVm.actionBtnDisable = false;
        } else if ("powering_down" === itemVm.status) {
          itemVm.statusText = "关机中...";
          itemVm.statusColor = "orange";
        } else if ("powering_up" === itemVm.status) {
          itemVm.statusText = "开机中...";
          itemVm.statusColor = "orange";
        } else if ("wait_for_launch" === itemVm.status) {
          itemVm.statusText = "准备中...";
          itemVm.statusColor = "blue";
        } else if ("reboot_in_progress" === itemVm.status) {
          itemVm.statusText = "重启中...";
          itemVm.statusColor = "orange";
        } else {
          itemVm.statusText = "故障";
          itemVm.statusColor = "#f50";
          itemVm.actionBtnDisable = false;
        }
        let osTemp = itemVm.os.replace("_", "").toLowerCase();
        // console.log(osTemp);
        if (-1 != osTemp.indexOf("windows")) {
          //windows
          if (osTemp.indexOf("10") > 0) {
            itemVm.osIcon = "icon-win10";
          } else {
            itemVm.osIcon = "icon-win7";
          }
          if (osTemp.indexOf("x64") > 0) {
            itemVm.osX64Flag = "x64";
          } else {
            itemVm.osX64Flag = "x86";
          }
        } else if (itemVm.os == "other_linux") {
          //linux
          itemVm.osIcon = "icon-linux";
          itemVm.osX64Flag = "";
        } else {
          //ubuntu
          itemVm.osIcon = "icon-other";
          itemVm.osX64Flag = "";
        }
      });
      state.vmlist = rs.data;
    };

    onMounted(() => {
      //获取vmlist
      initVmList();
    });
    onUnmounted(() => {
      //清除定时器
      clearInterval(timerUpdateToken);
      clearInterval(timerUpdateVmList);
    });

    return {
      ...toRefs(state),
      cardOpen,
      handleVMCommand,
    };
  },
});
</script>

<style lang="less" scoped>
.carouselWrap {
  padding: 65px 60px 0;
  display: flex !important;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}
.cardWrap {
  width: 240px;
  border-radius: 5px;
  cursor: default;
  margin: 10px;
}

.ant-carousel :deep(.slick-slide) {
  height: 500px;
  line-height: 500px;
}

.ant-carousel :deep(.slick-arrow.custom-slick-arrow) {
  width: 40px;
  height: 40px;
  font-size: 36px;
  color: #fff;
  opacity: 0.5;
}
.ant-carousel :deep(.custom-slick-arrow:before) {
  display: none;
}
.ant-carousel :deep(.custom-slick-arrow:hover) {
  opacity: 0.9;
}
.os-x64-flag {
  position: absolute;
  left: 58%;
  top: 75px;
}
</style>
