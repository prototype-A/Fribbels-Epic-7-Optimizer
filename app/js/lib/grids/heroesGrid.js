const tinygradient = require('tinygradient');
var gradient = tinygradient('#ffa8a8', '#ffffe5', '#8fed78');

global.heroesGrid = null;
global.buildsGrid = null;
var currentHeroes = [];
var selectedBuildNode = null;

var currentAggregate = {};
module.exports = {

    initialize: () => {
        buildGrid();
    },

    refresh: async (heroes, id) => {
        if (!heroes) {
            const response = await Api.getAllHeroes();
            heroes = response.heroes;
        }
        const selectedNode = heroesGrid.gridOptions.api.getSelectedNodes()[0]

        console.log('Heroes: ');
        for (var hero of heroes) {
            if (!hero['nameLocalized']) {
                hero['nameLocalized'] = Languages.getLocalizedHeroName(hero['name']);
            }
        }
		console.log(heroes);

        currentHeroes = heroes;
        heroesGrid.gridOptions.api.setRowData(heroes)
        heroesGrid.gridOptions.api.redrawRows();

        if (!selectedNode && !id) {
            return;
        }

        heroesGrid.gridOptions.api.forEachNode((node) => {
            if (id) {
                if (node.data.id == id) {
                    node.setSelected(true, false);
                    heroesGrid.gridOptions.api.ensureNodeVisible(node);
                }
            } else {
                if (node.data.id == selectedNode.data.id) {
                    node.setSelected(true, false);
                }
            }
        })
    },

    refreshHeroesGrid: () => {
        const selectedNode = heroesGrid.gridOptions.api.getSelectedNodes()[0]
        heroesGrid.gridOptions.api.refreshCells();

        heroesGrid.gridOptions.api.forEachNode((node) => {
            if (node.data.id == selectedNode.data.id) {
                node.setSelected(true, false);
            }
        })
    },

    refreshBuilds: async (response) => {
        const selectedRow = module.exports.getSelectedRow();
        if (!selectedRow) return;

        var hero;
        if (response) {
            hero = response.hero;
        } else {
            const useReforgedStats = HeroesTab.getUseReforgedStats();
            hero = (await Api.getHeroById(selectedRow.id, useReforgedStats)).hero;
        }

        updateCurrentAggregate(hero);
        console.log("Refresh build selected hero row", hero);
        buildsGrid.gridOptions.api.setRowData(hero.builds == null ? [] : hero.builds)

        const getMaybeSelectedRows = buildsGrid.gridOptions.api.getSelectedNodes()[0];
        if (getMaybeSelectedRows) {
            selectedBuildNode = getMaybeSelectedRows;
        }


        if (!selectedBuildNode) {
            return;
        }

        buildsGrid.gridOptions.api.forEachNode((node) => {
            if (JSON.stringify(node.data.items) == JSON.stringify(selectedBuildNode.data.items)) {
                node.setSelected(true, false);
            }
        })
        // })
    },

    getSelectedRow: () => {
        const selectedRows = heroesGrid.gridOptions.api.getSelectedRows();
        if (selectedRows.length > 0) {
            const row = selectedRows[0];
            console.log("SELECTED ROW", row)
            return row;
        }
        return null;
    },

    getSelectedBuildRow: () => {
        const selectedRows = buildsGrid.gridOptions.api.getSelectedRows();
        if (selectedRows.length > 0) {
            const row = selectedRows[0];
            console.log("SELECTED ROW", row)
            return row;
        }
        return null;
    },

    refreshFilters: (filters) => {
        const classFilter = filters.classFilter;
        const elementFilter = filters.elementFilter;

        const classFilterComponent = heroesGrid.gridOptions.api.getFilterInstance('role');
        if (!classFilter) {
            classFilterComponent.setModel(null);
        } else {
            classFilterComponent.setModel({
                type: 'startsWith',
                filter: classFilter
            });
        }

        const elementFilterComponent = heroesGrid.gridOptions.api.getFilterInstance('attribute');
        if (!elementFilter) {
            elementFilterComponent.setModel(null);
        } else {
            elementFilterComponent.setModel({
                type: 'startsWith',
                filter: elementFilter
            });
        }

        heroesGrid.gridOptions.api.onFilterChanged();
    },

    redrawPreview: async () => {
        const heroRow = module.exports.getSelectedRow();
        const buildRow = module.exports.getSelectedBuildRow();
        if (buildRow) {
            const itemIds = buildRow.items;

            const itemsResponse = await Api.getItemsByIds(itemIds);
            const items = itemsResponse.items;

            const useReforgeStats = HeroesTab.getUseReforgedStats();
            const heroResponse = await Api.getHeroById(heroRow.id, useReforgeStats);
            const baseStats = heroResponse.baseStats;

            for (var i = 0; i < 6; i++) {
                const item = items[i];
                // const itemId = itemIds[i];
                const displayId = Constants.gearDisplayIdByIndex[i];
                const html = HtmlGenerator.buildItemPanel(item, "heroesGrid", baseStats)
                document.getElementById(displayId).innerHTML = html;
            }
            return;
        }


        if (heroRow) {
            redrawPreviewHero(heroRow.id);
        }
    },
}

function buildGrid(heroes) {
    const gridOptions = {
        defaultColDef: {
            width: 47,
            sortable: true,
            sortingOrder: ['asc', 'desc'],
        },

        columnDefs: [
            {headerName: Languages.getTranslationForKey('heroTableIconLabel'), field: 'name', width: 60, cellRenderer: (params) => renderIcon(params.value)},
            {headerName: Languages.getTranslationForKey('heroTableElementLabel'), field: 'attribute', width: 50, filter: 'agTextColumnFilter', cellRenderer: (params) => renderElement(params.value)},
            {headerName: Languages.getTranslationForKey('heroTableClassLabel'), field: 'role', width: 50, filter: 'agTextColumnFilter', cellRenderer: (params) => renderClass(params.value)},
            {headerName: Languages.getTranslationForKey('heroTableNameLabel'), field: 'nameLocalized', width: 170, wrapText: true, cellStyle: {'white-space': 'normal !important', 'line-height': '16px'}},
            // {headerName: 'Stars', field: 'rarity', width: 50},
            // {headerName: 'Class', field: 'role', width: 100, cellRenderer: (params) => renderClass(params.value)},
            {headerName: Languages.getTranslationForKey('gearSetsLabel'), field: 'equipment', width: 85, cellRenderer: (params) => renderSets(params.value)},
            {headerName: Languages.getTranslationForKey('substatAtkLabel'), field: 'atk'},
            {headerName: Languages.getTranslationForKey('substatHpLabel'), field: 'hp'},
            {headerName: Languages.getTranslationForKey('substatDefLabel'), field: 'def'},
            {headerName: Languages.getTranslationForKey('substatSpdLabel'), field: 'spd'},
            {headerName: Languages.getTranslationForKey('substatCrLabel'), field: 'cr'},
            {headerName: Languages.getTranslationForKey('substatCdLabel'), field: 'cd'},
            {headerName: Languages.getTranslationForKey('substatEffLabel'), field: 'eff'},
            {headerName: Languages.getTranslationForKey('substatResLabel'), field: 'res'},
            {headerName: Languages.getTranslationForKey('ratingCombatPowerLabel'), field: 'cp'},
            {headerName: Languages.getTranslationForKey('ratingHpSpeedLabel'), field: 'hpps'},
            {headerName: Languages.getTranslationForKey('ratingEffectiveHpLabel'), field: 'ehp'},
            {headerName: Languages.getTranslationForKey('ratingEffectiveHpSpeedLabel'), field: 'ehpps'},
            {headerName: Languages.getTranslationForKey('ratingDmgLabel'), field: 'dmg'},
            {headerName: Languages.getTranslationForKey('ratingDmgSpeedLabel'), field: 'dmgps'},
            {headerName: Languages.getTranslationForKey('ratingMaxCritDmgLabel'), field: 'mcdmg', width: 55},
            {headerName: Languages.getTranslationForKey('ratingMaxCritDmgSpeedLabel'), field: 'mcdmgps', width: 55},
            {headerName: Languages.getTranslationForKey('ratingDmgHealthLabel'), field: 'dmgh', width: 55},
            {headerName: Languages.getTranslationForKey('ratingGearScoreLabel'), field: 'score', width: 55},
            {headerName: Languages.getTranslationForKey('ratingNumGearsToUpgradeLabel'), field: 'upgrades', width: 55},
        ],
        rowSelection: 'single',
        rowData: heroes,
        suppressScrollOnNewData: true,
        rowHeight: 45,
        pagination: true,
        paginationPageSize: 100000,
        onRowSelected: onHeroRowSelected,
        onRowClicked: onHeroRowClick,
    };

    const buildsGridOptions = {
        defaultColDef: {
            width: 50,
            sortable: true,
            sortingOrder: ['desc', 'asc'],
            cellStyle: columnGradient,
            // suppressNavigable: true,
            cellClass: 'no-border'
            // valueFormatter: numberFormatter,
        },
        columnDefs: [
            {headerName: Languages.getTranslationForKey('buildsTableNameLabel'), field: 'name', width: 150},
            {headerName: Languages.getTranslationForKey('gearSetsLabel'), field: 'sets', width: 100, cellRenderer: (params) => GridRenderer.renderSets(params.value)},
            {headerName: Languages.getTranslationForKey('substatAtkLabel'), field: 'atk'},
            {headerName: Languages.getTranslationForKey('substatHpLabel'), field: 'hp', width: 55},
            {headerName: Languages.getTranslationForKey('substatDefLabel'), field: 'def'},
            {headerName: Languages.getTranslationForKey('substatSpdLabel'), field: 'spd'},
            {headerName: Languages.getTranslationForKey('substatCrLabel'), field: 'cr'},
            {headerName: Languages.getTranslationForKey('substatCdLabel'), field: 'cd'},
            {headerName: Languages.getTranslationForKey('substatEffLabel'), field: 'eff'},
            {headerName: Languages.getTranslationForKey('substatResLabel'), field: 'res'},
            // {headerName: 'dac', field: 'dac'},
            {headerName: Languages.getTranslationForKey('ratingCombatPowerLabel'), field: 'cp', width: 55},
            {headerName: Languages.getTranslationForKey('ratingHpSpeedLabel'), field: 'hpps', width: 50},
            {headerName: Languages.getTranslationForKey('ratingEffectiveHpLabel'), field: 'ehp', width: 55},
            {headerName: Languages.getTranslationForKey('ratingEffectiveHpSpeedLabel'), field: 'ehpps', width: 50},
            {headerName: Languages.getTranslationForKey('ratingEffectiveHpSpeedLabel'), field: 'dmg', width: 50},
            {headerName: Languages.getTranslationForKey('ratingDmgSpeedLabel'), field: 'dmgps', width: 50},
            {headerName: Languages.getTranslationForKey('ratingMaxCritDmgLabel'), field: 'mcdmg', width: 55},
            {headerName: Languages.getTranslationForKey('ratingMaxCritDmgSpeedLabel'), field: 'mcdmgps', width: 50},
            {headerName: Languages.getTranslationForKey('ratingDmgHealthLabel'), field: 'dmgh', width: 50},
            {headerName: Languages.getTranslationForKey('ratingGearScoreLabel'), field: 'score', width: 50},
            {headerName: Languages.getTranslationForKey('ratingNumGearsToUpgradeLabel'), field: 'upgrades', width: 50},
        ],
        rowHeight: 27,
        rowSelection: 'single',
        onRowSelected: onBuildRowSelected,
        suppressScrollOnNewData: true,
        rowData: [],
        cacheBlockSize: 1000,
        maxBlocksInCache: 1,
        suppressPaginationPanel: false,
        navigateToNextCell: navigateToNextCell.bind(this),
    };

    const gridDiv = document.getElementById('heroes-table');
    const buildsGridDiv = document.getElementById('builds-table');
	gridDiv.textContent = '';
	buildsGridDiv.textContent = '';
    heroesGrid = new Grid(gridDiv, gridOptions);
    buildsGrid = new Grid(buildsGridDiv, buildsGridOptions);
    // console.log("HeroesGrid", heroesGrid);
    // console.log("HeroesGrid", heroesGrid);
}


function renderSets(equipment) {
    if (!equipment) return;

    const setNames = Object.values(equipment).map(x => x.set);
    const setCounters = [
        Math.floor(setNames.filter(x => x == "HealthSet").length),
        Math.floor(setNames.filter(x => x == "DefenseSet").length),
        Math.floor(setNames.filter(x => x == "AttackSet").length),
        Math.floor(setNames.filter(x => x == "SpeedSet").length),
        Math.floor(setNames.filter(x => x == "CriticalSet").length),
        Math.floor(setNames.filter(x => x == "HitSet").length),
        Math.floor(setNames.filter(x => x == "DestructionSet").length),
        Math.floor(setNames.filter(x => x == "LifestealSet").length),
        Math.floor(setNames.filter(x => x == "CounterSet").length),
        Math.floor(setNames.filter(x => x == "ResistSet").length),
        Math.floor(setNames.filter(x => x == "UnitySet").length),
        Math.floor(setNames.filter(x => x == "RageSet").length),
        Math.floor(setNames.filter(x => x == "ImmunitySet").length),
        Math.floor(setNames.filter(x => x == "PenetrationSet").length),
        Math.floor(setNames.filter(x => x == "RevengeSet").length),
        Math.floor(setNames.filter(x => x == "InjurySet").length)
    ]

    const sets = [];
    for (var i = 0; i < setCounters.length; i++) {
        const setsFound = Math.floor(setCounters[i] / Constants.piecesBySetIndex[i]);
        for (var j = 0; j < setsFound; j++) {
            sets.push(Constants.setsByIndex[i]);
        }
    }

    const images = sets.map(x => '<img class="optimizerSetIcon" src=' + Assets.getSetAsset(x) + '></img>');
    // console.log("RenderSets images", images);
    return images.join("");
}
// function columnGradient(params) {
//     const field = params.colDef.field;
//     if (field == "sets" || field == "name") return;

//     const hero = module.exports.getSelectedRow();
//     if (params.value > hero[field]) {
//         return {
//             backgroundColor: "#bbfd91"
//         };
//     } else if (params.value < hero[field]) {
//         return {
//             backgroundColor: "#ffafaf"
//         };
//     } else {
//         // return {
//         //     backgroundColor: "#fffdc4"
//         // };
//     }
// }

function columnGradient(params) {
    try {
        if (!params || params.value == undefined) return;
        var colId = params.column.colId;
        var value = params.value;

        var agg = currentAggregate[colId];

        if (!agg) return;

        // var percent = agg.max == agg.min ? 1 : (value - agg.min) / (agg.max - agg.min);

        var color;
        if (value > agg.avg) {
            var percent = 0.5 * ((value - agg.avg) / (agg.max - agg.avg)) + 0.5
            percent = Math.min(1, Math.max(0, percent))
            color = gradient.rgbAt(percent);
        }

        if (value == agg.avg) {
            color = gradient.rgbAt(0.5)
        }

        if (value < agg.avg) {
            var percent = (1 - (agg.avg - value) / (agg.avg - agg.min))*0.5
            percent = Math.min(1, Math.max(0, percent))
            color = gradient.rgbAt(percent);
        }

        // if (agg.min == 0 && agg.max == 0) {
        //     color = gradient.rgbAt(0.5)
        // }

        return {
            backgroundColor: color.toHexString()
        };
    } catch (e) {console.error(e)}
}

function navigateToNextCell(params) {
  var previousCell = params.previousCellPosition,
    suggestedNextCell = params.nextCellPosition,
    nextRowIndex,
    renderedRowCount;

  switch (params.key) {
    case KEY_DOWN:
      // return the cell below
      nextRowIndex = previousCell.rowIndex + 1;
      renderedRowCount = optimizerGrid.gridOptions.api.getModel().getRowCount();
      if (nextRowIndex >= renderedRowCount) {
        return null;
      } // returning null means don't navigate

      optimizerGrid.gridOptions.api.selectNode(optimizerGrid.gridOptions.api.getRowNode("" + nextRowIndex))
      return {
        rowIndex: nextRowIndex,
        column: previousCell.column,
        floating: previousCell.floating,
      };
    case KEY_UP:
      // return the cell above
      nextRowIndex = previousCell.rowIndex - 1;
      if (nextRowIndex <= -1) {
        return null;
      } // returning null means don't navigate

      optimizerGrid.gridOptions.api.selectNode(optimizerGrid.gridOptions.api.getRowNode("" + nextRowIndex))
      return {
        rowIndex: nextRowIndex,
        column: previousCell.column,
        floating: previousCell.floating,
      };
    case KEY_LEFT:
    case KEY_RIGHT:
      return suggestedNextCell;
    default:
      throw 'this will never happen, navigation is always one of the 4 keys above';
  }
}


function renderElement(element) {
    var file = Assets.getElementAsset(element);
    return `<img class='optimizerSetIcon' src='${file}'></img>`;

    // return {
    //     "light": "<img class='optimizerSetIcon' src='https://assets.epicsevendb.com/attribute/cm_icon_promlight.png'></img>",
    //     "fire": "<img class='optimizerSetIcon' src='https://assets.epicsevendb.com/attribute/cm_icon_profire.png'></img>",
    //     "ice": "<img class='optimizerSetIcon' src='https://assets.epicsevendb.com/attribute/cm_icon_proice.png'></img>",
    //     "wind": "<img class='optimizerSetIcon' src='https://assets.epicsevendb.com/attribute/cm_icon_proearth.png'></img>",
    //     "dark": "<img class='optimizerSetIcon' src='https://assets.epicsevendb.com/attribute/cm_icon_promdark.png'></img>",
    // }[element];
}

function renderClass(role) {
    var file = Assets.getClassAsset(role);
    return `<img class='optimizerSetIcon' src='${file}'></img>`;

    // return {
    //     "light": "<img class='optimizerSetIcon' src='https://assets.epicsevendb.com/attribute/cm_icon_promlight.png'></img>",
    //     "fire": "<img class='optimizerSetIcon' src='https://assets.epicsevendb.com/attribute/cm_icon_profire.png'></img>",
    //     "ice": "<img class='optimizerSetIcon' src='https://assets.epicsevendb.com/attribute/cm_icon_proice.png'></img>",
    //     "wind": "<img class='optimizerSetIcon' src='https://assets.epicsevendb.com/attribute/cm_icon_proearth.png'></img>",
    //     "dark": "<img class='optimizerSetIcon' src='https://assets.epicsevendb.com/attribute/cm_icon_promdark.png'></img>",
    // }[element];
}



function renderIcon(name) {
    const url = HeroData.getHeroExtraInfo(name).assets.icon
    const image = '<img class="heroIcon" src=' + url + '></img>';
    return image;
}

// function renderClass(value) {
//     if (value == 'manauser')
//         return 'Soul Weaver';
//     if (value == 'mage')
//         return 'Mage';
//     if (value == 'ranger')
//         return 'Ranger';
//     if (value == 'knight')
//         return 'Knight';
//     if (value == 'warrior')
//         return 'Warrior';
//     if (value == 'assassin')
//         return 'Thief';
//     return value;
// }

async function onBuildRowSelected(event) {
    console.log("onBuildRowSelected", event);
    if (event.node.selected) {
        const hero = HeroesGrid.getSelectedRow();
        // const baseStatsResponse = await Api.getBaseStats(hero.name);
        const useReforgeStats = HeroesTab.getUseReforgedStats();
        const heroResponse = await Api.getHeroById(hero.id, useReforgeStats);
        const baseStats = heroResponse.baseStats;
        const itemIds = event.data.items;

        const itemsResponse = await Api.getItemsByIds(itemIds);
        const items = itemsResponse.items;

        for (var i = 0; i < 6; i++) {
            const item = items[i];
            // const itemId = itemIds[i];
            const displayId = Constants.gearDisplayIdByIndex[i];
            const html = HtmlGenerator.buildItemPanel(item, "heroesGrid", baseStats)
            document.getElementById(displayId).innerHTML = html;
        }
    }

    // const equipmentMap = hero.equipment ? hero.equipment : {};
    // const equipment = [
    //     equipmentMap["Weapon"],
    //     equipmentMap["Helmet"],
    //     equipmentMap["Armor"],
    //     equipmentMap["Necklace"],
    //     equipmentMap["Ring"],
    //     equipmentMap["Boots"],
    // ]

    // module.exports.refreshBuilds();

    // const baseStatsResponse = await Api.getBaseStats(hero.name);

    // for (var i = 0; i < 6; i++) {
    //     const gear = equipment[i];
    //     const displayId = Constants.gearDisplayIdByIndex[i];

    //     const html = HtmlGenerator.buildItemPanel(gear, "heroesGrid", baseStatsResponse.heroStats)
    //     document.getElementById(displayId).innerHTML = html;
    // }
}

function onHeroRowClick(event) {
    selectedBuildNode = null;
}

function onHeroRowSelected(event) {
    if (event.node.selected) {
        console.log("onHeroRowSelected", event);
        const heroId = event.data.id;

        redrawPreviewHero(heroId);

        // const useReforgedStats = HeroesTab.getUseReforgedStats();
        // console.log("Use reforge", useReforgedStats)
        // Api.getHeroById(heroId, useReforgedStats).then(async (response) => {
        //     const hero = response.hero;
        //     console.log("On hero row selected hero row", hero);

        //     updateCurrentAggregate(hero);
        //     buildsGrid.gridOptions.api.setRowData(hero.builds == null ? [] : hero.builds)

        //     const equipmentMap = hero.equipment ? hero.equipment : {};
        //     const equipment = [
        //         equipmentMap["Weapon"],
        //         equipmentMap["Helmet"],
        //         equipmentMap["Armor"],
        //         equipmentMap["Necklace"],
        //         equipmentMap["Ring"],
        //         equipmentMap["Boots"],
        //     ]

        //     module.exports.refreshBuilds(response);

        //     // const baseStatsResponse = await Api.getBaseStats(hero.name);
        //     const baseStats = response.baseStats;

        //     for (var i = 0; i < 6; i++) {
        //         const gear = equipment[i];
        //         const displayId = Constants.gearDisplayIdByIndex[i];

        //         const html = HtmlGenerator.buildItemPanel(gear, "heroesGrid", baseStats)
        //         document.getElementById(displayId).innerHTML = html;
        //     }
        // })
    }
}

function redrawPreviewHero(heroId) {
    const useReforgedStats = HeroesTab.getUseReforgedStats();
    console.log("Use reforge", useReforgedStats)
    Api.getHeroById(heroId, useReforgedStats).then(async (response) => {
        const hero = response.hero;
        console.log("On hero row selected hero row", hero);

        updateCurrentAggregate(hero);
        buildsGrid.gridOptions.api.setRowData(hero.builds == null ? [] : hero.builds)

        const equipmentMap = hero.equipment ? hero.equipment : {};
        const equipment = [
            equipmentMap["Weapon"],
            equipmentMap["Helmet"],
            equipmentMap["Armor"],
            equipmentMap["Necklace"],
            equipmentMap["Ring"],
            equipmentMap["Boots"],
        ]

        module.exports.refreshBuilds(response);

        // const baseStatsResponse = await Api.getBaseStats(hero.name);
        const baseStats = response.baseStats;

        for (var i = 0; i < 6; i++) {
            const gear = equipment[i];
            const displayId = Constants.gearDisplayIdByIndex[i];

            const html = HtmlGenerator.buildItemPanel(gear, "heroesGrid", baseStats)
            document.getElementById(displayId).innerHTML = html;
        }
    })
}

function getField(heroStats, stat) {
    return heroStats.map(x => x[stat]);
}
function cleanInfinities(num) {
    if (num == -Infinity || num == Infinity) {
        return 0;
    }
    return num;
}


function updateCurrentAggregate(hero) {
    const statsToAggregate = [
        "atk",
        "hp",
        "def",
        "spd",
        "cr",
        "cd",
        "eff",
        "res",
        "dac",
        "cp",
        "hpps",
        "ehp",
        "ehpps",
        "dmg",
        "dmgps",
        "mcdmg",
        "mcdmgps",
        "dmgh",
        "score"
    ]

    const heroStats = hero.builds || [];
    var count = heroStats.length;

    for (var stat of statsToAggregate) {
        const arrSum = arr => arr.reduce((a,b) => a + b[stat], 0);
        var max = Math.max(...getField(heroStats, stat));
        var min = Math.min(...getField(heroStats, stat));
        var sum = arrSum(heroStats);
        var avg = hero[stat];

        if (stat == 'cr') {
            max = Math.min(100, max);
            min = Math.min(100, min);
        }
        if (stat == 'cd') {
            max = Math.min(350, max);
            min = Math.min(350, min);
        }

        currentAggregate[stat] = {
            max: cleanInfinities(max),
            min: cleanInfinities(min),
            sum: cleanInfinities(sum),
            avg: cleanInfinities(avg)
        }
    }

    console.log("Aggregated", currentAggregate);
}
