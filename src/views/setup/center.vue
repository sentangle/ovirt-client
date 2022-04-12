<template>
  <div class="center">
    <a-tabs
      v-model:activeKey="activeKey"
      tab-position="top"
      style="width: 100%"
    >
      <a-tab-pane key="1">
        <template #tab>
          <span> <BorderOuterOutlined />数据中心</span>
        </template>
        <div>
          <a-form layout="inline">
            <a-form-item label="ip">
              <a-input
                v-model:value="dataCenter.ip"
                placeholder="输入数据中心的IP"
              >
              </a-input>
            </a-form-item>
            <a-form-item label="port">
              <a-input
                v-model:value="dataCenter.port"
                placeholder="输入数据中心的端口"
              >
              </a-input>
            </a-form-item>
            <a-form-item label="域">
              <a-input
                v-model:value="dataCenter.domain"
                placeholder="输入数据中心的域"
              >
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="centerAdd"> 新增 </a-button>
            </a-form-item>
          </a-form>
        </div>
        <div style="margin-top: 20px">
          <a-card
            hoverable
            class="cardWrap"
            v-for="(centerObj, centerIndex) in dataCenterList"
            :key="centerIndex"
          >
            <template #actions>
              <a-tooltip placement="top">
                <template #title>设为默认 </template>
                <PushpinFilled
                  style="font-size: 22px"
                  @click="centerSet(centerIndex)"
                />
              </a-tooltip>
              <a-tooltip placement="top">
                <template #title>点击删除 </template>
                <DeleteFilled
                  style="font-size: 22px"
                  @click="centerDel(centerIndex)"
                />
              </a-tooltip>
            </template>
            <a-card-meta>
              <template #avatar><DatabaseFilled /></template>
              <template #title>
                <p>
                  {{ centerObj.ip }}
                  <a-tag color="blue" v-if="!centerIndex">默认</a-tag>
                </p>
              </template>
              <template #description>
                <p style="margin-bottom: 8px">端口: {{ centerObj.port }}</p>
                <p style="margin-bottom: 5px">域: {{ centerObj.domain }}</p>
              </template>
            </a-card-meta>
          </a-card>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2">
        <template #tab>
          <span> <ApiOutlined />网络设置</span>
        </template>
        网络设置
      </a-tab-pane>
      <a-tab-pane key="3">
        <template #tab>
          <span> <BranchesOutlined />诊断工具</span>
        </template>
        诊断工具
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, toRaw, onMounted } from "vue";
import { message } from "ant-design-vue";
import { isEmpty } from "@/utils/function";
const configObj = require("@/../electron/configure.json");

import {
  BorderOuterOutlined,
  ApiOutlined,
  BranchesOutlined,
  PushpinFilled,
  DeleteFilled,
  DatabaseFilled,
} from "@ant-design/icons-vue";
export default defineComponent({
  components: {
    BorderOuterOutlined,
    BranchesOutlined,
    ApiOutlined,
    PushpinFilled,
    DeleteFilled,
    DatabaseFilled,
  },
  setup() {
    const state = reactive({
      dataCenter: {
        ip: "",
        port: "",
        domain: "",
      },
      dataCenterList: {} as any,
      activeKey: "1",
    });
    onMounted(() => {
      state.dataCenterList = configObj.centerinfo;
    });
    const centerAdd = () => {
      if (
        isEmpty(state.dataCenter.ip) ||
        isEmpty(state.dataCenter.port) ||
        isEmpty(state.dataCenter.domain)
      ) {
        message.warning("填写的数据不完整");
        return;
      }
      let rs = (window as any).ipcRender.sendSync(
        "centeradd",
        toRaw(state.dataCenter)
      );
      console.log(rs);
      if (!rs.status) {
        message.error(rs.message);
      }
      return;
    };
    const centerSet = (centerIndex: number) => {
      if (centerIndex == 0) {
        return;
      }
      let firstCenter = state.dataCenterList[centerIndex];
      state.dataCenterList.splice(centerIndex, 1);
      state.dataCenterList.unshift(firstCenter);
      let requestData = toRaw(state.dataCenterList);
      console.log(requestData);
      let rs = (window as any).ipcRender.sendSync("centerupdate", requestData);
      console.log(rs);
      return;
    };
    const centerDel = (centerIndex: number) => {
      state.dataCenterList.splice(centerIndex, 1);
      let requestData = toRaw(state.dataCenterList);
      console.log(requestData);
      let rs = (window as any).ipcRender.sendSync("centerupdate", requestData);
      console.log(rs);
      return;
    };

    return {
      ...toRefs(state),
      centerAdd,
      centerSet,
      centerDel,
    };
  },
});
</script>

<style lang="less" scoped>
.cardWrap {
  width: 280px;
  margin: 5px 5px;
  float: left;
  border-radius: 5px;
  .ant-card-actions {
    font-size: 20px;
  }
}
</style>
