const contentMapping = {
  '1H': '1H',
  '2H': '2H',
  '3H': '3H',
  HR: 'HR',
  飛球: 'FO',
  滾地: 'GO',
  BB: 'BB',
  K: 'K',
  E: 'E',
  野選: 'FC',
  犧飛: 'SF',
  雙殺: 'DP',
  三殺: 'TP',
};
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

const parseGame = arr => {
  const nameCol = arr[0].indexOf('名單');
  const errCol = arr[0].indexOf('失誤');
  const startCol = arr[0].indexOf('一');
  let row = 1;
  let col = startCol;
  let order = 1;
  let result = [];
  let scan = [];
  let errorArr = [];

  while (col < arr[0].length && row < arr.length) {
    if (scan.indexOf(row + '' + col) === -1) {
      scan.push(row + '' + col);
      if (arr[row][col]) {
        let run = '';
        if (arr[row][col + 2] === 'R') {
          run = arr[row][nameCol];
        } else if (
          row + 1 < arr.length &&
          arr[row + 1][col] === '' &&
          arr[row + 1][col + 2] === 'R'
        ) {
          run = arr[row + 1][nameCol];
        }
        result.push({
          order: order++,
          inn: innArray.indexOf(arr[0][col]),
          name: arr[row][nameCol],
          content: contentMapping[arr[row][col]],
          r: run,
          rbi: arr[row][col + 1],
          _row: row,
        });
      }
    }
    if (arr[row][errCol] && col === startCol) {
      errorArr.push({
        name: arr[row][nameCol],
        count: arr[row][errCol],
      });
    }
    row++;
    if (row === arr.length) {
      if (scan.indexOf('1' + col) === -1) {
        row = 1;
      } else {
        col += 3;
        if (result[result.length - 1]) {
          if (result[result.length - 1]._row === arr.length - 1) {
            row = 1;
          } else {
            row = result[result.length - 1]._row + 1;
          }
        } else {
          row = 1;
        }
      }
    }
  }
  return {
    orders: result.map(item => {
      delete item._row;
      return item;
    }),
    errors: errorArr,
  };
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

const genGameList = games => {
  const temp = games
    .map(item => item.game.substr(0, 8))
    .filter((v, i, self) => self.indexOf(v) === i)
    .sort((a, b) => {
      return (
        parseInt(b.match(/\d/g).join(''), 10) -
        parseInt(a.match(/\d/g).join(''), 10)
      );
    })
    .map(item => {
      return {
        date: item,
        games: games.filter(sub => sub.game.substr(0, 8) === item),
      };
    });
  return temp;
};

const displayGame = (players, records, errors, role) => {
  let arr = [];
  let startOrder = 0;
  let innChange = 0;

  records
    .map((item, i) => {
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
      return item;
    })
    .forEach(item => {
      if (item.inn !== innChange) {
        innChange = item.inn;
        item.innChange = item.inn;
      }
      if (!item.content) {
        item.content = 'new';
      }
      item.color = contentColor(item.content);

      let index = -1;
      const find = arr.find(sub => sub.name === item.name);
      if (find) {
        let middleArr = [];
        middleArr.length =
          Math.ceil(item.order / (startOrder || 10) - 1) - find.content.length;
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
          middleArr.length = Math.ceil(item.order / (startOrder || 10) - 1);
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
        middleArr.length = Math.ceil(item.order / (startOrder || 10) - 1);
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

  if (records.length && startOrder) {
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
      return [1];
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
        if (role === 'manager' && startOrder === 0) {
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

function toDataURL(src, callback, outputFormat) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    const canvas = document.createElement('CANVAS');
    const ctx = canvas.getContext('2d');
    canvas.height = this.naturalHeight;
    canvas.width = this.naturalWidth;
    ctx.drawImage(this, 0, 0);
    callback(canvas.toDataURL(outputFormat));
  };
  img.src = src;
  if (img.complete || img.complete === undefined) {
    img.src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    img.src = src;
  }
}
const cache = {};
const cacheImg = url => {
  if (cache[url]) {
    return cache[url];
  } else {
    if (!/\.(gif|jpg|jpeg|tiff|png)$/i.test(url)) {
      toDataURL(url, dataUrl => {
        cache[url] = dataUrl;
      });
    }
    return url;
  }
};

function scrollTo(element) {
  // check is dom node
  if (!!element && element.nodeType === 1) {
    const y = element.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = window.innerHeight * 0.01 * 50;

    window.scrollTo({
      top: Math.max(0, y - yOffset + element.clientHeight / 2),
      behavior: 'smooth',
    });
  }
}

export default {
  parseGame,
  genStatistics,
  genGameList,
  displayGame,
};

export { cacheImg, scrollTo };
