const translationsPath = Files.getRootPath() + '/translations/';
let translationFiles = {};
let translation = null;

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
        translation = JSON.parse(await Files.readFile(translationsPath + translationFiles[lang]));

        document.body.querySelectorAll('[data-tl-key]').forEach((elem) => {
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
                    elem.childNodes[0].nodeValue = tlData;
                }
            }

            if (translation['styles'].hasOwnProperty(elemTag)) {
                for (var _style of Object.keys(translation['styles'][elemTag])) {
                    elem.style[_style] = translation['styles'][elemTag][_style];
                }
            }
        });

        updateHeroDropdownOptionsText('inputHeroAdd');

        updateHeroDropdownOptionsText('optionsExcludeGearFrom');

        updateSetDropdownOptionsText('inputNecklaceStat');
        updateSetDropdownOptionsText('inputRingStat');
        updateSetDropdownOptionsText('inputBootsStat');

        updateSetDropdownOptionsText('inputSet1');
        updateSetDropdownOptionsText('inputSet2');
        updateSetDropdownOptionsText('inputSet3');

        updateSetDropdownOptionsText('inputExcludeSet');

        updateHeroDropdownOptionsText('addHeroesSelector');

        OptimizerTab.setMouseHoverClearText(translation['translation']['app']['clearSectionText']);

        OptimizerGrid.initialize();
        ItemsGrid.initialize();
        HeroesGrid.initialize();
    },

    getLocalizedHeroName: (heroNameEN) => {
        if (translation != null) {
            return translation['translation']['heroNames'][heroNameEN];
        }

        return heroNameEN;
    },

    getTranslationForKey: (key) => {
        if (translation != null) {
            return translation['translation']['app'][key];
        }
    }
}

function updateMultipleSelectLocalization(dropdownId) {
    $('#' + dropdownId).multipleSelect('refreshOptions', {
        placeholder: translation['translation']['app'][dropdownId + 'DropdownPlaceholder'],
        formatSelectAll() {
            return translation['translation']['dropdown']['selectAllOptionLabel'];
        },
        formatNoMatchesFound() {
            return translation['translation']['dropdown']['noMatchesFoundOptionLabel'];
        }
    });
}

function updateHeroDropdownOptionsText(dropdownId) {
    let dropdown = document.getElementById(dropdownId);
    for (let i = 0; i < dropdown.children.length; i++) {
        dropdown.children[i].innerText = translation['translation']['heroNames'][dropdown.children[i].getAttribute('value')];
    }
    updateMultipleSelectLocalization(dropdownId, translation);

    $('#' + dropdownId).multipleSelect('refresh');
}

function updateSetDropdownOptionsText(dropdownId) {
    let dropdown = document.getElementById(dropdownId);
    for (let i = 0; i < dropdown.children.length; i++) {
        dropdown.children[i].setAttribute('label', translation['translation']['app'][dropdown.children[i].getAttribute('data-tl-key')]);

        let dropdownOpts = dropdown.children[i];
        for (let j = 0; j < dropdownOpts.length; j++) {
            dropdownOpts.children[j].innerText = translation['translation']['app'][dropdownOpts.children[i].getAttribute('data-tl-key')];
        }
    }
    updateMultipleSelectLocalization(dropdownId, translation);

    $('#' + dropdownId).multipleSelect('refresh');
}