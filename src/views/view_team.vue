<template>
  <div>
    <mobile-header
      :icon="$route.params.team ? currentTeamIcon : undefined"
      @back="back_"
      @save="editTeam_"
    />
    <div class="container" ref="container">
      <h1>
        {{ $route.params.team ? $t('manage_team') : $t('create_team') }}
        <div
          v-if="$route.params.team && teamScore !== undefined"
          class="score"
          @click="showScore"
        >
          {{ `${$t('ttl_score')} ${teamScore}` }}
        </div>
      </h1>

      <div
        class="request"
        :key="`request_${request.teamCode}`"
        v-for="request in teamRequests"
      >
        <img :src="$cacheImg(request.photo)" />
        <p>{{ $t('msg_request_join', { team: request.teamName }) }}</p>
        <p class="request-msg">{{ request.msg }}</p>
        <p>{{ new Date(request.timestamp).toLocaleString() }}</p>
        <div class="request-btn-container">
          <button @click="acceptRequest_(request.id)">
            {{ $t('btn_accept') }}
          </button>
          <button @click="deniedRequest_(request.id)">
            {{ $t('btn_denied') }}
          </button>
        </div>
      </div>

      <custom-input
        limit="en-only"
        :name="$t('ttl_team_code')"
        :placeholder="$t('pla_en_only')"
        :error="teamCode_err"
        :disabled="$route.params.team ? true : false"
        v-model="teamCode"
      />

      <custom-input
        :name="$t('ttl_team_name')"
        :error="teamName_err"
        v-model="teamName"
      />

      <custom-input
        type="splitting-wording"
        :name="$t('ttl_other_names')"
        :placeholder="$t('pla_split_names')"
        v-model="otherNames"
      />

      <custom-input
        type="textarea"
        rows="3"
        :name="$t('ttl_team_intro')"
        v-model="teamIntro"
      />

      <h2 v-html="$t('desc_gen_opacity')"></h2>
      <div
        v-if="!iconEdit"
        class="icon-container"
        :style="{ background: `url(${$cacheImg(transparentPng)})` }"
      >
        <i class="fa fa-picture-o" @click="iconEdit = true"></i>
        <img :src="$cacheImg(icon)" />
      </div>
      <div v-else class="icon-editor-container">
        <i class="fa fa-times" @click="iconEdit = false"></i>
        <vue-avatar-editor
          class="icon-editor"
          :image="icon"
          :hasRotation="true"
          :width="400"
          :height="400"
          :zoomText="$t('zoom')"
          :finishText="$t('gen_img')"
          :canMoveOutOfBound="true"
          @finished="genImage"
        />
      </div>

      <h2 class="player-header">
        {{ $t('ttl_player_list') }}
        <i
          v-if="$route.params.team && container"
          class="fa fa-info-circle"
          v-tooltip="{
            content: `<ul><li>${$t('tip_player')
              .split('|')
              .join('</li><li>')}</li></ul>`,
            classes: ['info'],
            container: $refs.container,
          }"
        ></i>
        <i
          class="fa fa-plus-circle"
          @click="players = [].concat({}, players)"
        ></i>
      </h2>

      <div class="player" v-for="(player, i) in players" :key="`row_${i}`">
        <!-- a little bit different between insert / edit mode -->
        <template v-if="$route.params.team">
          <input
            type="text"
            class="txt-player"
            :placeholder="$t('name')"
            v-model="player.name"
          />
          <input
            type="number"
            pattern="\d*"
            min="0"
            class="txt-number"
            :placeholder="$t('number')"
            @input="checkNumber"
            v-model.number.lazy="player.number"
          />
          <!-- oninput="console.log(this);if(value.length>11)value=value.slice(0,11)" -->
          <label v-if="player && player.uid" :for="`chk${i}`">
            <input
              type="checkbox"
              :id="`chk${i}`"
              :disabled="atLeastOneManager(player.manager)"
              v-model="player.manager"
              @change="releaseSelfManager($event, player)"
            />
            <span>{{ $t('manager') }}</span>
          </label>
          <photo
            v-if="player && player.uid && player.photo"
            class="binded"
            :photo="player.photo"
            :name="player.name"
            :number="player.number"
            size="medium"
          />
          <!-- <img
            v-if="player && player.uid && player.photo"
            :src="$cacheImg(player.photo)"
            class="binded"
            onerror="this.style.visibility = 'hidden'"
          /> -->
          <span v-if="player && player.uid">{{ $t('binded') }}</span>
          <i
            v-if="player.uid !== userId"
            class="fa fa-minus-circle"
            @click="players = [...players.slice(0, i), ...players.slice(i + 1)]"
          ></i>
        </template>

        <!-- insert mode -->
        <template v-else>
          <input
            type="text"
            class="txt-player"
            :placeholder="$t('name')"
            v-model="player.name"
          />
          <input
            type="number"
            pattern="\d*"
            min="0"
            class="txt-number"
            :placeholder="$t('number')"
            @input="checkNumber"
            v-model.number.lazy="player.number"
          />
          <label :for="`rdo${i}`">
            <input
              type="radio"
              name="self"
              :id="`rdo${i}`"
              :checked="player.self"
              @change="rdoBindSelf(i)"
            />
            <span>{{ $t('bind_self') }}</span>
          </label>
          <i
            class="fa fa-minus-circle"
            @click="players = [...players.slice(0, i), ...players.slice(i + 1)]"
          ></i>
        </template>
      </div>

      <h2 class="player-header" v-if="$route.params.team && benches.length">
        {{ $t('ttl_bench_list') }}
        <i
          v-if="container"
          class="fa fa-info-circle"
          v-tooltip="{
            content: `<ul><li>${$t('tip_bench')
              .split('|')
              .join('</li><li>')}</li></ul>`,
            classes: ['info'],
            container: $refs.container,
          }"
        ></i>
      </h2>

      <div
        class="player"
        v-for="(player, i) in benches"
        :key="`benches_row_${i}`"
      >
        <template v-if="$route.params.team">
          <input
            type="text"
            class="txt-player"
            :placeholder="$t('name')"
            v-model="player.name"
          />
          <input
            type="number"
            pattern="\d*"
            min="0"
            class="txt-number"
            :placeholder="$t('number')"
            @input="checkNumber"
            v-model.number.lazy="player.number"
          />
          <label v-if="player && player.uid" style="width: 57px;"> </label>
          <photo
            v-if="player && player.uid && player.photo"
            class="binded"
            :photo="player.photo"
            :name="player.name"
            :number="player.number"
            size="medium"
          />
          <!-- <img
            v-if="player && player.uid && player.photo"
            :src="$cacheImg(player.photo)"
            class="binded"
            onerror="this.style.visibility = 'hidden'"
          /> -->
          <i
            v-if="container"
            class="fa fa-commenting-o"
            v-tooltip="{
              content: player.msg,
              classes: ['info'],
              container: $refs.container,
            }"
          ></i>
          <i
            v-if="player.uid !== userId"
            class="fa fa-times-circle"
            @click="benches = [...benches.slice(0, i), ...benches.slice(i + 1)]"
          ></i>
        </template>
      </div>

      <div v-if="players_err" class="error" v-html="players_err"></div>

      <div v-if="$route.params.team" class="field-wrapper delete-btn-container">
        <button class="btn danger" @click="delete_">
          {{ $t('btn_delete_team') }}
        </button>
      </div>

      <div class="btn-container">
        <button class="btn" @click="back_">
          {{ $t('btn_cancel') }}
        </button>
        <button v-if="$route.params.team" class="btn danger" @click="delete_">
          {{ $t('btn_delete_team') }}
        </button>
        <button class="btn" @click="editTeam_">
          {{ $route.params.team ? $t('btn_update') : $t('btn_insert') }}
        </button>
      </div>
    </div>
    <team-score-modal
      :teamScore="teamScore"
      :teamScoreKVP="teamScoreKVP"
      @evaluate="reEvaluateTeamScore"
    />
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.container {
  .request {
    color: #fff;
    box-sizing: border-box;
    max-width: $max_width;
    width: 100%;
    margin: 15px auto;
    border-radius: 5px;
    background-color: $input_font;
    padding: 5px 8px 10px 60px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    > img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      position: absolute;
      left: 13px;
      top: 7px;
    }
    > p {
      margin: 0 0 10px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    > p {
      margin: 0;
    }
    &-msg {
      position: relative;
      padding-left: 16px;
      &:before {
        content: '-';
        position: absolute;
        top: 2px;
        left: 3px;
      }
    }
    &-btn-container {
      margin-left: -50px;
      display: flex;
      > button {
        background-color: $header_bgcolor;
        flex: 1;
        padding: 5px 8px;
      }
    }
  }
  h2 {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
    padding: 15px 0 2px 8px;
    font-size: 12px;
    font-weight: normal;
    text-align: left;
    color: $input_font;
    box-sizing: border-box;
    &.player-header {
      position: relative;
      .fa {
        bottom: 0;
      }
    }
  }
  h1 {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
    position: relative;
    .score {
      position: absolute;
      z-index: 1;
      right: 0;
      top: 1px;
      height: 22px;
      padding: 0 8px;
      min-width: 18px;
      line-height: 22px;
      font-size: 14px;
      background-color: $dark_gray;
      border-radius: 9px;
      box-sizing: border-box;
      text-align: center;
      color: #fff;
      opacity: 0.8;
      cursor: pointer;
    }
  }
  .field-wrapper {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
  }
  .fa {
    font-size: 28px;
    cursor: pointer;
    vertical-align: middle;
  }
  .fa-minus-circle,
  .fa-plus-circle,
  .fa-times-circle {
    position: absolute;
    right: 5px;
  }
  .binded {
    width: 28px;
    height: 28px;
    margin: 0 3px 0 12px;
    position: relative;
    &::v-deep .img {
      top: 0;
    }
  }
  .player {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto 5px;
    position: relative;
    display: flex;
    align-items: center;
    .txt-player,
    .txt-number {
      border: 2px solid $input_border;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: $input_font_size - 4;
      line-height: 14px;
      height: 32px;
      display: inline-block;
      margin: 0;
      padding: 0 8px;
      margin-right: 4px;
      outline: none;
      @media (hover: hover) and (pointer: fine) {
        &:hover {
          border-color: #3b5998;
        }
      }
      &:focus {
        border-color: #3b5998;
      }
    }
    .txt-player {
      width: 55px;
    }
    .txt-number {
      width: 48px;
    }
    label,
    span {
      font-size: 12px;
      line-height: 32px;
      vertical-align: top;
      display: inline-block;
    }
  }
  .delete-btn-container {
    display: none;
  }
  .btn.danger {
    width: auto;
  }
  .error {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
    padding: 0 10px;
    font-size: 12px;
    box-sizing: border-box;
    color: $error_color;
  }
}
.icon-container {
  text-align: center;
  margin: 10px auto 0;
  width: 300px;
  height: 300px;
  line-height: 300px;
  position: relative;
  .fa {
    color: white;
    background-color: $current_user_bgcolor;
    border-radius: 4px;
    width: 26px;
    height: 26px;
    line-height: 26px;
    font-size: 18px;
    box-sizing: border-box;
    cursor: pointer;
    position: absolute;
    left: 6px;
    top: 6px;
  }
  img {
    vertical-align: middle;
    width: 300px;
  }
}
.icon-editor-container {
  text-align: center;
  margin: 10px auto 0;
  width: 300px;
  position: relative;
  .fa {
    color: white;
    background-color: $current_user_bgcolor;
    border-radius: 4px;
    width: 26px;
    height: 26px;
    line-height: 26px;
    font-size: 18px;
    box-sizing: border-box;
    cursor: pointer;
    position: absolute;
    left: 6px;
    top: 6px;
  }
}
.icon-editor {
  > :last-child {
    // buttons area
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    > :first-child {
      // progress
      width: 170px;
      margin-right: 10px;
    }
    > :nth-child(2) {
      // rotate left
      color: white;
      background-color: $current_user_bgcolor;
      border-radius: 4px;
      width: 26px;
      height: 26px;
      line-height: 26px;
      font-size: 21px;
      box-sizing: border-box;
      cursor: pointer;
      position: absolute;
      left: 6px;
      top: -36px;
      > :first-child {
        height: 26px;
        line-height: 26px;
      }
    }
    > :nth-child(3) {
      // rotate right
      color: white;
      background-color: $current_user_bgcolor;
      border-radius: 4px;
      width: 26px;
      height: 26px;
      line-height: 26px;
      font-size: 21px;
      box-sizing: border-box;
      cursor: pointer;
      position: absolute;
      right: 6px;
      top: -36px;
      > :first-child {
        height: 26px;
        line-height: 26px;
      }
    }
    > :last-child {
      // button
      flex: 1;
      background-color: $header_bgcolor;
      padding: 10px;
      margin: 0;
    }
  }
}

@media only screen and (max-width: 760px) {
  .container {
    .delete-btn-container {
      display: block;
      margin-top: 15px;
      .btn {
        display: block;
        width: 100%;
        margin: 0;
      }
    }
  }
  .icon-container {
    width: 200px;
    height: 200px;
    line-height: 200px;
    img {
      width: 200px;
    }
  }
  .icon-editor-container {
    width: 200px;
  }
  .icon-editor {
    > :first-child > :first-child {
      width: 200px;
      height: 200px;
    }
    > :last-child {
      // buttons area
      > :first-child {
        // progress
        width: 110px;
      }
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import transparentPng from '../images/transparent.png';
import { evaluateTeamScore } from '../libs/utils';

export default {
  data() {
    return {
      container: null,
      teamCode: '',
      teamCode_err: '',
      teamName: '',
      teamName_err: '',
      teamIntro: '',
      otherNames: '',
      teamScore: undefined,
      teamScoreKVP: {},
      players: [{}],
      benches: [],
      players_err: '',
      icon: '',
      iconEdit: false,
      transparentPng,
    };
  },
  created() {},
  mounted() {
    this.container = this.$refs.container;
  },
  beforeDestroy() {},
  methods: {
    ...mapActions({
      editTeam: 'editTeam',
      editTeamScore: 'editTeamScore',
      handleRequest: 'handleRequest',
      deleteTeam: 'deleteTeam',
      alert: 'alert',
      confirm: 'confirm',
    }),
    checkNumber(e) {
      if (!e.target.validity.valid) {
        e.target.value = '';
      } else if (e.target.value.length > 2) {
        e.target.value = e.target.value.slice(0, 2);
      }
    },
    validate() {
      this.players = this.players
        .map(item => {
          return {
            name: item.name || '',
            number: item.number,
            manager: item.manager || false,
            self: item.self || false,
            uid: item.uid || '',
            photo: item.photo || '',
          };
        })
        .filter(v => v.name.trim() !== '');
      this.benches = this.benches.map(item => {
        return {
          ...item,
          name: (item.name || '').trim(),
        };
      });

      this.teamCode_err = '';
      if (!this.teamCode) {
        this.teamCode_err = this.$t('required');
      }

      this.teamName_err = '';
      if (!this.teamName) {
        this.teamName_err = this.$t('required');
      }

      if (this.players.length === 0) {
        this.players = [{}];
      }

      this.players_err = [
        {
          condition: this.players.length === 0,
          err: this.$t('msg_atleastone'),
        },
        {
          condition:
            !this.players.find(item => item.self) && !this.$route.params.team,
          err: this.$t('msg_bind_self'),
        },
        {
          condition:
            !this.players.find(item => item.manager) && this.$route.params.team,
          err: this.$t('msg_atleastone_manager'),
        },
        {
          condition: this.players.filter(
            (v, i, self) => self.map(item => item.name).indexOf(v.name) !== i,
          ).length,
          err: this.$t('msg_duplicate_name'),
        },
        {
          condition: this.players.filter(
            (v, i, self) =>
              v.number && self.map(item => item.number).indexOf(v.number) !== i,
          ).length,
          err: this.$t('msg_duplicate_number'),
        },
        {
          condition: this.benches.filter(v =>
            this.players.map(item => item.name).includes(v.name),
          ).length,
          err: this.$t('msg_duplicate_name'),
        },
        {
          condition: this.benches.filter(v =>
            this.players.map(item => item.number).includes(v.number),
          ).length,
          err: this.$t('msg_duplicate_number'),
        },
      ]
        .reduce((acc, check) => {
          return check.condition ? acc.concat(check.err) : acc;
        }, [])
        .join('<br>');

      return ![this.teamCode_err, this.teamName_err, this.players_err].some(
        str => !!str,
      );
    },
    back_() {
      this.$router.back();
    },
    editTeam_() {
      // wait for tags component ready
      setTimeout(() => {
        if (this.validate()) {
          this.editTeam({
            code: this.teamCode,
            name: this.teamName,
            subNames: this.otherNames,
            intro: this.teamIntro,
            players: this.players,
            benches: this.benches,
            prePlayers: !this.$route.params.team ? [] : this.teamInfo.players,
            preBenches: !this.$route.params.team ? [] : this.teamInfo.benches,
            icon: this.icon,
            isNew: !this.$route.params.team,
            nextAction: () => {
              const { score, scoreKVP } = evaluateTeamScore({
                teamInfo: this.teamInfo,
                games: this.games,
                records: this.records,
              });
              this.editTeamScore({
                teamCode: this.teamCode,
                score,
                scoreKVP,
              });
            },
          });
        } else {
          setTimeout(() => {
            const alertStr = [
              this.teamCode_err &&
                this.$t('msg_required', { col: this.$t('ttl_team_code') }),
              this.teamName_err &&
                this.$t('msg_required', { col: this.$t('ttl_team_name') }),
            ]
              .concat(this.players_err.split('<br>'))
              .filter(str => !!str)
              .join('\n');
            if (alertStr) {
              this.alert(alertStr);
            }
          }, 10);
        }
      });
    },
    rdoBindSelf(index) {
      this.players = this.players.map((player, i) => {
        return {
          ...player,
          manager: i === index,
          self: i === index,
        };
      });
    },
    atLeastOneManager(checked) {
      return checked && this.players.filter(item => item.manager).length === 1;
    },
    releaseSelfManager($event, player) {
      if ($event.target.checked === false && player.uid === this.userId) {
        this.alert(this.$t('msg_self_release'));
      }
    },
    genImage(img) {
      if (img) {
        this.icon = img.toDataURL();
      }
      this.iconEdit = false;
    },
    acceptRequest_(requestId) {
      this.handleRequest({
        requestId,
        action: 'accept',
      });
    },
    deniedRequest_(requestId) {
      this.handleRequest({
        requestId,
        action: 'denied',
      });
    },
    delete_() {
      if (
        this.teamInfo.players.find(
          player => player.uid === this.userId && player.manager,
        )
      ) {
        if (this.teamInfo.players.filter(player => player.manager).length > 1) {
          this.alert(this.$t('msg_delete_team_condition'));
          return;
        }
        this.confirm({ msg: this.$t('msg_delete_warning') }).then(() => {
          this.deleteTeam({ teamCode: this.teamCode });
        });
      } else {
        this.alert(this.$t('msg_not_manager'));
      }
    },
    showScore() {
      this.$modal.show('score');
    },
    reEvaluateTeamScore() {
      const { score, scoreKVP } = evaluateTeamScore({
        teamInfo: this.teamInfo,
        games: this.games,
        records: this.records,
      });
      if (
        score !== this.teamScore &&
        JSON.stringify(scoreKVP) !== JSON.stringify(this.teamScoreKVP)
      ) {
        this.editTeamScore({
          teamCode: this.teamCode,
          score,
          scoreKVP,
        });
      }
    },
  },
  computed: {
    ...mapGetters({
      userId: 'userId',
      teamInfo: 'teamInfo',
      currentTeamIcon: 'currentTeamIcon',
      teamRequests: 'teamRequests',
      games: 'games',
      records: 'records',
    }),
  },
  watch: {
    teamInfo: {
      handler() {
        if (this.$route.params.team) {
          this.teamCode = this.teamInfo.teamCode;
          this.teamName = this.teamInfo.teamName;
          this.teamIntro = this.teamInfo.teamIntro;
          this.otherNames = this.teamInfo.otherNames;
          this.teamScore = this.teamInfo.score;
          this.teamScoreKVP = this.teamInfo.scoreKVP;

          this.icon = this.teamInfo.icon;
          this.players = this.teamInfo.players.map(player => {
            return {
              ...player,
              self: player.uid === this.userId,
            };
          });
          this.benches = this.teamInfo.benches.map(player => ({ ...player }));
        }
      },
      immediate: true,
    },
  },
};
</script>
