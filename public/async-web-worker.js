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
  const sortRecords = Array.from(records).sort((a, b) => {
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
      LEVLE: '-/-/-',
      listByGame: games,
      locations: top
        .filter(item => item.location && item.location.x)
        .map(item => ({
          x: item.location.x,
          y: item.location.y,
          color: item.content === 'HR' ? 'white' : contentColor(item.content),
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
  let arr = [];
  let startOrder = 0;
  let innChange = 0;
  const assumedOrder = 12;

  (records.find(item => !item.content) || {}).content = 'new';

  records
    .map((item, i, self) => {
      const find = arr.find(sub => sub.name === item.name);
      if (!item.order) {
        item.order = i + 1;
      }
      if (!find && startOrder === 0) {
        arr.push({
          name: item.name,
          data: (players.find(sub => sub.id === item.name) || { data: {} })
            .data,
          order: item.order,
          content: [],
          location: item.location,
        });
      } else {
        if (startOrder === 0) {
          startOrder = item.order - find.order;
        }
      }

      const onbase = (() => {
        const selfAndNext5 = self
          .slice(i, i + 6)
          .map(sub => sub.onbase)
          .reduce((acc, sub) => acc.concat(sub), []);
        return {
          r: selfAndNext5.find(
            sub => sub && sub.name === item.name && sub.result === 'run',
          )
            ? item.name
            : '',
          out: selfAndNext5.find(
            sub => sub && sub.name === item.name && sub.result === 'out',
          )
            ? true
            : false,
        };
      })();
      return {
        ...item,
        r: item.r || onbase.r,
        out: onbase.out,
      };
    })
    .forEach(item => {
      if (item.inn !== innChange) {
        innChange = item.inn;
        item.innChange = item.inn;
      }
      // if (!item.content) {
      //   item.content = 'new';
      // }
      item.color = contentColor(item.content);

      let index = -1;
      const find = arr.find(sub => sub.name === item.name);
      if (find) {
        let middleArr = [];
        middleArr.length =
          Math.ceil(item.order / (startOrder || assumedOrder) - 1) -
          find.content.length;
        find.content = find.content.concat(middleArr, item);
      } else {
        // Handle 代打
        index = -1;
        arr.forEach((sub, i) => {
          if (
            (sub.altOrder &&
              sub.altOrder === (item.order % startOrder || startOrder)) ||
            sub.order === (item.order % startOrder || startOrder)
          ) {
            index = i;
          }
        });
        if (index > -1) {
          let middleArr = [];
          middleArr.length = Math.ceil(
            item.order / (startOrder || assumedOrder) - 1,
          );
          arr.splice(index + 1, 0, {
            name: item.name,
            data: (players.find(sub => sub.id === item.name) || { data: {} })
              .data,
            order: item.order,
            altOrder: item.order % startOrder || startOrder,
            content: [].concat(middleArr, item),
          });
        }
      }
      // Handle 代跑
      index = -1;
      arr.forEach((sub, i) => {
        if (
          (sub.altOrder &&
            sub.altOrder === (item.order % startOrder || startOrder)) ||
          sub.order === (item.order % startOrder || startOrder)
        ) {
          index = i;
        }
      });
      if (item.r && item.r !== item.name && index > -1) {
        let middleArr = [];
        middleArr.length = Math.ceil(
          item.order / (startOrder || assumedOrder) - 1,
        );
        arr.splice(index + 1, 0, {
          name: item.r,
          data: (players.find(sub => sub.id === item.r) || { data: {} }).data,
          order: item.order,
          altOrder: item.order % startOrder || startOrder,
          content: [].concat(middleArr, {
            inn: item.inn,
            name: item.r,
            order: item.order,
            r: item.r,
            color: 'gray',
            content: 'PR',
          }),
        });
      }
    });

  if (
    (records.length && startOrder) ||
    (startOrder === 0 &&
      [undefined, 'new'].indexOf(records[records.length - 1].content) === -1)
  ) {
    if (startOrder === 0) startOrder = records.length;
    let insertAt = records[records.length - startOrder];
    if (insertAt.r && insertAt.name !== insertAt.r) {
      insertAt = insertAt.r;
    } else {
      insertAt = insertAt.name;
    }
    arr
      .find(player => player.name === insertAt)
      .content.push({
        content: 'new',
        name: insertAt,
        inn: role === 'manager' && records[records.length - 1].inn,
      });
  }
  const header = innArray.reduce((acc, item, i) => {
    if (startOrder === 0) {
      const inns = records
        .filter(record => record.inn)
        .map(record => record.inn);
      const maxInn = inns.length ? Math.max(...inns) : 1;
      return Array.apply(null, Array(maxInn)).map((undefined, i) => i + 1);
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

  let paMax = 0;
  arr.forEach(item => {
    if (item.content.length > paMax) paMax = item.content.length;
  });
  arr.forEach(item => {
    let ab = 0;
    let h = 0;
    const error = errors.find(sub => sub.name === item.name);
    item.content.forEach(sub => {
      ab +=
        [
          '1H',
          '2H',
          '3H',
          'HR',
          'FO',
          'GO',
          'K',
          'E',
          'FC',
          'DP',
          'TP',
        ].indexOf(sub.content) > -1
          ? 1
          : 0;
      h += ['1H', '2H', '3H', 'HR'].indexOf(sub.content) > -1 ? 1 : 0;
    });
    item.content.length = paMax;
    item.contentNormal = header.reduce((acc, inn, i, self) => {
      const filter = item.content.filter(sub => sub.inn === inn);
      const hasPrev = item.content.some(sub => sub.inn < inn);
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
          return acc.concat(item.content);
        } else {
          return acc.concat(arr);
        }
      }
    }, []);
    item.summary = `${ab}-${h}`;
    item.error = error && error.count;
  });
  return [[...header, startOrder]].concat(arr);
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
