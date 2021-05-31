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
import Carousel3d from 'vue-carousel-3d';
import { Plugin } from 'vue-fragment';
import simplebar from 'simplebar-vue';
import VueRangeSlider from 'vue-range-component';
import { VueSvgGauge } from 'vue-svg-gauge';
import VueQrcodeReader from 'vue-qrcode-reader';
import smoothscroll from 'smoothscroll-polyfill';
import icon from './components/icon';
import './css/font-awesome.min.css';
import './css/font.css';
import './scss/_base.scss';
import './scss/v-tooltip.scss';
import 'vue-select/dist/vue-select.css';
import 'simplebar/dist/simplebar.min.css';
import 'vue-range-component/dist/vue-range-slider.css';

const componentsReq = require.context('./components/', false, /\.vue$/);
componentsReq.keys().forEach(path => {
  Vue.component(
    path
      .replace(/(_|\b|-)./g, a => a.toUpperCase())
      .replace(/(_|\b|-|\.\/|\.vue)*/gi, ''),
    componentsReq(path).default,
  );
});
Object.keys(icon).forEach(key => {
  Vue.component(key, { template: icon[key] });
});
Vue.component('vue-tags-input', VueTagsInput);
Vue.component('vue-draggable', draggable);
Vue.component('v-select', vSelect);
Vue.component('simplebar', simplebar);
Vue.component('vue-range-slider', VueRangeSlider);
Vue.component('vue-svg-gauge', VueSvgGauge);
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
Vue.use(Carousel3d);
Vue.use(Plugin);
Vue.use(VueQrcodeReader);
Vue.use({
  install() {
    Vue.cacheImg = cacheImg;
    Vue.prototype.$cacheImg = cacheImg;
  },
});
Vue.config.productionTip = false;
Vue.config.ignoredElements = [/^vpon/];
// Vue.config.devtools = false;

// Vue.config.errorHandler = function(err, vm, info) {
//   alert(`Error: ${err.toString()}\nInfo: ${info}`);
// };
// window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
//   alert(
//     'Error: ' +
//       errorMsg +
//       '\nScript: ' +
//       url +
//       '\nLine: ' +
//       lineNumber +
//       '\nColumn: ' +
//       column +
//       '\nStackTrace: ' +
//       errorObj,
//   );
// };

const version = 9;
if (window.localStorage.getItem('version') !== version.toString()) {
  store.dispatch('forceLogin', version);
  window.indexedDB.deleteDatabase(process.env.VUE_APP_PROJECTNAME);
}

// https://aryedoveidelman.com/fixing_vh_units_on_mobile_once_and_for_all
let preVH;
const resetVH = () => {
  const VH = window.innerHeight * 0.01;
  if (preVH !== VH) {
    document.documentElement.style.setProperty('--vh', `${VH}px`);
    preVH = VH;
  }
};
resetVH();

const checkThemeMode = isDarkModeOn => {
  const theme = window.localStorage.getItem('pref_theme');
  if (['dark', 'light'].includes(theme)) {
    switch (theme) {
      case 'dark':
        document.body.classList.add('dark');
        break;
      case 'light':
        document.body.classList.remove('dark');
        break;
    }
  } else {
    if (isDarkModeOn) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
};
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
checkThemeMode(darkModeMediaQuery.matches);
darkModeMediaQuery.addListener(e => {
  checkThemeMode(e.matches);
});
window.addEventListener('storage', e => {
  if (e.key === 'pref_theme') {
    checkThemeMode(darkModeMediaQuery.matches);
  }
});

const render = () => {
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
    resetVH();
    store.dispatch('chkLoginStatus');
  });
};

const vhChangeEventTypes = [
  'scroll',
  'resize',
  'fullscreenchange',
  'fullscreenerror',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
  'mozbrowserscroll',
  'mozbrowserscrollareachanged',
  'mozbrowserscrollviewchange',
  'mozbrowserresize',
  'MozScrolledAreaChanged',
  'mozbrowserresize',
  'orientationchange',
];
vhChangeEventTypes.forEach(type => {
  window.addEventListener(type, () => window.requestAnimationFrame(resetVH));
});
// window.addEventListener('resize', () => window.requestAnimationFrame(resetVH));
// window.addEventListener('dblclick', () => {
//   alert(document.documentElement.style.getPropertyValue('--vh'));
// });
if (navigator.userAgent.match(/crios/gi)) {
  const input = document.createElement('INPUT');
  input.type = 'text';
  input.style =
    'width: 0; height: 0; border: none; background: none; box-sizing: border-box; padding: 0;';
  document.body.appendChild(input);
  input.focus();
  setTimeout(() => {
    input.blur();
    document.body.removeChild(input);
    setTimeout(() => {
      render();
    }, 50);
  }, 100);
} else {
  render();
}
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
