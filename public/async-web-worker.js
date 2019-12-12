const contentColor = content => {
  if (['1H', '2H', '3H', 'HR'].indexOf(content) > -1) {
    return 'red';
  }
  if (['BB', 'SF'].indexOf(content) > -1) {
    return 'yellow';
  }
  return 'blue';
};

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
      .slice(0, filterPA);

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
      listByGame: games,
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
      };
    }
  });
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
    }
  },
  false,
);
