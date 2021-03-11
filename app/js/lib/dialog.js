const Swal = require('sweetalert2');

const e7StatToOptimizerStat = {
    "att_rate": "AttackPercent",
    "max_hp_rate": "HealthPercent",
    "def_rate": "DefensePercent",
    "att": "Attack",
    "max_hp": "Health",
    "def": "Defense",
    "speed": "Speed",
    "res": "EffectResistancePercent",
    "cri": "CriticalHitChancePercent",
    "cri_dmg": "CriticalHitDamagePercent",
    "acc": "EffectivenessPercent",
    "coop": "DualAttackChancePercent"
}

var e7StatToDisplayStat;

module.exports = {

    initialize: () => {
        e7StatToDisplayStat = {
            "att_rate": "% " + Languages.getTranslationForKey('statAttackLabel'),
            "max_hp_rate": "% " + Languages.getTranslationForKey('statHealthLabel'),
            "def_rate": "% " + Languages.getTranslationForKey('statDefenseLabel'),
            "att": " " + Languages.getTranslationForKey('statAttackLabel'),
            "max_hp": " " + Languages.getTranslationForKey('statHealthLabel'),
            "def": " " + Languages.getTranslationForKey('statDefenseLabel'),
            "speed": " " + Languages.getTranslationForKey('statSpeedLabel'),
            "res": "% " + Languages.getTranslationForKey('statEffectResistanceLabel'),
            "cri": "% " + Languages.getTranslationForKey('statCritChanceLabel'),
            "acc": "% " + Languages.getTranslationForKey('statEffectivenessLabel'),
            "coop": "% " + Languages.getTranslationForKey('statDualAttackChance')
        }
    },

    error: (text) => {
        Swal.fire({
          icon: 'error',
          text: text,
        })
    },

    info: (text) => {
        Swal.fire({
          icon: 'info',
          text: text,
        })
    },

    success: (text) => {
        Swal.fire({
          icon: 'success',
          text: text,
        })
    },

    htmlSuccess: (html) => {
        Swal.fire({
          icon: 'success',
          html: html,
        })
    },

    changeArtifact: (level) => {
        const name = $('#editArtifact').val();

        var html = ``;

//${level == i ? "selected" : ""}
        for (var i = 30; i >= 0; i--) {
            var stats = Artifact.getStats(name, i)
            html += `<option value="${i}" >${i} - (${stats.attack.toFixed(1)} atk, ${stats.health.toFixed(1)} hp)</option>`
        }

        $("select[id='editArtifactLevel']").find('option').remove().end().append(html);
    },

    editHeroDialog: async (hero) => {
        return new Promise(async (resolve, reject) => {
            const getAllHeroesResponse = await Api.getAllHeroes();
            const heroData = HeroData.getAllHeroData();
            const heroes = getAllHeroesResponse.heroes;

            const heroInfo = heroData[hero.name];
            const ee = heroInfo.ex_equip[0];

            const { value: formValues } = await Swal.fire({
                title: '',
                html: `
                    <div class="editGearForm">
                        <link href="https://cdn.jsdelivr.net/npm/@sweetalert2/themes@4.0.1/minimal/minimal.min.css" rel="stylesheet">

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('artifactLabel')}</div>
                            <select id="editArtifact" class="editGearStatSelect" onchange="Dialog.changeArtifact()">
                                ${getArtifactHtml(hero)}
                            </select>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('artifactLevelLabel')}</div>
                            <select id="editArtifactLevel" class="editGearStatSelect">
                                ${getArtifactEnhanceHtml(hero)}
                            </select>
                        </div>

                        <div class="horizontalLineWithMoreSpace"></div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('imprintConcentrationLabel')}</div>
                            ${getImprintHtml(hero, heroInfo)}
                        </div>

                        <div class="horizontalLineWithMoreSpace"></div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('exclusiveEquipmentLabel')}</div>

                            <select id="editEe" class="editGearStatSelect">
                                ${getEeEnhanceHtml(hero, ee)}
                            </select>
                        </div>


                        <div class="horizontalLineWithMoreSpace"></div>

                        <p>${Languages.getTranslationForKey('addAdditionalBonusStatsTitle')}</p>
                        <br>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('statAttackLabel')}</div>
                            <div class="valuePadding input-holder">
                                <input type="number" class="bonusStatInput" max="100" accuracy="1" min="0" id="editHeroBonusAttack" value="${hero.bonusAtk || 0}">
                            </div>
                            <div class="blankFormSpace"></div>
                            <span class="valuePadding input-holder-percent">
                                <input type="number" class="bonusStatInputPercent" max="100" accuracy="1" min="0" id="editHeroBonusAttackPercent" value="${hero.bonusAtkPercent || 0}">
                            </span>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('statDefenseLabel')}</div>
                            <span class="valuePadding input-holder">
                                <input type="number" class="bonusStatInput" max="100" accuracy="1" min="0" id="editHeroBonusDefense" value="${hero.bonusDef || 0}">
                            </span>
                            <div class="blankFormSpace"></div>
                            <span class="valuePadding input-holder-percent">
                                <input type="number" class="bonusStatInputPercent" max="100" accuracy="1" min="0" id="editHeroBonusDefensePercent" value="${hero.bonusDefPercent || 0}">
                            </span>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('statHealthLabel')}</div>
                            <span class="valuePadding input-holder">
                                <input type="number" class="bonusStatInput" max="100" accuracy="1" min="0" id="editHeroBonusHealth" value="${hero.bonusHp || 0}">
                            </span>
                            <div class="blankFormSpace"></div>
                            <span class="valuePadding input-holder-percent">
                                <input type="number" class="bonusStatInputPercent" max="100" accuracy="1" min="0" id="editHeroBonusHealthPercent" value="${hero.bonusHpPercent || 0}">
                            </span>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('statSpeedLabel')}</div>
                            <span class="valuePadding input-holder">
                                <input type="number" class="bonusStatInput" max="100" accuracy="1" min="0" id="editHeroBonusSpeed" value="${hero.bonusSpeed || 0}">
                            </span>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('statCritChanceLabel')}</div>
                            <span class="valuePadding input-holder">
                                <input type="number" class="bonusStatInput" max="100" accuracy="1" min="0" id="editHeroBonusCritChance" value="${hero.bonusCr || 0}">
                            </span>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('statCritDmgLabel')}</div>
                            <span class="valuePadding input-holder">
                                <input type="number" class="bonusStatInput" max="100" accuracy="1" min="0" id="editHeroBonusCritDamage" value="${hero.bonusCd || 0}">
                            </span>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('statEffLabel')}</div>
                            <span class="valuePadding input-holder">
                                <input type="number" class="bonusStatInput" max="100" accuracy="1" min="0" id="editHeroBonusEffectiveness" value="${hero.bonusEff || 0}">
                            </span>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('statEffResLabel')}</div>
                            <span class="valuePadding input-holder">
                                <input type="number" class="bonusStatInput" max="100" accuracy="1" min="0" id="editHeroBonusEffectResistance" value="${hero.bonusRes || 0}">
                            </span>
                        </div>
                    </div>
                `,
                didOpen: async () => {
                    const options = {
                        filter: true,
                        maxHeight: 400,
                        // customFilter: Utils.customFilter,
                        filterAcceptOnEnter: true
                    }

                    $('#editArtifact').multipleSelect(options)
                    $('#editArtifact').change(module.exports.changeArtifact)
                },
                focusConfirm: false,
                showCancelButton: true,
                preConfirm: async () => {
                    const artifactName = $('#editArtifact').val();
                    const artifactLevel = $('#editArtifactLevel').val();
                    const imprintNumber = $('#editImprint').val();
                    const eeNumber = $('#editEe').val()

                    const editedHero = {
                        attack: parseInt(document.getElementById('editHeroBonusAttack').value),
                        defense: parseInt(document.getElementById('editHeroBonusDefense').value),
                        health: parseInt(document.getElementById('editHeroBonusHealth').value),
                        attackPercent: parseFloat(document.getElementById('editHeroBonusAttackPercent').value),
                        defensePercent: parseFloat(document.getElementById('editHeroBonusDefensePercent').value),
                        healthPercent: parseFloat(document.getElementById('editHeroBonusHealthPercent').value),
                        speed: parseInt(document.getElementById('editHeroBonusSpeed').value),
                        critChance: parseFloat(document.getElementById('editHeroBonusCritChance').value),
                        critDamage: parseFloat(document.getElementById('editHeroBonusCritDamage').value),
                        effectiveness: parseFloat(document.getElementById('editHeroBonusEffectiveness').value),
                        effectResistance: parseFloat(document.getElementById('editHeroBonusEffectResistance').value),

                        aeiAttack: 0,
                        aeiDefense: 0,
                        aeiHealth: 0,
                        aeiAttackPercent: 0,
                        aeiDefensePercent: 0,
                        aeiHealthPercent: 0,
                        aeiSpeedPercent: 0,
                        aeiCritChance: 0,
                        aeiCritDamage: 0,
                        aeiEffectiveness: 0,
                        aeiEffectResistance: 0,

                        artifactName: artifactName,
                        artifactLevel: artifactLevel,
                        imprintNumber: imprintNumber,
                        eeNumber: eeNumber,
                        ee: ee,
                        heroInfo: heroInfo
                    }

                    resolve(editedHero);
                }
            });
        });
    },

    editBuildDialog: async (name) => {
        return new Promise(async (resolve, reject) => {
            const { value: formValues } = await Swal.fire({
                title: '',
                html: `
                    <div class="editGearForm">
                        <link href="https://cdn.jsdelivr.net/npm/@sweetalert2/themes@4.0.1/minimal/minimal.min.css" rel="stylesheet">

                        <p>${Languages.getTranslationForKey('editBuildNamePopupLabel')}</p>
                        <input type="text" class="bonusStatInput" id="editBuildName" value="${name ? name : ""}" autofocus="autofocus" onfocus="this.select()" style="width:200px !important">
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                preConfirm: async () => {
                    const buildInfo = {
                        buildName: document.getElementById('editBuildName').value,
                    }

                    resolve(buildInfo);
                }
            });
        });
    },

    changeEditGearMainStat: () => {
        const gear = $('#editGearType').val();

        if (gear == "Weapon") {
            $('#editGearMainStatType').val("Attack")
        }
        if (gear == "Helmet") {
            $('#editGearMainStatType').val("Health")
        }
        if (gear == "Armor") {
            $('#editGearMainStatType').val("Defense")
        }
    },

    editGearDialog: async (item, edit, useReforgedStats) => {
        console.log("Dialog editing item", item);
        console.log("Dialog use reforged", useReforgedStats);
        if (!item) {
            item = {
                main: {},
                substats: []
            };
        }
        ItemAugmenter.augment([item])
        if (useReforgedStats && Reforge.isReforgeableNow(item)) {
            item = JSON.parse(JSON.stringify(item));
            item.level = 90;
            item.main.value = item.main.reforgedValue;

            for (var substat of item.substats) {
                substat.value = substat.reforgedValue;
            }
        }

        return new Promise(async (resolve, reject) => {
            const getAllHeroesResponse = await Api.getAllHeroes();
            const heroes = getAllHeroesResponse.heroes;

            const { value: formValues } = await Swal.fire({
                title: '',
                html: `
                    <div class="editGearForm">
                        <link href="https://cdn.jsdelivr.net/npm/@sweetalert2/themes@4.0.1/minimal/minimal.min.css" rel="stylesheet">

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('editGearEquippedToLabel')}</div>
                            <select id="editGearEquipped" class="editGearStatSelect">
                                ${getEquippedHtml(item, heroes)}
                            </select>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('editGearTypeLabel')}</div>
                            <select id="editGearType" class="editGearStatSelect" onchange="Dialog.changeEditGearMainStat()">
                                ${getGearTypeOptionsHtml(item)}
                            </select>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('gearTableSetLabel')}</div>
                            <select id="editGearSet" class="editGearStatSelect">
                                ${getGearSetOptionsHtml(item)}
                            </select>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('editGearReforgeLabel')}</div>
                            <select id="editGearMaterial" class="editGearStatSelect">
                                ${getGearMaterialOptionsHtml(item)}
                            </select>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('gearTableRankLabel')}</div>
                            <select id="editGearRank" class="editGearStatSelect">
                                ${getGearRankOptionsHtml(item)}
                            </select>
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('gearTableLevelLabel')}</div>
                            <input type="number" class="editGearStatNumber" id="editGearLevel" value="${item.level}">
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('gearTableEnhanceLevelLabel')}</div>
                            <input type="number" class="editGearStatNumber" id="editGearEnhance" value="${item.enhance}">
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('gearTableLockedLabel')}</div>
                            <input type="checkbox" id="editGearLocked" ${item.locked ? "checked" : ""}>
                        </div>

                        </br>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('editGearMainStatLabel')}</div>
                            <select id="editGearMainStatType" class="editGearStatSelect">
                                ${getStatOptionsHtml(item.main)}
                            </select>
                            <input type="number" class="editGearStatNumber" id="editGearMainStatValue" value="${item.main.value}">
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('editGearSubstat1Label')}</div>
                            <select id="editGearStat1Type" class="editGearStatSelect">
                                ${getStatOptionsHtml(item.substats[0])}
                            </select>
                            <input type="number" class="editGearStatNumber" id="editGearStat1Value" value="${item.substats[0] ? item.substats[0].value : ""}">
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('editGearSubstat2Label')}</div>
                            <select id="editGearStat2Type" class="editGearStatSelect">
                                ${getStatOptionsHtml(item.substats[1])}
                            </select>
                            <input type="number" class="editGearStatNumber" id="editGearStat2Value" value="${item.substats[1] ? item.substats[1].value : ""}">
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('editGearSubstat3Label')}</div>
                            <select id="editGearStat3Type" class="editGearStatSelect">
                                ${getStatOptionsHtml(item.substats[2])}
                            </select>
                            <input type="number" class="editGearStatNumber" id="editGearStat3Value" value="${item.substats[2] ? item.substats[2].value : ""}">
                        </div>

                        <div class="editGearFormRow">
                            <div class="editGearStatLabel">${Languages.getTranslationForKey('editGearSubstat4Label')}</div>
                            <select id="editGearStat4Type" class="editGearStatSelect">
                                ${getStatOptionsHtml(item.substats[3])}
                            </select>
                            <input type="number" class="editGearStatNumber" id="editGearStat4Value" value="${item.substats[3] ? item.substats[3].value : ""}">
                        </div>
                    </div>
                `,
                didOpen: async () => {
                    const options = {
                        filter: true,
                        filterAcceptOnEnter: true,
                        // customFilter: Utils.customFilter,
                        maxHeight: 250
                    }

                    $('#editGearEquipped').multipleSelect(options)
                },
                focusConfirm: false,
                showCancelButton: true,
                preConfirm: async () => {
                    const editedItem = {
                        rank: document.getElementById('editGearRank').value,
                        set: document.getElementById('editGearSet').value,
                        gear: document.getElementById('editGearType').value,
                        material: document.getElementById('editGearMaterial').value,
                        main: {
                            type: document.getElementById('editGearMainStatType').value,
                            value: parseInt(document.getElementById('editGearMainStatValue').value),
                        },
                        enhance: parseInt(document.getElementById('editGearEnhance').value) || 0,
                        level: parseInt(document.getElementById('editGearLevel').value) || 0,
                        locked: document.getElementById('editGearLocked').checked,
                    }

                    if (!editedItem.rank || editedItem.rank == "None" ||
                        !editedItem.set  || editedItem.set == "None"  ||
                        !editedItem.gear || editedItem.gear == "None" ||
                        !editedItem.main || !editedItem.main.type || editedItem.main.type == "None" || !editedItem.main.value) {
                        module.exports.error("Please make sure Type / Set / Rank / Level / Enhance / Main stat are not empty");
                        console.error("FAIL", editedItem)
                        return false;
                    }

                    const substats = [];

                    const subStatType1 = document.getElementById('editGearStat1Type').value;
                    const subStatType2 = document.getElementById('editGearStat2Type').value;
                    const subStatType3 = document.getElementById('editGearStat3Type').value;
                    const subStatType4 = document.getElementById('editGearStat4Type').value;

                    if (subStatType1 != "None") substats.push({type: subStatType1, value: parseInt(document.getElementById('editGearStat1Value').value || 0)})
                    if (subStatType2 != "None") substats.push({type: subStatType2, value: parseInt(document.getElementById('editGearStat2Value').value || 0)})
                    if (subStatType3 != "None") substats.push({type: subStatType3, value: parseInt(document.getElementById('editGearStat3Value').value || 0)})
                    if (subStatType4 != "None") substats.push({type: subStatType4, value: parseInt(document.getElementById('editGearStat4Value').value || 0)})

                    editedItem.substats = substats;

                    if (editedItem.enhance == 15 && editedItem.substats.length != 4) {
                        module.exports.error("Please make sure +15 items have 4 substats");
                        console.error("FAIL", editedItem)
                        return false;
                    }
                    if (editedItem.enhance < 0 ||  editedItem.enhance > 15) {
                        module.exports.error("Item enhance can only be 0 - 15");
                        console.error("FAIL", editedItem)
                        return false;
                    }

                    ItemAugmenter.augment([editedItem]);
                    if (item.id && edit) {
                        editedItem.id = item.id;
                    }

                    var equippedById = document.getElementById('editGearEquipped').value;

                    if (edit) {
                        if (equippedById == "None") {
                            await Api.unequipItems([editedItem.id])
                        } else {
                            editedItem.equippedById = equippedById;
                            editedItem.equippedByName = heroes.filter(x => x.id == equippedById)[0].name
                            await Api.equipItemsOnHero(equippedById, [editedItem.id])
                        }
                    } else {
                        if (equippedById == "None") {
                            await Api.addItems([editedItem]);
                        } else {
                            editedItem.equippedById = equippedById;
                            editedItem.equippedByName = heroes.filter(x => x.id == equippedById)[0].name
                            await Api.addItems([editedItem]);
                            await Api.equipItemsOnHero(equippedById, [editedItem.id])
                        }
                    }

                    console.log(editedItem);
                    resolve(editedItem);
                }
            })
        })
    }
}



function getEeHtml(hero, ee) {
    const statType = ee ? ee.stat.type : "None";
    const statValue = ee ? ee.stat.value : 0;
    const percentValue = Math.round(statValue * 100);
    const initialValue = hero.eeStat || 0
    // const labelText = ee ?  + " (" + percentValue + " - " + percentValue * 2 + ")": "None";
    const labelText = ee ? `${e7StatToDisplayStat[statType]} (${percentValue} - ${percentValue*2})` : "None";

    return `
        <div class="valuePadding input-holder">
            <input type="number" class="bonusStatInput" id="editHeroBonusEeStat" value="${initialValue}">
        </div>
    `
        // <div class="smallBlankFormSpace"></div>
        // <div class="editEeStatLabel">${labelText}</div>
}

function getImprintHtml(hero, heroInfo) {
    const imprintType = heroInfo.self_devotion.type;
    const displayText = e7StatToDisplayStat[imprintType];
    const imprintValues = heroInfo.self_devotion.grades;
    const fixedImprintValues = [];

    const isFlat = imprintType == "max_hp" || imprintType == "speed" || imprintType == "att" || imprintType == "def";

    for (var grade of Object.keys(imprintValues)) {
        if (!isFlat) {
            fixedImprintValues[grade] = Utils.round10ths(imprintValues[grade] * 100);
        } else {
            fixedImprintValues[grade] = imprintValues[grade];
        }
    }

    var html = `<select class="editGearStatSelect" id="editImprint"><option value="None">${Languages.getTranslationForKey('dropdownNonePlaceholder')}</option>`;

    for (var grade of Object.keys(fixedImprintValues)) {
        html += `<option value="${fixedImprintValues[grade]}" ${hero.imprintNumber == fixedImprintValues[grade] ? "selected" : ""}>${fixedImprintValues[grade]}${displayText} - ${grade}</option>`
        // html += `<option value="${imprintValues[grade]}"}>${grade + " - " + imprintValues[grade]} ${displayText}</option>`
    }

    html += `</select>
            `
            // <div class="smallBlankFormSpace"></div>
            // <div class="editEeStatLabel">${displayText}</div>
    return html;
}


function getEquippedHtml(item, heroes) {
    var html = `<option value="None">${Languages.getTranslationForKey('dropdownNobodyPlaceholder')}</option>`;

    Utils.sortByAttribute(heroes, 'name');

    for (var hero of heroes) {
        let heroName = (Languages.getLanguage() === Languages.getDefaultLanguage()) ? hero.name : Languages.getLocalizedHeroName(hero.name);
        html += `<option value="${hero.id}" ${hero.id == item.equippedById ? "selected" : ""}>${heroName}</option>`
    }

    return html;
}


function getArtifactHtml(hero) {
    var html = `<option value="None">${Languages.getTranslationForKey('dropdownNonePlaceholder')}</option>`;

    const artifactsJson = HeroData.getAllArtifactData();
    const artifacts = Object.values(artifactsJson);

    for (var artifact of artifacts) {
        // console.log(hero, artifact.name);
        let artifactName = (Languages.getLanguage() === Languages.getDefaultLanguage()) ? artifact.name : Languages.getLocalizedArtifactName(artifact.name);
        html += `<option value="${artifact.name}" ${hero.artifactName == artifact.name ? "selected" : ""}>${artifactName}</option>`


    }

    return html;
}


function getArtifactEnhanceHtml(hero) {
    var html = `<option value="None">${Languages.getTranslationForKey('dropdownNonePlaceholder')}</option>`;

    const artifactName = hero.artifactName
    if (artifactName && artifactName != "None") {
        const artifactLevel = hero.artifactLevel;
        if (artifactLevel && artifactLevel != "None") {
            for (var i = 30; i >= 0; i--) {
                var stats = Artifact.getStats(artifactName, i)
                html += `<option value="${i}" ${artifactLevel == i ? "selected" : ""}>${i} - (${stats.attack.toFixed(1)} atk, ${stats.health.toFixed(1)} hp)</option>`
            }

        }
    }

    return html;
}

function getEeEnhanceHtml(hero, ee) {
    var html = `<option value="None">${Languages.getTranslationForKey('dropdownNonePlaceholder')}</option>`;
    if (!ee) {
        return html;
    }
    const statType = ee.stat.type;
    const isFlat = statType == "max_hp" || statType == "speed" || statType == "att" || statType == "def";

    const baseValue = isFlat ? ee.stat.value : Math.round(ee.stat.value * 100);
    const maxValue = baseValue * 2;


    const displayText = e7StatToDisplayStat[statType];

    for (var i = baseValue; i <= maxValue; i++) {
        html += `<option value="${i}" ${hero.eeNumber == i ? "selected" : ""}>${i}${displayText}</option>`
    }

    return html;
}

function getStatOptionsHtml(stat) {
    const type = stat ? stat.type : null;
    return  `
<option value="None"></option>
<option value="AttackPercent" ${type == "AttackPercent" ? "selected" : ""}>${Languages.getTranslationForKey('statAttackPercentLabel')}</option>
<option value="Attack" ${type == "Attack" ? "selected" : ""}>${Languages.getTranslationForKey('statAttackLabel')}</option>
<option value="HealthPercent" ${type == "HealthPercent" ? "selected" : ""}>${Languages.getTranslationForKey('statHealthPercentLabel')}</option>
<option value="Health" ${type == "Health" ? "selected" : ""}>${Languages.getTranslationForKey('statHealthLabel')}</option>
<option value="DefensePercent" ${type == "DefensePercent" ? "selected" : ""}>${Languages.getTranslationForKey('statDefensePercentLabel')}</option>
<option value="Defense" ${type == "Defense" ? "selected" : ""}>${Languages.getTranslationForKey('statDefenseLabel')}</option>
<option value="Speed" ${type == "Speed" ? "selected" : ""}>${Languages.getTranslationForKey('statSpeedLabel')}</option>
<option value="CriticalHitChancePercent" ${type == "CriticalHitChancePercent" ? "selected" : ""}>${Languages.getTranslationForKey('statCritChanceLabel')}</option>
<option value="CriticalHitDamagePercent" ${type == "CriticalHitDamagePercent" ? "selected" : ""}>${Languages.getTranslationForKey('statCritDamageLabel')}</option>
<option value="EffectivenessPercent" ${type == "EffectivenessPercent" ? "selected" : ""}>${Languages.getTranslationForKey('statEffectivenessLabel')}</option>
<option value="EffectResistancePercent" ${type == "EffectResistancePercent" ? "selected" : ""}>${Languages.getTranslationForKey('statEffectResistanceLabel')}</option>
`
}

function getGearTypeOptionsHtml(item) {
    const gear = item.gear;
    return  `
<option value="None"></option>
<option value="Weapon" ${gear == "Weapon" ? "selected" : ""}>${Languages.getTranslationForKey('gearTypeWeapon')}</option>
<option value="Helmet" ${gear == "Helmet" ? "selected" : ""}>${Languages.getTranslationForKey('gearTypeHelmet')}</option>
<option value="Armor" ${gear == "Armor" ? "selected" : ""}>${Languages.getTranslationForKey('gearTypeArmor')}</option>
<option value="Necklace" ${gear == "Necklace" ? "selected" : ""}>${Languages.getTranslationForKey('gearTypeNecklace')}</option>
<option value="Ring" ${gear == "Ring" ? "selected" : ""}>${Languages.getTranslationForKey('gearTypeRing')}</option>
<option value="Boots" ${gear == "Boots" ? "selected" : ""}>${Languages.getTranslationForKey('gearTypeBoots')}</option>
`
}

function getGearSetOptionsHtml(item) {
    const set = item.set;
    return  `
<option value="None"></option>
<option value="SpeedSet" ${set == "SpeedSet" ? "selected" : ""}>${Languages.getTranslationForKey('setSpeedLabel')}</option>
<option value="AttackSet" ${set == "AttackSet" ? "selected" : ""}>${Languages.getTranslationForKey('setAttackLabel')}</option>
<option value="DestructionSet" ${set == "DestructionSet" ? "selected" : ""}>${Languages.getTranslationForKey('setDestructionLabel')}</option>
<option value="LifestealSet" ${set == "LifestealSet" ? "selected" : ""}>${Languages.getTranslationForKey('setLifestealLabel')}</option>
<option value="CounterSet" ${set == "CounterSet" ? "selected" : ""}>${Languages.getTranslationForKey('setCounterLabel')}</option>
<option value="RageSet" ${set == "RageSet" ? "selected" : ""}>${Languages.getTranslationForKey('setRageLabel')}</option>
<option value="HealthSet" ${set == "HealthSet" ? "selected" : ""}>${Languages.getTranslationForKey('setHealthLabel')}</option>
<option value="DefenseSet" ${set == "DefenseSet" ? "selected" : ""}>${Languages.getTranslationForKey('setDefenseLabel')}</option>
<option value="CriticalSet" ${set == "CriticalSet" ? "selected" : ""}>${Languages.getTranslationForKey('setCriticalLabel')}</option>
<option value="HitSet" ${set == "HitSet" ? "selected" : ""}>${Languages.getTranslationForKey('setHitLabel')}</option>
<option value="ResistSet" ${set == "ResistSet" ? "selected" : ""}>${Languages.getTranslationForKey('setResistLabel')}</option>
<option value="UnitySet" ${set == "UnitySet" ? "selected" : ""}>${Languages.getTranslationForKey('setUnityLabel')}</option>
<option value="ImmunitySet" ${set == "ImmunitySet" ? "selected" : ""}>${Languages.getTranslationForKey('setImmunityLabel')}</option>
<option value="PenetrationSet" ${set == "PenetrationSet" ? "selected" : ""}>${Languages.getTranslationForKey('setPenetrationLabel')}</option>
<option value="InjurySet" ${set == "InjurySet" ? "selected" : ""}>${Languages.getTranslationForKey('setInjuryLabel')}</option>
<option value="RevengeSet" ${set == "RevengeSet" ? "selected" : ""}>${Languages.getTranslationForKey('setRevengeLabel')}</option>
`
}

function getGearRankOptionsHtml(item) {
    const rank = item.rank;
    return  `
<option value="None"></option>
<option value="Epic" ${rank == "Epic" ? "selected" : ""}>${Languages.getTranslationForKey('gearRankEpic')}</option>
<option value="Heroic" ${rank == "Heroic" ? "selected" : ""}>${Languages.getTranslationForKey('gearRankHeroic')}</option>
<option value="Rare" ${rank == "Rare" ? "selected" : ""}>${Languages.getTranslationForKey('gearRankRare')}</option>
<option value="Good" ${rank == "Good" ? "selected" : ""}>${Languages.getTranslationForKey('gearRankGood')}</option>
<option value="Normal" ${rank == "Normal" ? "selected" : ""}>${Languages.getTranslationForKey('gearRankNormal')}</option>
`
}

function getGearMaterialOptionsHtml(item) {
    const material = item.material;
    return  `
<option value="None">None</option>
<option value="Hunt" ${material == "Hunt" ? "selected" : ""}>${Languages.getTranslationForKey('gearReforgeTypeHunt')}</option>
<option value="Conversion" ${material == "Conversion" ? "selected" : ""}>${Languages.getTranslationForKey('gearReforgeTypeEquipmentConversion')}</option>
`
}