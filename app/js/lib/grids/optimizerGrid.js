const tinygradient = require('tinygradient');
const tinycolor = require('tinycolor2');
var gradient = null;
var textColor = tinycolor('#000');
var inverseTextColor = tinycolor('#fff');

optimizerGrid = null;
var currentSortModel;
var currentAggregate = {};
var selectedRow = null;
var pinnedRow = {
    atk: 0,
    def: 0,
    hp: 0,
    spd: 0,
    cr: 0,
    cd: 0,
    eff: 0,
    res: 0
};

module.exports = {

    initialize: () => {
        gradient = tinygradient([
            {color: Themes.getLowerOptimizerScoreGridGradientColor(), pos: 0},
            {color: Themes.getNeutralScoreGridGradientColor(), pos: 0.5},
            {color: Themes.getHigherOptimizerScoreGridGradientColor(), pos: 1}
        ]);
        textColor = tinycolor(Themes.getGridTextColor());
        inverseTextcolor = (textColor.isLight()) ? textColor.clone().darken(90) : textColor.clone().brighten(90);

        buildGrid();
    },

    reloadData: (getResultRowsResponse) => {
        optimizerGrid.gridOptions.api.setDatasource(datasource);
    },

    refresh: (getResultRowsResponse) => {
        // gridOptions
        console.log("REFRESH")
        // const selectedNode = optimizerGrid.gridOptions.api.getSelectedNodes()[0]

        optimizerGrid.gridOptions.api.refreshInfiniteCache()
        // optimizerGrid.gridOptions.api.forEachNode((node) => {
        //     console.log(node.data)
        //     console.log(selectedNode.data)
        //     if (selectedNode && node.data.id == selectedNode.data.id) {
        //         node.setSelected(true, false);
        //     }
        // })
        // optimizerGrid.gridOptions.api.refreshInfiniteCache();
        // optimizerGrid.gridOptions.api.paginationGoToPage(0);
    },

    setPinnedHero: (hero) => {
        optimizerGrid.gridOptions.api.setPinnedTopRowData([hero]);
        pinnedRow = hero;
        StatPreview.draw(pinnedRow, pinnedRow)
    },

    showLoadingOverlay: () => {
        optimizerGrid.gridOptions.api.showLoadingOverlay();
    },

    getSelectedGearIds: () => {
        const selectedRows = optimizerGrid.gridOptions.api.getSelectedRows();
        if (selectedRows.length > 0) {
            const row = selectedRows[0];
            console.log("getSelectedGearIds SELECTED ROW", row)

            return [
                row.items[0],
                row.items[1],
                row.items[2],
                row.items[3],
                row.items[4],
                row.items[5]
            ];
        }
        return [];
    },

    getSelectedRow: () => {
        const selectedRows = optimizerGrid.gridOptions.api.getSelectedRows();
        if (selectedRows.length > 0) {
            const row = selectedRows[0];
            console.log("getSelectedRow SELECTED ROW", row)

            return row;
        }
        return null;
    },

    getSelectedNode: () => {
        const selectedNodes = optimizerGrid.gridOptions.api.getSelectedNodes();
        if (selectedNodes.length > 0) {
            const node = selectedNodes[0];
            console.log("selectedNode SELECTED NODE", node)

            return node;
        }
        return null;
    },
}

const datasource = {
    async getRows(params) {
        console.log("DEBUG getRows params", params);
        const startRow = params.startRow;
        const endRow = params.endRow;
        const sortColumn = params.sortModel.length ? params.sortModel[0].colId : null;
        const sortOrder = params.sortModel.length ? params.sortModel[0].sort : null;

        global.optimizerGrid = optimizerGrid;

        optimizerGrid.gridOptions.api.showLoadingOverlay();
        const heroId = document.getElementById('inputHeroAdd').value;
        const optimizationRequest = OptimizerTab.getOptimizationRequestParams();
        optimizationRequest.heroId = heroId;

        const request = {
            startRow: startRow,
            endRow: endRow,
            sortColumn: sortColumn,
            sortOrder: sortOrder,
            optimizationRequest: optimizationRequest
        }

        const getResultRowsResponse = Api.getResultRows(request).then(getResultRowsResponse => {
            console.log("GetResultRowsResponse", getResultRowsResponse);
            aggregateCurrentHeroStats(getResultRowsResponse.heroStats)
            optimizerGrid.gridOptions.api.hideOverlay();
            params.successCallback(getResultRowsResponse.heroStats, getResultRowsResponse.maximum)

            var pinned = optimizerGrid.gridOptions.api.getPinnedTopRow(0);
            if (pinned) {
                optimizerGrid.gridOptions.api.setPinnedTopRowData([pinned.data])
            }
        });
    },
}

function aggregateCurrentHeroStats(heroStats) {
// currentAggregate
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

    var count = heroStats.length;

    for (var stat of statsToAggregate) {
        const arrSum = arr => arr.reduce((a,b) => a + b[stat], 0);
        var max = Math.max(...getField(heroStats, stat));
        var min = Math.min(...getField(heroStats, stat));
        var sum = arrSum(heroStats);
        var avg = sum/count;

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

function cleanInfinities(num) {
    if (num == -Infinity || num == Infinity) {
        return 0;
    }
    return num;
}

function getField(heroStats, stat) {
    return heroStats.map(x => x[stat]);
}

function buildGrid() {

    const DIGITS_2 = 35;
    const DIGITS_3 = 43;
    const DIGITS_4 = 48;
    const DIGITS_5 = 50;
    const DIGITS_6 = 55;

    const gridOptions = {
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
            {headerName: Languages.getTranslationForKey('gearSetsLabel'), field: 'sets', width: 100, cellRenderer: (params) => GridRenderer.renderSets(params.value)},
            {headerName: Languages.getTranslationForKey('substatAtkLabel'), field: 'atk', width: DIGITS_4},
            {headerName: Languages.getTranslationForKey('substatHpLabel'), field: 'hp', width: DIGITS_5},
            {headerName: Languages.getTranslationForKey('substatDefLabel'), field: 'def', width: DIGITS_4},
            {headerName: Languages.getTranslationForKey('substatSpdLabel'), field: 'spd', width: DIGITS_3},
            {headerName: Languages.getTranslationForKey('substatCrLabel'), field: 'cr', width: DIGITS_3},
            {headerName: Languages.getTranslationForKey('substatCdLabel'), field: 'cd', width: DIGITS_3},
            {headerName: Languages.getTranslationForKey('substatEffLabel'), field: 'eff', width: DIGITS_3},
            {headerName: Languages.getTranslationForKey('substatResLabel'), field: 'res', width: DIGITS_3},
            // {headerName: 'dac', field: 'dac'},
            {headerName: Languages.getTranslationForKey('ratingCombatPowerLabel'), field: 'cp', width: DIGITS_6},
            {headerName: Languages.getTranslationForKey('ratingHpSpeedLabel'), field: 'hpps', width: DIGITS_4},
            {headerName: Languages.getTranslationForKey('ratingEffectiveHpLabel'), field: 'ehp', width: DIGITS_6},
            {headerName: Languages.getTranslationForKey('ratingEffectiveHpSpeedLabel'), field: 'ehpps', width: DIGITS_5},
            {headerName: Languages.getTranslationForKey('ratingDmgLabel'), field: 'dmg', width: DIGITS_5},
            {headerName: Languages.getTranslationForKey('ratingDmgSpeedLabel'), field: 'dmgps', width: DIGITS_4},
            {headerName: Languages.getTranslationForKey('ratingMaxCritDmgLabel'), field: 'mcdmg', width: DIGITS_5},
            {headerName: Languages.getTranslationForKey('ratingMaxCritDmgSpeedLabel'), field: 'mcdmgps', width: DIGITS_4},
            {headerName: Languages.getTranslationForKey('ratingDmgHealthLabel'), field: 'dmgh', width: DIGITS_5},
            {headerName: Languages.getTranslationForKey('ratingGearScoreLabel'), field: 'score', width: DIGITS_3},
            {headerName: Languages.getTranslationForKey('ratingNumGearsToUpgradeLabel'), field: 'upgrades', width: DIGITS_2},
            {headerName: Languages.getTranslationForKey('availableActionsLabel'), field: 'property', width: 50, sortable: false, cellRenderer: (params) => GridRenderer.renderStar(params.value)},
        ],
        rowHeight: 27,
        rowModelType: 'infinite',
        rowSelection: 'single',
        onRowSelected: onRowSelected,
        pagination: true,
        paginationPageSize: 500,
        cacheBlockSize: 500,
        maxBlocksInCache: 1,
        suppressPaginationPanel: false,
        datasource: datasource,
        suppressScrollOnNewData: true,
        onCellMouseOver: cellMouseOver,
        onCellMouseOut: cellMouseOut,
        navigateToNextCell: GridRenderer.arrowKeyNavigator().bind(this),
        localeText: Languages.getAgGridLocalization()
    };

    const gridDiv = document.getElementById('myGrid');
    gridDiv.textContent = '';
    optimizerGrid = new Grid(gridDiv, gridOptions);
    console.log("Built optimizergrid", optimizerGrid);
}

function getContrastingTextColor(cellColor) {
    if (cellColor.clone().darken().isLight()) {
        return textColor;
    }

    return inverseTextColor;
}

function columnGradient(params) {
    try {
        if (!params || params.value == undefined) return;
        var colId = params.column.colId;
        var value = params.value;

        var agg = currentAggregate[colId];
        if (!agg) return;

        var percent = agg.max == agg.min ? 1 : (value - agg.min) / (agg.max - agg.min);
        percent = Math.min(1, Math.max(0, percent))

        var bgColor = gradient.rgbAt(percent);
        if (agg.min == 0 && agg.max == 0) {
            bgColor = gradient.rgbAt(0.5)
        }
		const cellTextColor = getContrastingTextColor(bgColor);

        return {
            backgroundColor: bgColor.toHexString(),
            color: cellTextColor.toHexString()
        };
    } catch (e) {console.error(e)}
}

function onRowSelected(event) {
    console.log("row selected")
    if (!event.node.selected) return;

    selectedRow = event.data;
    StatPreview.draw(pinnedRow, selectedRow);

    const gearIds = module.exports.getSelectedGearIds();
    OptimizerTab.drawPreview(gearIds);
}

function cellMouseOver(event) {
    const row = event.data;
    if (!row) return;

    StatPreview.draw(pinnedRow, row);
}

function cellMouseOut(event) {
    const row = selectedRow;
    if (!row) return;

    StatPreview.draw(pinnedRow, row);
}