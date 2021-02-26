const themePath = './../../themes/';
let themeList = {};

module.exports = {
    initialize: () => {
        module.exports.loadThemeList();
    },

    loadThemeList: () => {
        let themeFiles = Files.listFilesInFolder('./themes');
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

    setTheme: (themeName) => {
        var style = document.getElementById('theme');
        style.href = themePath + themeList[themeName];
    }
}