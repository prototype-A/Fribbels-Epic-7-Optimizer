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
            if (tlData != '') {
                if (elemTag === 'input') {
                    elem.value = tlData;
                    //elem.style.width = elem.value.length + 'ch';
                } else if (elemTag === 'p' || elemTag === 'div') {
                    elem.innerHTML = tlData;
                } else if (elemTag === 'optgroup') {
                    elem.label = tlData;
			    } else {
                    elem.innerText = tlData;
                }
            }
            if (translation['styles'].hasOwnProperty(elemTag)) {
                for (var _style of Object.keys(translation['styles'][elemTag])) {
                    elem.style[_style] = translation['styles'][elemTag][_style];
                }
            }
        });
    }
}