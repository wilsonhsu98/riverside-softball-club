<template>
  <div class="parse-container">
    <button
      v-if="todo.length"
      class="parse-btn"
      @click="importData($route.params.team)"
    >
      Batch Upload&nbsp;<i
        class="fa fa-cloud-upload"
        style="vertical-align: middle;"
      ></i>
    </button>
    <button
      class="parse-btn"
      @click="
        migrateAll({
          team: $route.params.team,
          games: list.map(item => item.game),
        })
      "
    >
      Re-upload All&nbsp;<i
        class="fa fa-cloud-upload"
        style="vertical-align: middle;"
      ></i>
    </button>
    <div class="parse-item" v-for="(item, index) in list" :key="`chk${index}`">
      <label :for="`chk${index}`">
        <input
          type="checkbox"
          :id="`chk${index}`"
          :disabled="item.disabled"
          :checked="item.checked"
          @change="toggleTodo(item.game)"
          :style="{ visibility: item.disabled ? 'hidden' : 'visible' }"
        />
        {{ item.game }}
      </label>
      <button
        :disabled="!item.disabled"
        class="parse-btn"
        style="padding: 4px 6px;"
        @click="importOneGame({ team: $route.params.team, game: item.game })"
      >
        Re-upload&nbsp;<i
          class="fa fa-cloud-upload"
          style="vertical-align: middle;"
        ></i>
      </button>
      <i
        :ref="item.game"
        class="fa fa-check"
        :style="{ visibility: done.includes(item.game) ? 'visible' : 'hidden' }"
      ></i>
    </div>
    <loading v-if="loading"></loading>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.parse-container {
  padding: 10px;
  text-align: center;
}
.parse-item {
  margin: 10px 0;
}
.parse-btn {
  background-color: $header_bgcolor;
  color: white;
  padding: 10px 20px;
  &:focus {
    outline: none;
  }
  &:disabled {
    opacity: 0.3;
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import { scrollTo } from '../libs/utils';

export default {
  created() {
    // this.fetchTwoOrigin(this.$route.params.team);
    // this.migrateGamesTimeToTeamDoc(this.$route.params.team);
    // this.migratePlayersToTeamDoc(this.$route.params.team);
    // this.migrateBenchesToTeamDoc(this.$route.params.team);
    // this.migrateTeamRoleToAccountDoc();
    // this.migrateAccountPhotoToTeamDoc();
    // this.deleteCollection();
  },
  methods: {
    ...mapActions([
      'fetchTwoOrigin',
      'importData',
      'importOneGame',
      'toggleTodo',
      'migrateAll',

      'migrateGamesTimeToTeamDoc',
      'migratePlayersToTeamDoc',
      'migrateBenchesToTeamDoc',
      'migrateTeamRoleToAccountDoc',
      'migrateAccountPhotoToTeamDoc',
      'deleteCollection',
    ]),
  },
  computed: {
    ...mapGetters({
      list: 'getSourceList',
      loading: 'loading',
      todo: 'todo',
      done: 'done',
      current_handel: 'current_handel',
    }),
  },
  watch: {
    current_handel() {
      scrollTo(this.$refs[this.current_handel][0]);
    },
  },
};
</script>
