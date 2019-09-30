import Vue from 'vue';
import store from './store';
import router from './router';
import i18n from './i18n';
import { cacheImg } from './libs/utils';
import './css/font-awesome.min.css';
import './css/font.css';
import './scss/_base.scss';
import VueTagsInput from '@johmun/vue-tags-input';
import VTooltip from 'v-tooltip';
import './scss/v-tooltip.scss';
import draggable from 'vuedraggable';
import smoothscroll from 'smoothscroll-polyfill';

const componentsReq = require.context('./components/', false, /\.vue$/);
componentsReq.keys().forEach(path => {
  Vue.component(
    path
      .replace(/(_|\b|-)./g, a => a.toUpperCase())
      .replace(/(_|\b|-|\.\/|\.vue)*/gi, ''),
    componentsReq(path).default,
  );
});
Vue.component('vue-tags-input', VueTagsInput);
Vue.component('vue-draggable', draggable);
const tootipConfig = {
  defaultTrigger: 'hover focus click',
  disposeTimeout: 1000,
  defaultPopperOptions: {
    modifiers: {
      preventOverflow: { padding: 20 },
    },
  },
};
Vue.use(VTooltip, {
  ...tootipConfig,
  popover: {
    ...tootipConfig,
  },
});
Vue.config.productionTip = false;
Vue.use({
  install() {
    Vue.cacheImg = cacheImg;
    Vue.prototype.$cacheImg = cacheImg;
  },
});

new Promise(resolve => {
  resolve(
    new Vue({
      el: '#app',
      store,
      router,
      i18n,
    }),
  );
}).then(() => {
  store.dispatch('chkLoginStatus');
});

const version = 4;
if (window.localStorage.getItem('version') !== version.toString()) {
  window.localStorage.clear();
  window.localStorage.setItem('version', version.toString());
}

const resetVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};
resetVH();
window.addEventListener('resize', () => {
  resetVH();
});
smoothscroll.polyfill();

document.title = 'Riverside Softball Club';
const link = document.createElement('link');
link.type = 'image/png';
link.rel = 'shortcut icon';
link.href = require('./images/icon.png');
document.getElementsByTagName('head')[0].appendChild(link);
