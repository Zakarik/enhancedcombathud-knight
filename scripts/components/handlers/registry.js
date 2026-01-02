const registryArmorCapacity = {};
const registryTooltip = {};
const registryRestore = {};

const defaultArmorCapacityHandler = {
  async activate(ctx, { capacite, special, variant }) {
    const { actor, armure, armureLegend, dataCapacity, isLegend } = ctx;
    const sysArmor = isLegend ? armureLegend : armure;
    await sysArmor.system.activateCapacity({ capacite, special, variant });
  }
};

const defaultTooltipHandler = {
  async activate(ctx, { capacite = '', special = '', variant = ''}) {
    let { data, description, details, propertiesLabel, properties } = ctx;
    description.push(data.description);
  }
};

const defaultRestoreHandler = {
  async activate(ctx) {}
};

function registerArmorCapacity(key, handler) {
  registryArmorCapacity[key] = handler;
}

function registerTooltip(key, handler) {
  registryTooltip[key] = handler;
}

function registerRestore(key, handler) {
  registryRestore[key] = handler;
}

export function getArmorCapacityHandler(key) {
  return registryArmorCapacity[key] ?? defaultArmorCapacityHandler;
}

export function getTooltipHandler(key) {
  return registryTooltip[key] ?? defaultTooltipHandler;
}

export function getRestoreHandler(key) {
  return registryRestore[key] ?? defaultRestoreHandler;
}

async function registerAllArmorCapacities() {
  const h = await import("./armorCapacityHandler.js");
  registerArmorCapacity("warlord", h.warlordHandler);
  registerArmorCapacity("ascension", h.ascensionHandler);
  registerArmorCapacity("morph", h.morphHandler);
  registerArmorCapacity("puppet", h.puppetHandler);
  registerArmorCapacity("goliath", h.goliathHandler);
  registerArmorCapacity("ghost", h.ghostHandler);
  registerArmorCapacity("companions", h.companionsHandler);
  registerArmorCapacity("changeling", h.changelingHandler);
  registerArmorCapacity("contrecoups", h.specialHandler);
  registerArmorCapacity("impregnation", h.specialHandler);
  registerArmorCapacity("energiedeficiente", h.specialHandler);
  registerArmorCapacity("recolteflux", h.recolteFluxHandler);
}

async function registerAllTooltip() {
  const h = await import("./tooltipHandler.js");

  // Capacités d'armure "classiques"
  registerTooltip("ascension", h.ascensionHandler);
  registerTooltip("totem", h.totemHandler);
  registerTooltip("borealis", h.borealisHandler);
  registerTooltip("changeling", h.changelingHandler);
  registerTooltip("companions", h.companionsHandler);
  registerTooltip("ghost", h.ghostHandler);
  registerTooltip("goliath", h.goliathHandler);
  registerTooltip("rage", h.rageHandler);
  registerTooltip("illumination", h.illuminationHandler);
  registerTooltip("vision", h.visionHandler);
  registerTooltip("nanoc", h.nanocHandler);
  registerTooltip("mechanic", h.mechanicHandler);
  registerTooltip("puppet", h.puppetHandler);
  registerTooltip("discord", h.discordHandler);
  registerTooltip("windtalker", h.windtalkerHandler);
  registerTooltip("type", h.typeHandler);
  registerTooltip("warlord", h.warlordHandler);
  registerTooltip("forward", h.forwardHandler);
  registerTooltip("record", h.recordHandler);
  registerTooltip("rewind", h.rewindHandler);
  registerTooltip("zen", h.zenHandler);
  registerTooltip("shrine", h.shrineHandler);

  // Spéciaux d'armure
  registerTooltip("energiedeficiente", h.energiedeficienteHandler);
  registerTooltip("impregnation", h.impregnationHandler);
  registerTooltip("recolteflux", h.recoltefluxHandler);

  // Modules
  registerTooltip("module", h.moduleHandler);

  // Capacités
  registerTooltip("capacite", h.capaciteHandler);

  // Mecha Armure
  registerTooltip("mechaarmure", h.maHandler);
}

async function registerAllRestore() {
  const h = await import("./restoreHandler.js");

  registerRestore("sante", h.stdRecoverHandler);
  registerRestore("armure", h.stdRecoverHandler);
  registerRestore("energie", h.stdRecoverHandler);
  registerRestore("espoir", h.stdRecoverHandler);
  registerRestore("contact", h.stdRecoverHandler);
  registerRestore("grenades", h.grenadesRecoverHandler);
  registerRestore("nods", h.nodsRecoverHandler);
  registerRestore("chargeur", h.chargeurRecoverHandler);
}

export async function registerAllKnightArgon() {
  await registerAllArmorCapacities();
  await registerAllTooltip();
  await registerAllRestore();
}