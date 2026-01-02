import {
    capitalizeFirstLetter,
    confirmationDialog,
  } from "/systems/knight/module/helpers/common.mjs";

export const stdRecoverHandler = {
    async activate(ctx) {
        let { actor, type } = ctx;
        const max = actor.system[type].max;

        if(!await confirmationDialog('restoration', `Confirmation${capitalizeFirstLetter(type)}`)) return;
        await actor.update({[`system.${type}.value`]:max});

        const exec = new game.knight.RollKnight(actor,
          {
            name:actor.name,
          }).sendMessage({
              text:game.i18n.localize(`KNIGHT.RECUPERER.MSG.${capitalizeFirstLetter(type)}`),
              sounds:CONFIG.sounds.notification,
          });
    },
    icon(type) {
        let result = '';

        switch(type) {
            case 'armure':
                result = "modules/enhancedcombathud-knight/assets/armure.svg";
                break;

            case 'contact':
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

            case 'contact':
                result = `ITEM.Type${capitalizeFirstLetter(type)}`;
                break;
        }

        return result;
    }
}

export const chargeurRecoverHandler = {
    async activate(ctx) {
        let { actor, type } = ctx;

        if(!await confirmationDialog('restoration', `Confirmation${capitalizeFirstLetter(type)}`)) return;
        const items = actor.items.filter(itm => itm.type === 'arme' || itm.type === 'module' || itm.type === 'armure');

        items.forEach(itm => {
          itm.system.resetMunition();
        })

        const exec = new game.knight.RollKnight(actor,
        {
            name:actor.name,
        }).sendMessage({
            text:game.i18n.localize('KNIGHT.JETS.RemplirChargeur'),
            classes:'important',
            sounds:CONFIG.sounds.notification,
        });
    },
    icon(type) {
        return "modules/enhancedcombathud-knight/assets/armes.svg";
    },
    label(type) {
        return `KNIGHT.EFFETS.CHARGEUR.Label`;
    }
}

export const nodsRecoverHandler = {
    async activate(ctx) {
        let { actor, type } = ctx;
        if(!await confirmationDialog('restoration', `Confirmation${capitalizeFirstLetter(type)}`)) return;
        const list = ['armure', 'energie', 'soin']
        let update = {};

        for (let i of list) {
            const max = actor.system.combat[type][i].max;

            update[`system.combat.${type}.${i}.value`] = max;
        }

        actor.update(update);

        const exec = new game.knight.RollKnight(actor,
        {
            name:actor.name,
        }).sendMessage({
            text:game.i18n.localize(`KNIGHT.RECUPERER.MSG.${capitalizeFirstLetter(type)}`),
            sounds:CONFIG.sounds.notification,
        });
    },
    icon(type) {
        return "modules/enhancedcombathud-knight/assets/nods.svg";
    },
    label(type) {
        return `KNIGHT.COMBAT.NODS.Label`;
    }
}

export const grenadesRecoverHandler = {
    async activate(ctx) {
        let { actor, type } = ctx;
        const max = actor.system.combat[type].quantity.max;

        if(!await confirmationDialog('restoration', `Confirmation${capitalizeFirstLetter(type)}`)) return;
        await actor.update({[`system.combat.${type}.quantity.value`]:max});

        const exec = new game.knight.RollKnight(actor,
          {
            name:actor.name,
          }).sendMessage({
              text:game.i18n.localize(`KNIGHT.RECUPERER.MSG.${capitalizeFirstLetter(type)}`),
              sounds:CONFIG.sounds.notification,
          });
    },
    icon(type) {
        return "modules/enhancedcombathud-knight/assets/grenades.svg";
    },
    label(type) {
        return `KNIGHT.COMBAT.GRENADES.Label`;
    }
}