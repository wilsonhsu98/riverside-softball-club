import Vue from 'vue';
import store from './store';
import router from './router';
import i18n from './i18n';
import { cacheImg } from './libs/utils';
import VueTagsInput from '@johmun/vue-tags-input';
import VTooltip from 'v-tooltip';
import VCalendar from 'v-calendar';
import draggable from 'vuedraggable';
import vSelect from 'vue-select';
import VModal from 'vue-js-modal';
import smoothscroll from 'smoothscroll-polyfill';
import './css/font-awesome.min.css';
import './css/font.css';
import './scss/_base.scss';
import './scss/v-tooltip.scss';
import 'vue-select/dist/vue-select.css';

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
Vue.component('v-select', vSelect);
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
Vue.use(VCalendar, {
  locales: {
    'zh-TW': {
      firstDayOfWeek: 2,
    },
  },
});
Vue.use(VModal);
Vue.use({
  install() {
    Vue.cacheImg = cacheImg;
    Vue.prototype.$cacheImg = cacheImg;
  },
});
Vue.config.productionTip = false;

const version = 8;
if (window.localStorage.getItem('version') !== version.toString()) {
  store.dispatch('forceLogin', version);
  window.indexedDB.deleteDatabase(process.env.VUE_APP_PROJECTNAME);
}

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

const resetVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  // document.documentElement.style.maxHeight = `${window.innerHeight}px`;
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

let reads = 0;
window.trackRead = function(title, count) {
  reads += count;
  if (process.env.NODE_ENV === 'production') {
    window.reads = reads;
  } else {
    console.log(`====${title}====\nadd: ${count}\ncurrent: ${reads}`);
  }
};
