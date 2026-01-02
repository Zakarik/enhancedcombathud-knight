import { promptNumber, promptSelect } from "../helpers/prompt.js";
import PatchBuilder from "/systems/knight/module/utils/patchBuilder.mjs";
import {ModuleName} from "../../utils.js";

export const warlordHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;
    const sysArmor = isLegend ? armureLegend : armure;

    if (special === "energie") {
      const ask = await promptNumber({
        title: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.IMPULSIONS.ENERGIE.Label"),
        label: game.i18n.localize(`${ModuleName}.OTHER.DepenseEnergie`),
        name: "energy",
        value: actor.system.equipements.armure.capacites.warlord.energie.nbre,
        min: dataCapacity.impulsions.energie.energie.min,
        max: dataCapacity.impulsions.energie.energie.max
      });
      if (ask != null) {
        await PatchBuilder.for(actor)
          .sys("equipements.armure.capacites.warlord.energie.nbre", ask)
          .apply();

        await sysArmor.system.activateCapacity({ capacite, special, variant });
      }
      return;
    }

    if (variant === "allie" && special !== "action") {
      const ask = await promptNumber({
        title: game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.IMPULSIONS.${special.toUpperCase()}.Label`),
        label: game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.ACTIVATION.Allie`),
        name: "allie",
        value: actor.system.equipements.armure.capacites.warlord[special].nbre
      });
      if (ask != null) {
        await PatchBuilder.for(actor)
          .sys(`equipements.armure.capacites.warlord.${special}.nbre`, ask)
          .apply();

        await sysArmor.system.activateCapacity({ capacite, special, variant });
      }
      return;
    }

    await sysArmor.system.activateCapacity({ capacite, special, variant });
  }
};

export const ascensionHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;
    const ask = await promptNumber({
      title: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ASCENSION.Label"),
      label: game.i18n.localize(`${ModuleName}.OTHER.DonEnergie`),
      name: "energy",
      value: actor.system.equipements.armure.capacites.ascension.energie,
      min: dataCapacity.energie.min,
      max: dataCapacity.energie.max
    });
    if (ask != null) {
      const sysArmor = isLegend ? armureLegend : armure;

      await PatchBuilder.for(actor)
        .sys("equipements.armure.capacites.ascension.energie", ask)
        .apply();
      await sysArmor.system.activateCapacity({ capacite, special, variant });
    }
  }
};

export const morphHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;

    if (special === "etirement" && variant !== "choix") {
      const dialog = new game.knight.applications.KnightRollDialog(
        actor.token ? actor.token.id : actor.id,
        {
          label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.ETIREMENT.Label")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.ETIREMENT.Immobilisation")}`,
          succesbonus: dataCapacity.etirement.bonus
        }
      );
      dialog.open();
      return;
    }
    const sysArmor = isLegend ? armureLegend : armure;

    await sysArmor.system.activateCapacity({ capacite, special, variant });
  }
};

export const puppetHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;

    const ask = await promptNumber({
      title: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.PUPPET.Label"),
      label: game.i18n.localize("KNIGHT.AUTRE.CibleSupplementaire"),
      name: "nbre",
      value: actor.system.equipements.armure.capacites.puppet.cible,
      min: 0,
      max: dataCapacity.creatures
    });
    if (ask != null) {
      const sysArmor = isLegend ? armureLegend : armure;

      await PatchBuilder.for(actor)
        .sys("equipements.armure.capacites.puppet.cible", ask)
        .apply();

      await sysArmor.system.activateCapacity({ capacite, special, variant });
    }
  }
};

export const goliathHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;

    const ask = await promptNumber({
      title: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GOLIATH.Label"),
      label: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GOLIATH.MetreBonus"),
      name: "taille",
      value: actor.system.equipements.armure.capacites.goliath.metre,
      min: 0,
      max: dataCapacity.taille.max
    });
    if (ask != null) {
      const sysArmor = isLegend ? armureLegend : armure;

      await PatchBuilder.for(actor)
        .sys("equipements.armure.capacites.goliath.metre", ask)
        .apply();

      await sysArmor.system.activateCapacity({ capacite, special, variant });
    }
  }
};

export const ghostHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;

    if (special === "passerinaperçu") {
      const dialog = new game.knight.applications.KnightRollDialog(
        actor.token ? actor.token.id : actor.id,
        {
          label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.Label")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.PasserInaperçu")}`,
          succesbonus: dataCapacity.bonus.reussites
        }
      );
      dialog.open();
      return;
    }
    const sysArmor = isLegend ? armureLegend : armure;

    await sysArmor.system.activateCapacity({ capacite, special, variant });
  }
};

export const companionsHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;
    const sysArmor = isLegend ? armureLegend : armure;
    const label = armure.system.espoir.remplaceEnergie
      ? game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.ENERGIE.OctroyerEspoirP")
      : game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.ENERGIE.OctroyerEnergieP");

    const ask = await promptSelect({
      title: game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.${special.toUpperCase()}.Label`),
      label,
      name: "energie",
      list: armure.system.energieDisponiblePar10.map(e => ({ label: e, value: e })),
      value: actor.system.equipements.armure.capacites.companions.energie
    });

    if (ask != null) {

      await PatchBuilder.for(actor)
        .sys("equipements.armure.capacites.companions.energie", ask)
        .apply();
      await sysArmor.system.activateCapacity({ capacite, special, variant });
    }
  }
};

export const changelingHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;
    const sysArmor = isLegend ? armureLegend : armure;
    if (special === "fauxEtre") {
      const ask = await promptNumber({
        title: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.FauxEtres"),
        label: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.FauxEtres"),
        name: "fauxetres",
        value: actor.system.equipements.armure.capacites.changeling.fauxetres,
        min: 0,
        max: dataCapacity.energie.fauxEtre.max
      });
      if (ask != null) {

        await PatchBuilder.for(actor)
          .sys("equipements.armure.capacites.changeling.fauxetres", ask)
          .apply();
        await sysArmor.system.activateCapacity({ capacite, special, variant });
      }
      return;
    }
      await sysArmor.system.activateCapacity({ capacite, special, variant });
  }
};

export const specialHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;
    const sysArmor = isLegend ? armureLegend : armure;

    await sysArmor.system.activateSpecial({ capacite, special, variant });
  }
};

export const recolteFluxHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;
    const sysArmor = isLegend ? armureLegend : armure;

    if (special === "horsconflit") {
      const ask = await promptNumber({
        title: game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.Label"),
        label: game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXHORSCONFLIT.NbreCreature"),
        name: "nbre",
        value: actor.system.equipements.armure.special.flux,
        min: 0
      });
      if (ask != null) {
        await PatchBuilder.for(actor)
          .sys("equipements.armure.special.flux", ask)
          .apply();
        await sysArmor.system.activateSpecial({ capacite, special, variant });
        return;
      }
    }
    await sysArmor.system.activateSpecial({ capacite, special, variant });
  }
};