var utils = exports;
var contentMapping = {
    '1H': '1H',
    '2H': '2H',
    '3H': '3H',
    'HR': 'HR',
    '飛球': 'FO',
    '滾地': 'GO',
    'BB': 'BB',
    'K': 'K',
    'E': 'E',
    '野選': 'FC',
    '犧飛': 'SF',
    '雙殺': 'DP',
    '三殺': 'TP',
};

utils.genStatistics = function(players, records, filterPA, filterGames) {
    // filterPA = filterPA || 10;
    let sortRecords = JSON.parse(JSON.stringify(records));

    sortRecords = sortRecords.sort((a, b) => {
        return parseInt(b._table.match(/\d/g).join('') + (b.order + 10), 10) -
            parseInt(a._table.match(/\d/g).join('') + (a.order + 10), 10)
    });

    return players.map(function(player) {
        var name = player.id,
            pa = 0,
            ab = 0,
            h = 0,
            tb = 0,
            tob = 0,
            r = 0,
            rbi = 0,
            h1 = 0,
            h2 = 0,
            h3 = 0,
            hr = 0,
            k = 0,
            bb = 0,
            sf = 0,
            dp = 0;

        var top = sortRecords
            .filter(function(item) { return filterGames === undefined || (Array.isArray(filterGames) && filterGames.length === 0) ? true : filterGames.indexOf(item._table) > -1; })
            .filter(function(item) { return item.name === name })
            .slice(0, filterPA);

        let limit = 1;
        var games = top
            .map(item => item._table)
            .filter(function(v, i, self) { return self.indexOf(v) === i; })
            .map((game) => {
                return sortRecords
                    .filter(function(item) { return item._table === game && item.name === name; })
                    .map(item => {
                        let color = 'blue';
                        if (['1H', '2H', '3H', 'HR'].indexOf(item.content) > -1) color = 'red';
                        if (['BB', 'SF'].indexOf(item.content) > -1) color = 'yellow';
                        return {
                            name: item.name,
                            content: item.content,
                            order: item.order,
                            exclude: limit++ > filterPA,
                            color,
                        };
                    }).concat(game.substr(4));
            });


        top.forEach(function(item) {
            pa += 1;
            ab += ['1H', '2H', '3H', 'HR', 'FO', 'GO', 'K', 'E', 'FC', 'DP', 'TP'].indexOf(item.content) > -1 ? 1 : 0;
            h += ['1H', '2H', '3H', 'HR'].indexOf(item.content) > -1 ? 1 : 0;
            tb += ['1H', '2H', '3H', 'HR'].indexOf(item.content) + 1;
            tob += ['1H', '2H', '3H', 'HR', 'BB'].indexOf(item.content) > -1 ? 1 : 0;
            r += item.r === item.name ? 1 : 0;
            rbi += item.rbi || 0;
            h1 += item.content === '1H' ? 1 : 0;
            h2 += item.content === '2H' ? 1 : 0;
            h3 += item.content === '3H' ? 1 : 0;
            hr += item.content === 'HR' ? 1 : 0;
            k += item.content === 'K' ? 1 : 0;
            bb += item.content === 'BB' ? 1 : 0;
            sf += item.content === 'SF' ? 1 : 0;
            dp += item.content === 'DP' ? 1 : 0;
        });

        if (filterPA === undefined) {
            r += sortRecords
                .filter(function(item) { return item.r === name && item.name !== name})
                .filter(function(item) { return filterGames === undefined || (Array.isArray(filterGames) && filterGames.length === 0) ? true : filterGames.indexOf(item._table) > -1; })
                .length;
        }

        var obj = {
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
        if (pa === 0) {} else if (pa > 0 && ab === 0) {
            obj = Object.assign(obj, {
                PA: pa,
                TOB: tob > 0 ? tob : '-',
                BB: bb > 0 ? bb : '-',
                SF: sf > 0 ? sf : '-',
                R: r > 0 ? r : '-',
                RBI: rbi > 0 ? rbi : '-',
                OBP: Math.round(tob / pa * 1000) / 1000,
                OPS: Math.round(tob / pa * 1000) / 1000
            });
        } else {
            obj = Object.assign(obj, {
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
                AVG: Math.round(h / ab * 1000) / 1000,
                OBP: Math.round(tob / pa * 1000) / 1000,
                SLG: Math.round(tb / ab * 1000) / 1000,
                OPS: Math.round((tob / pa + tb / ab) * 1000) / 1000
            });
        }

        return obj;
    });
};

utils.parseGame = function(arr) {
    var nameCol = arr[0].indexOf('名單'),
        errCol = arr[0].indexOf('失誤'),
        startCol = arr[0].indexOf('一'),
        row = 1,
        col = startCol,
        order = 1,
        result = [],
        scan = [],
        innArray = ['', '一', '二', '三', '四', '五', '六', '七'],
        errorArr = [];

    while (col < arr[0].length && row < arr.length) {
        if (scan.indexOf(row + '' + col) === -1) {
            scan.push(row + '' + col);
            if (arr[row][col]) {
                var run = '';
                if (arr[row][col + 2] === 'R') {
                    run = arr[row][nameCol];
                } else if (row + 1 < arr.length && arr[row + 1][col] === '' && arr[row + 1][col + 2] === 'R') {
                    run = arr[row + 1][nameCol];
                }
                result.push({
                    order: order++,
                    inn: innArray.indexOf(arr[0][col]),
                    name: arr[row][nameCol],
                    content: contentMapping[arr[row][col]],
                    r: run,
                    rbi: arr[row][col + 1],
                    _row: row
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
                        row = result[result.length - 1]._row + 1
                    }
                } else {
                    row = 1;
                }
            }
        }
    }
    return {
        orders: result.map(function(item) {
            delete item._row;
            return item;
        }),
        errors: errorArr,
    };
};

utils.displayGame = function(players, records, errors) {
    var arr = [],
        order = 0,
        inn = 0,
        innChange = 0,
        contentColor = (content) => {
            let color = 'blue';
            if (['1H', '2H', '3H', 'HR'].indexOf(content) > -1) color = 'red';
            if (['BB', 'SF'].indexOf(content) > -1) color = 'yellow';
            return color;
        };
    records.map((item, i, self) => {
            const find = arr.find(sub => sub.name === item.name);
            if (!item.order) {
                item.order = i + 1;
            }
            if (!find && order === 0) {
                arr.push({
                    name: item.name,
                    data: (players.find(sub => sub.id === item.name) || {data: {}}).data,
                    order: item.order,
                    content: [],
                    location: item.location,
                });
            } else {
                if (order === 0) {
                    order = item.order - find.order;
                }
            }
            if (self.length - 1 === i) {
                inn = item.inn;
            }
            return item;
        }).forEach(item => {
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
                middleArr.length = Math.ceil(item.order / (order || 10) - 1) - find.content.length;
                find.content = find.content.concat(middleArr, item);
            } else {
                // Handle 代打
                index = -1;
                arr.forEach((sub, i) => {
                    if (sub.altOrder && sub.altOrder === (item.order % order || order)) {
                        index = i;
                    } else if (sub.order === (item.order % order || order)) {
                        index = i;
                    }
                });
                if (index > -1) {
                    let middleArr = [];
                    middleArr.length = Math.ceil(item.order / (order || 10) - 1);
                    arr.splice(index + 1, 0, {
                        name: item.name,
                        data: (players.find(sub => sub.id === item.name) || {data: {}}).data,
                        order: item.order,
                        altOrder: item.order % order || order,
                        content: [].concat(middleArr, item),
                    });
                }
            }
            // Handle 代跑
            index = -1;
            arr.forEach((sub, i) => {
                if (sub.altOrder && sub.altOrder === (item.order % order || order)) {
                    index = i;
                } else if (sub.order === (item.order % order || order)) {
                    index = i;
                }
            });
            if (item.r && item.r !== item.name && index > -1) {
                let middleArr = [];
                middleArr.length = Math.ceil(item.order / (order || 10) - 1);
                arr.splice(index + 1, 0, {
                    name: item.r,
                    data: (players.find(sub => sub.id === item.r) || {data: {}}).data,
                    order: item.order,
                    altOrder: item.order % order || order,
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

    if (records.length && order) {
        let insertAt = records[records.length - order];
        if (insertAt.r && insertAt.name !== insertAt.r) {
            insertAt = insertAt.r;
        } else {
            insertAt = insertAt.name;
        }
        arr.find(player => player.name === insertAt).content.push({ content: 'new', name: insertAt });
    }

    let paMax = 0;
    arr.forEach(item => {
        if (item.content.length > paMax) paMax = item.content.length;
    });
    arr.forEach(item => {
        let ab = 0;
        let h = 0;
        const error = errors.find(sub => sub.name === item.name);
        item.content.forEach(sub => {
            ab += ['1H', '2H', '3H', 'HR', 'FO', 'GO', 'K', 'E', 'FC', 'DP', 'TP'].indexOf(sub.content) > -1 ? 1 : 0;
            h += ['1H', '2H', '3H', 'HR'].indexOf(sub.content) > -1 ? 1 : 0;
        });
        item.content.length = paMax;
        item.summary = `${ab}-${h}`;
        item.error = error && error.count;
    });
    return arr;
};

utils.genGameList = function(games) {
    const temp = games.map(item => item.game.substr(0, 8))
        .filter((v, i, self) => self.indexOf(v) === i)
        .sort((a, b) => {
            return parseInt(b.match(/\d/g).join(''), 10) - parseInt(a.match(/\d/g).join(''), 10)
        })
        .map(item => {
            return {
                date: item,
                games: games.filter(sub => sub.game.substr(0, 8) === item),
            }
        });
    return temp;
};