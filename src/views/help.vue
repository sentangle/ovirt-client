<template>
  <div class="center">
    <a-tabs
      v-model:activeKey="activeKey"
      tabPosition="left"
      style="width: 100%"
    >
      <a-tab-pane key="1">
        <template #tab>
          <span> <BorderOuterOutlined />数据中心</span>
        </template>
        <div>
          <h4>如何添加数据中心?</h4>
          <p>
            由于和被请求的资源的当前状态之间存在冲突，请求无法完成。这个代码只允许用在这样的情况下才能被使用：
            用户被认为能够解决冲突，并且会重新提交新的请求。该响应应当包含足够的信息以便用户发现冲突的源头。
            冲突通常发生于对PUT请求的处理中。
            例如，在采用版本检查的环境下，某次PUT提交的对特定资源的修改请求所附带的版本信息与之前的某个（第三方）请求向冲突，那么此时服务器就应该返回一个409错误，告知用户请求无法完成。此时，响应实体中很可能会包含两个冲突版本之间的差异比较，以便用户重新提交归并以后的新版本。
            所以，按你的回退之后，返回 409
            ，个人感觉，本身应该是用得不太合理，如果这里用409的话，那么他就应该告诉你，有冲突，而且应该告诉你如何修改，但是我看现在那里面都没有给出修改意见，而且我想也肯定没有给你提供修改方法。
          </p>
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
import { defineComponent, reactive, toRefs } from "vue";

import {
  BorderOuterOutlined,
  ApiOutlined,
  BranchesOutlined,
} from "@ant-design/icons-vue";
export default defineComponent({
  components: {
    BorderOuterOutlined,
    BranchesOutlined,
    ApiOutlined,
  },
  setup() {
    const state = reactive({});

    return {
      ...toRefs(state),
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
