<template>
  <div>
    <import v-if="boxSummary.version === 'import'" />
    <template v-else>
      <edit v-if="pa" />
      <insert v-else />
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  created() {
    if (this.boxSummary.game !== this.$route.params.game) {
      this.setGame(this.$route.params.game);
    }
    this.setOrder(this.$route.params.order);
  },
  methods: {
    ...mapActions(['setGame', 'setOrder']),
  },
  computed: {
    ...mapGetters(['boxSummary', 'pa']),
  },
  components: {
    import: require('./view_pa_import').default,
    edit: require('./view_pa_edit').default,
    insert: require('./view_pa_insert').default,
  },
};
</script>
