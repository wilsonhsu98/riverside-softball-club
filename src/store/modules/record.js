import {
  types as rootTypes,
  // getters as rootGetters,
  state as rootState,
} from '../root';
import { state as teamState, getters as teamGetters } from './team';
import utils, { sumByInn, accCalc } from '../../libs/utils';
import workerCreater from '../../web-worker';

// const formatColor = content => {
//   if (['1H', '2H', '3H', 'HR'].includes(content)) {
//     return 'red';
//   }
//   if (['BB', 'SF'].includes(content)) {
//     return 'yellow';
//   }
//   if (content === 'UNKNOWN') {
//     return 'gray';
//   }
//   return 'blue';
// };
// const displayGame = (players, records, errors = [], role) => {
//   const assumedOrder = 12;
//   const checkRunOut = (self, i, item) => {
//     const selfAndNext5 = self
//       .slice(i, i + 6)
//       .filter(sub => sub.inn === item.inn)
//       .map(sub => sub.onbase)
//       .flat();
//     return {
//       r:
//         item.r ||
//         (selfAndNext5.find(
//           sub => sub && sub.name === item.name && sub.result === 'run',
//         )
//           ? item.name
//           : ''),
//       out: selfAndNext5.find(
//         sub => sub && sub.name === item.name && sub.result === 'out',
//       )
//         ? true
//         : false,
//     };
//   };
//   const recordsWithAltRun = records.reduce((acc, item, i, self) => {
//     const prev5 = self
//       .slice(Math.max(i - 5, 0), i)
//       .filter(sub => sub.inn === item.inn);
//     const prev5name = prev5.map(sub => sub.name);
//     const prev5outOrRun = prev5
//       .map(sub => sub.onbase)
//       .flat()
//       .filter(
//         sub => typeof sub === 'object' && ['out', 'run'].includes(sub.result),
//       )
//       .map(sub => sub.name);
//     const currentOnbase = (item.onbase || [])
//       .slice(1)
//       .filter(sub => sub.name && sub.result)
//       .map(sub => sub.name)
//       .reverse();
//     // .concat(shouldSetLegacyAltRunner ? [r] : []);
//     const candidate = prev5name.filter(n => !prev5outOrRun.includes(n));
//     return currentOnbase.reduce((acc, name, ii) => {
//       if (candidate.includes(name)) {
//         return acc;
//       }
//       const { r, out } = checkRunOut(self, i, { name, inn: item.inn });
//       const find = acc.filter(
//         s =>
//           s.inn === item.inn &&
//           (s.original === candidate[ii] || s.name === candidate[ii]),
//       );

//       const findIndex = acc.indexOf(find[find.length - 1]);
//       const isDuplicate = acc.find(
//         sub => sub.inn === item.inn && sub.name === name,
//       );
//       if (findIndex > -1 && !isDuplicate) {
//         return [
//           ...acc.slice(0, findIndex + 1),
//           {
//             inn: item.inn,
//             altOrder: acc[findIndex].order || acc[findIndex].altOrder,
//             original: candidate[ii],
//             name,
//             r,
//             out,
//             content: 'PR',
//           },
//           ...acc.slice(findIndex + 1),
//         ];
//       } else {
//         return acc;
//       }
//     }, acc);
//   }, records);
//   console.log(recordsWithAltRun);
//   return recordsWithAltRun.reduce(
//     (acc, item, i, self) => {
//       const { arr, startOrder: prevStartOrder, prevInn, isSetNewContent } = acc;
//       const order = !item.order
//         ? arr.filter(s => !s.altOrder).length + 1
//         : item.order;
//       const startOrder = item.break ? order - 1 : prevStartOrder;

//       const find = arr.find(sub => sub.name === item.name);
//       const findIndex = arr.indexOf(find);
//       const canPushPlayer =
//         !find && startOrder === 0 && !item.break && item.content !== 'PR';
//       const shouldSetStartOrder = (find && startOrder === 0) || item.break;
//       const shouldSetInnChange = item.inn !== prevInn;
//       const shouldSetNewContent =
//         role === 'manager' && !item.content && !isSetNewContent;
//       const { r, out } = checkRunOut(self, i, item);
//       const { name, inn, rbi, location, onbase, video } = item;
//       const newItem = {
//         name,
//         inn,
//         order,
//         content: shouldSetNewContent ? 'new' : item.content,
//         rbi,
//         r,
//         out,
//         location,
//         onbase,
//         video,
//         color: formatColor(item.content),
//         // 換局
//         ...(shouldSetInnChange && {
//           innChange: item.inn,
//         }),
//       };

//       const alt = arr
//         .map(
//           sub =>
//             (sub.altOrder &&
//               sub.altOrder === (order % startOrder || startOrder)) ||
//             sub.order === (order % startOrder || startOrder),
//         )
//         .lastIndexOf(true);
//       const altR = arr
//         .map(
//           sub =>
//             (sub.altOrder &&
//               sub.altOrder === (item.altOrder % startOrder || item.altOrder)) ||
//             sub.order === (item.altOrder % startOrder || item.altOrder) ||
//             sub.order % startOrder === item.altOrder % startOrder,
//         )
//         .lastIndexOf(true);
//       const shouldSetAltBatter = !find && alt > -1 && item.content !== 'PR';
//       const shouldSetAltRunner = !find && altR > -1 && item.content === 'PR';
//       const shouldSetLegacyAltRunner = r && r !== item.name && alt > -1;
//       const isLast = i === self.length - 1;
//       const order_ = !item.order ? item.altOrder || i + 1 : item.order;
//       const midLen = Math.ceil(order_ / (startOrder || assumedOrder) - 1);

//       const result = {
//         ...acc,
//         prevInn: item.inn,
//         // 第一輪加入球員
//         ...(canPushPlayer && {
//           arr: [
//             ...arr,
//             {
//               name: item.name,
//               data: (players.find(sub => sub.id === item.name) || { data: {} })
//                 .data,
//               order,
//               content: [newItem],
//               queue: [item.name],
//             },
//           ],
//         }),
//         // 第二輪找到原本球員並加入打擊內容
//         ...(find && {
//           arr: [
//             ...arr.slice(0, findIndex),
//             {
//               ...find,
//               /*
//                * https://stackoverflow.com/questions/34559918/spread-syntax-es6
//                * Array.prototype.concat will preserve the empty slots in the array
//                * while the Spread will replace them with undefined values.
//                */
//               content: find.content.concat(
//                 Array(Math.max(midLen - find.content.length, 0)),
//                 newItem,
//               ),
//               queue: [
//                 ...(find.queue || []),
//                 item.name,
//                 ...(shouldSetLegacyAltRunner ? [r] : []),
//               ],
//             },
//             // 舊代跑
//             ...(shouldSetLegacyAltRunner
//               ? [
//                   {
//                     name: r,
//                     data: (players.find(sub => sub.id === r) || { data: {} })
//                       .data,
//                     order,
//                     altOrder: item.order % startOrder || startOrder,
//                     content: Array(midLen).concat({
//                       inn: item.inn,
//                       name: r,
//                       order,
//                       r,
//                       color: 'gray',
//                       content: 'PR',
//                     }),
//                   },
//                 ]
//               : []),
//             ...arr.slice(findIndex + 1),
//           ],
//         }),
//         // 代打
//         ...(shouldSetAltBatter && {
//           arr: [
//             ...arr.slice(0, alt + 1),
//             {
//               name: item.name,
//               data: (players.find(sub => sub.id === item.name) || { data: {} })
//                 .data,
//               order,
//               altOrder: order % startOrder || startOrder,
//               content: Array(midLen).concat(newItem),
//             },
//             ...arr.slice(alt + 1),
//           ].map(row => ({
//             ...row,
//             ...(row.order === (order % startOrder || startOrder)
//               ? {
//                   queue: [...row.queue, item.name],
//                 }
//               : undefined),
//           })),
//         }),
//         // 代跑
//         ...(shouldSetAltRunner && {
//           arr: [
//             ...arr.slice(0, altR + 1),
//             {
//               name: item.name,
//               data: (players.find(sub => sub.id === item.name) || { data: {} })
//                 .data,
//               altOrder: item.altOrder % startOrder || item.altOrder,
//               content: Array(midLen).concat({
//                 inn: item.inn,
//                 name: item.name,
//                 r: item.r,
//                 color: 'gray',
//                 content: item.content,
//               }),
//             },
//             ...arr.slice(altR + 1),
//           ].map(row => ({
//             ...row,
//             ...(row.order === (item.altOrder % startOrder || item.altOrder)
//               ? {
//                   queue: [...row.queue, item.name],
//                 }
//               : undefined),
//           })),
//         }),
//         // 一輪有幾棒
//         ...(shouldSetStartOrder && {
//           startOrder: item.break
//             ? order - 1
//             : order - (find.order || find.altOrder),
//         }),
//         // 設定第一個內容為空的球員 打擊內容為 new
//         ...(shouldSetNewContent && {
//           isSetNewContent: true,
//         }),
//       };
//       if (isLast) {
//         /*
//          * 最後一round
//          * 取得單場最多次打席數
//          * 加header & start order
//          * 修正所有content array長度至最多打席數
//          * h / ab
//          * 失誤總數
//          */
//         const { arr, startOrder: prevStartOrder, isSetNewContent } = result;
//         const selfLen = self.filter(s => s.altOrder === undefined).length;
//         const startOrder = item.break ? order - 1 : prevStartOrder;
//         const paMax =
//           Math.ceil(selfLen / (startOrder || selfLen)) +
//           (selfLen % (startOrder || selfLen) === 0 && role === 'manager'
//             ? 1
//             : 0);
//         const header = Array(20)
//           .fill(undefined)
//           .reduce((acc, item, i) => {
//             if (startOrder === 0) {
//               const inns = records
//                 .filter(record => record.inn)
//                 .map(record => record.inn);
//               const maxInn = inns.length ? Math.max(...inns) : 1;
//               return Array.apply(null, Array(maxInn)).map(
//                 (undefined, i) => i + 1,
//               );
//             }
//             if (i) {
//               return [
//                 ...acc,
//                 ...Array(
//                   Math.ceil(
//                     (records.filter(record => record.inn === i).length +
//                       (i === (records[records.length - 1] || {}).inn &&
//                       role === 'manager'
//                         ? 1
//                         : 0)) /
//                       startOrder,
//                   ),
//                 )
//                   .fill(undefined)
//                   .map(() => i),
//               ];
//             }
//             return acc;
//           }, []);
//         return [
//           [...header, startOrder],
//           ...arr.map(sub => {
//             const { ab, h, BB, HR, locations } = sub.content.reduce(
//               ({ ab, h, BB, HR, locations }, item) => ({
//                 ab:
//                   ab +
//                   ([
//                     '1H',
//                     '2H',
//                     '3H',
//                     'HR',
//                     'FO',
//                     'GO',
//                     'K',
//                     'FOUL',
//                     'E',
//                     'FC',
//                     'DP',
//                     'TP',
//                   ].includes(item.content)
//                     ? 1
//                     : 0),
//                 h:
//                   h + (['1H', '2H', '3H', 'HR'].includes(item.content) ? 1 : 0),
//                 BB: BB + (item.content === 'BB' ? 1 : 0),
//                 HR: HR + (item.content === 'HR' ? 1 : 0),
//                 locations:
//                   item.location && item.location.x
//                     ? [
//                         ...locations,
//                         {
//                           x: item.location.x,
//                           y: item.location.y,
//                           location: item.location.location,
//                           color: formatColor(item.content),
//                           borderColor:
//                             item.content === 'HR' ? 'white' : 'black',
//                         },
//                       ]
//                     : locations,
//               }),
//               { ab: 0, h: 0, BB: 0, HR: 0, locations: [] },
//             );
//             const preBatter =
//               self.find(
//                 s => s.order === item.order - (startOrder || item.order) + 1,
//               ) || self[self.length - (startOrder || self.length)];
//             const newBatter =
//               preBatter.r && preBatter.name !== preBatter.r
//                 ? preBatter.r
//                 : arr.some(
//                     r =>
//                       r.altOrder ===
//                       (preBatter.order % startOrder || preBatter.order),
//                   )
//                 ? arr
//                     .filter(
//                       r =>
//                         r.altOrder ===
//                         (preBatter.order % startOrder || preBatter.order),
//                     )
//                     .reverse()[0].name
//                 : preBatter.name;
//             const shouldSetLastNew =
//               role === 'manager' && sub.name === newBatter;
//             const newContent =
//               !isSetNewContent && shouldSetLastNew
//                 ? [
//                     ...sub.content,
//                     {
//                       content: 'new',
//                       name: newBatter,
//                       inn: self[self.length - 1].inn,
//                     },
//                   ]
//                 : sub.content;

//             newContent.length = paMax || 1;
//             return {
//               ...sub,
//               content: newContent,
//               contentNormal: header.reduce((acc, inn, i, self) => {
//                 const filter = newContent.filter(sub => sub && sub.inn === inn);
//                 const hasPrev = newContent.some(sub => sub && sub.inn < inn);
//                 const arr = [];
//                 arr.length = 1;
//                 if (i && self[i - 1] === inn) {
//                   if (filter.length > 1) {
//                     return acc;
//                   } else {
//                     return acc.concat(arr);
//                   }
//                 } else if (filter.length) {
//                   return acc.concat(filter);
//                 } else {
//                   if (
//                     role === 'manager' &&
//                     startOrder === 0 &&
//                     i === self.length - 1 &&
//                     !hasPrev
//                   ) {
//                     return acc.concat(newContent);
//                   } else {
//                     return acc.concat(arr);
//                   }
//                 }
//               }, []),
//               summary: `${ab}-${h}`,
//               error: errors.some(e => e.hasOwnProperty('count'))
//                 ? (errors.find(({ name }) => name === sub.name) || {}).count
//                 : errors.filter(({ name }) => name === sub.name).length,
//               /* for group summary */
//               AB: ab,
//               H: h,
//               BB,
//               HR,
//               locations,
//             };
//           }),
//         ];
//       } else {
//         return result;
//       }
//     },
//     {
//       arr: [],
//       startOrder: 0,
//       prevInn: 0,
//       isSetNewContent: false,
//     },
//   );
// };

const types = {
  INIT_FROM_LS: 'RECORD/INIT_FROM_LS',
  GET_PERIOD: 'RECORD/GET_PERIOD',
  GET_PLAYERS: 'RECORD/GET_PLAYERS',
  GET_RECORDS: 'RECORD/GET_RECORDS',
  SET_PERIOD: 'RECORD/SET_PERIOD',
  SET_GAME_TYPES: 'RECORD/SET_GAME_TYPES',
  SET_TOP: 'RECORD/SET_TOP',
  SET_UNLIMITED_PA: 'RECORD/SET_UNLIMITED_PA',
  SET_SORTBY: 'RECORD/SET_SORTBY',
  SET_CHECKALL: 'RECORD/SET_CHECKALL',
  SET_COLS: 'RECORD/SET_COLS',
  SET_LASTUPDATE: 'RECORD/SET_LASTUPDATE',
  SET_GAME: 'RECORD/SET_GAME',
  SET_ORDER: 'RECORD/SET_ORDER',
  GET_GAMELIST: 'RECORD/GET_GAMELIST',
  SET_GENSTATISTICS: 'RECORD/SET_GENSTATISTICS',
  SET_PITCHER_SORTBY: 'RECORD/SET_PITCHER_SORTBY',
  SET_PITCHER_CHECKALL: 'RECORD/SET_PITCHER_CHECKALL',
  SET_PITCHER_COLS: 'RECORD/SET_PITCHER_COLS',
  SET_PITCHER_GENSTATISTICS: 'RECORD/SET_PITCHER_GENSTATISTICS',
  SET_ITEMSTATS: 'RECORD/SET_ITEMSTATS',
  SET_BOX: 'RECORD/SET_BOX',
  RESET_PERIOD: 'RECORD/RESET_PERIOD',
  SET_BOX_DISPLAY: 'RECORD/SET_BOX_DISPLAY',
  SET_OTHER_CONDITIONS: 'RECORD/SET_OTHER_CONDITIONS',
  SET_UNION_INTERSECT: 'RECORD/SET_UNION_INTERSECT',
  SET_SUPPORT_PITCHERS: 'RECORD/SET_SUPPORT_PITCHERS',
};

const state = {
  players: [],
  records: [],
  period: [{ period: 'period_all', select: true }],
  gameTypes: ['regular', 'playoff', 'cup'],
  top: 10,
  unlimitedPA: true,
  sortBy: 'OPS',
  lastUpdate: '',
  cols: [
    { name: 'Rank', visible: true },
    { name: 'name', visible: true },
    { name: 'PA', visible: true },
    { name: 'AB', visible: true },
    { name: 'H', visible: true },
    { name: 'TB', visible: true },
    { name: 'TOB', visible: true },
    { name: 'R', visible: true },
    { name: 'RBI', visible: true },
    { name: '1H', visible: true },
    { name: '2H', visible: true },
    { name: '3H', visible: true },
    { name: 'HR', visible: true },
    { name: 'K', visible: true },
    { name: 'DP', visible: true },
    { name: 'BB', visible: true },
    { name: 'SF', visible: true },
    { name: 'AVG', visible: true },
    { name: 'OBP', visible: true },
    { name: 'SLG', visible: true },
    { name: 'OPS', visible: true },
    { name: 'LEVEL', visible: true },
    { name: 'AVG_NO', visible: true },
    { name: 'AVG_SP', visible: true },
    { name: 'AVG_FB', visible: true },
  ],
  game: '',
  order: 0,
  games: [],
  genStatistics: [],
  pitcherSortBy: 'ERA',
  pitcherCols: [
    { name: 'Rank', visible: true },
    { name: 'name', visible: true },
    { name: 'W', visible: true },
    { name: 'L', visible: true },
    { name: 'ERA', visible: true },
    { name: 'G', visible: true },
    { name: 'GS', visible: true },
    { name: 'IP', visible: true },
    { name: 'H', visible: true },
    { name: 'R', visible: true },
    { name: 'NP', visible: true },
    { name: 'BB', visible: true },
    { name: 'SO', visible: true },
    { name: 'WHIP', visible: true },
    { name: 'S%', visible: true },
    { name: 'PIP', visible: true },
    { name: 'K7', visible: true },
    { name: 'BB7', visible: true },
    { name: 'H7', visible: true },
  ],
  genPitcherStatistics: [],
  itemStats: {
    AVG: [],
    H: [],
    HR: [],
    RBI: [],
    GWRBI: [],
    W: [],
    SO: [],
    ERA: [],
    WHIP: [],
    MVP: [],
  },
  box: [],
  boxDisplay: 'content',
  otherConditions: [],
  unionOrIntersect: 'union',
  conditionGames: [],
  reseting: true,
  pitcherGameCount: 0,
};

const getters = {
  period: state => state.period,
  periodSelect: state => {
    return state.period.find(item => item.select).period;
  },
  gameTypes: state => state.gameTypes,
  top: state => state.top,
  unlimitedPA: state => state.unlimitedPA,
  sortBy: state => state.sortBy,
  checkAll: state => {
    return (
      state.cols.filter(
        item => item.name !== 'Rank' && item.name !== 'name' && item.visible,
      ).length ===
      state.cols.filter(item => item.name !== 'Rank' && item.name !== 'name')
        .length
    );
  },
  conditionCols: state => {
    return state.cols
      .filter(item => item.name !== 'Rank' && item.name !== 'name')
      .map(item => ({
        name: item.name,
        visible: item.visible,
        disabled: item.name === state.sortBy,
      }));
  },
  genStatistics: state => state.genStatistics,
  displayedCols: state => {
    return state.cols.filter(item => item.visible);
  },
  pitcherSortBy: state => state.pitcherSortBy,
  pitcherCheckAll: state => {
    return (
      state.pitcherCols.filter(
        item => item.name !== 'Rank' && item.name !== 'name' && item.visible,
      ).length ===
      state.pitcherCols.filter(
        item => item.name !== 'Rank' && item.name !== 'name',
      ).length
    );
  },
  pitcherConditionCols: state => {
    return state.pitcherCols
      .filter(item => item.name !== 'Rank' && item.name !== 'name')
      .map(item => ({
        name: item.name,
        visible: item.visible,
        disabled: item.name === state.pitcherSortBy,
      }));
  },
  genPitcherStatistics: state => state.genPitcherStatistics,
  pitcherDisplayedCols: state => {
    return state.pitcherCols.filter(item => item.visible);
  },
  lastUpdate: state => state.lastUpdate,
  pa: state => {
    return state.records.find(
      item =>
        item._table === state.game && `${item.order}` === `${state.order}`,
    );
  },
  boxSummary: state => {
    const boxSummary =
      (state.games.length &&
        state.game &&
        state.games.find(item => item.game === state.game)) ||
      {};
    const allowedGameTypes = state.gameTypes;
    const game = state.records.filter(item => item._table === state.game);
    const beforePitchers = state.games
      .filter(
        item =>
          allowedGameTypes.includes(item.gameType) &&
          parseInt(item.game.replace('-', ''), 10) <
            parseInt(state.game.replace('-', ''), 10) &&
          Array.isArray(item.pitchers),
      )
      .map(item => item.pitchers)
      .flat();
    return {
      ...boxSummary,
      result: boxSummary.result,
      h: game.filter(item => ['1H', '2H', '3H', 'HR'].includes(item.content))
        .length,
      r:
        game.filter(item => item.r).length ||
        game
          .filter(item => Array.isArray(item.onbase))
          .reduce((acc, item) => {
            if (item.onbase[0].result === 'run') acc += 1;
            if (item.onbase[1].result === 'run') acc += 1;
            if (item.onbase[2].result === 'run') acc += 1;
            if (item.onbase[3].result === 'run') acc += 1;
            return acc;
          }, 0),
      e: Array.isArray(boxSummary.errors)
        ? boxSummary.errors.some(e => e.hasOwnProperty('count'))
          ? (boxSummary.errors || []).reduce(
              (result, item) => result + item.count,
              0,
            )
          : boxSummary.errors.length
        : '',
      opponentE: game.filter(item => ['E'].includes(item.content)).length,
      contents: game,
      opponentScores: boxSummary.opponentScores || [],
      scores: game.reduce((acc, item) => {
        if (typeof item.inn === 'number') {
          acc.length = item.inn;
          acc[item.inn - 1] = (acc[item.inn - 1] || 0) + (item.r ? 1 : 0);
          if (Array.isArray(item.onbase)) {
            acc[item.inn - 1] +=
              (item.onbase[0].result === 'run' ? 1 : 0) +
              (item.onbase[1].result === 'run' ? 1 : 0) +
              (item.onbase[2].result === 'run' ? 1 : 0) +
              (item.onbase[3].result === 'run' ? 1 : 0);
          }
        }
        return acc;
      }, []),
      pitchersRaw: boxSummary.pitchers,
      beforePitchers,
      pitchers:
        Array.isArray(boxSummary.pitchers) && boxSummary.pitchers.length
          ? boxSummary.pitchers.map((p, i, self) => {
              const OUT = sumByInn(p.OUT);
              const { ERA, WHIP } = accCalc(
                beforePitchers,
                self,
                i,
                teamGetters.teamInfo(teamState).pitcherInn,
              );
              return {
                OUT,
                IP: `${Math.floor(OUT / 3)}.${OUT % 3}`,
                H: sumByInn(p.H),
                R: sumByInn(p.R),
                BB: sumByInn(p.BB),
                SO: sumByInn(p.SO),
                ERA,
                WHIP,
                name: p.name,
              };
            })
          : [],
    };
  },
  games: state => state.games,
  records: state => {
    return state.records;
  },
  gamesResult: state => {
    const allowedGameTypes = state.gameTypes;
    return state.conditionGames
      .filter(
        item =>
          allowedGameTypes.includes(item.gameType) &&
          (state.period.find(item => item.select).games || []).includes(
            item.game,
          ),
      )
      .reduce(
        ({ win, lose, tie }, item) => {
          const w = win + (['win', 'win_'].includes(item.result) ? 1 : 0);
          const l = lose + (['lose', 'lose_'].includes(item.result) ? 1 : 0);
          const t = tie + (item.result === 'tie' ? 1 : 0);
          return {
            win: w,
            lose: l,
            tie: t,
            maxLength: Math.max(`${w}`.length, `${l}`.length, `${t}`.length),
          };
        },
        { win: 0, lose: 0, tie: 0 },
      );
  },
  groupGames: state => {
    if (state.reseting) return undefined;
    const allowedGameTypes = state.gameTypes;
    return utils.genGameList(
      state.conditionGames.filter(item =>
        allowedGameTypes.includes(item.gameType),
      ),
      (state.period.find(item => item.select) || { games: [] }).games,
    );
  },
  allTimeGameOptions: state => {
    const concat = (acc, item, col) => {
      const values = [].concat(item[col]);
      return values.reduce((acc, text) => {
        const find = acc.find(prev => prev.text === text);
        if (find) {
          return [
            ...acc.filter(prev => prev.text !== text),
            { text, count: find.count + 1 },
          ];
        } else if (text) {
          return acc.concat({ text, count: 1 });
        } else {
          return acc;
        }
      }, acc[col]);
    };
    return state.games.reduce(
      (acc, item, i, self) => {
        if (i === self.length - 1) {
          return {
            period: concat(acc, item, 'period').sort(
              (a, b) => b.text.localeCompare(a.text),
              'zh-TW',
            ),
            opponent: concat(acc, item, 'opponent').sort(
              (a, b) => a.text.localeCompare(b.text),
              'zh-TW',
            ),
            league: concat(acc, item, 'league').sort(
              (a, b) => a.text.localeCompare(b.text),
              'zh-TW',
            ),
            group: concat(acc, item, 'group').sort(
              (a, b) => a.text.localeCompare(b.text),
              'zh-TW',
            ),
            tags: concat(acc, item, 'tags').sort(
              (a, b) => a.text.localeCompare(b.text),
              'zh-TW',
            ),
          };
        } else {
          return {
            period: concat(acc, item, 'period'),
            opponent: concat(acc, item, 'opponent'),
            league: concat(acc, item, 'league'),
            group: concat(acc, item, 'group'),
            tags: concat(acc, item, 'tags'),
          };
        }
      },
      {
        period: [],
        opponent: [],
        league: [],
        group: [],
        tags: [],
      },
    );
  },
  gameOptions: state => {
    const concat = (acc, item, col) => {
      const values = [].concat(item[col]);
      return values.reduce((acc, text) => {
        const find = acc.find(prev => prev.text === text);
        if (find) {
          return [
            ...acc.filter(prev => prev.text !== text),
            { text, count: find.count + 1 },
          ];
        } else if (text) {
          return acc.concat({ text, count: 1 });
        } else {
          return acc;
        }
      }, acc[col]);
    };
    const allowedGameTypes = state.gameTypes;
    const filterGames = (
      state.period.find(item => item.select) || { games: [] }
    ).games;
    return state.games
      .filter(
        item =>
          allowedGameTypes.includes(item.gameType) &&
          filterGames.includes(item.game),
      )
      .reduce(
        (acc, item, i, self) => {
          if (i === self.length - 1) {
            return {
              opponent: concat(acc, item, 'opponent').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              league: concat(acc, item, 'league').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              group: concat(acc, item, 'group').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              coach: concat(acc, item, 'coach').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              recorder: concat(acc, item, 'recorder').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              tags: concat(acc, item, 'tags').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
            };
          } else {
            return {
              opponent: concat(acc, item, 'opponent'),
              league: concat(acc, item, 'league'),
              group: concat(acc, item, 'group'),
              coach: concat(acc, item, 'coach'),
              recorder: concat(acc, item, 'recorder'),
              tags: concat(acc, item, 'tags'),
            };
          }
        },
        {
          opponent: [],
          league: [],
          group: [],
          coach: [],
          recorder: [],
          tags: [],
        },
      );
  },
  game: state => state.game,
  periodGames: state => state.period.find(item => item.select).games || [],
  itemStats: state => state.itemStats,
  box: state => state.box,
  boxDisplay: state => state.boxDisplay,
  otherConditions: state => state.otherConditions,
  unionOrIntersect: state => state.unionOrIntersect,
  pitcherGameCount: state => state.pitcherGameCount,
};

const actions = {
  initFromLS({ commit }) {
    commit(types.INIT_FROM_LS);
  },
  operateGames({ commit }, changedData) {
    const dates = changedData
      .filter(item => item.data.timestamp)
      .map(item => new Date(item.data.timestamp.seconds * 1000));
    if (dates.length) {
      const lastDate = new Date(Math.max.apply(null, dates));
      commit(types.SET_LASTUPDATE, lastDate);
    }
    const records = changedData
      .filter(item => item.data.orders)
      .map(item => {
        return item.data.orders.map(sub => ({
          ...sub,
          _table: item.id,
        }));
      })
      .reduce((a, b) => a.concat(b), []);
    const period = changedData.map(item => {
      const { orders, ...others } = item.data;
      orders;
      return { ...others, game: item.id };
    });
    commit(types.GET_PERIOD, period);
    commit(types.GET_RECORDS, records);
    commit(types.GET_GAMELIST, period);
    actions.workerGenStatistics({ commit });
    actions.workerGenPitcherStatistics({ commit });
    actions.workerItemStats({ commit });
    actions.workerBox({ commit });
  },
  setPeriod({ commit }, value) {
    commit(types.SET_PERIOD, value);
    actions.workerGenStatistics({ commit });
    actions.workerGenPitcherStatistics({ commit });
    actions.workerItemStats({ commit });
  },
  setGameTypes({ commit }, value) {
    commit(types.SET_GAME_TYPES, value);
    actions.workerGenStatistics({ commit });
    actions.workerGenPitcherStatistics({ commit });
    actions.workerItemStats({ commit });
  },
  setTop({ commit }, value) {
    commit(types.SET_TOP, value);
    actions.workerGenStatistics({ commit });
  },
  setUnlimitedPA({ commit }, value) {
    commit(types.SET_UNLIMITED_PA, value);
    actions.workerGenStatistics({ commit });
  },
  setSortBy({ commit }, value) {
    commit(types.SET_SORTBY, value);
    commit(types.SET_COLS, { col: value, visible: true });
    actions.workerGenStatistics({ commit });
  },
  setCheckAll({ commit }, isCheckAll) {
    commit(types.SET_CHECKALL, isCheckAll);
  },
  toggleColumn({ commit }, col) {
    commit(types.SET_COLS, { col });
  },
  setGame({ commit }, gameDate) {
    commit(types.SET_GAME, gameDate);
    actions.workerBox({ commit });
  },
  setOrder({ commit }, order) {
    commit(types.SET_ORDER, order);
  },
  workerGenStatistics({ commit }) {
    commit(rootTypes.LOADING, true);
    workerCreater(
      {
        cmd: 'GenStatistics',
        players: state.players,
        records: state.records,
        unlimitedPA: state.unlimitedPA,
        top: state.top,
        period: state.period,
        sortBy: state.sortBy,
        excludedGames: state.games
          .filter(g => !state.gameTypes.includes(g.gameType))
          .map(g => g.game),
      },
      data => {
        commit(types.SET_GENSTATISTICS, data);
        commit(rootTypes.LOADING, false);
      },
    );
  },
  setPitcherSortBy({ commit }, value) {
    commit(types.SET_PITCHER_SORTBY, value);
    commit(types.SET_PITCHER_COLS, { col: value, visible: true });
    actions.workerGenPitcherStatistics({ commit });
  },
  setPitcherCheckAll({ commit }, isCheckAll) {
    commit(types.SET_PITCHER_CHECKALL, isCheckAll);
  },
  togglePitcherColumn({ commit }, col) {
    commit(types.SET_PITCHER_COLS, { col });
  },
  workerGenPitcherStatistics({ commit }) {
    commit(rootTypes.LOADING, true);
    workerCreater(
      {
        cmd: 'GenPitcherStatistics',
        players: state.players,
        games: state.games,
        period: state.period,
        sortBy: state.pitcherSortBy,
        excludedGames: state.games
          .filter(g => !state.gameTypes.includes(g.gameType))
          .map(g => g.game),
        pitcherInn: teamGetters.teamInfo(teamState).pitcherInn,
      },
      data => {
        commit(types.SET_PITCHER_GENSTATISTICS, data);
        commit(rootTypes.LOADING, false);
      },
    );
  },
  workerItemStats({ commit }) {
    commit(rootTypes.LOADING, true);
    workerCreater(
      {
        cmd: 'ItemStats',
        players: state.players,
        records: state.records,
        period: state.period,
        games: state.games,
        excludedGames: state.games
          .filter(g => !state.gameTypes.includes(g.gameType))
          .map(g => g.game),
        pitcherInn: teamGetters.teamInfo(teamState).pitcherInn,
      },
      data => {
        const { pitcherGameCount, ...others } = data;
        commit(types.SET_ITEMSTATS, others);
        commit(types.SET_SUPPORT_PITCHERS, pitcherGameCount);
        commit(rootTypes.LOADING, false);
      },
    );
  },
  workerBox({ commit }) {
    // commit(rootTypes.LOADING, true);
    if (state.game && state.records.some(item => item._table === state.game)) {
      // const boxSummary =
      //   state.games.length &&
      //   state.game &&
      //   state.games.find(item => item.game === state.game);
      // const data = displayGame(
      //   state.players,
      //   state.records.filter(item => item._table === state.game),
      //   boxSummary.errors,
      //   state.role,
      // );
      // console.log(data);
      // commit(types.SET_BOX, data);
      // return;
      workerCreater(
        {
          cmd: 'Box',
          games: state.games,
          game: state.game,
          players: state.players,
          records: state.records,
          role: rootState.role,
        },
        data => {
          commit(types.SET_BOX, data);
          // commit(rootTypes.LOADING, false);
        },
      );
    } else {
      commit(types.SET_BOX, []);
    }
  },
  setBoxDisplay({ commit }, value) {
    commit(types.SET_BOX_DISPLAY, value);
  },
  setOtherConditions({ commit }, value) {
    commit(types.SET_OTHER_CONDITIONS, value);
  },
  setUnionOrIntersect({ commit }, value) {
    commit(types.SET_UNION_INTERSECT, value);
  },
};

const mutations = {
  [types.INIT_FROM_LS](state) {
    state.top =
      parseInt(window.localStorage.getItem('pref_top'), 10) || state.top;
    state.unlimitedPA =
      window.localStorage.getItem('pref_unlimited_pa') === 'true' ||
      state.unlimitedPA;
    state.sortBy = window.localStorage.getItem('pref_sortby') || state.sortBy;
    state.pitcherSortBy =
      window.localStorage.getItem('pref_pitcher_sortby') || state.pitcherSortBy;
    state.boxDisplay =
      window.localStorage.getItem('pref_box_display') || state.boxDisplay;
    state.unionOrIntersect =
      window.localStorage.getItem('pref_union_intersect') ||
      state.unionOrIntersect;

    const pref_period = window.localStorage.getItem('pref_period');
    if (pref_period) state.period = JSON.parse(pref_period);
    const pref_cols = window.localStorage.getItem('pref_cols');
    if (pref_cols) state.cols = JSON.parse(pref_cols);
    const pref_pitcher_cols = window.localStorage.getItem('pref_pitcher_cols');
    if (pref_pitcher_cols) state.pitcherCols = JSON.parse(pref_pitcher_cols);
    const pref_game_types = window.localStorage.getItem('pref_game_types');
    if (pref_game_types) state.gameTypes = JSON.parse(pref_game_types);
    const pref_other_conditions = window.localStorage.getItem(
      'pref_other_conditions',
    );
    if (pref_other_conditions)
      state.otherConditions = JSON.parse(pref_other_conditions);
  },
  [types.RESET_PERIOD](state) {
    state.reseting = true;
    state.period = [{ period: 'period_all', select: true }];
    state.otherConditions = [];
  },
  [types.GET_PERIOD](state, data) {
    const period = [
      { period: 'period_all' },
      ...data.map(item => ({ period: item.period })),
      ...data
        .filter(item => !isNaN(parseInt(item.period)))
        .map(item => ({ period: `${parseInt(item.period)}` })),
    ]
      .filter((value, index, self) => {
        return (
          value &&
          value.period !== undefined &&
          self.map(item => item.period).indexOf(value.period) === index
        );
      })
      .sort((a, b) => {
        return b.period.localeCompare(a.period);
      })
      .map(item => {
        if (item.period === 'period_all') {
          return {
            ...item,
            games: data
              .map(sub => sub.game)
              .sort((a, b) => {
                return (
                  parseInt((b.match(/\d/g) || [b]).join(''), 10) -
                  parseInt((a.match(/\d/g) || [a]).join(''), 10)
                );
              }),
          };
        } else if (item.period && !isNaN(item.period)) {
          return {
            ...item,
            games: data
              .filter(sub => `${parseInt(sub.period)}` === item.period)
              .map(sub => sub.game),
          };
        } else {
          return {
            ...item,
            games: data
              .filter(sub => sub.period === item.period)
              .map(sub => sub.game),
          };
        }
      });
    const prevSelect = (state.period.find(item => item.select) || {}).period;
    const select = period.map(item => item.period).includes(prevSelect)
      ? prevSelect
      : 'period_all';
    state.reseting = false;
    state.period = period.map(item => ({
      ...item,
      select: item.period === select,
    }));
  },
  [types.GET_PLAYERS](state, data) {
    state.players = data;
  },
  [types.GET_RECORDS](state, data) {
    state.records = data;
  },
  [types.SET_PERIOD](state, data) {
    state.period = state.period.map(item => ({
      ...item,
      select: item.period === data,
    }));
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem('pref_period', JSON.stringify(state.period));
  },
  [types.SET_GAME_TYPES](state, value) {
    state.gameTypes = state.gameTypes.includes(value)
      ? state.gameTypes.filter(gameType => gameType !== value)
      : [...state.gameTypes, value];
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem(
        'pref_game_types',
        JSON.stringify(state.gameTypes),
      );
  },
  [types.SET_TOP](state, value) {
    state.top = value;
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem('pref_top', state.top);
  },
  [types.SET_UNLIMITED_PA](state, value) {
    state.unlimitedPA = value;
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem('pref_unlimited_pa', state.unlimitedPA);
  },
  [types.SET_SORTBY](state, value) {
    state.sortBy = value;
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem('pref_sortby', state.sortBy);
  },
  [types.SET_CHECKALL](state, isCheckAll) {
    state.cols = state.cols.map(item => ({
      ...item,
      visible: ['Rank', 'name', state.sortBy].includes(item.name) || isCheckAll,
    }));
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem('pref_cols', JSON.stringify(state.cols));
  },
  [types.SET_COLS](state, { col, visible }) {
    state.cols = state.cols.map(item => ({
      ...item,
      visible: item.name === col ? visible || !item.visible : item.visible,
    }));
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem('pref_cols', JSON.stringify(state.cols));
  },
  [types.SET_LASTUPDATE](state, date) {
    state.lastUpdate = date;
  },
  [types.SET_GAME](state, data) {
    state.game = data;
  },
  [types.SET_ORDER](state, data) {
    state.order = data;
  },
  [types.GET_GAMELIST](state, data) {
    state.games = data;
    state.conditionGames = utils.unionOrIntersect(
      state.unionOrIntersect,
      state.otherConditions,
      state.games,
    );
  },
  [types.SET_GENSTATISTICS](state, data) {
    state.genStatistics = data;
  },
  [types.SET_PITCHER_SORTBY](state, value) {
    state.pitcherSortBy = value;
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem('pref_pitcher_sortby', state.pitcherSortBy);
  },
  [types.SET_PITCHER_CHECKALL](state, isCheckAll) {
    state.pitcherCols = state.pitcherCols.map(item => ({
      ...item,
      visible:
        ['Rank', 'name', state.pitcherSortBy].includes(item.name) || isCheckAll,
    }));
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem(
        'pref_pitcher_cols',
        JSON.stringify(state.pitcherCols),
      );
  },
  [types.SET_PITCHER_COLS](state, { col, visible }) {
    state.pitcherCols = state.pitcherCols.map(item => ({
      ...item,
      visible: item.name === col ? visible || !item.visible : item.visible,
    }));
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem(
        'pref_pitcher_cols',
        JSON.stringify(state.pitcherCols),
      );
  },
  [types.SET_PITCHER_GENSTATISTICS](state, data) {
    state.genPitcherStatistics = data;
  },
  [types.SET_ITEMSTATS](state, data) {
    state.itemStats = data;
  },
  [types.SET_BOX](state, data) {
    state.box = data;
  },
  [types.SET_BOX_DISPLAY](state, value) {
    state.boxDisplay = value;
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem('pref_box_display', state.boxDisplay);
  },
  [types.SET_OTHER_CONDITIONS](state, data) {
    state.otherConditions = data;
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem(
        'pref_other_conditions',
        JSON.stringify(state.otherConditions),
      );
    state.conditionGames = utils.unionOrIntersect(
      state.unionOrIntersect,
      state.otherConditions,
      state.games,
    );
  },
  [types.SET_UNION_INTERSECT](state, data) {
    state.unionOrIntersect = data;
    !window.sessionStorage.getItem('currentTeam') &&
      window.localStorage.setItem(
        'pref_union_intersect',
        state.unionOrIntersect,
      );
    state.conditionGames = utils.unionOrIntersect(
      state.unionOrIntersect,
      state.otherConditions,
      state.games,
    );
  },
  [types.SET_SUPPORT_PITCHERS](state, data) {
    state.pitcherGameCount = data;
  },
};

const getLastOrderPosition = async newGameId => {
  const getLastOrderPosition_ = gameId =>
    new Promise(resolve => {
      workerCreater(
        {
          cmd: 'Box',
          games: state.games,
          game: gameId,
          players: teamGetters.teamInfo(teamState).players,
          records: state.records,
        },
        data => {
          resolve({
            orders: Array.isArray(data)
              ? data
                  .slice(1)
                  .filter(row => !Boolean(row.altOrder))
                  .map(row => ({ name: row.name }))
              : [],
            positions: (state.games.find(g => g.game === gameId) || {})
              .positions,
          });
        },
      );
    });
  let lastGame;
  for (let i = state.games.length - 1; i >= 0; i -= 1) {
    if (
      parseInt(newGameId.replace('-', '')) >
      parseInt(state.games[i].game.replace('-', ''))
    ) {
      lastGame = state.games[i].game;
      break;
    }
  }
  return lastGame ? await getLastOrderPosition_(lastGame) : {};
};

export { types, actions, getLastOrderPosition };
export default {
  state,
  getters,
  actions,
  mutations,
};
