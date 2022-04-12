import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import {
  Button,
  Form,
  Input,
  Select,
  Tabs,
  Card,
  Avatar,
  Tag,
  Tooltip,
  Switch,
  Carousel,
  Popover,
  Slider,
} from "ant-design-vue";
const app = createApp(App);
app.use(Button);
app.use(Tabs);
app.use(Form);
app.use(Input);
app.use(Select);
app.use(Card);
app.use(Avatar);
app.use(Tag);
app.use(Tooltip);
app.use(Switch);
app.use(Carousel);
app.use(Popover);
app.use(Slider);

app.use(router).mount("#app");
