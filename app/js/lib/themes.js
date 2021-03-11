const themePath = Files.getRootPath() + '/themes/';
let themeList = {};
let theme = '';

module.exports = {
    initialize: () => {
        module.exports.loadThemeList();
    },

    loadThemeList: () => {
        let themeFiles = Files.listFilesInFolder(themePath);
        for (var themeFile of themeFiles) {
            let themeName = themeFile.substring(0, themeFile.lastIndexOf('.css'));
            themeList[themeName] = themeFile;
        }
    },

    getDefaultTheme: () => {
        //return module.exports.getThemeList()[0];
        return 'Light';
    },

    getThemeList: () => {
        return Object.keys(themeList);
    },

    getLowerGearScoreGridGradientColor: () => {
        return '#ffa8a8';
    },

    getLowerOptimizerScoreGridGradientColor: () => {
        return '#F5A191';
    },

    getNeutralScoreGridGradientColor: () => {
        return getStyleDefinitionValue('.ag-theme-balham .ag-row:nth-child(even)', 'background-color');
    },

    getHigherGearScoreGridGradientColor: () => {
        return '#8fed78';
    },

    getHigherOptimizerScoreGridGradientColor: () => {
        return '#77e246';
    },

    getGridTextColor: () => {
        return getStyleDefinitionValue('.ag-theme-balham .ag-row:nth-child(even)', ' color');
    },

    setTheme: async (themeName) => {
        let path = themePath + themeList[themeName]
        theme = await Files.readFile(path);

        let style = document.getElementById('theme');
        style.href = path;

        OptimizerGrid.initialize();
        ItemsGrid.initialize();
        HeroesGrid.initialize();
    }
}

function getStyleDefinitionValue(definition, styleToGet) {
    let styleDefinition = theme.indexOf(definition);
    let styles = theme.substr(styleDefinition + 1, theme.substr(styleDefinition, theme.length).indexOf('}'));
    let lineStart = styles.substr(styles.indexOf(styleToGet));
    let styleLine = lineStart.substr(0, lineStart.indexOf(';')).replace(/\s/g, '');
    let value = styleLine.substr(styleLine.indexOf(':') + 1, styleLine.length);

    return value;
}