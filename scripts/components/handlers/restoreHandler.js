import {
    capitalizeFirstLetter,
    confirmationDialog,
  } from "/systems/knight/module/helpers/common.mjs";

export const stdRecoverHandler = {
    async activate(ctx) {
        let { actor, type } = ctx;

        actor.system.askToRestore(type);
    },
    icon(type) {
        let result = '';

        switch(type) {
            case 'armure':
                result = "modules/enhancedcombathud-knight/assets/armure.svg";
                break;

            case 'contacts':
                result = "modules/enhancedcombathud-knight/assets/contact.svg";
                break;

            case 'sante':
                result = "modules/enhancedcombathud-knight/assets/sante.svg";
                break;

            case 'espoir':
                result = "modules/enhancedcombathud-knight/assets/espoir.svg";
                break;

            case 'energie':
                result = "modules/enhancedcombathud-knight/assets/energie.svg";
                break;

            case 'grenades':
                result = "modules/enhancedcombathud-knight/assets/grenades.svg";
                break;

            case 'nods':
                result = "modules/enhancedcombathud-knight/assets/nods.svg";
                break;

            case 'chargeur':
                result = "modules/enhancedcombathud-knight/assets/armes.svg";
                break;
        }

        return result;
    },
    label(type) {
        let result = '';

        switch(type) {
            case 'armure':
            case 'sante':
            case 'energie':
            case 'espoir':
                result = `KNIGHT.LATERAL.${capitalizeFirstLetter(type)}`;
                break;

            case 'contacts':
                result = `ITEM.TypeContact`;
                break;

            case 'grenades':
            case 'nods':
                result = `KNIGHT.COMBAT.${type.toUpperCase()}.Label`;;
                break;

            case 'chargeur':
                result = `KNIGHT.EFFETS.${type.toUpperCase()}.Label`;;
                break;
        }

        return result;
    }
}