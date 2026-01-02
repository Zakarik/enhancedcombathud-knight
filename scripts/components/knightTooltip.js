import {
    capitalizeFirstLetter,
    getSpecial,
} from "/systems/knight/module/helpers/common.mjs";

import {
  getTooltipHandler
} from "./handlers/registry.js";

const generateProperties = (e) => {
  const EFFETS_MAP = (() => {
    const { effets, effetsfm4, AMELIORATIONS } = CONFIG.KNIGHT;
    return {
    ...effets,
    ...effetsfm4,
    ...AMELIORATIONS.distance,
    ...AMELIORATIONS.structurelles,
    ...AMELIORATIONS.ornementales
    };
  })();

  const split = e.split(' ');
  let label = `${game.i18n.localize(EFFETS_MAP[String(e).split(" ")[0]].label)}`;

  if(split[1]) label += ` ${String(e).split(" ")[1]}`

  return {
    label: label,
  }
};

const capacityTooltip = {
  async generate(item, base={}) {
    let{
      actor, title, description, details, propertiesLabel, properties, footerText,
      capacite, special, variant } = base;
    const data = item.system;

    const ctx = { actor, data, description, details, propertiesLabel, properties, footerText };
    console.error(capacite);
    const handler = getTooltipHandler(capacite);
    await handler.activate?.(
      ctx,
      generateProperties,
      { capacite, special, variant }
    );

    description = description.join(' ');
    propertiesLabel = propertiesLabel.join(' ');

    return { title, description, details, propertiesLabel, properties, footerText };
  }
}

const prolongateTooltip = {
  async generate(item, base={}) {
    let{
      actor, title, description, details, propertiesLabel, properties, footerText,
      capacite, special, variant } = base;
    const data = item.system;

    const ctx = { actor, data, description, details, propertiesLabel, properties, footerText };
    const handler = getTooltipHandler(capacite);
    await handler.prolongate?.(
      ctx,
      generateProperties,
      { capacite, special, variant }
    );

    description = description.join(' ');
    propertiesLabel = propertiesLabel.join(' ');

    return { title, description, details, propertiesLabel, properties, footerText };
  }
}

const moduleTooltip = {
  async generate(item, base={}) {
    let{
      actor, title, description, details, propertiesLabel, properties, footerText,
      capacite, special, variant } = base;
    const data = item.system;

    const ctx = { actor, data, description, details, propertiesLabel, properties, footerText };
    const handler = getTooltipHandler('module');
    await handler.activate?.(
      ctx,
      generateProperties,
    );

    description = description.join(' ');
    propertiesLabel = propertiesLabel.join(' ');

    return { title, description, details, propertiesLabel, properties, footerText };
  }
}

const maTooltip = {
  async generate(item, base={}) {
    let{
      actor, title, description, details, propertiesLabel, properties, footerText,
      capacite, special, variant } = base;

      title = game.i18n.localize(`KNIGHT.MECHAARMURE.MODULES.${item.system.data.key.toUpperCase()}.Label`);

    const ctx = { actor, item, description, details, propertiesLabel, properties, footerText };
    const handler = getTooltipHandler('mechaarmure');
    await handler.activate?.(
      ctx,
      generateProperties,
    );

    description = description.join(' ');
    propertiesLabel = propertiesLabel.join(' ');

    return { title, description, details, propertiesLabel, properties, footerText };
  }
}

export async function getTooltipDetails(actor, item, tooltipFor='wpn') {
    const type = item.type;
    const armorSpecial = getSpecial(actor);
    const cFor = tooltipFor.split('/_');
    const capacite = cFor[0];
    const special = cFor[1];
    const variant = cFor[2];
    let system = {};
    let details = [];
    let properties = [];
    let description = [];
    let propertiesLabel = [];
    let title, footerText;

    title = item.name;
    footerText = game.i18n.localize("enhancedcombathud-knight.OTHER.Lock");

    if(type === 'capacity') {
      title = item.system.label;

      return await capacityTooltip.generate(item, {
        actor, title, description, details, propertiesLabel, properties, footerText,
        capacite, special, variant,
      });
    }
    else if(type === 'prolonger') {
      title = item.system.label;

      return await prolongateTooltip.generate(item, {
        actor, title, description, details, propertiesLabel, properties, footerText,
        capacite, special, variant,
      });
    }
    else if(type === 'module' && tooltipFor !== 'wpn') return await moduleTooltip.generate(item, {
      actor, title, description, details, propertiesLabel, properties, footerText,
      capacite, special, variant,
    });
    else if(type === 'capacite' && tooltipFor !== 'wpn') {
      await getTooltipHandler('capacite').generate(
        {actor, item, title, description, details, propertiesLabel, properties, footerText},
        generateProperties,
      );

      description = description.join(' ');
      propertiesLabel = propertiesLabel.join(' ');

      return { title, description, details, propertiesLabel, properties, footerText };
    }
    else if(type === 'mechaarmure') {
      return await maTooltip.generate(item, {
        actor, title, description, details, propertiesLabel, properties, footerText,
        capacite, special, variant,
      });
    }

    if(type === 'module' && tooltipFor === 'wpn') system = item.system.niveau.actuel.arme;
    else if(type === 'capacite' && tooltipFor === 'wpn') system = item.system.attaque;
    else system = item.system;

    if(system?.portee) {
      details.push({
        label:'KNIGHT.PORTEE.Label',
        value:game.i18n.localize(`KNIGHT.PORTEE.${capitalizeFirstLetter(system?.portee)}`)
      });
    }

    const e = system?.energie;

    if (e != null && !Array.isArray(e) && typeof e !== "object") {
      details.push({
        label: game.i18n.localize("KNIGHT.LATERAL.Energie"),
        value: e
      });
    }

    details.push({
      label:'KNIGHT.AUTRE.Degats',
      value:`${system?.degats?.dice ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${system?.degats?.fixe ?? 0}`,
    });

    details.push({
      label:'KNIGHT.AUTRE.Violence',
      value:`${system?.violence?.dice ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${system?.violence?.fixe ?? 0}`,
    });

    propertiesLabel = `KNIGHT.EFFETS.Label`;

    if(system?.type === "contact" && system?.options2mains?.has && system?.options2mains?.actuel === '2mains') {
      for(let e of system?.effets2mains?.raw ?? []) {
        const generator = generateProperties(e);

        // On vérifie si properties n'inclut pas déjà un objet avec le même label
        if (!properties.some(prop => prop.label === generator.label)) {
          properties.push(generator);
        }
      }
    } else {
      for(let e of system?.effets?.raw ?? []) {
        const generator = generateProperties(e);

        // On vérifie si properties n'inclut pas déjà un objet avec le même label
        if (!properties.some(prop => prop.label === generator.label)) {
          properties.push(generator);
        }
      }
    }

    if(system?.type === 'contact') {
      for(let e of system?.ornementales?.raw ?? []) {
        const generator = generateProperties(e);

        // On vérifie si properties n'inclut pas déjà un objet avec le même label
        if (!properties.some(prop => prop.label === generator.label)) {
          properties.push(generator);
        }
      }

      for(let e of system?.structurelles?.raw ?? []) {
        const generator = generateProperties(e);

        // On vérifie si properties n'inclut pas déjà un objet avec le même label
        if (!properties.some(prop => prop.label === generator.label)) {
          properties.push(generator);
        }
      }
    } else {
      for(let e of system?.distance?.raw ?? []) {
        const generator = generateProperties(e);

        // On vérifie si properties n'inclut pas déjà un objet avec le même label
        if (!properties.some(prop => prop.label === generator.label)) {
          properties.push(generator);
        }
      }

      if(system?.optionsmunitions?.has) {
        for(let e of system?.optionsmunitions?.liste?.[system?.optionsmunitions?.actuel]?.raw ?? []) {
          const generator = generateProperties(e);

          // On vérifie si properties n'inclut pas déjà un objet avec le même label
          if (!properties.some(prop => prop.label === generator.label)) {
            properties.push(generator);
          }
        }
      }
    }

    for(let e of armorSpecial?.raw ?? []) {
      const generator = generateProperties(e);

      // On vérifie si properties n'inclut pas déjà un objet avec le même label
      if (!properties.some(prop => prop.label === generator.label)) {
        properties.push(generator);
      }
    }

    const collator = new Intl.Collator(game?.i18n?.lang || "fr", {
      sensitivity: "base",
      ignorePunctuation: true,
      numeric: true
    });
    properties.sort((a, b) => collator.compare(String(a?.label ?? ""), String(b?.label ?? "")));

    return { title, description, details, propertiesLabel, properties, footerText };
}