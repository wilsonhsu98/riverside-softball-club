const formatColor = content => {
  if (['1H', '2H', '3H', 'HR'].includes(content)) {
    return 'red';
  }
  if (['BB', 'SF'].includes(content)) {
    return 'yellow';
  }
  if (content === 'UNKNOWN') {
    return 'gray';
  }
  return 'blue';
};
const sumByInn = (scores = [], inn = scores.length) =>
  scores.slice(0, inn).reduce((acc, v) => acc + (parseInt(v) || 0), 0);
const accCalc = (beforePitchers = [], pitchers = [], currentIndex) => {
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
    ERA: OUT === 0 ? (R === 0 ? '-' : '∞') : ((R * 7) / (OUT / 3)).toFixed(2),
    WHIP: OUT === 0 ? '-' : ((H + BB) / (OUT / 3)).toFixed(2),
    PIP: OUT === 0 ? '-' : ((S + B) / (OUT / 3)).toFixed(2),
    K7: OUT === 0 ? '-' : ((SO * 7) / (OUT / 3)).toFixed(2),
    BB7: OUT === 0 ? '-' : ((BB * 7) / (OUT / 3)).toFixed(2),
    H7: OUT === 0 ? '-' : ((H * 7) / (OUT / 3)).toFixed(2),
  };
};

const genStatistics = (players, records, filterPA, filterGames = []) => {
  // filterPA = filterPA || 10;
  const sortRecords = [...records].sort((a, b) => {
    return (
      parseInt(
        (b._table.match(/\d/g) || [b._table]).join('') + (b.order + 10),
        10,
      ) -
      parseInt(
        (a._table.match(/\d/g) || [a._table]).join('') + (a.order + 10),
        10,
      )
    );
  });
  const filterGamesRecords = sortRecords.filter(item =>
    filterGames.includes(item._table),
  );

  return players.map(player => {
    const name = player.id;

    const top = filterGamesRecords
      .filter(
        item =>
          item.name === name && item.content && item.content !== 'UNKNOWN',
      )
      .slice(0, filterPA)
      .map(item => {
        const onbase = (() => {
          const next5 = filterGamesRecords
            .filter(sub => sub._table === item._table)
            .reverse()
            .slice(item.order - 1, item.order - 1 + 5)
            .map(sub => sub.onbase)
            .reduce((acc, sub) => acc.concat(sub), []);
          return {
            r: next5.find(
              sub => sub && sub.name === item.name && sub.result === 'run',
            )
              ? item.name
              : '',
          };
        })();

        return {
          ...item,
          r: item.r || onbase.r,
        };
      });

    let limit = 1;
    const games = top
      .map(item => item._table)
      .filter((v, i, self) => self.indexOf(v) === i)
      .map(game => {
        return filterGamesRecords
          .filter(
            item =>
              item._table === game &&
              item.name === name &&
              item.content !== 'UNKNOWN',
          )
          .map(item => {
            return {
              name: item.name,
              content: item.content,
              order: item.order,
              exclude: limit++ > filterPA,
              color: formatColor(item.content),
            };
          })
          .concat(game.slice(-6));
      });
    const calc = top.reduce(
      (acc, item) => {
        const isAB = [
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
        ].includes(item.content);
        const isHit = ['1H', '2H', '3H', 'HR'].includes(item.content);
        return {
          pa: acc.pa + 1,
          ab: acc.ab + (isAB ? 1 : 0),
          h: acc.h + (isHit ? 1 : 0),
          ...(Array.isArray(item.onbase) && item.onbase.length && isAB
            ? {
                abNo:
                  acc.abNo +
                  (!item.onbase[1].name &&
                  !item.onbase[2].name &&
                  !item.onbase[3].name
                    ? 1
                    : 0),
                hNo:
                  acc.hNo +
                  (!item.onbase[1].name &&
                  !item.onbase[2].name &&
                  !item.onbase[3].name &&
                  isHit
                    ? 1
                    : 0),
                abSP:
                  acc.abSP +
                  (item.onbase[2].name || item.onbase[3].name ? 1 : 0),
                hSP:
                  acc.hSP +
                  ((item.onbase[2].name || item.onbase[3].name) && isHit
                    ? 1
                    : 0),
                abFB:
                  acc.abFB +
                  (item.onbase[1].name &&
                  item.onbase[2].name &&
                  item.onbase[3].name
                    ? 1
                    : 0),
                hFB:
                  acc.hFB +
                  (item.onbase[1].name &&
                  item.onbase[2].name &&
                  item.onbase[3].name &&
                  isHit
                    ? 1
                    : 0),
              }
            : {
                abNo: acc.abNo,
                hNo: acc.hNo,
                abSP: acc.abSP,
                hSP: acc.hSP,
                abFB: acc.abFB,
                hFB: acc.hFB,
              }),
          tb: acc.tb + (['1H', '2H', '3H', 'HR'].indexOf(item.content) + 1),
          tob:
            acc.tob +
            (['1H', '2H', '3H', 'HR', 'BB'].includes(item.content) ? 1 : 0),
          rbi: acc.rbi + (item.rbi || 0),
          h1: acc.h1 + (item.content === '1H' ? 1 : 0),
          h2: acc.h2 + (item.content === '2H' ? 1 : 0),
          h3: acc.h3 + (item.content === '3H' ? 1 : 0),
          hr: acc.hr + (item.content === 'HR' ? 1 : 0),
          k: acc.k + (item.content === 'K' ? 1 : 0),
          bb: acc.bb + (item.content === 'BB' ? 1 : 0),
          sf: acc.sf + (item.content === 'SF' ? 1 : 0),
          dp: acc.dp + (item.content === 'DP' ? 1 : 0),
          r: acc.r + (filterPA && item.r === item.name ? 1 : 0),
        };
      },
      {
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
        r:
          filterPA === undefined
            ? filterGamesRecords.filter(item => {
                return (
                  item.r === name ||
                  (Array.isArray(item.onbase) &&
                    item.onbase.some(
                      sub => sub && sub.name === name && sub.result === 'run',
                    ))
                );
              }).length
            : 0,
      },
    );
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
};

const genPitcherStatistics = (players, games, filterGames = []) => {
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
        pitchers: acc.pitchers.includes(g.pitcher)
          ? acc.pitchers
          : g.pitcher
          ? [...acc.pitchers, g.pitcher]
          : acc.pitchers,
        records: [
          ...acc.records,
          ...(Array.isArray(g.pitchers) ? g.pitchers : []),
        ],
      };
    },
    { pitchers: [], records: [] },
  );
  return pitchers.map(name => {
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
    );
    return {
      name,
      data: (players.find(sub => sub.id === name) || { data: {} }).data,
      OUT,
      S,
      B,
      W: alltime.filter(g => g.pitcher === name && g.result === 'win').length,
      L: alltime.filter(g => g.pitcher === name && g.result === 'lose').length,
      ERA,
      G:
        current.filter(g => g.pitchers.some(p => p.name === name)).length +
        legacy.filter(g => g.pitcher === name).length,
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
            GS: current.filter(g => (g.pitchers[0] || {}).name === name).length,
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
};

const displayGame = (players, records, errors = [], role) => {
  const insertAfter = (arr, name, newItem, startOrder) => {
    const firstFind = arr.find(sub => sub.name === name);
    const findAlt = arr.find(sub => sub.name === newItem.name);
    if (firstFind && !findAlt) {
      const find =
        firstFind.altOrder && !firstFind.order
          ? arr.find(sub => sub.order === firstFind.altOrder)
          : firstFind;
      const findIndex = arr.indexOf(find);
      const altOrder = find.order % startOrder || startOrder || find.order;
      const temp = [
        ...arr.slice(0, findIndex),
        {
          ...find,
          altRunners: [
            ...(find.altRunners || []),
            {
              ...newItem,
              altOrder,
            },
          ],
          queue: [...find.queue, newItem.name],
        },
        ...arr.slice(findIndex + 1),
      ];
      return [
        ...temp.filter(t => t.order < altOrder || t.altOrder < altOrder),
        temp.find(t => t.order === altOrder || t.altOrder === altOrder),
        ...temp.find(t => t.order === altOrder || t.altOrder === altOrder)
          .altRunners,
        ...temp.filter(t => t.order > altOrder || t.altOrder > altOrder),
      ];
    }
    return arr;
  };
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
  const assumedOrder = 12;
  return records.reduce(
    (acc, item, i, self) => {
      const { arr, startOrder: prevStartOrder, prevInn, isSetNewContent } = acc;
      const order = !item.order ? i + 1 : item.order;
      const startOrder = item.break ? order - 1 : prevStartOrder;

      const find = arr.find(sub => sub.name === item.name);
      const findIndex = arr.indexOf(find);
      const canPushPlayer = !find && startOrder === 0 && !item.break;
      const shouldSetStartOrder = (find && startOrder === 0) || item.break;
      const shouldSetInnChange = item.inn !== prevInn;
      const shouldSetNewContent =
        role === 'manager' && !item.content && !isSetNewContent;

      const { r, out } = checkRunOut(self, i, item);
      const { name, inn, rbi, location, onbase, video } = item;
      const newItem = {
        name,
        inn,
        order,
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
      const shouldSetAltBatter = !find && alt > -1;
      const shouldSetLegacyAltRunner = r && r !== item.name && alt > -1;
      const isLast = i === self.length - 1;
      const midLen = Math.ceil(order / (startOrder || assumedOrder) - 1);

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
        .reverse()
        .concat(shouldSetLegacyAltRunner ? [r] : []);
      const candidate = prev5name.filter(n => !prev5outOrRun.includes(n));
      const altRunners = currentOnbase.reduce((acc, name, ii) => {
        if (candidate.includes(name)) {
          return acc;
        }
        const { r, out } = checkRunOut(self, i, { name, inn: item.inn });
        return [
          ...acc,
          {
            original: shouldSetLegacyAltRunner ? item.name : candidate[ii],
            alt: {
              name,
              data: (players.find(sub => sub.id === name) || { data: {} }).data,
              content: Array(midLen).concat({
                inn: item.inn,
                name,
                r: shouldSetLegacyAltRunner ? name : r,
                out,
                order,
                color: 'gray',
                content: 'PR',
              }),
            },
          },
        ];
      }, []);
      const result = {
        ...acc,
        prevInn: item.inn,
        // 第一輪加入球員
        ...(canPushPlayer && {
          arr: altRunners.reduce(
            (acc, runner) => {
              return insertAfter(acc, runner.original, runner.alt, startOrder);
            },
            [
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
          ),
        }),
        // 第二輪找到原本球員並加入打擊內容
        ...(find && {
          arr: altRunners.reduce(
            (acc, runner) => {
              return insertAfter(acc, runner.original, runner.alt, startOrder);
            },
            [
              ...arr.slice(0, findIndex),
              {
                ...find,
                /*
                 * https://stackoverflow.com/questions/34559918/spread-syntax-es6
                 * Array.prototype.concat will preserve the empty slots in the array
                 * while the Spread will replace them with undefined values.
                 */
                content: find.content.concat(
                  Array(Math.max(midLen - find.content.length, 0)),
                  newItem,
                ),
                queue: [...(find.queue || []), item.name],
              },
              ...arr.slice(findIndex + 1),
            ],
          ),
        }),
        // 代打
        ...(shouldSetAltBatter && {
          arr: insertAfter(
            arr,
            (
              arr.find(
                sub => sub.order === (order % startOrder || startOrder),
              ) || {}
            ).name,
            {
              name: item.name,
              data: (players.find(sub => sub.id === item.name) || { data: {} })
                .data,
              content: Array(midLen).concat(newItem),
            },
            startOrder,
          ),
        }),
        // 一輪有幾棒
        ...(shouldSetStartOrder && {
          startOrder: item.break ? order - 1 : order - find.order,
        }),
        // 設定第一個內容為空的球員 打擊內容為 new
        ...(shouldSetNewContent && {
          isSetNewContent: true,
        }),
      };

      if (isLast) {
        /*
         * 最後一round
         * 取得單場最多次打席數
         * 加header & start order
         * 修正所有content array長度至最多打席數
         * h / ab
         * 失誤總數
         */
        const { arr, startOrder: prevStartOrder, isSetNewContent } = result;
        const startOrder = item.break ? order - 1 : prevStartOrder;
        const paMax =
          Math.ceil(self.length / (startOrder || self.length)) +
          (self.length % (startOrder || self.length) === 0 && role === 'manager'
            ? 1
            : 0);
        const header = Array(20)
          .fill(undefined)
          .reduce((acc, item, i) => {
            if (startOrder === 0) {
              const inns = records
                .filter(record => record.inn)
                .map(record => record.inn);
              const maxInn = inns.length ? Math.max(...inns) : 1;
              return Array.apply(null, Array(maxInn)).map(
                (undefined, i) => i + 1,
              );
            }
            if (i) {
              return [
                ...acc,
                ...Array(
                  Math.ceil(
                    (records.filter(record => record.inn === i).length +
                      (i === (records[records.length - 1] || {}).inn &&
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

        return [
          [...header, startOrder],
          ...arr.map(sub => {
            const { ab, h } = sub.content.reduce(
              ({ ab, h }, item) => ({
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
              }),
              { ab: 0, h: 0 },
            );
            const preBatter = self[self.length - (startOrder || self.length)];
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

            newContent.length = paMax || 1;
            return {
              ...sub,
              content: newContent,
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
                  if (
                    role === 'manager' &&
                    startOrder === 0 &&
                    i === self.length - 1 &&
                    !hasPrev
                  ) {
                    return acc.concat(newContent);
                  } else {
                    return acc.concat(arr);
                  }
                }
              }, []),
              summary: `${ab}-${h}`,
              error: (errors.find(({ name }) => name === sub.name) || {}).count,
            };
          }),
        ];
      } else {
        return result;
      }
    },
    {
      arr: [],
      startOrder: 0,
      prevInn: 0,
      isSetNewContent: false,
    },
  );
};

const execGenStatistics = state => {
  return genStatistics(
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
};

const execGenPitcherStatistics = state => {
  return genPitcherStatistics(
    state.players,
    state.games,
    (state.period.find(item => item.select).games || []).filter(
      g => !(state.excludedGames || []).includes(g),
    ),
  ).sort((a, b) => {
    if (b[state.sortBy] === '-' && a[state.sortBy] !== '-') {
      return -1;
    }
    if (['ERAA'].includes(state.sortBy)) {
      return b[state.sortBy] === a[state.sortBy]
        ? b['IP'] - a['IP']
        : b[state.sortBy] - a[state.sortBy];
    } else if (['ERA', 'WHIP', 'BB7', 'H7'].includes(state.sortBy)) {
      return b[state.sortBy] === a[state.sortBy]
        ? b['IP'] - a['IP']
        : a[state.sortBy] - b[state.sortBy];
    } else {
      if (b[state.sortBy] === 0 && a[state.sortBy] === 0) {
        return b['IP'] - a['IP'];
      } else {
        return b[state.sortBy] === a[state.sortBy]
          ? a['IP'] - b['IP']
          : b[state.sortBy] - a[state.sortBy];
      }
    }
  });
};

const execItemStats = state => {
  const games = (state.period.find(item => item.select).games || []).filter(
    g => !(state.excludedGames || []).includes(g),
  );
  const minimunPA = games.length * 1.6;
  const records = genStatistics(state.players, state.records, undefined, games);

  const pitcherGames = state.games.filter(
    item =>
      games.includes(item.game) &&
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
  const pitchers = Object.keys(pitcherSet).map(name => ({
    ...pitcherSet[name],
    name,
  }));
  return {
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
    W: state.games
      .filter(
        item =>
          games.includes(item.game) && item.result === 'win' && item.pitcher,
      )
      .map(item => item.pitcher)
      .reduce((acc, pitcher, undefined, self) => {
        if (!acc.find(player => player.pitcher === pitcher)) {
          return [
            ...acc,
            {
              pitcher,
              OUT: (pitcherSet[pitcher] || { OUT: 0 }).OUT,
              W: self.filter(player => player === pitcher).length,
            },
          ];
        }
        return acc;
      }, [])
      .sort((a, b) =>
        b['W'] === a['W'] ? a['OUT'] - b['OUT'] : b['W'] - a['W'],
      )
      .map(item => ({
        name: item.pitcher,
        W: item.W,
        data: (state.players.find(player => player.id === item.pitcher) || {})
          .data,
      })),
    SO: pitchers
      .filter(item => item.SO > 0)
      .sort((a, b) =>
        b['SO'] === a['SO'] ? a['OUT'] - b['OUT'] : b['SO'] - a['SO'],
      )
      .map(item => ({
        name: item.name,
        SO: item.SO,
        data: (state.players.find(player => player.id === item.name) || {})
          .data,
      })),
    ERA: pitchers
      .filter(item => !['', '∞'].includes(item.ERA) && item.OUT >= minimunOut)
      .sort((a, b) =>
        b['ERA'] === a['ERA'] ? b['OUT'] - a['OUT'] : a['ERA'] - b['ERA'],
      )
      .map(item => ({
        name: item.name,
        ERA: item.ERA,
        data: (state.players.find(player => player.id === item.name) || {})
          .data,
      })),
    WHIP: pitchers
      .filter(item => item.WHIP !== '-' && item.OUT >= minimunOut)
      .sort((a, b) =>
        b['WHIP'] === a['WHIP'] ? b['OUT'] - a['OUT'] : a['WHIP'] - b['WHIP'],
      )
      .map(item => ({
        name: item.name,
        WHIP: item.WHIP,
        data: (state.players.find(player => player.id === item.name) || {})
          .data,
      })),
    pitcherGameCount: pitcherGames.length,
  };
};

const execBox = state => {
  const boxSummary =
    state.games.length &&
    state.game &&
    state.games.find(item => item.game === state.game);
  return displayGame(
    state.players,
    state.records.filter(item => item._table === state.game),
    boxSummary.errors,
    state.role,
  );
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
