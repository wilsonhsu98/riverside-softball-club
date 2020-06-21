const contentColor = content => {
  if (['1H', '2H', '3H', 'HR'].indexOf(content) > -1) {
    return 'red';
  }
  if (['BB', 'SF'].indexOf(content) > -1) {
    return 'yellow';
  }
  return 'blue';
};
const innArray = ['', '一', '二', '三', '四', '五', '六', '七'];

const genStatistics = (players, records, filterPA, filterGames) => {
  // filterPA = filterPA || 10;
  const sortRecords = [...records].sort((a, b) => {
    return (
      parseInt(b._table.match(/\d/g).join('') + (b.order + 10), 10) -
      parseInt(a._table.match(/\d/g).join('') + (a.order + 10), 10)
    );
  });

  return players.map(player => {
    const name = player.id;

    const top = sortRecords
      .filter(item => {
        return filterGames === undefined ||
          (Array.isArray(filterGames) && filterGames.length === 0)
          ? true
          : filterGames.indexOf(item._table) > -1;
      })
      .filter(item => item.name === name)
      .slice(0, filterPA)
      .map(item => {
        const onbase = (() => {
          const next5 = sortRecords
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
        return sortRecords
          .filter(item => item._table === game && item.name === name)
          .map(item => {
            return {
              name: item.name,
              content: item.content,
              order: item.order,
              exclude: limit++ > filterPA,
              color: contentColor(item.content),
            };
          })
          .concat(game.substr(4));
      });
    const calc = top.reduce(
      (acc, item) => {
        return {
          pa: acc.pa + 1,
          ab:
            acc.ab +
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
            ].indexOf(item.content) > -1
              ? 1
              : 0),
          h:
            acc.h +
            (['1H', '2H', '3H', 'HR'].indexOf(item.content) > -1 ? 1 : 0),
          tb: acc.tb + (['1H', '2H', '3H', 'HR'].indexOf(item.content) + 1),
          tob:
            acc.tob +
            (['1H', '2H', '3H', 'HR', 'BB'].indexOf(item.content) > -1 ? 1 : 0),
          rbi: acc.rbi + (item.rbi || 0),
          h1: acc.h1 + (item.content === '1H' ? 1 : 0),
          h2: acc.h2 + (item.content === '2H' ? 1 : 0),
          h3: acc.h3 + (item.content === '3H' ? 1 : 0),
          hr: acc.hr + (item.content === 'HR' ? 1 : 0),
          k: acc.k + (item.content === 'K' ? 1 : 0),
          bb: acc.bb + (item.content === 'BB' ? 1 : 0),
          sf: acc.sf + (item.content === 'SF' ? 1 : 0),
          dp: acc.dp + (item.content === 'DP' ? 1 : 0),
          r: acc.r + (item.r === item.name ? 1 : 0),
        };
      },
      {
        pa: 0,
        ab: 0,
        h: 0,
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
            ? sortRecords
                .filter(item => {
                  return item.r === name && item.name !== name;
                })
                .filter(item => {
                  return filterGames === undefined ||
                    (Array.isArray(filterGames) && filterGames.length === 0)
                    ? true
                    : filterGames.indexOf(item._table) > -1;
                }).length
            : 0,
      },
    );

    const { pa, ab, h, tb, tob, rbi, h1, h2, h3, hr, k, bb, sf, dp, r } = calc;
    const obj = {
      name: name,
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
          color: contentColor(item.content),
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
        OBP: Math.round((tob / pa) * 1000) / 1000,
        SLG: Math.round((tb / ab) * 1000) / 1000,
        OPS: Math.round((tob / pa + tb / ab) * 1000) / 1000,
        LEVEL: `${Math.floor(Math.round((h / ab) * 1000) / 100)}/${Math.floor(
          Math.round((tob / pa) * 1000) / 100,
        )}/${Math.floor(Math.round((tb / ab) * 1000) / 100)}`,
      };
    }
  });
};

const displayGame = (players, records, errors, role) => {
  const assumedOrder = 12;
  return records.reduce(
    (acc, item, i, self) => {
      const { arr, startOrder: prevStartOrder, prevInn, isSetNewContent } = acc;
      const order = !item.order ? i + 1 : item.order;
      const startOrder = item.break ? order - 1 : prevStartOrder;

      const find = arr.find(sub => sub.name === item.name);
      const findIndex = arr.indexOf(find);
      const canPushPlayer = !find && startOrder === 0 && !item.break;
      const shouldSetStartOrder = find && startOrder === 0;
      const shouldSetInnChange = item.inn !== prevInn;
      const shouldSetNewContent =
        role === 'manager' && !item.content && !isSetNewContent;

      const { r, out } = (() => {
        const selfAndNext5 = self
          .slice(i, i + 6)
          .map(sub => sub.onbase)
          .reduce((acc, sub) => acc.concat(sub), []);
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
      })();
      const { name, inn, rbi, location, onbase } = item;
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
        color: contentColor(item.content),
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
      const shouldSetAltRunner = r && r !== item.name && alt > -1;
      const isLast = i === self.length - 1;
      const midLen = Math.ceil(order / (startOrder || assumedOrder) - 1);

      const result = {
        ...acc,
        prevInn: item.inn,
        // 第一輪加入球員
        ...(canPushPlayer && {
          arr: [
            ...arr,
            {
              name: item.name,
              data: (players.find(sub => sub.id === item.name) || { data: {} })
                .data,
              order,
              content: [newItem],
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
                Array(Math.max(midLen - find.content.length, 0)),
                newItem,
              ),
            },
            // 代跑
            ...(shouldSetAltRunner
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
              data: (players.find(sub => sub.id === item.name) || { data: {} })
                .data,
              order,
              altOrder: order % startOrder || startOrder,
              content: Array(midLen).concat(newItem),
            },
            ...arr.slice(alt + 1),
          ],
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
        const header = innArray.reduce((acc, item, i) => {
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

        // if (
        //   (records.length && startOrder) ||
        //   (startOrder === 0 &&
        //     [undefined, 'new'].indexOf(records[records.length - 1].content) === -1)
        // ) {
        //   if (startOrder === 0) startOrder = records.length;
        //   let insertAt = records[records.length - startOrder];
        //   if (insertAt.r && insertAt.name !== insertAt.r) {
        //     insertAt = insertAt.r;
        //   } else {
        //     insertAt = insertAt.name;
        //   }
        //   arr
        //     .find(player => player.name === insertAt)
        //     .content.push({
        //       content: 'new',
        //       name: insertAt,
        //       inn: role === 'manager' && records[records.length - 1].inn,
        //     });
        // }
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
    state.period.find(item => item.select).games,
  )
    .filter(
      item => item.PA !== '-' && (state.unlimitedPA || item.PA === state.top),
    )
    .sort((a, b) => {
      if (['AVG', 'OBP', 'SLG', 'OPS'].indexOf(state.sortBy) > -1) {
        return b[state.sortBy] === a[state.sortBy]
          ? b['PA'] - a['PA']
          : b[state.sortBy] - a[state.sortBy];
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

const execItemStats = state => {
  const games = state.period.find(item => item.select).games || [];
  const minimunPA = games.length * 1.6;
  const records = genStatistics(state.players, state.records, undefined, games);
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
              W: self.filter(player => player === pitcher).length,
            },
          ];
        }
        return acc;
      }, [])
      .sort((a, b) => b['W'] - a['W'])
      .map(item => ({
        name: item.pitcher,
        W: item.W,
        data: (state.players.find(player => player.id === item.pitcher) || {})
          .data,
      })),
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
