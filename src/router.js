import Vue from 'vue';
import VueRouter from 'vue-router';
import i18n from './i18n';
import store from './store';
import config from '../config';

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
Vue.use(VueRouter);

const position = {};
const scrollBehavior = (to, from, savedPosition) => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (
        ['games', 'v_games'].includes(to.name) &&
        ['game', 'v_game'].includes(from.name)
      ) {
        resolve(position[to.name]);
      }
      if (savedPosition) {
        resolve(savedPosition);
      } else {
        resolve({ x: 0, y: 0 });
      }
    });
  });
};

const router = new VueRouter({
  scrollBehavior,
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/page_login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/login/:custom',
      name: 'customLogin',
      component: () => import('./views/page_login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/parse',
      name: 'parse',
      component: () => import('./views/page_parse.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/parse/:team',
      name: 'parseteam',
      component: () => import('./views/page_parse.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/management',
      name: 'management',
      component: () => import('./views/page_management.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/main',
      name: 'main',
      component: () => import('./views/page_main.vue'),
      meta: { requiresAuth: true, anonymous: true },
      children: [
        {
          path: 'games/:team',
          name: 'games',
          component: () => import('./views/view_games.vue'),
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'games/:team/new',
          name: 'create_game_info',
          component: () => import('./views/view_game_info.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game/edit',
          name: 'edit_game_info',
          component: () => import('./views/view_game_info.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game/defense',
          name: 'edit_defense_info',
          component: () => import('./views/view_defense.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game/order',
          name: 'game_order',
          component: () => import('./views/view_order.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game/position',
          name: 'game_position',
          component: () => import('./views/view_position.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game/position/:mode',
          name: 'edit_game_position',
          component: () => import('./views/view_position.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game',
          name: 'game',
          component: () => import('./views/view_game.vue'),
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'games/:team/:game/:order',
          name: 'pa',
          component: () => import('./views/view_pa.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'stats_pa/:team',
          name: 'stats_pa',
          component: () => import('./views/view_stats_pa.vue'),
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'stats_pitcher/:team',
          name: 'stats_pitcher',
          component: () => import('./views/view_stats_pitcher.vue'),
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'stats_item/:team',
          name: 'stats_item',
          component: () => import('./views/view_stats_item.vue'),
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'career/:uid',
          name: 'career_stats',
          component: () => import('./views/view_career_stats.vue'),
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'career/:teamCode/:playerName',
          name: 'career_stats_team',
          component: () => import('./views/view_career_stats.vue'),
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('./views/view_user.vue'),
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'user_avatar',
          name: 'avatar',
          component: () => import('./views/view_avatar.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'create_team',
          name: 'create_team',
          component: () => import('./views/view_team.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'edit_team/:team',
          name: 'edit_team',
          component: () => import('./views/view_team.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'join_team',
          name: 'join_team',
          component: () => import('./views/view_join.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'leave_team',
          name: 'leave_team',
          component: () => import('./views/view_leave.vue'),
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'policy/:policy_type',
          name: 'policy',
          component: () => import('./views/view_policy.vue'),
          meta: { requiresAuth: false },
        },
      ],
    },
    {
      path: '/session/:team',
      name: 'session',
      meta: { requiresAuth: true },
    },
    {
      path: '/view',
      name: 'view',
      component: () => import('./views/page_view.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'games/:team',
          name: 'v_games',
          component: () => import('./views/view_games.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'games/:team/:game',
          name: 'v_game',
          component: () => import('./views/view_game.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'stats_pa/:team',
          name: 'v_stats_pa',
          component: () => import('./views/view_stats_pa.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'stats_pitcher/:team',
          name: 'v_stats_pitcher',
          component: () => import('./views/view_stats_pitcher.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'stats_item/:team',
          name: 'v_stats_item',
          component: () => import('./views/view_stats_item.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/deletion',
      name: 'deletion',
      component: () => import('./views/page_deletion.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '*',
      redirect: '/main/user',
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (
    ['games', 'v_games'].includes(from.name) &&
    ['game', 'v_game'].includes(to.name)
  ) {
    position[from.name] = {
      x: window.pageXOffset,
      y: window.pageYOffset,
    };
  }
  if (
    ['game', 'v_game'].includes(from.name) &&
    ['games', 'v_games'].includes(to.name)
  ) {
    window.localStorage.setItem('focus_game', from.params.game);
  }
  window.scrollTo(0, 0);

  if (
    to.matched.some(route => route.meta.requiresAuth) &&
    store.getters.userId === '' &&
    store.getters.token === ''
  ) {
    next({ path: '/login' });
    if (to.name === 'join_team') {
      store.dispatch('alert', i18n.t('msg_login_before_join'));
      window.localStorage.setItem('next_url', JSON.stringify(to));
    }
  } else if (
    (to.path === '/login' && store.getters.token) ||
    (to.path === '/management' &&
      !config.managers.includes(store.getters.userId)) ||
    (to.matched.some(route => route.meta.anonymous === false) &&
      store.getters.isAnonymous) ||
    (to.params.team &&
      store.getters.currentTeam &&
      to.params.team !== store.getters.currentTeam)
  ) {
    next({ path: from.path });
  } else if (to.name === 'session') {
    window.sessionStorage.setItem('currentTeam', to.params.team);
    next({ path: `/view/games/${to.params.team}` });
  } else if (
    to.name.startsWith('v_') &&
    window.sessionStorage.getItem('currentTeam') !== to.params.team
  ) {
    next({ path: '/main/user' });
  } else {
    next();
  }
});

// Tracks whether the current tab has actually navigated within this app
// before (as opposed to landing directly on the current page — a pasted
// link, a new tab, or a same-tab link click from an outside site). The
// first resolved navigation is the initial page load itself, so
// `hasHistory` only flips true starting from the second one; from then on
// `$router.back()` is guaranteed to land on an in-app, same-origin route.
router.hasHistory = false;
let resolvedCount = 0;
router.afterEach(() => {
  resolvedCount += 1;
  if (resolvedCount > 1) {
    router.hasHistory = true;
  }
});

export default router;
