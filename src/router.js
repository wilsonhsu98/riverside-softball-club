import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store';

Vue.use(VueRouter);

const position = {};
const scrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition;
  } else {
    if (from.name === 'game' && to.name === 'games') {
      return position[to.name];
    }
    return { x: 0, y: 0 };
  }
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
      path: '/main',
      name: 'main',
      component: require('./views/page_main').default,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'games/:team',
          name: 'games',
          component: require('./views/view_games').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'games/:team/new',
          name: 'new_game',
          component: require('./views/view_new_game').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'games/:team/:game',
          name: 'game',
          component: require('./views/view_game').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'games/:team/:game/:order',
          name: 'pa',
          component: require('./views/view_edit_pa').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'stats_pa/:team',
          name: 'stats_pa',
          component: require('./views/view_stats_pa').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'stats_item/:team',
          name: 'stats_item',
          component: require('./views/view_stats_item').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'user',
          name: 'user',
          component: require('./views/view_user').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'user/avatar',
          name: 'avatar',
          component: require('./views/view_avatar').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'create_team',
          name: 'create_team',
          component: require('./views/view_team').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'edit_team/:team',
          name: 'edit_team',
          component: require('./views/view_team').default,
          meta: { requiresAuth: true },
        },
        {
          path: 'join_team',
          name: 'join_team',
          component: require('./views/view_join').default,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '*',
      redirect: '/main/user',
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (from.name === 'games' && to.name === 'game') {
    position[from.name] = {
      x: window.pageXOffset,
      y: window.pageYOffset,
    };
  }

  if (
    to.matched.some(route => route.meta.requiresAuth) &&
    store.getters.userId === '' &&
    store.getters.token === ''
  ) {
    next({ path: '/login' });
  } else if (to.path === '/login' && store.getters.token) {
    next({ path: from.path });
  } else {
    next();
  }
});

export default router;
