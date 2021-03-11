const { remote } = require('electron')
const dialog = remote.dialog;
const currentWindow = remote.getCurrentWindow();
const documentsPath = remote.app.getPath('documents');
const savesFolder = documentsPath + '/FribbelsOptimizerSaves';

const defaultPath = savesFolder;

const settingsPath = defaultPath + "/settings.ini";
var pathOverride;

var excludeSelects = [];

module.exports = {
    initialize: async () => {
        const settingsIds = [
            'settingUnlockOnUnequip',
            'settingRageSet',
            'settingMaxResults',
            'settingAppTheme',
            'settingAppLanguage'
        ];

        $('#optionsExcludeGearFrom').change(module.exports.saveSettings)


        for (var id of settingsIds) {
            document.getElementById(id).addEventListener('change', (event) => {
                module.exports.saveSettings();
                if (event.target.id === settingsIds[3]) {
                    Themes.setTheme(event.target.value);
                } else if (event.target.id === settingsIds[4]) {
                    Languages.setLanguage(event.target.value);
                }
            });
        }

        document.getElementById('selectDefaultFolderSubmit').addEventListener("click", async () => {
            const options = {
                title: "Open folder",
                defaultPath : module.exports.getDefaultPath(),
                buttonLabel : "Open folder",
                properties: ['openDirectory'],
            }

            const filenames = dialog.showOpenDialogSync(currentWindow, options);
            console.log(filenames);

            if (!filenames || filenames.length < 1) {
                return console.warn("Invalid filename")
            };

            const path = Files.path(filenames[0]);
            pathOverride = path;
            module.exports.saveSettings();
            $('#selectDefaultFolderSubmitOutputText').text(`New saves folder: ${path}`);

            Notifier.info(path);
        });

        const themeList = Themes.getThemeList();
        for (var themeName of themeList) {
            let themeOption = document.createElement('option')
            themeOption.text = themeName;
            themeOption.value = themeName;
            document.getElementById(settingsIds[3]).add(themeOption);
        }

        const langList = Languages.getLanguageList();
        for (var langName of langList) {
            let langOption = document.createElement('option')
            langOption.text = langName;
            langOption.value = langName;
            document.getElementById(settingsIds[4]).add(langOption);
        }
		
        await module.exports.loadSettings();
    },

    getDefaultPath: () => {
        return Files.path(pathOverride || defaultPath);
    },

    getExcludeSelects: () => {
        return excludeSelects;
    },

    getDefaultSettings: () => {
        return {
            settingUnlockOnUnequip: true,
            settingRageSet: true,
            settingMaxResults: 5_000_000,
            defaultPath: defaultPath,
            settingExcludeEquipped: [],
            settingAppTheme: Themes.getDefaultTheme(),
            settingAppLanguage: Languages.getDefaultLanguage()
        }
    },

    loadSettings: async () => {
        console.log("LOAD SETTINGS", settingsPath);
        const text = await Files.readFile(Files.path(settingsPath));
        const settings = JSON.parse(text);
        console.log("LOADING SETTINGS", settings);

        document.getElementById('settingUnlockOnUnequip').checked = settings.settingUnlockOnUnequip;
        document.getElementById('settingRageSet').checked = settings.settingRageSet;
        pathOverride = settings.settingDefaultPath;

        if (settings.settingMaxResults) {
            document.getElementById('settingMaxResults').value = settings.settingMaxResults;
        }

        if (settings.settingExcludeEquipped) {
            console.log("BEFORE", $('#optionsExcludeGearFrom').multipleSelect('getOptions'))
            console.log("BEFORE", $('#optionsExcludeGearFrom').multipleSelect('getSelects'))
            $('#optionsExcludeGearFrom').multipleSelect('setSelects', settings.settingExcludeEquipped)
            console.log("AFTER", $('#optionsExcludeGearFrom').multipleSelect('getSelects'))
            excludeSelects = settings.settingExcludeEquipped;
        }

        if (settings.settingAppTheme) {
            document.getElementById('settingAppTheme').value = settings.settingAppTheme;
            await Themes.setTheme(settings.settingAppTheme);
        }

        if (settings.settingAppLanguage) {
            document.getElementById('settingAppLanguage').value = settings.settingAppLanguage;
            await Languages.setLanguage(settings.settingAppLanguage);
        }

        $('#selectDefaultFolderSubmitOutputText').text(settings.settingDefaultPath || defaultPath);
        Api.setSettings(settings);
    },

    saveSettings: async () => {
        console.log("SAVE SETTINGS");
        const settings = {
            settingUnlockOnUnequip: document.getElementById('settingUnlockOnUnequip').checked,
            settingRageSet: document.getElementById('settingRageSet').checked,
            settingMaxResults: parseInt(document.getElementById('settingMaxResults').value || 5_000_000),
            settingDefaultPath: pathOverride ? pathOverride : defaultPath,
            settingExcludeEquipped: $('#optionsExcludeGearFrom').multipleSelect('getSelects'),
            settingAppTheme: document.getElementById('settingAppTheme').value || module.exports.getDefaultSettings().settingAppTheme,
            settingAppLanguage: document.getElementById('settingAppLanguage').value || module.exports.getDefaultSettings().settingAppLanguage
        };

        excludeSelects = settings.settingExcludeEquipped;

        Files.saveFile(settingsPath, JSON.stringify(settings, null, 2))
        Api.setSettings(settings);
    }
}