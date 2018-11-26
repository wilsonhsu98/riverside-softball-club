import Vue from "vue";
import VueI18n from "vue-i18n";
import en from "./i18n/en-us.json";
import tw from "./i18n/zh-tw.json";

Vue.use(VueI18n);
const currentLocale = "zh-TW";
const messages = {
  "en-US": en,
  "zh-TW": tw
};
const i18n = new VueI18n({
  locale: currentLocale,
  messages
});
document.getElementsByTagName("html")[0].setAttribute("lang", currentLocale);

export default i18n;
