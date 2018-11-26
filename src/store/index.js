import Vue from "vue";
import Vuex from "vuex";

// root
import { state, actions, mutations, getters } from "./root";
// modules
import importGame from "./modules/import";
import record from "./modules/record";
import team from "./modules/team";
import user from "./modules/user";

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  actions,
  mutations,
  getters,
  modules: {
    import: importGame,
    record,
    team,
    user
  },
  strict: true
});
