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
            let tlData = module.exports.getTranslationForKey(tlKey);

            if (tlData != null) {
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
                Object.assign(elem.style, translation['styles'][elemTag]);
            }
        });

        for (var selector of Object.keys(translation['styles'])) {
            if (selector.startsWith('#')) {
	            Object.assign(document.querySelector(selector).style, translation['styles'][selector]);
            } else if (selector.startsWith('.')) {
                document.querySelectorAll(selector).forEach((elem) => {
                    Object.assign(elem.style, translation['styles'][selector]);
                });
            }
        }

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
        Tooltip.updateTooltipLocalization();
    },

    getLocalizedHeroName: (heroNameEN) => {
        if (translation != null) {
            return translation['translation']['heroNames'][heroNameEN];
        }

        return heroNameEN;
    },

    getTranslationForKey: (key) => {
        if (translation != null) {
            let data = translation['translation']['app'][key];

            if (typeof data !== 'undefined' || data !== undefined || data !== '') {
                const substitutes = data?.match(/{([^}]+)}/g)?.forEach((sub) => {
                    let subKey = sub.substr(1, sub.length - 2);
                    data = data.replace(sub, translation['translation']['app'][subKey]);
				});

                const allowedTags = [ 'p', 'b', 'i', 'u', 'br', 'code' ];
                data = data.replace(/<([^>]+)>/g, (match, $1) => {
                    let tag = $1.toLowerCase();
                    if (!(allowedTags.includes(tag) || allowedTags.includes($1.substr(1, tag.length - 1)))) {
                        return '';
                    }

                    return match;
                });

                return data;
            }
        }

        //return `Translation not found for \"${key}\"`;
        return null;
    }
}

function updateMultipleSelectLocalization(dropdownId) {
    $('#' + dropdownId).multipleSelect('refreshOptions', {
        placeholder: translation['translation']['app'][dropdownId + 'DropdownPlaceholder'],
        formatSelectAll() {
            return translation['translation']['app']['dropdownSelectAllOptionLabel'];
        },
        formatNoMatchesFound() {
            return translation['translation']['app']['dropdownNoMatchesFoundOptionLabel'];
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