const tippy = require('tippy.js').default;

const allowHTML = true;
const tooltipPlacement = 'auto';
const maxTooltipWidth = 550;

tippy.setDefaultProps({
    allowHTML: allowHTML,
    placement: tooltipPlacement,
    maxWidth: maxTooltipWidth,
});

module.exports = {
    displayItem: (elementId, html) => {
        tippy('#' + elementId, {
            allowHTML: allowHTML,
            placement: tooltipPlacement,
            maxWidth: maxTooltipWidth,
            content: html
        })
    },

    initialize: () => {
        tippy('#heroTooltip', {
            content: Languages.getTranslationForKey('heroDropdownTooltip')
        });

        tippy('#previewTooltip', {
            content: Languages.getTranslationForKey('statPreviewTooltip')
        });

        tippy('#optionsTooltip', {
            content: Languages.getTranslationForKey('optimizationOptionsTooltip')
        });

        tippy('#filterStatsTooltip', {
            content: Languages.getTranslationForKey('statFiltersTooltip')
        });

        tippy('#filterRatingsTooltip', {
            content: Languages.getTranslationForKey('ratingFiltersTooltip')
        });

        tippy('#substatPriorityTooltip', {
            content: Languages.getTranslationForKey('substatPriorityTooltip')
        });

        tippy('#accessoryMainStatsTooltip', {
            content: Languages.getTranslationForKey('accessoryMainStatsTooltip')
        });

        tippy('#setsTooltip', {
            content: Languages.getTranslationForKey('gearSetsTooltip')
        });

        tippy('#excludeTooltip', {
            content: Languages.getTranslationForKey('gearSetExclusionTooltip')
        });

//         tippy('#forceModeTooltip', {
//             content:
// `
// <p>
// Choose how many substats you want to match the force filters.
// "Force at least 2 substats" means to search only gears matching at least 2 stat rows from the force panel.
// </p>
// <p>
// The substat priority filter should be doing most of the filtering for you. Only this when you have have a very specific substat requirement.
// </p>

// <p>
// Examples:</br>
// Force at least one: Speed > 10 for speed units.</br>
// Force at least one: Hp % / Def % / Speed, for tanks.</br>
// Force at least two: Atk / Atk % / Cr / Cd / Speed, for dps units.</br>
// </p>
// `
//         });

//         tippy('#forceTooltip', {
//             content:
// `
// <p>
// See the force mode tooltip for more info.
// </p>

// <p>
// Select required substats to use with the force mode. Left column is min (inclusive) and right column is max (inclusive).
// </p>

// <p>
// Force filter is automatically disabled when no forced substats are specified.
// </p>
// `
//         });

        tippy('#filterDetailsTooltip', {
            content: Languages.getTranslationForKey('filterDetailsTooltip')
        });

        tippy('#actionsTooltip', {
            content: Languages.getTranslationForKey('optimizerActionsTooltip')
        });





        tippy('#gearTableTooltip', {
            content: Languages.getTranslationForKey('gearTableTooltip')
        });

        tippy('#gearActionsTooltip', {
            content: Languages.getTranslationForKey('gearActionsTooltip')
        });

        tippy('#gearFiltersTooltip', {
            content: Languages.getTranslationForKey('gearFiltersTooltip')
        });
    },

    updateTooltipLocalization: () => {
        document.querySelector('#heroTooltip')._tippy?.setContent(Languages.getTranslationForKey('heroDropdownTooltip'));

        document.querySelector('#previewTooltip')._tippy?.setContent(Languages.getTranslationForKey('statPreviewTooltip'));

        document.querySelector('#optionsTooltip')._tippy?.setContent(Languages.getTranslationForKey('optimizationOptionsTooltip'));

        document.querySelector('#filterStatsTooltip')._tippy?.setContent(Languages.getTranslationForKey('statFiltersTooltip'));

        document.querySelector('#filterRatingsTooltip')._tippy?.setContent(Languages.getTranslationForKey('ratingFiltersTooltip'));

        document.querySelector('#substatPriorityTooltip')._tippy?.setContent(Languages.getTranslationForKey('substatPriorityTooltip'));

        document.querySelector('#accessoryMainStatsTooltip')._tippy?.setContent(Languages.getTranslationForKey('accessoryMainStatsTooltip'));

        document.querySelector('#setsTooltip')._tippy?.setContent(Languages.getTranslationForKey('gearSetsTooltip'));

        document.querySelector('#excludeTooltip')._tippy?.setContent(Languages.getTranslationForKey('gearSetExclusionTooltip'));

        document.querySelector('#filterDetailsTooltip')._tippy?.setContent(Languages.getTranslationForKey('filterDetailsTooltip'));

        document.querySelector('#actionsTooltip')._tippy?.setContent(Languages.getTranslationForKey('optimizerActionsTooltip'));





        document.querySelector('#gearTableTooltip')._tippy?.setContent(Languages.getTranslationForKey('gearTableTooltip'));

        document.querySelector('#gearActionsTooltip')._tippy?.setContent(Languages.getTranslationForKey('gearActionsTooltip'));

        document.querySelector('#gearFiltersTooltip')._tippy?.setContent(Languages.getTranslationForKey('gearFiltersTooltip'));
    }
}
