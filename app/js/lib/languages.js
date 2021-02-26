const translationsPath = './translations/';
let translationFiles = {};

module.exports = {
    initialize: async () => {
        await module.exports.loadLanguageList();
    },

    loadLanguageList: async () => {
        let langFiles = Files.listFilesInFolder(translationsPath);
        for (var langFile of langFiles) {
            const langName = JSON.parse(await Files.readFile(translationsPath + langFile))['name'];
            translationFiles[langName] = langFile;
        }
    },

    getDefaultLanguage: () => {
        //return module.exports.getLanguageList()[0];
        return 'English';
    },

    getLanguageList: () => {
        return Object.keys(translationFiles);
    },

    setLanguage: async (lang) => {
        const translation = JSON.parse(await Files.readFile(translationsPath + translationFiles[lang]));

        document.body.querySelectorAll('[data-tl-key]').forEach(function(elem) {
			let elemTag = elem.tagName.toLowerCase();
            let tlKey = elem.dataset['tlKey'];
            let tlData = translation['translation']['app'][tlKey];

            const substitutes = tlData.match(/{([^}]+)}/g);
            if (substitutes != null) {
                for (var sub of substitutes) {
                    let subKey = sub.substr(1, sub.length - 2);
                    tlData = tlData.replace(sub, translation['translation']['app'][subKey]);
                }
            }

            if (tlData != '') {
                if (elemTag === 'input') {
                    elem.value = tlData;
                    //elem.style.width = elem.value.length + 'ch';
                } else if (elemTag === 'optgroup') {
                    elem.label = tlData;
                } else {
                    elem.innerText = tlData;
                }
            }

            OptimizerTab.setMouseHoverClearText(translation['translation']['app']['clearSectionText']);

            if (translation['styles'].hasOwnProperty(elemTag)) {
                for (var _style of Object.keys(translation['styles'][elemTag])) {
                    elem.style[_style] = translation['styles'][elemTag][_style];
                }
            }
        });
    }
}