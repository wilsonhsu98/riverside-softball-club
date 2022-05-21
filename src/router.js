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
      component: require('./views/page_login').default,
      meta: { requiresAuth: false },
    },
    {
      path: '/login/:custom',
      name: 'customLogin',
      component: require('./views/page_login').default,
      meta: { requiresAuth: false },
    },
    {
      path: '/parse',
      name: 'parse',
      component: require('./views/page_parse').default,
      meta: { requiresAuth: false },
    },
    {
      path: '/parse/:team',
      name: 'parseteam',
      component: require('./views/page_parse').default,
      meta: { requiresAuth: false },
    },
    {
      path: '/management',
      name: 'management',
      component: require('./views/page_management').default,
      meta: { requiresAuth: false },
    },
    {
      path: '/main',
      name: 'main',
      component: require('./views/page_main').default,
      meta: { requiresAuth: true, anonymous: true },
      children: [
        {
          path: 'games/:team',
          name: 'games',
          component: require('./views/view_games').default,
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'games/:team/new',
          name: 'create_game_info',
          component: require('./views/view_game_info').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game/edit',
          name: 'edit_game_info',
          component: require('./views/view_game_info').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game/defense',
          name: 'edit_defense_info',
          component: require('./views/view_defense').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game/order',
          name: 'game_order',
          component: require('./views/view_order').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game/position',
          name: 'game_position',
          component: require('./views/view_position').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game/position/:mode',
          name: 'edit_game_position',
          component: require('./views/view_position').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'games/:team/:game',
          name: 'game',
          component: require('./views/view_game').default,
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'games/:team/:game/:order',
          name: 'pa',
          component: require('./views/view_pa').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'stats_pa/:team',
          name: 'stats_pa',
          component: require('./views/view_stats_pa').default,
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'stats_pitcher/:team',
          name: 'stats_pitcher',
          component: require('./views/view_stats_pitcher').default,
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'stats_item/:team',
          name: 'stats_item',
          component: require('./views/view_stats_item').default,
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'user',
          name: 'user',
          component: require('./views/view_user').default,
          meta: { requiresAuth: true, anonymous: true },
        },
        {
          path: 'user_avatar',
          name: 'avatar',
          component: require('./views/view_avatar').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'create_team',
          name: 'create_team',
          component: require('./views/view_team').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'edit_team/:team',
          name: 'edit_team',
          component: require('./views/view_team').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'join_team',
          name: 'join_team',
          component: require('./views/view_join').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'leave_team',
          name: 'leave_team',
          component: require('./views/view_leave').default,
          meta: { requiresAuth: true, anonymous: false },
        },
        {
          path: 'policy/:policy_type',
          name: 'policy',
          component: require('./views/view_policy').default,
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
      component: require('./views/page_view').default,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'games/:team',
          name: 'v_games',
          component: require('./views/view_games').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'games/:team/:game',
          name: 'v_game',
          component: require('./views/view_game').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'stats_pa/:team',
          name: 'v_stats_pa',
          component: require('./views/view_stats_pa').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'stats_pitcher/:team',
          name: 'v_stats_pitcher',
          component: require('./views/view_stats_pitcher').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'stats_item/:team',
          name: 'v_stats_item',
          component: require('./views/view_stats_item').default,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/deletion',
      name: 'deletion',
      component: require('./views/page_deletion').default,
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

export default router;
