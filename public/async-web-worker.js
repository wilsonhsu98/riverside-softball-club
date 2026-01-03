const formatColor = content => {
  if (['1H', '2H', '3H', 'HR'].includes(content)) {
    return 'red';
  }
  if (['BB', 'SF'].includes(content)) {
    return 'yellow';
  }
  if (['UNKNOWN', 'PR', 'FR'].includes(content)) {
    return 'gray';
  }
  return 'blue';
};
const sumByInn = (scores = [], inn = scores.length) =>
  scores.slice(0, inn).reduce((acc, v) => acc + (parseInt(v) || 0), 0);
const accCalc = (beforePitchers = [], pitchers = [], currentIndex, inn = 7) => {
  const name = pitchers[currentIndex].name;
  const { OUT, R, H, SO, BB, S, B } = [
    ...beforePitchers.filter(bp => bp.name === name),
    ...pitchers.slice(0, currentIndex).filter(bp => bp.name === name),
    pitchers[currentIndex],
  ].reduce(
    (acc, bp) => {
      return {
        OUT: acc.OUT + sumByInn(bp.OUT),
        R: acc.R + sumByInn(bp.R),
        H: acc.H + sumByInn(bp.H),
        SO: acc.SO + sumByInn(bp.SO),
        BB: acc.BB + sumByInn(bp.BB),
        S: acc.S + sumByInn(bp.S),
        B: acc.B + sumByInn(bp.B),
      };
    },
    { OUT: 0, R: 0, H: 0, SO: 0, BB: 0, S: 0, B: 0 },
  );
  return {
    ERA: OUT === 0 ? (R === 0 ? '-' : '∞') : ((R * inn) / (OUT / 3)).toFixed(2),
    WHIP: OUT === 0 ? '-' : ((H + BB) / (OUT / 3)).toFixed(2),
    PIP: OUT === 0 ? '-' : ((S + B) / (OUT / 3)).toFixed(2),
    K7: OUT === 0 ? '-' : ((SO * inn) / (OUT / 3)).toFixed(2),
    BB7: OUT === 0 ? '-' : ((BB * inn) / (OUT / 3)).toFixed(2),
    H7: OUT === 0 ? '-' : ((H * inn) / (OUT / 3)).toFixed(2),
  };
};

const genStatistics = (players, records, filterPA, filterGames = []) => {
  const filterGamesSet = new Set(filterGames);
  const filterGamesRecords = records.filter(r => filterGamesSet.has(r._table));
  const recordsByGame = new Map();
  const recordsByPlayer = new Map();
  const recordsByGamePlayer = new Map();

  for (const r of records) {
    if (!filterGamesSet.has(r._table)) continue;
    if (r.content === 'UNKNOWN') continue;

    // game index
    if (!recordsByGame.has(r._table)) {
      recordsByGame.set(r._table, []);
    }
    recordsByGame.get(r._table).push(r);

    // player index
    if (!recordsByPlayer.has(r.name)) {
      recordsByPlayer.set(r.name, []);
    }
    recordsByPlayer.get(r.name).push(r);

    const key = `${r._table}__${r.name}`;
    if (!recordsByGamePlayer.has(key)) {
      recordsByGamePlayer.set(key, []);
    }
    recordsByGamePlayer.get(key).push(r);
  }

  // 預算 sort key（避免 regex 重跑）
  for (const list of recordsByGame.values()) {
    for (const r of list) {
      if (r._orderKey == null) {
        r._orderKey = parseInt(
          (r._table.match(/\d/g) || [r._table]).join('') + (r.order + 10),
          10,
        );
      }
    }
    list.sort((a, b) => b._orderKey - a._orderKey);
  }

  const result = players.map(player => {
    const name = player.id;

    const playerRecords = recordsByPlayer.get(name) || [];

    const top = playerRecords
      .filter(item => item.content && item.content !== 'UNKNOWN')
      .slice(0, filterPA)
      .map(item => {
        const gameRecords = recordsByGame.get(item._table) || [];

        // next5：直接 slice，不 filter
        const idx = gameRecords.findIndex(
          r => r.name === item.name && r.order === item.order,
        );

        let rName = '';
        if (idx >= 0) {
          for (let i = idx + 1; i < idx + 6 && i < gameRecords.length; i++) {
            const ob = gameRecords[i].onbase;
            if (
              Array.isArray(ob) &&
              ob.some(
                sub => sub && sub.name === item.name && sub.result === 'run',
              )
            ) {
              rName = item.name;
              break;
            }
          }
        }

        return {
          ...item,
          r: item.r || rName,
        };
      });

    let limit = 1;
    const games = [];
    const seenGames = new Set();

    for (const item of top) {
      const game = item._table;
      if (seenGames.has(game)) continue;
      seenGames.add(game);

      const key = `${game}__${name}`;
      const list = recordsByGamePlayer.get(key) || [];

      games.push(
        list
          .map(r => ({
            name: r.name,
            content: r.content,
            order: r.order,
            exclude: limit++ > filterPA,
            color: formatColor(r.content),
          }))
          .concat(game.slice(-6)),
      );
    }

    const rCount =
      filterPA === undefined
        ? filterGamesRecords.reduce((acc, item) => {
            if (
              item.r === name ||
              (Array.isArray(item.onbase) &&
                item.onbase.some(
                  sub => sub && sub.name === name && sub.result === 'run',
                ))
            ) {
              return acc + 1;
            }
            return acc;
          }, 0)
        : 0;
    const calc = {
      pa: 0,
      ab: 0,
      h: 0,
      abNo: 0,
      hNo: 0,
      abSP: 0,
      hSP: 0,
      abFB: 0,
      hFB: 0,
      tb: 0,
      tob: 0,
      rbi: 0,
      h1: 0,
      h2: 0,
      h3: 0,
      hr: 0,
      k: 0,
      bb: 0,
      sf: 0,
      dp: 0,
      r: rCount,
    };

    for (let i = 0; i < top.length; i++) {
      const item = top[i];
      const content = item.content;

      calc.pa++;

      const isAB =
        content === '1H' ||
        content === '2H' ||
        content === '3H' ||
        content === 'HR' ||
        content === 'FO' ||
        content === 'GO' ||
        content === 'K' ||
        content === 'FOUL' ||
        content === 'E' ||
        content === 'FC' ||
        content === 'DP' ||
        content === 'TP';

      const isHit =
        content === '1H' ||
        content === '2H' ||
        content === '3H' ||
        content === 'HR';

      if (isAB) calc.ab++;
      if (isHit) calc.h++;

      if (Array.isArray(item.onbase) && item.onbase.length && isAB) {
        const ob1 = item.onbase[1]?.name;
        const ob2 = item.onbase[2]?.name;
        const ob3 = item.onbase[3]?.name;

        if (!ob1 && !ob2 && !ob3) {
          calc.abNo++;
          if (isHit) calc.hNo++;
        }

        if (ob2 || ob3) {
          calc.abSP++;
          if (isHit) calc.hSP++;
        }

        if (ob1 && ob2 && ob3) {
          calc.abFB++;
          if (isHit) calc.hFB++;
        }
      }

      // TB
      if (isHit) {
        if (content === '1H') calc.tb += 1;
        else if (content === '2H') calc.tb += 2;
        else if (content === '3H') calc.tb += 3;
        else if (content === 'HR') calc.tb += 4;
      }

      // TOB
      if (
        content === '1H' ||
        content === '2H' ||
        content === '3H' ||
        content === 'HR' ||
        content === 'BB'
      ) {
        calc.tob++;
      }

      calc.rbi += item.rbi || 0;

      if (content === '1H') calc.h1++;
      else if (content === '2H') calc.h2++;
      else if (content === '3H') calc.h3++;
      else if (content === 'HR') calc.hr++;
      else if (content === 'K') calc.k++;
      else if (content === 'BB') calc.bb++;
      else if (content === 'SF') calc.sf++;
      else if (content === 'DP') calc.dp++;

      if (filterPA && item.r === item.name) {
        calc.r++;
      }
    }

    const {
      pa,
      ab,
      h,
      tb,
      tob,
      rbi,
      h1,
      h2,
      h3,
      hr,
      k,
      bb,
      sf,
      dp,
      r,
      abNo,
      hNo,
      abSP,
      hSP,
      abFB,
      hFB,
    } = calc;
    const obj = {
      name,
      data: player.data,
      records: top,
      PA: '-',
      AB: '-',
      H: '-',
      TB: '-',
      TOB: '-',
      R: '-',
      RBI: '-',
      '1H': '-',
      '2H': '-',
      '3H': '-',
      HR: '-',
      K: '-',
      BB: '-',
      SF: '-',
      DP: '-',
      AVG: '-',
      AVG_NO: '-',
      AVG_DESC_NO: '0-0',
      AVG_SP: '-',
      AVG_DESC_SP: '0-0',
      AVG_FB: '-',
      AVG_DESC_FB: '0-0',
      OBP: '-',
      SLG: '-',
      OPS: '-',
      LEVEL: '-/-/-',
      listByGame: games,
      locations: top
        .filter(item => item.location && item.location.x)
        .sort((a, b) => {
          if (a.content === 'HR' && b.content !== 'HR') return 1;
          if (a.content !== 'HR' && b.content === 'HR') return -1;
          return 0;
        })
        .map(item => ({
          x: item.location.x,
          y: item.location.y,
          location: item.location.location,
          color: formatColor(item.content),
          borderColor: item.content === 'HR' ? 'white' : 'black',
        })),
    };
    if (pa === 0) {
      return obj;
    } else if (pa > 0 && ab === 0) {
      return {
        ...obj,
        PA: pa,
        TOB: tob > 0 ? tob : '-',
        BB: bb > 0 ? bb : '-',
        SF: sf > 0 ? sf : '-',
        R: r > 0 ? r : '-',
        RBI: rbi > 0 ? rbi : '-',
        OBP: Math.round((tob / pa) * 1000) / 1000,
        OPS: Math.round((tob / pa) * 1000) / 1000,
        LEVEL: `-/${Math.floor(Math.round((tob / pa) * 1000) / 100)}/-`,
      };
    } else {
      return {
        ...obj,
        PA: pa,
        AB: ab,
        H: h,
        TB: tb,
        TOB: tob,
        R: r,
        RBI: rbi,
        '1H': h1,
        '2H': h2,
        '3H': h3,
        HR: hr,
        K: k,
        BB: bb,
        SF: sf,
        DP: dp,
        AVG: Math.round((h / ab) * 1000) / 1000,
        AVG_NO: abNo ? Math.round((hNo / abNo) * 1000) / 1000 : '-',
        AVG_DESC_NO: `${abNo}-${hNo}`,
        AVG_SP: abSP ? Math.round((hSP / abSP) * 1000) / 1000 : '-',
        AVG_DESC_SP: `${abSP}-${hSP}`,
        AVG_FB: abFB ? Math.round((hFB / abFB) * 1000) / 1000 : '-',
        AVG_DESC_FB: `${abFB}-${hFB}`,
        OBP: Math.round((tob / pa) * 1000) / 1000,
        SLG: Math.round((tb / ab) * 1000) / 1000,
        OPS: Math.round((tob / pa + tb / ab) * 1000) / 1000,
        LEVEL: `${Math.floor(Math.round((h / ab) * 1000) / 100)}/${Math.floor(
          Math.round((tob / pa) * 1000) / 100,
        )}/${Math.floor(Math.round((tb / ab) * 1000) / 100)}`,
        hNo,
        abNo,
        hSP,
        abSP,
        hFB,
        abFB,
      };
    }
  });

  return result;
};

const genPitcherStatistics = (
  players,
  games,
  filterGames = [],
  pitcherInn = 7,
) => {
  const games_ = games.filter(g => filterGames.includes(g.game));
  const alltime = games_.filter(
    g => g.pitcher || (Array.isArray(g.pitchers) && g.pitchers.length),
  );
  const legacy = games_.filter(
    g =>
      g.pitcher &&
      (!Array.isArray(g.pitchers) ||
        (Array.isArray(g.pitchers) && g.pitchers.length === 0)),
  );
  const current = games_.filter(
    g => Array.isArray(g.pitchers) && g.pitchers.length,
  );
  const { pitchers, records } = alltime.reduce(
    (acc, g) => {
      return {
        pitchers: [
          ...acc.pitchers,
          Array.isArray(g.pitcher) ? g.pitcher[0] : g.pitcher,
          ...(Array.isArray(g.pitchers) ? g.pitchers.map(p => p.name) : []),
        ].filter((n, i, self) => n && self.indexOf(n) === i),
        records: [
          ...acc.records,
          ...(Array.isArray(g.pitchers) ? g.pitchers : []),
        ],
      };
    },
    { pitchers: [], records: [] },
  );
  const currentPlayers = players.map(p => p.id);
  const result = pitchers
    .filter(name => currentPlayers.includes(name))
    .map(name => {
      const { OUT, R, H, SO, BB, S, B } = records
        .filter(p => p.name === name)
        .reduce(
          (acc, p) => ({
            OUT: acc.OUT + sumByInn(p.OUT),
            R: acc.R + sumByInn(p.R),
            H: acc.H + sumByInn(p.H),
            SO: acc.SO + sumByInn(p.SO),
            BB: acc.BB + sumByInn(p.BB),
            S: acc.S + sumByInn(p.S),
            B: acc.B + sumByInn(p.B),
          }),
          { OUT: 0, R: 0, H: 0, S: 0, SO: 0, BB: 0, B: 0 },
        );
      const { ERA, WHIP, K7, BB7, H7, PIP } = accCalc(
        [],
        [
          {
            OUT: [OUT],
            R: [R],
            H: [H],
            SO: [SO],
            BB: [BB],
            S: [S],
            B: [B],
          },
        ],
        0,
        pitcherInn,
      );
      return {
        name,
        data: (players.find(sub => sub.id === name) || { data: {} }).data,
        OUT,
        S,
        B,
        W: alltime.filter(
          g =>
            (Array.isArray(g.pitcher) ? g.pitcher[0] : g.pitcher) === name &&
            g.result === 'win',
        ).length,
        L: alltime.filter(
          g =>
            (Array.isArray(g.pitcher) ? g.pitcher[0] : g.pitcher) === name &&
            g.result === 'lose',
        ).length,
        ERA,
        G:
          current.filter(g => g.pitchers.some(p => p.name === name)).length +
          legacy.filter(
            g => (Array.isArray(g.pitcher) ? g.pitcher[0] : g.pitcher) === name,
          ).length,
        ...(OUT === 0
          ? {
              GS: '-',
              IP: '-',
              H: '-',
              R: '-',
              NP: '-',
              BB: '-',
              SO: '-',
              WHIP: '-',
              'S%': '-',
              PIP: '-',
              K7: '-',
              BB7: '-',
              H7: '-',
            }
          : {
              GS: current.filter(g => (g.pitchers[0] || {}).name === name)
                .length,
              IP: `${Math.floor(OUT / 3)}.${OUT % 3}`,
              H,
              R,
              NP: S + B,
              BB,
              SO,
              WHIP,
              'S%': B === 0 ? '-' : Math.round((S / B) * 100) / 100,
              PIP,
              K7,
              BB7,
              H7,
            }),
      };
    });

  return result;
};

const displayGame = (players, records, errors = [], role) => {
  const checkRunOut = (self, i, item) => {
    const selfAndNext5 = self
      .slice(i, i + 6)
      .filter(sub => sub.inn === item.inn)
      .map(sub => sub.onbase)
      .flat();
    return {
      r:
        item.r ||
        (selfAndNext5.find(
          sub => sub && sub.name === item.name && sub.result === 'run',
        )
          ? item.name
          : ''),
      out: selfAndNext5.find(
        sub => sub && sub.name === item.name && sub.result === 'out',
      )
        ? true
        : false,
    };
  };
  const recordsWithAltRun = records.reduce((recordsAcc, item, i, self) => {
    const prev5 = self
      .slice(Math.max(i - 5, 0), i)
      .filter(sub => sub.inn === item.inn);
    const prev5name = prev5.map(sub => sub.name);
    const prev5outOrRun = prev5
      .map(sub => sub.onbase)
      .flat()
      .filter(
        sub => typeof sub === 'object' && ['out', 'run'].includes(sub.result),
      )
      .map(sub => sub.name);
    const currentOnbase = (item.onbase || [])
      .slice(1)
      .filter(sub => sub.name && sub.result)
      .map(sub => sub.name)
      .reverse();
    const candidate = prev5name.filter(n => !prev5outOrRun.includes(n));
    return currentOnbase.reduce((currentOnbaseAcc, name, ii) => {
      if (candidate.includes(name)) {
        return currentOnbaseAcc;
      }
      const { r, out } = checkRunOut(self, i, { name, inn: item.inn });
      const find = currentOnbaseAcc.filter(
        s =>
          s.inn === item.inn &&
          (s.original === candidate[ii] || s.name === candidate[ii]),
      );

      const findIndex = currentOnbaseAcc.indexOf(find[find.length - 1]);
      const isDuplicate = currentOnbaseAcc.find(
        sub => sub.inn === item.inn && sub.name === name,
      );
      if (item.isForcedMode) {
        const assumePrevCount = currentOnbase.length;
        const prev3 = self
          .slice(Math.max(i - 3, 0), i)
          .filter(sub => sub.inn === item.inn - 1);
        const prev3name = prev3.map(sub => sub.name);
        const currentIndex = currentOnbaseAcc.indexOf(item);
        return [
          ...currentOnbaseAcc.slice(0, currentIndex),
          {
            inn: item.inn,
            ...(!prev3name.includes(name) && {
              altOrder: item.order + ii - assumePrevCount,
            }),
            name,
            r,
            out,
            content: 'FR',
            isForcedMode: true,
          },
          ...currentOnbaseAcc.slice(currentIndex),
        ];
      } else if (findIndex > -1 && !isDuplicate) {
        return [
          ...currentOnbaseAcc.slice(0, findIndex + 1),
          {
            inn: item.inn,
            altOrder:
              currentOnbaseAcc[findIndex].order ||
              currentOnbaseAcc[findIndex].altOrder,
            original: candidate[ii],
            name,
            r,
            out,
            content: 'PR',
          },
          ...currentOnbaseAcc.slice(findIndex + 1),
        ];
      } else {
        return currentOnbaseAcc;
      }
    }, recordsAcc);
  }, records);
  let startOrder = 0;
  records.some((item, i, self) => {
    if (item.break) {
      startOrder = item.order - 1;
      return true;
    }
    if (self.findIndex(player => player.name === item.name) < i) {
      startOrder = i;
      return true;
    }
    if (i === self.length - 1) {
      startOrder = self.length;
    }
  });

  const displayGame_ = (recordsWithAltRun_, records_) => {
    return recordsWithAltRun_.reduce(
      (recordsWithAltRunAcc, item, i, self) => {
        const {
          arr,
          prevInn,
          isSetNewContent,
          isForcedMode,
        } = recordsWithAltRunAcc;
        const order = !item.order
          ? arr.filter(
              s => !s.altOrder && s.content !== 'FR', // 非代打 非突破僵局跑者
            ).length + 1
          : item.order;

        const find = arr.find(sub => sub.name === item.name);
        const findIndex = arr.indexOf(find);
        const canPushPlayer =
          !find &&
          !item.break &&
          !['PR', 'FR'].includes(item.content) &&
          !item.altOrder;
        const shouldSetInnChange = item.inn !== prevInn;
        const shouldSetNewContent =
          role === 'manager' && !item.content && !isSetNewContent;
        const { r, out } = checkRunOut(self, i, item);
        const { name, inn, rbi, location, onbase, video } = item;
        const newItem = {
          name,
          inn,
          order: shouldSetNewContent
            ? Math.max(...self.map(({ order }) => order).filter(Boolean), 0) + 1
            : order,
          content: shouldSetNewContent ? 'new' : item.content,
          rbi,
          r,
          out,
          location,
          onbase,
          video,
          color: formatColor(item.content),
          // 換局
          ...(shouldSetInnChange && {
            innChange: item.inn,
          }),
        };

        const alt = arr
          .map(
            sub =>
              (sub.altOrder &&
                sub.altOrder === (order % startOrder || startOrder)) ||
              sub.order === (order % startOrder || startOrder),
          )
          .lastIndexOf(true);
        const altR = arr
          .map(
            sub =>
              (sub.altOrder &&
                sub.altOrder ===
                  (item.altOrder % startOrder || item.altOrder)) ||
              sub.order === (item.altOrder % startOrder || item.altOrder) ||
              sub.order % startOrder === item.altOrder % startOrder,
          )
          .lastIndexOf(true);
        const shouldSetAltBatter =
          !find && alt > -1 && !['PR', 'FR'].includes(item.content);
        const shouldSetAltRunner =
          !find && altR > -1 && ['PR', 'FR'].includes(item.content);
        const shouldSetLegacyAltRunner = r && r !== item.name && alt > -1;
        const isLast = i === self.length - 1;
        const order_ = !item.order ? item.altOrder || i + 1 : item.order;
        const midLen = Math.ceil(order_ / startOrder - 1);
        if (['吳秉璋', '王建鈞'].includes(item.name)) {
          // console.log('name', item, order, arr, arr
          //   .map(
          //     sub =>
          //       (sub.altOrder &&
          //         sub.altOrder ===
          //           (item.altOrder % startOrder || item.altOrder)) ||
          //       sub.order === (item.altOrder % startOrder || item.altOrder) ||
          //       sub.order % startOrder === item.altOrder % startOrder,
          //   ));
          // console.log('canPushPlayer', canPushPlayer)
          // console.log('shouldSetAltBatter', shouldSetAltBatter)
          // console.log('shouldSetAltRunner', shouldSetAltRunner)
        }
        const result = {
          ...recordsWithAltRunAcc,
          prevInn: item.inn,
          // 第一輪加入球員
          ...(canPushPlayer && {
            arr: [
              ...arr,
              {
                name: item.name,
                data: (
                  players.find(sub => sub.id === item.name) || { data: {} }
                ).data,
                order,
                content: [newItem],
                queue: [item.name],
              },
            ],
          }),
          // 第二輪找到原本球員並加入打擊內容
          ...(find && {
            arr: [
              ...arr.slice(0, findIndex),
              {
                ...find,
                /*
                 * https://stackoverflow.com/questions/34559918/spread-syntax-es6
                 * Array.prototype.concat will preserve the empty slots in the array
                 * while the Spread will replace them with undefined values.
                 */
                content: find.content.concat(
                  Array(
                    ['FR', 'new', undefined].includes(newItem.content)
                      ? 0
                      : Math.max(midLen - find.content.length, 0),
                  ),
                  newItem,
                ),
                queue: [
                  ...(find.queue || []),
                  item.name,
                  ...(shouldSetLegacyAltRunner ? [r] : []),
                ],
              },
              // 舊代跑
              ...(shouldSetLegacyAltRunner
                ? [
                    {
                      name: r,
                      data: (players.find(sub => sub.id === r) || { data: {} })
                        .data,
                      order,
                      altOrder: item.order % startOrder || startOrder,
                      content: Array(midLen).concat({
                        inn: item.inn,
                        name: r,
                        order,
                        r,
                        color: 'gray',
                        content: 'PR',
                      }),
                    },
                  ]
                : []),
              ...arr.slice(findIndex + 1),
            ],
          }),
          // 代打
          ...(shouldSetAltBatter && {
            arr: [
              ...arr.slice(0, alt + 1),
              {
                name: item.name,
                data: (
                  players.find(sub => sub.id === item.name) || { data: {} }
                ).data,
                order,
                altOrder: order % startOrder || startOrder,
                content: Array(midLen).concat(newItem),
              },
              ...arr.slice(alt + 1),
            ].map(row => ({
              ...row,
              ...(row.order === (order % startOrder || startOrder)
                ? {
                    queue: [...(row.queue || []), item.name],
                  }
                : undefined),
            })),
          }),
          // 代跑
          ...(shouldSetAltRunner && {
            arr: [
              ...arr.slice(0, altR + 1),
              {
                name: item.name,
                data: (
                  players.find(sub => sub.id === item.name) || { data: {} }
                ).data,
                altOrder: item.altOrder % startOrder || item.altOrder,
                content: Array(midLen).concat({
                  inn: item.inn,
                  name: item.name,
                  r: item.r,
                  color: 'gray',
                  content: item.content,
                  // 換局
                  ...(shouldSetInnChange && {
                    innChange: item.inn,
                  }),
                }),
              },
              ...arr.slice(altR + 1),
            ].map(row => ({
              ...row,
              ...(row.order === (item.altOrder % startOrder || item.altOrder)
                ? {
                    queue: [...(row.queue || []), item.name],
                  }
                : undefined),
            })),
          }),
          // 設定第一個內容為空的球員 打擊內容為 new
          ...(shouldSetNewContent && {
            isSetNewContent: true,
          }),
          isForcedMode: isForcedMode || Boolean(item.isForcedMode),
        };
        if (isLast) {
          /*
           * 最後一round
           * 加header & start order
           * 修正所有content array長度
           * h / ab
           * 失誤總數
           */
          const { arr, isSetNewContent, isForcedMode } = result;
          let header = Array(20)
            .fill(undefined)
            .reduce((acc, item, i) => {
              if (i) {
                return [
                  ...acc,
                  ...Array(
                    Math.ceil(
                      (records_.filter(record => record.inn === i).length +
                        (i === (records_[records_.length - 1] || {}).inn &&
                        role === 'manager'
                          ? 1
                          : 0)) /
                        startOrder,
                    ),
                  )
                    .fill(undefined)
                    .map(() => i),
                ];
              }
              return acc;
            }, []);
          if (header.length === 0 && role === 'manager') {
            header = [1];
          }
          const rows = arr.map(sub => {
            const { ab, h, BB, HR, locations } = sub.content.reduce(
              ({ ab, h, BB, HR, locations }, item) => ({
                ab:
                  ab +
                  ([
                    '1H',
                    '2H',
                    '3H',
                    'HR',
                    'FO',
                    'GO',
                    'K',
                    'FOUL',
                    'E',
                    'FC',
                    'DP',
                    'TP',
                  ].includes(item.content)
                    ? 1
                    : 0),
                h:
                  h + (['1H', '2H', '3H', 'HR'].includes(item.content) ? 1 : 0),
                BB: BB + (item.content === 'BB' ? 1 : 0),
                HR: HR + (item.content === 'HR' ? 1 : 0),
                locations:
                  item.location && item.location.x
                    ? [
                        ...locations,
                        {
                          x: item.location.x,
                          y: item.location.y,
                          location: item.location.location,
                          color: formatColor(item.content),
                          borderColor:
                            item.content === 'HR' ? 'white' : 'black',
                        },
                      ]
                    : locations,
              }),
              { ab: 0, h: 0, BB: 0, HR: 0, locations: [] },
            );
            const preBatter =
              self.find(s => s.order === item.order - startOrder + 1) ||
              self[self.length - startOrder];
            const newBatter =
              preBatter.r && preBatter.name !== preBatter.r
                ? preBatter.r
                : arr.some(
                    r =>
                      r.altOrder ===
                      (preBatter.order % startOrder || preBatter.order),
                  )
                ? arr
                    .filter(
                      r =>
                        r.altOrder ===
                        (preBatter.order % startOrder || preBatter.order),
                    )
                    .reverse()[0].name
                : preBatter.name;
            const shouldSetLastNew =
              role === 'manager' && sub.name === newBatter;
            const newContent =
              !isSetNewContent && shouldSetLastNew
                ? [
                    ...sub.content,
                    {
                      content: 'new',
                      name: newBatter,
                      inn: self[self.length - 1].inn,
                    },
                  ]
                : sub.content;
            const newContent_ = [...newContent];
            return {
              ...sub,
              content: newContent_,
              contentNormal: header.reduce((acc, inn, i, self) => {
                const filter = newContent.filter(sub => sub && sub.inn === inn);
                const hasPrev = newContent.some(sub => sub && sub.inn < inn);
                const arr = [];
                arr.length = 1;
                if (i && self[i - 1] === inn) {
                  if (filter.length > 1) {
                    return acc;
                  } else {
                    return acc.concat(arr);
                  }
                } else if (filter.length) {
                  return acc.concat(filter);
                } else {
                  if (role === 'manager' && i === self.length - 1 && !hasPrev) {
                    return acc.concat(newContent.filter(sub => sub));
                  } else {
                    return acc.concat(arr);
                  }
                }
              }, []),
              summary: `${ab}-${h}`,
              error: errors.some(e => e.hasOwnProperty('count'))
                ? (errors.find(({ name }) => name === sub.name) || {}).count
                : errors.filter(({ name }) => name === sub.name).length,
              /* for group summary */
              AB: ab,
              H: h,
              BB,
              HR,
              locations,
            };
          });

          let maxLen = 0;
          rows.forEach(({ content }) => {
            const contentLen = (content || []).length;
            if (contentLen > maxLen) {
              maxLen = contentLen;
            }
          });

          return [
            [...header, startOrder],
            ...rows.map(({ content, contentNormal, ...rest }) => {
              const newContent_ = [...content];
              newContent_.length = maxLen;
              return {
                ...rest,
                contentNormal,
                content: isForcedMode ? contentNormal : newContent_,
              };
            }),
          ];
        } else {
          return result;
        }
      },
      {
        arr: [],
        prevInn: 0,
        isSetNewContent: false,
        isForcedMode: false,
      },
    );
  };

  const displayedRecords = displayGame_(recordsWithAltRun, records);
  return displayedRecords;
};

const execGenStatistics = state => {
  const t0 = performance.now();
  const result = genStatistics(
    state.players,
    state.records,
    state.unlimitedPA ? undefined : state.top,
    (state.period.find(item => item.select).games || []).filter(
      g => !(state.excludedGames || []).includes(g),
    ),
  )
    .filter(
      item => item.PA !== '-' && (state.unlimitedPA || item.PA === state.top),
    )
    .sort((a, b) => {
      if (typeof a[state.sortBy] < typeof b[state.sortBy]) {
        return -1;
      }
      if (
        ['AVG', 'OBP', 'SLG', 'OPS', 'AVG_NO', 'AVG_SP', 'AVG_FB'].includes(
          state.sortBy,
        )
      ) {
        return b[state.sortBy] === a[state.sortBy]
          ? b['PA'] - a['PA']
          : b[state.sortBy] - a[state.sortBy];
      } else if (state.sortBy === 'LEVEL') {
        return b[state.sortBy] === a[state.sortBy]
          ? b['PA'] - a['PA']
          : b[state.sortBy].localeCompare(a[state.sortBy]);
      } else {
        if (b[state.sortBy] === 0 && a[state.sortBy] === 0) {
          return b['PA'] - a['PA'];
        } else {
          return b[state.sortBy] === a[state.sortBy]
            ? a['PA'] - b['PA']
            : b[state.sortBy] - a[state.sortBy];
        }
      }
    });
  const t1 = performance.now();
  console.log(`[perf] execGenStatistics cost: ${(t1 - t0).toFixed(2)} ms`);
  return result;
};

const execGenPitcherStatistics = state => {
  const t0 = performance.now();
  const result = genPitcherStatistics(
    state.players,
    state.games,
    (state.period.find(item => item.select).games || []).filter(
      g => !(state.excludedGames || []).includes(g),
    ),
    state.pitcherInn,
  ).sort((a, b) => {
    if (b[state.sortBy] === '-' && a[state.sortBy] !== '-') {
      return -1;
    }
    if (b[state.sortBy] === 0 && a[state.sortBy] === 0) {
      return b['IP'] - a['IP'];
    }
    if (
      ['L', 'ERA', 'WHIP', 'PIP', 'H', 'R', 'BB', 'BB7', 'H7'].includes(
        state.sortBy,
      )
    ) {
      // small to large
      return b[state.sortBy] === a[state.sortBy]
        ? b['IP'] - a['IP']
        : a[state.sortBy] - b[state.sortBy];
    } else {
      return b[state.sortBy] === a[state.sortBy]
        ? a['IP'] - b['IP']
        : b[state.sortBy] - a[state.sortBy];
    }
  });
  const t1 = performance.now();
  console.log(
    `[perf] execGenPitcherStatistics cost: ${(t1 - t0).toFixed(2)} ms`,
  );
  return result;
};

const execItemStats = state => {
  const t0 = performance.now();
  const currentPlayers = new Set(state.players.map(p => p.id));
  const playerMap = new Map(state.players.map(p => [p.id, p]));
  const games = (state.period.find(item => item.select).games || []).filter(
    g => !(state.excludedGames || []).includes(g),
  );
  const gamesSet = new Set(games);
  const minimunPA = games.length * 1.6;
  const records = genStatistics(state.players, state.records, undefined, games);
  const recordMap = new Map(records.map(r => [r.name, r]));
  const winCount = {};
  const gwrbiCount = {};
  const mvpCount = {};

  state.games.forEach(item => {
    if (gamesSet.has(item.game) && item.result === 'win' && item.pitcher) {
      const pitcher = Array.isArray(item.pitcher)
        ? item.pitcher[0]
        : item.pitcher;
      winCount[pitcher] = (winCount[pitcher] || 0) + 1;
    }
    if (
      gamesSet.has(item.game) &&
      item.result === 'win' &&
      Array.isArray(item.gwrbi) &&
      item.gwrbi[0]
    ) {
      const batter = item.gwrbi[0];
      gwrbiCount[batter] = (gwrbiCount[batter] || 0) + 1;
    }
    if (gamesSet.has(item.game) && item.mvp && currentPlayers.has(item.mvp)) {
      mvpCount[item.mvp] = (mvpCount[item.mvp] || 0) + 1;
    }
  });

  const pitcherGames = state.games.filter(
    item =>
      gamesSet.has(item.game) &&
      Array.isArray(item.pitchers) &&
      item.pitchers.length,
  );
  const minimunOut = pitcherGames.length * 3;
  const pitcherSet = pitcherGames
    .map(item => item.pitchers)
    .flat()
    .reduce((acc, p) => {
      const samePlayer = acc[p.name] || {
        BB: 0,
        H: 0,
        OUT: 0,
        R: 0,
        SO: 0,
      };
      const { BB, H, OUT, R, SO } = {
        BB: samePlayer.BB + sumByInn(p.BB),
        H: samePlayer.H + sumByInn(p.H),
        OUT: samePlayer.OUT + sumByInn(p.OUT),
        R: samePlayer.R + sumByInn(p.R),
        SO: samePlayer.SO + sumByInn(p.SO),
      };
      const { ERA, WHIP } = accCalc(
        [],
        [
          {
            BB: [BB],
            H: [H],
            OUT: [OUT],
            R: [R],
          },
        ],
        0,
        state.pitcherInn,
      );
      return {
        ...acc,
        [p.name]: {
          BB,
          H,
          OUT,
          R,
          SO,
          ERA,
          WHIP,
        },
      };
    }, {});
  const pitchers = Object.keys(pitcherSet)
    .filter(name => currentPlayers.has(name))
    .map(name => ({
      ...pitcherSet[name],
      name,
    }));
  const result = {
    AVG: records
      .filter(item => item.PA !== '-' && item.AVG > 0 && item.PA >= minimunPA)
      .sort((a, b) =>
        b['AVG'] === a['AVG'] ? b['PA'] - a['PA'] : b['AVG'] - a['AVG'],
      )
      .map(item => ({
        name: item.name,
        PA: item.PA,
        AVG: item.AVG.toFixed(3),
        data: item.data,
      })),
    H: records
      .filter(item => item.PA !== '-' && item.H > 0)
      .sort((a, b) => (b['H'] === a['H'] ? a['PA'] - b['PA'] : b['H'] - a['H']))
      .map(item => ({
        name: item.name,
        PA: item.PA,
        H: item.H,
        data: item.data,
      })),
    HR: records
      .filter(item => item.PA !== '-' && item.HR > 0)
      .sort((a, b) =>
        b['HR'] === a['HR'] ? a['PA'] - b['PA'] : b['HR'] - a['HR'],
      )
      .map(item => ({
        name: item.name,
        PA: item.PA,
        HR: item.HR,
        data: item.data,
      })),
    RBI: records
      .filter(item => item.PA !== '-' && item.RBI > 0)
      .sort((a, b) =>
        b['RBI'] === a['RBI'] ? a['PA'] - b['PA'] : b['RBI'] - a['RBI'],
      )
      .map(item => ({
        name: item.name,
        PA: item.PA,
        RBI: item.RBI,
        data: item.data,
      })),
    W: Object.entries(winCount)
      .filter(([pitcher]) => currentPlayers.has(pitcher))
      .map(([pitcher, W]) => ({
        pitcher,
        W,
        OUT: (pitcherSet[pitcher] || { OUT: 0 }).OUT,
      }))
      .sort((a, b) => (b.W === a.W ? a.OUT - b.OUT : b.W - a.W))
      .map(item => ({
        name: item.pitcher,
        W: item.W,
        data: (playerMap.get(item.pitcher) || { data: {} }).data,
      })),
    SO: pitchers
      .filter(item => item.SO > 0)
      .sort((a, b) =>
        b['SO'] === a['SO'] ? a['OUT'] - b['OUT'] : b['SO'] - a['SO'],
      )
      .map(item => ({
        name: item.name,
        SO: item.SO,
        data: (
          state.players.find(player => player.id === item.name) || { data: {} }
        ).data,
      })),
    ERA: pitchers
      .filter(item => !['', '∞'].includes(item.ERA) && item.OUT >= minimunOut)
      .sort((a, b) =>
        b['ERA'] === a['ERA'] ? b['OUT'] - a['OUT'] : a['ERA'] - b['ERA'],
      )
      .map(item => ({
        name: item.name,
        ERA: item.ERA,
        data: (
          state.players.find(player => player.id === item.name) || { data: {} }
        ).data,
      })),
    WHIP: pitchers
      .filter(item => item.WHIP !== '-' && item.OUT >= minimunOut)
      .sort((a, b) =>
        b['WHIP'] === a['WHIP'] ? b['OUT'] - a['OUT'] : a['WHIP'] - b['WHIP'],
      )
      .map(item => ({
        name: item.name,
        WHIP: item.WHIP,
        data: (
          state.players.find(player => player.id === item.name) || { data: {} }
        ).data,
      })),
    GWRBI: Object.entries(gwrbiCount)
      .filter(([batter]) => currentPlayers.has(batter))
      .map(([batter, GWRBI]) => ({
        batter,
        GWRBI,
        PA: (recordMap.get(batter) || { PA: 0 }).PA,
      }))
      .sort((a, b) => (b.GWRBI === a.GWRBI ? a.PA - b.PA : b.GWRBI - a.GWRBI))
      .map(item => ({
        name: item.batter,
        GWRBI: item.GWRBI,
        data: (playerMap.get(item.batter) || { data: {} }).data,
      })),
    MVP: Object.entries(mvpCount)
      .map(([mvp, MVP]) => ({
        mvp,
        MVP,
        PA: (recordMap.get(mvp) || { PA: 0 }).PA,
      }))
      .sort((a, b) => (b.MVP === a.MVP ? a.PA - b.PA : b.MVP - a.MVP))
      .map(item => ({
        name: item.mvp,
        MVP: item.MVP,
        data: (playerMap.get(item.mvp) || { data: {} }).data,
      })),

    pitcherGameCount: pitcherGames.length,
  };
  const t1 = performance.now();
  console.log(`[perf] execItemStats cost: ${(t1 - t0).toFixed(2)} ms`);
  return result;
};

const execBox = state => {
  const t0 = performance.now();
  const boxSummary =
    state.games.length &&
    state.game &&
    state.games.find(item => item.game === state.game);
  const result = displayGame(
    state.players,
    state.records.filter(item => item._table === state.game),
    boxSummary.errors,
    state.role,
  );
  const t1 = performance.now();
  console.log(`[perf] execBox cost: ${(t1 - t0).toFixed(2)} ms`);
  return result;
};

self.addEventListener(
  'message',
  e => {
    const data = e.data;
    switch (data.cmd) {
      case 'GenStatistics':
        self.postMessage(execGenStatistics(data));
        break;
      case 'GenPitcherStatistics':
        self.postMessage(execGenPitcherStatistics(data));
        break;
      case 'ItemStats':
        self.postMessage(execItemStats(data));
        break;
      case 'Box':
        self.postMessage(execBox(data));
        break;
    }
  },
  false,
);
