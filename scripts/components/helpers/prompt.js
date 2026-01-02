import {generateAskHTML} from "../../utils.js";

export async function promptNumber({ title, label, name, value, min, max }) {
    const ask = await foundry.applications.api.DialogV2.prompt({
      window: { title },
      classes: ["knightAsk"],
      content: generateAskHTML([{ label, type: "number", name, value, min, max }]),
      ok: {
        label: game.i18n.localize("KNIGHT.AUTRE.Valider"),
        callback: (event, button) => {
          let number = button.form.elements[name].valueAsNumber;

          if(max) number = Math.min(number, max);

          if(min) number = Math.max(number, min);

          return number;
        }
      }
    });
    return ask ?? null;
}

export async function promptSelect({ title, label, name, list, value, classes=[] }) {
    const ask = await foundry.applications.api.DialogV2.prompt({
      window: { title },
      classes: ["knightAsk"].concat(...classes),
      content: generateAskHTML([{ label, type: "select", name, list, value }]),
      ok: {
        label: game.i18n.localize("KNIGHT.AUTRE.Valider"),
        callback: (event, button) => {
          const v = button.form.elements[name].value;
          const n = Number(v);
          return Number.isNaN(n) ? v : n;
        }
      }
    });
    return ask ?? null;
}