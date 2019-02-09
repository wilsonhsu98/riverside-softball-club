import Vue from "vue";
import store from "./store";
import router from "./router";
import i18n from "./i18n";
import "./css/font-awesome.min.css";
import "./css/font.css";
import "./scss/_base.scss";
import VueTagsInput from "@johmun/vue-tags-input";
import VTooltip from "v-tooltip";
import "./scss/v-tooltip.scss";

let componentsReq = require.context("./components/", false, /\.vue$/);
componentsReq.keys().forEach(path => {
  Vue.component(
    path
      .replace(/(_|\b|-)./g, function(a) {
        return a.toUpperCase();
      })
      .replace(/(_|\b|-|\.\/|\.vue)*/gi, ""),
    componentsReq(path).default
  );
});
Vue.component("vue-tags-input", VueTagsInput);
Vue.use(VTooltip, {
  defaultTrigger: "hover focus click"
});
Vue.config.productionTip = false;

new Promise(resolve => {
  resolve(
    new Vue({
      el: "#app",
      store,
      router,
      i18n
    })
  );
}).then(() => {
  store.dispatch("chkLoginStatus");
});

const version = 4;
if (window.localStorage.getItem("version") !== version.toString()) {
  window.localStorage.clear();
  window.localStorage.setItem("version", version.toString());
}

document.title = "Riverside Softball Club";
let link = document.createElement("link");
link.type = "image/png";
link.rel = "shortcut icon";
link.href = require("./images/icon.png");
document.getElementsByTagName("head")[0].appendChild(link);
