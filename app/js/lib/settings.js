const { remote } = require('electron')
const dialog = remote.dialog;
const currentWindow = remote.getCurrentWindow();
const documentsPath = remote.app.getPath('documents');
const savesFolder = documentsPath + '/FribbelsOptimizerSaves';

const defaultPath = savesFolder;

const settingsPath = defaultPath + "/settings.ini";
var pathOverride;

module.exports = {
    initialize: () => {
        module.exports.loadSettings();

        const settingsIds = [
            'settingUnlockOnUnequip',
            'settingMaxResults',
            'settingRageSet',
            'settingAppTheme'
        ];

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

        const themeList = Themes.getThemeList();
        for (var themeName of themeList) {
            let themeOption = document.createElement('option')
            themeOption.text = themeName;
            document.getElementById(settingsIds[3]).add(themeOption);
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
    },

    getDefaultPath: () => {
        return Files.path(pathOverride || defaultPath);
    },

    getDefaultSettings: () => {
        return {
            settingUnlockOnUnequip: true,
            settingRageSet: true,
            settingMaxResults: 5_000_000,
            settingAppTheme: Themes.getDefaultTheme(),
            defaultPath: defaultPath
        }
    },

    loadSettings: async () => {
        console.log("LOAD SETTINGS");
        const text = await Files.readFile(Files.path(settingsPath));
        const settings = JSON.parse(text);

        document.getElementById('settingUnlockOnUnequip').checked = settings.settingUnlockOnUnequip;
        document.getElementById('settingRageSet').checked = settings.settingRageSet;
        pathOverride = settings.settingDefaultPath;

        if (settings.settingMaxResults) {
            document.getElementById('settingMaxResults').value = settings.settingMaxResults;
        }
		
        if (settings.settingAppTheme) {
            document.getElementById('settingAppTheme').value = settings.settingAppTheme;
            Themes.setTheme(settings.settingAppTheme);
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
            settingAppTheme: document.getElementById('settingAppTheme').value || module.exports.getDefaultSettings().settingAppTheme,
            settingDefaultPath: pathOverride ? pathOverride : defaultPath
        };

        Files.saveFile(Files.path(settingsPath), JSON.stringify(settings, null, 2))
        Api.setSettings(settings);
    }
}