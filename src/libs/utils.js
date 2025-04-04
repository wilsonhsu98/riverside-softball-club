const contentMapping = {
  '1H': '1H',
  '2H': '2H',
  '3H': '3H',
  HR: 'HR',
  飛球: 'FO',
  滾地: 'GO',
  BB: 'BB',
  K: 'K',
  FOUL: 'FOUL',
  E: 'E',
  野選: 'FC',
  犧飛: 'SF',
  雙殺: 'DP',
  三殺: 'TP',
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

const genGameList = (games, filterGames = []) => {
  const temp = games
    .filter(item => filterGames.includes(item.game))
    .map(item => item.game.split('-')[0])
    .filter((v, i, self) => self.indexOf(v) === i)
    .sort((a, b) => {
      return (
        parseInt((b.match(/\d/g) || [b]).join(''), 10) -
        parseInt((a.match(/\d/g) || [a]).join(''), 10)
      );
    })
    .map(item => {
      const games_ = games.filter(
        sub =>
          sub.game.split('-')[0] === item && filterGames.includes(sub.game),
      );
      const bothHaveTime = games_.every(sub => sub.time);
      return {
        date: item,
        games: bothHaveTime
          ? games_.sort((a, b) => a.time.localeCompare(b.time))
          : games_,
      };
    });
  return temp;
};

const locationMapping = {
  P: { code: '1', content: '投' },
  '1B': { code: '3', content: '壹' },
  '2B': { code: '4', content: '貳' },
  '3B': { code: '5', content: '參' },
  ss: { code: '6', content: '游' },
  lf: { code: '7', content: '左' },
  cf: { code: '8', content: '中' },
  rf: { code: '9', content: '右' },
  l_hr: { code: '7', content: '左' },
  c_hr: { code: '8', content: '中' },
  r_hr: { code: '9', content: '右' },
};
const contentMappingForBox = {
  '1H': 'H',
  FO: 'F',
  GO: 'G',
  一安: '安',
  二安: '2',
  三安: '3',
  全壘打: '全',
  犧飛: '犧',
  飛球: '飛',
  滾地: '滾',
  失誤: '失',
  野選: '選',
};

const formatContent = (mode, content, location) => {
  if (locationMapping[location]) {
    const short = contentMappingForBox[content] || content;
    if (mode === 'content') {
      return `${locationMapping[location][mode]}${short.replace(/[0-9]/g, s =>
        String.fromCharCode(s.charCodeAt(0) + 0xfee0),
      )}`;
    }
    if (mode === 'code') {
      const result = `${short}${locationMapping[location][mode]}`;
      if (result.length === 2) {
        return result.replace(/[a-zA-Z0-9]/g, s =>
          String.fromCharCode(s.charCodeAt(0) + 0xfee0),
        );
      } else {
        return result;
        // return `${result[0]}${result[1]}${result[2].replace(/[a-zA-Z0-9]/g, s =>
        //   String.fromCharCode(s.charCodeAt(0) + 0xfee0),
        // )}`;
      }
    }
  } else {
    return content.replace(/[a-zA-Z0-9]/g, s =>
      String.fromCharCode(s.charCodeAt(0) + 0xfee0),
    );
  }
};

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
    // if (!/\.(gif|jpg|jpeg|tiff|png)$/i.test(url)) {
    //   toDataURL(url, dataUrl => {
    //     cache[url] = dataUrl;
    //   });
    // }
    toDataURL(url, dataUrl => {
      cache[url] = dataUrl;
    });
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

const getShuffledArr = arr => {
  if (arr.length === 1) {
    return arr;
  }
  const rand = Math.floor(Math.random() * arr.length);
  return [
    arr[rand],
    ...getShuffledArr(arr.filter((undefined, i) => i !== rand)),
  ];
};

const unionOrIntersect = (type, conditions = [], games = []) => {
  if (type === 'union' && Array.isArray(conditions) && conditions.length) {
    // 聯集
    return conditions
      .map(condition => condition.value)
      .reduce((acc, condition) => {
        const [key, val] = condition.split(':');
        return [
          ...new Set([
            ...acc,
            ...games.filter(item => {
              if (Array.isArray(item[key])) {
                return item[key].includes(val);
              } else {
                return item[key] === val;
              }
            }),
          ]),
        ];
      }, []);
  }

  if (type === 'intersect' && Array.isArray(conditions) && conditions.length) {
    // 交集
    return conditions
      .map(condition => condition.value)
      .reduce((acc, condition) => {
        const [key, val] = condition.split(':');
        return acc.filter(item => {
          if (Array.isArray(item[key])) {
            return item[key].includes(val);
          } else {
            return item[key] === val;
          }
        });
      }, games);
  }

  return games;
};

const getNameNumber = ({ name = '', number = '' }) => {
  const tempName = (() => {
    if (name.length >= 2) {
      if (['小', '大', '阿', '老'].includes(name[0])) {
        return name[1].toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return name
      .slice(0, 1)
      .toUpperCase()
      .replace(/[A-Z]/g, s => String.fromCharCode(s.charCodeAt(0) + 0xfee0));
  })();
  const tempNum = number
    ? `${number}`.length === 1
      ? `${number}`.replace(/[0-9]/g, s =>
          String.fromCharCode(s.charCodeAt(0) + 0xfee0),
        )
      : number
    : '';
  return `${tempName}${tempNum}`;
};

const basicCount = 22;
const scoreMapping = [
  {
    key: 'teamIcon',
    checkFunc: ({ teamInfo = {} }) => (teamInfo.icon ? 1 : 0),
    percent: 10,
  },
  {
    key: '10Players',
    checkFunc: ({ teamInfo = { players: [] } }) =>
      Math.min(teamInfo.players.length, 10) / 10,
    percent: 10,
    max: 10,
  },
  {
    key: '10BindingPlayers',
    checkFunc: ({ teamInfo = { players: [] } }) =>
      Math.min(teamInfo.players.filter(player => player.uid).length, 10) / 10,
    percent: 10,
    max: 10,
  },
  {
    key: '10CompletedGames',
    checkFunc: ({ teamInfo = {}, games = [] }) =>
      Math.min(games.length - (teamInfo.unlockGames || []).length, 10) / 10,
    percent: 10,
    max: 10,
  },
  {
    key: 'teamIntro',
    checkFunc: ({ teamInfo = {} }) => (teamInfo.teamIntro ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'teamOtherNames',
    checkFunc: ({ teamInfo = {} }) => (teamInfo.otherNames ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gamePeriod',
    checkFunc: ({ games = [] }) => (games.some(g => g.period) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gameLeague',
    checkFunc: ({ games = [] }) => (games.some(g => g.league) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gameGroup',
    checkFunc: ({ games = [] }) => (games.some(g => g.group) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gameType',
    checkFunc: ({ games = [] }) => (games.some(g => g.gameType) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gamePlace',
    checkFunc: ({ games = [] }) => (games.some(g => g.place) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gameTopBottom',
    checkFunc: ({ games = [] }) => (games.some(g => g.topBottom) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gameCoach',
    checkFunc: ({ games = [] }) => (games.some(g => g.coach) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gameRecorder',
    checkFunc: ({ games = [] }) => (games.some(g => g.recorder) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gameTags',
    checkFunc: ({ games = [] }) =>
      games.some(g => Array.isArray(g.tags) && g.tags.length) ? 1 : 0,
    percent: 60 / basicCount,
  },
  {
    key: 'gamePitcher',
    checkFunc: ({ games = [] }) => (games.some(g => g.pitcher) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gameResult',
    checkFunc: ({ games = [] }) => (games.some(g => g.result) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gameOpponentScores',
    checkFunc: ({ games = [] }) =>
      games.some(
        g => Array.isArray(g.opponentScores) && g.opponentScores.length,
      )
        ? 1
        : 0,
    percent: 60 / basicCount,
  },
  {
    key: 'gameMvp',
    checkFunc: ({ games = [] }) => (games.some(g => g.mvp) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gameNote',
    checkFunc: ({ games = [] }) => (games.some(g => g.gameNote) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gamePositions',
    checkFunc: ({ games = [] }) =>
      games.some(
        g =>
          typeof g.positions === 'object' &&
          Object.keys(g.positions).length === 10,
      )
        ? 1
        : 0,
    percent: 60 / basicCount,
  },
  {
    key: 'gameVideo',
    desc: 'game video',
    checkFunc: ({ games = [] }) => (games.some(g => g.youtubeVideos) ? 1 : 0),
    percent: 60 / basicCount,
  },
  {
    key: 'gamePersonalVideo',
    checkFunc: ({ records = [] }) => {
      return [...records].reverse().some(r => typeof r.video === 'object')
        ? 1
        : 0;
    },
    percent: 60 / basicCount,
  },
  {
    key: 'gamePitchers',
    checkFunc: ({ games = [] }) =>
      games.some(g => Array.isArray(g.pitchers) && g.pitchers.length) ? 1 : 0,
    percent: 60 / basicCount,
  },
  {
    key: 'gameErrors',
    checkFunc: ({ games = [] }) =>
      games.some(g => Array.isArray(g.errors) && g.errors.length) ? 1 : 0,
    percent: 60 / basicCount,
  },
  {
    key: 'gameForcedMode',
    checkFunc: ({ records = [] }) => {
      return [...records].reverse().some(r => r.isForcedMode)
        ? 1
        : 0;
    },
    percent: 60 / basicCount,
  },
];
const evaluateTeamScore = ({ teamInfo = {}, games = [], records = [] }) => {
  const { score, scoreKVP } = scoreMapping.reduce(
    (acc, item) => {
      const s = item.checkFunc({ teamInfo, games, records }) * item.percent;
      return {
        score: acc.score + s,
        scoreKVP: {
          ...acc.scoreKVP,
          [item.key]: item.max ? s === item.max : !!s,
        },
      };
    },
    { score: 0, scoreKVP: {} },
  );
  return {
    score: Math.min(100, Math.round(score)),
    scoreKVP,
  };
};

const formatDate = dateVal => {
  return dateVal
    .toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '');
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

const cleanData = data =>
  Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

export default {
  parseGame,
  genGameList,
  unionOrIntersect,
};

export {
  cacheImg,
  scrollTo,
  formatContent,
  formatColor,
  getShuffledArr,
  getNameNumber,
  evaluateTeamScore,
  scoreMapping,
  formatDate,
  sumByInn,
  accCalc,
  cleanData,
};
