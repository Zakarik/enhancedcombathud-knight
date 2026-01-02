import ArmureAPI from "/systems/knight/module/utils/armureAPI.mjs";

import {
  ModuleName,
} from "../utils.js";

export function makeKnightPortraitPanel(ARGON) {
    class constructSide {
      constructor(actor) {
        this._actor = actor;
      }

      _getAttrLabel(attr) {
        let key;
        switch (attr) {
          case "champDeForce":
            key = `KNIGHT.LATERAL.${this._capitalizeFirstLetter(attr)}-short`;
            break;

          case 'contrecoups':
          case 'impregnation':
            key = `KNIGHT.ITEMS.ARMURE.SPECIAL.${attr.toUpperCase()}.Label`;
            break;

          case 'passagers':
          case 'vitesse':
            key = `KNIGHT.VEHICULE.${this._capitalizeFirstLetter(attr)}`;
            break;

          default:
            key = `KNIGHT.LATERAL.${this._capitalizeFirstLetter(attr)}`;
            break;
        }

        return game.i18n.localize(key);
      }

      _getAttrValue(attr) {
        return this._actor?.system?.[attr]?.value ?? 0;
      }

      _getAttrMax(attr) {
        return this._actor?.system?.[attr]?.max ?? 0;
      }

      _capitalizeFirstLetter(str) {
        if (!str) return str;
        return String(str).charAt(0).toUpperCase() + String(str).slice(1);
      }

      get sideKnight() {
        const actor = this._actor;
        const findArmor = actor.items.find(itm => itm.type === 'armure');
        const getArmure = findArmor ? new ArmureAPI(findArmor) : null;
        const listSpecial = getArmure ? getArmure.listSpecial : [];
        const list = CONFIG.KNIGHT.LIST?.[actor?.type] ?? [];
        // Désormais: left, center, right
        const Blocks = { left: [], center: [], right: [] };

        if (!actor?.system) return Blocks;

        if(actor.system.jauges.flux && !list.includes('flux')) list.push('flux');
        if(actor.system.jauges.egide && !list.includes('egide')) list.push('egide');
        if(listSpecial.includes('contrecoups') && !list.includes('contrecoups')) list.push('contrecoups');
        if(listSpecial.includes('impregnation') && !list.includes('impregnation')) list.push('impregnation');

        Blocks.center.push([{
          isSelect:true,
          options: Object.entries(CONFIG.KNIGHT.LIST.style ?? {}).map(([k, v]) => [k, game.i18n.localize(`${v.replace('Label', 'FullLabel')}`)]),
          value:actor.system.combat.style,
          changevent: (newvalue) => {
            actor?.update?.({ [`system.combat.style`]: newvalue });
          }
        }])

        for (const p of list) {
          if (!actor.system.jauges?.[p] && !listSpecial.includes(p)) continue;

          // Exemple inchangé: à adapter si certains doivent aller au "center"
          switch (p) {
            case "champDeForce":
              Blocks.right.push([
                { text: this._getAttrLabel(p) },
                { text: actor.system[p]?.value ?? 0, class: "cdf" },
              ]);
              break;

            case "armure":
            case "energie":
              (Blocks.right).push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;

            case 'flux':
              (Blocks.right).push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
              ]);
              break;

            case 'egide':
              (Blocks.left).push([
                { text: this._getAttrLabel(p) },
                { text: actor.system[p]?.value ?? 0, class: "egide" },]);
              break;

            case 'contrecoups':
              (Blocks.right).push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: actor?.system?.equipements?.armure?.special?.[p] ?? 0,
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.equipements?.armure?.special?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.equipements.armure.special.${p}`]: v });
                  }
                },
              ]);
              break;

            case 'impregnation':
              (Blocks.right).push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: actor?.system?.equipements?.armure?.special?.[p] ?? 0,
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.equipements?.armure?.special?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.equipements.armure.special.${p}`]: v });
                  }
                },
              ]);
              break;

            default:
              // Par défaut à gauche; mettez ici la logique qui décide du center si besoin
              Blocks.left.push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;
          }
        }

        return Blocks;
      }

      get sideBande() {
        const actor = this._actor;
        const list = CONFIG.KNIGHT.LIST?.bandes ?? [];
        // Désormais: left, center, right
        const Blocks = { left: [], center: [], right: [] };

        if (!actor?.system) return Blocks;

        Blocks.right.push([
          { text:game.i18n.localize('KNIGHT.AUTRE.Debordement') },
          {
            isinput:true,
            inputtype: "number",
            text: this._getAttrValue('debordement'),
            class:'debordement',
            changevent: (newvalue) => {
              const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape('debordement')}`);
              let v = Number(newvalue);
              if (input) input.value = String(v);
              actor?.update?.({ [`system.debordement.value`]: v });
            }
          }
        ]);

        Blocks.right.push([
          { text:(actor?.system?.debordement?.tour ?? 1) > 1 ? game.i18n.localize('KNIGHT.AUTRE.Tours') : game.i18n.localize('KNIGHT.AUTRE.Tour') },
          {
            isinput:true,
            inputtype: "number",
            text: actor?.system?.debordement?.tour ?? 1,
            class:'tour',
            changevent: (newvalue) => {
              const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape('debordement')}`);
              let v = Number(newvalue);

              if(v < 1) v = 1;
              if (input) input.value = String(v);
              actor?.update?.({ [`system.debordement.tour`]: v });
            }
          }
        ]);

        for (const p of list) {
          // Exemple inchangé: à adapter si certains doivent aller au "center"
          switch (p) {
            case "bouclier":
              if(!actor.system?.options?.bouclier) continue;
              Blocks.left.push([
                { text: this._getAttrLabel(p) },
                { text: actor.system[p]?.value ?? 0, class: "bouclier" },
              ]);
              break;

            case 'sante':
              // Par défaut à gauche; mettez ici la logique qui décide du center si besoin
              Blocks.left.push([
                { text: this._getAttrLabel('cohesion') },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;

            default:
              // Par défaut à gauche; mettez ici la logique qui décide du center si besoin
              Blocks.left.push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;
          }
        }

        return Blocks;
      }

      get sideCreature() {
        const actor = this._actor;
        const list = ['sante', 'espoir', 'resilience', 'armure', 'energie', 'bouclier', 'champDeForce'];
        // Désormais: left, center, right
        const Blocks = { left: [], center: [], right: [] };

        if (!actor?.system) return Blocks;

        for (const p of list) {
          if (!actor.system.options?.[p]) continue;

          // Exemple inchangé: à adapter si certains doivent aller au "center"
          switch (p) {
            case "champDeForce":
            case "bouclier":
              Blocks.right.push([
                { text: this._getAttrLabel(p) },
                { text: actor.system[p]?.value ?? 0, class: "cdf" },
              ]);
              break;

            case "armure":
              (Blocks.left).push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;

            case "energie":
              (Blocks.right).push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;

            default:
              // Par défaut à gauche; mettez ici la logique qui décide du center si besoin
              Blocks.left.push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;
          }
        }

        return Blocks;
      }

      get sideVehicule() {
        const actor = this._actor;
        const list = ['armure', 'energie', 'champDeForce', 'passagers', 'vitesse'];
        // Désormais: left, center, right
        const Blocks = { left: [], center: [], right: [] };

        if (!actor?.system) return Blocks;

        for (const p of list) {
          // Exemple inchangé: à adapter si certains doivent aller au "center"
          switch (p) {
            case "champDeForce":
              Blocks.right.push([
                { text: this._getAttrLabel(p) },
                { text: actor.system[p]?.value ?? 0, class: "cdf" },
              ]);
              break;

            case "vitesse":
            case "passagers":
              Blocks.left.push([
                { text: this._getAttrLabel(p) },
                { text: actor.system[p]?.value ?? 0, class: "cdf" },
              ]);
              break;

            case "armure":
              (Blocks.right).push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;

            case "energie":
              (Blocks.right).push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;

            default:
              // Par défaut à gauche; mettez ici la logique qui décide du center si besoin
              Blocks.left.push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;
          }
        }

        return Blocks;
      }

      get sideMechaArmure() {
        const actor = this._actor;
        const list = ['resilience', 'blindage', 'champDeForce', 'energie'];
        // Désormais: left, center, right
        const Blocks = { left: [], center: [], right: [] };

        if (!actor?.system) return Blocks;

        Blocks.center.push([{
          isSelect:true,
          options: Object.entries(CONFIG.KNIGHT.LIST.style ?? {}).map(([k, v]) => [k, game.i18n.localize(`${v.replace('Label', 'FullLabel')}`)]),
          value:actor.system.combat.style,
          changevent: (newvalue) => {
            actor?.update?.({ [`system.combat.style`]: newvalue });
          }
        }])

        for (const p of list) {
          // Exemple inchangé: à adapter si certains doivent aller au "center"
          switch (p) {
            case "champDeForce":
              Blocks.right.push([
                { text: this._getAttrLabel(p) },
                { text: actor.system[p]?.value ?? 0, class: "cdf" },
              ]);
              break;

            case "energie":
              // Par défaut à gauche; mettez ici la logique qui décide du center si besoin
              Blocks.right.push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;

            default:
              // Par défaut à gauche; mettez ici la logique qui décide du center si besoin
              Blocks.left.push([
                { text: this._getAttrLabel(p) },
                {
                  isinput: true,
                  inputtype: "number",
                  text: this._getAttrValue(p),
                  class: p,
                  changevent: (newvalue) => {
                    const max = actor?.system?.[p]?.max ?? Number.POSITIVE_INFINITY;
                    let v = Number(newvalue);
                    if (Number.isNaN(v)) v = 0;
                    if (v > max) {
                      v = max;
                      const input = this._rootEl?.querySelector(`.portrait-stat-block input.${CSS.escape(p)}`);
                      if (input) input.value = String(v);
                    }
                    actor?.update?.({ [`system.${p}.value`]: v });
                  }
                },
                { text: "/" },
                { text: this._getAttrMax(p) }
              ]);
              break;
          }
        }

        return Blocks;
      }

      get side() {
        const type = this._actor.type;
        let Blocks = { left: [], center: [], right: [] };

        switch(type) {
          case 'knight':
            Blocks = this.sideKnight;
            break;

          case 'bande':
            Blocks = this.sideBande;
            break;

          case 'creature':
          case 'pnj':
            Blocks = this.sideCreature;
            break;

          case 'vehicule':
            Blocks = this.sideVehicule;
            break;

          case 'mechaarmure':
            Blocks = this.sideMechaArmure;
            break;
        }

        return Blocks;
      }
    }

    return class KnightPortraitPanel extends ARGON.PORTRAIT.PortraitPanel {
        constructor(...args) {
          super(...args);
          this._rootEl = null;
        }

        async getsideStatBlocks() {
          const side = new constructSide(this.actor).side;
          return side;
        }

        async _renderInner(data) {
          const html = await super._renderInner(data);

          // Nœud racine fiable (HTMLElement)
          const root = html instanceof HTMLElement ? html : (html?.[0] ?? this.element?.[0] ?? this.element);
          if (!root) return html;
          this._rootEl = root;

          // 1) Nettoyer le rendu précédent (un seul wrapper)
          root.querySelectorAll(".portrait-stat-wrapper").forEach(n => n.remove());

          // 2) Données
          const statBlocksPromiseOrValue = this.getSideStatBlocks?.() ?? this.getsideStatBlocks?.();
          const blocks = statBlocksPromiseOrValue instanceof Promise ? await statBlocksPromiseOrValue : statBlocksPromiseOrValue;
          if (!blocks || typeof blocks !== "object") return html;

          // 3) Créer le wrapper unique
          const wrapper = document.createElement("div");
          wrapper.className = "portrait-stat-wrapper";
          // Laissez la mise en page au CSS; mettez position relative si vous gardez les colonnes en absolute
          // wrapper.style.position = "relative";

          // 4) Générer les 3 zones dans le même wrapper
          for (const position of ["center", "left", "right"]) {
            const sideList = blocks[position] || [];
            if (!Array.isArray(sideList) || sideList.length === 0) continue;

            const side = document.createElement("div");
            side.className = `portrait-stat-side portrait-stat-side--${position}`;

            // Si vous tenez à l’absolute inline (déconseillé: préférez le CSS), décommentez:
            // side.style.position = "absolute";
            // if (position === "left") side.style.left = "0px";
            // if (position === "right") side.style.right = "0px";
            // if (position === "center") { side.style.left = "50%"; side.style.transform = "translateX(-50%)"; }
            for (const block of sideList) {
              if (!Array.isArray(block)) continue;

              const blockEl = document.createElement("div");
              blockEl.classList.add("portrait-stat-block", "portrait-stat-block-lr");

              let firstAdded = false;
              let dataBlock = null;

              for (const stat of block) {
                if (stat?.position) continue; // possibilité de filtrer

                const node = this._createDisplayer(stat);

                if (!firstAdded) {
                  blockEl.appendChild(node);
                  firstAdded = true;
                } else {
                  if (!dataBlock) {
                    dataBlock = document.createElement("div");
                    dataBlock.classList.add(...this._addDataClass(stat));
                    blockEl.appendChild(dataBlock);
                  }
                  dataBlock.appendChild(node);
                }
              }

              side.appendChild(blockEl);
            }

            wrapper.appendChild(side);
          }

          // 5) Injecter le wrapper unique
          root.appendChild(wrapper);

          return html;
        }

        // Méthode interne: input | select | span
        _createDisplayer(stat = {}) {
          const isInput = stat.isinput || stat.isInput;
          const isSelect = stat.isSelect || stat.type === "select";

          const applyCommon = (el) => {
            if (stat.width) el.style.width = stat.width;
            if (stat.color) el.style.color = stat.color;
            if (stat.class) el.classList.add(...String(stat.class).split(/\s+/).filter(Boolean));
            return el;
          };

          const currentValue = stat.value !== undefined ? stat.value : stat.text;

          // INPUT
          if (isInput) {
            const el = applyCommon(document.createElement("input"));
            el.type = stat.inputtype || "text";

            if (el.type === "checkbox" || el.type === "radio") {
              const v = currentValue;
              el.checked = typeof v === "boolean" ? v : Boolean(v);
              el.addEventListener("change", () => stat.changevent?.(el.checked));
            } else {
              if (currentValue != null) el.value = String(currentValue);
              if (stat.min != null) el.min = String(stat.min);
              if (stat.max != null) el.max = String(stat.max);
              if (stat.step != null) el.step = String(stat.step);

              el.addEventListener("change", () => stat.changevent?.(el.value));
            }
            return el;
          }

          // SELECT
          if (isSelect) {
            const sel = applyCommon(document.createElement("select"));
            if (stat.multiple) sel.multiple = true;
            if (Number.isFinite(stat.size)) sel.size = Number(stat.size);

            const setOptions = (selectEl, options, selected) => {
              const mkOpt = (value, label, extra = {}) => {
                const o = document.createElement("option");
                o.value = String(value);
                o.textContent = label != null ? String(label) : String(value);
                if (extra.disabled) o.disabled = true;
                if (extra.selected) o.selected = true;
                return o;
              };

              const hasNoSelection =
                selected == null ||
                selected === "" ||
                (Array.isArray(selected) && selected.length === 0);

              if (stat.placeholder && hasNoSelection && !selectEl.multiple) {
                const ph = mkOpt("", stat.placeholder, { disabled: true, selected: true });
                selectEl.appendChild(ph);
              }

              const addArray = (arr, container) => {
                for (const item of arr) {
                  if (item && typeof item === "object" && Array.isArray(item.options)) {
                    const og = document.createElement("optgroup");
                    og.label = String(item.label ?? "");
                    addArray(item.options, og);
                    container.appendChild(og);
                    continue;
                  }

                  if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
                    container.appendChild(mkOpt(item, item));
                  } else if (Array.isArray(item) && item.length >= 1) {
                    const [value, label] = item;
                    container.appendChild(mkOpt(value, label ?? value));
                  } else if (item && typeof item === "object") {
                    const { value, label, disabled, selected: selFlag } = item;
                    container.appendChild(mkOpt(value, label ?? value, { disabled, selected: selFlag }));
                  }
                }
              };

              if (Array.isArray(options)) {
                addArray(options, selectEl);
              } else if (options && typeof options === "object") {
                for (const [value, label] of Object.entries(options)) {
                  selectEl.appendChild(mkOpt(value, label));
                }
              }

              if (selectEl.multiple) {
                const wanted = Array.isArray(selected)
                  ? selected.map(String)
                  : selected != null
                    ? [String(selected)]
                    : [];
                for (const opt of selectEl.options) opt.selected = wanted.includes(opt.value);
              } else if (selected != null) {
                const val = String(selected);
                if ([...selectEl.options].some(o => o.value === val)) selectEl.value = val;
              }
            };

            setOptions(sel, stat.options ?? [], currentValue);

            sel.addEventListener("change", () => {
              const out = sel.multiple
                ? Array.from(sel.selectedOptions).map(o => o.value)
                : sel.value;
              stat.changevent?.(out);
            });

            return sel;
          }

          // SPAN (fallback lecture seule)
          const span = applyCommon(document.createElement("span"));
          span.textContent = currentValue != null ? String(currentValue) : "";
          return span;
        }

        _addDataClass(stat) {
          let cls = ['data'];

          switch(stat.class) {
            case 'debordement':
            case 'tour':
              cls.push('full');
              break;
          }

          return cls;
        }
    }
}

export function makeKnightDrawerPanel(ARGON) {
  class constructCategories {
    constructor(actor) {
      this._actor = actor;
    }

    get listKnight() {
      const actor = this._actor;
      const aspects = {...actor.system.aspects};
      const returncategories = [];
      const listCaracteristiques = {
          'bete':[],
          'chair':[],
          'machine':[],
          'dame':[],
          'masque':[],
      };


      for(let a in aspects) {
          const mainData = aspects[a];

          if(mainData?.caracteristiques) {
              for(let c in mainData.caracteristiques) {
                  const subData = mainData.caracteristiques[c];

                  listCaracteristiques[a].push(
                      new ARGON.DRAWER.DrawerButton([
                          {
                              label: game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[c]),
                              onClick: () => {
                                  const dialog = new game.knight.applications.KnightRollDialog(actor.token ? actor.token.id : actor.id, {
                                      label:game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[c]),
                                      base:c,
                                  });

                                  dialog.open();
                              }
                          },
                          {
                              label: `${subData.value} + ${subData.overdrive.value} ${game.i18n.localize("KNIGHT.ASPECTS.OD")}`,
                              onClick: () => {},
                              style: ""
                          }
                      ])
                  )
              }

              returncategories.push({
                  gridCols: "7fr 2fr",
                  captions: [
                    { label: game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[a]) },
                    { label: "" },
                  ],
                  buttons:listCaracteristiques[a],
              })
          }
      }

      return returncategories;
    }

    get listNpc() {
      const actor = this._actor;
      const aspects = {...actor.system.aspects};
      const returncategories = [];
      const listAspects = []


      for(let a in aspects) {
        const mainData = aspects[a];

        listAspects.push(
              new ARGON.DRAWER.DrawerButton([
                  {
                      label: game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[a]),
                      onClick: () => {
                          const dialog = new game.knight.applications.KnightRollDialog(actor.token ? actor.token.id : actor.id, {
                              label:game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[a]),
                              base:a,
                          });
                          dialog.options.classes.push('npc');
                          dialog.open();
                      }
                  },
                  {
                      label: `${mainData.value} + ${mainData.ae.mineur.value+mainData.ae.majeur.value} ${game.i18n.localize("KNIGHT.ASPECTS.Exceptionnel-short")}`,
                      onClick: () => {},
                      style: ""
                  }
              ])
        )
      }

      returncategories.push({
          gridCols: "7fr 2fr",
          captions: [
            { label: game.i18n.localize('KNIGHT.ASPECTS.Aspects') },
            { label: "" },
          ],
          buttons:listAspects,
      })

      return returncategories;
    }

    get list() {
      const actor = this._actor;
      const type = actor.type;
      let result = [];

      switch(type) {
        case 'knight':
          result = this.listKnight;
          break;

        case 'bande':
        case 'creature':
        case 'pnj':
          result = this.listNpc;
          break;

        case 'mechaarmure':
          if(actor?.system?.getPilote) {
            const pilote = actor.system.getPilote;
            const returncategories = [];

            if(pilote.type === 'knight') {
              const aspects = {...pilote.system.aspects};
              const listCaracteristiques = {
                  'bete':[],
                  'chair':[],
                  'machine':[],
                  'dame':[],
                  'masque':[],
              };


              for(let a in aspects) {
                  const mainData = aspects[a];

                  if(mainData?.caracteristiques) {
                      for(let c in mainData.caracteristiques) {
                          const subData = mainData.caracteristiques[c];

                          listCaracteristiques[a].push(
                              new ARGON.DRAWER.DrawerButton([
                                  {
                                      label: game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[c]),
                                      onClick: () => {
                                          const dialog = new game.knight.applications.KnightRollDialog(actor.token ? actor.token.id : actor.id, {
                                            label:game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[c]),
                                            base:c,
                                          });

                                          dialog.open();
                                      }
                                  },
                                  {
                                      label: `${subData.value} + ${subData.overdrive.value} ${game.i18n.localize("KNIGHT.ASPECTS.OD")}`,
                                      onClick: () => {},
                                      style: ""
                                  }
                              ])
                          )
                      }

                      returncategories.push({
                          gridCols: "7fr 2fr",
                          captions: [
                            { label: game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[a]) },
                            { label: "" },
                          ],
                          buttons:listCaracteristiques[a],
                      })
                  }
              }
            } else {
              const aspects = {...pilote.system.aspects};
              const listAspects = []

              for(let a in aspects) {
                const mainData = aspects[a];

                listAspects.push(
                      new ARGON.DRAWER.DrawerButton([
                          {
                              label: game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[a]),
                              onClick: () => {
                                  const dialog = new game.knight.applications.KnightRollDialog(actor.token ? actor.token.id : actor.id, {
                                    label:game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[a]),
                                    base:a,
                                  });
                                  dialog.options.classes.push('npc');
                                  dialog.open();
                              }
                          },
                          {
                              label: `${mainData.value} + ${mainData.ae.mineur.value+mainData.ae.majeur.value} ${game.i18n.localize("KNIGHT.ASPECTS.Exceptionnel-short")}`,
                              onClick: () => {},
                              style: ""
                          }
                      ])
                )
              }

              returncategories.push({
                  gridCols: "7fr 2fr",
                  captions: [
                    { label: game.i18n.localize('KNIGHT.ASPECTS.Aspects') },
                    { label: "" },
                  ],
                  buttons:listAspects,
              })
            }

            result = returncategories;
          }
          break;
      }

      return result;
    }
  }

  return class KnightDrawerPanel extends ARGON.DRAWER.DrawerPanel {
    constructor(...args) {
      super(...args);
    }

    get type() {
      return this.actor.type;
    }

    get categories() {
      const categories = new constructCategories(this.actor);

      return categories.list;
    }

    get title() {
      const actor = this.actor;
      let title = '';

      switch(this.type) {
        case 'vehicule':
          if(!actor?.system?.pilote) title =  game.i18n.localize("KNIGHT.VEHICULE.PasPilote");
          else title = actor.system.pilote.name;
          break;

        case 'mechaarmure':
          if(!actor?.system?.getPilote) title =  game.i18n.localize("KNIGHT.VEHICULE.PasPilote");
          else title = this.actor.system.getPilote.type === 'knight' ? `${game.i18n.localize(`${ModuleName}.TITLES.Caracteristiques`)}` : `${game.i18n.localize(`${ModuleName}.TITLES.Aspects`)}`;
          break;

        default:
          title = this.type === 'knight' ? `${game.i18n.localize(`${ModuleName}.TITLES.Caracteristiques`)}` : `${game.i18n.localize(`${ModuleName}.TITLES.Aspects`)}`;
          break;
      }

      return title;
    }
  }
}

export function makeKnightInformationPanel(ARGON) {
  class InformationButton extends ARGON.MAIN.BUTTONS.ActionButton {
    constructor(options = {}) {
        const {
          type,
          label,
          icon,
          // Le reste ira au parent
          ...parentArgs
        } = options;

        super(parentArgs); // n’envoie que ce que le parent comprend

        this.type = type;
        this.iLabel = label;
        this.iIcon = icon;
    }

    get hasTooltip() {
      return true;
    }

    get colorScheme() {
      return 2;
    }

    get label() {
      return this.iLabel;
    }

    get icon() {
      return this.iIcon;
    }

    async getTooltipData() {
      const actor = this.actor;
      const aspects = actor.system.aspects[this.type].ae;
      const title = game.i18n.localize(this.iLabel);
      let description = '';

      if(aspects.majeur.value > 0) description += game.i18n.localize(`KNIGHT.ASPECTS.${this.type.toUpperCase()}.AE.Majeur`);
      if(aspects.mineur.value > 0) description += description !== "" ? `<br/><br/>${game.i18n.localize(`KNIGHT.ASPECTS.${this.type.toUpperCase()}.AE.Mineur`)}` : `${game.i18n.localize(`KNIGHT.ASPECTS.${this.type.toUpperCase()}.AE.Mineur`)}`;

      return { title, description };
    }

    async _onLeftClick(event) {}
  }

  return class KnightSpecialPanel extends ARGON.MAIN.ActionPanel {
    constructor(...args) {
      super(...args);
    }

    get label() {
      return "enhancedcombathud-knight.TITLES.Informations";
    }

    get isPJ() {
        const who = this.actor;
        const type = who.type;
        let result = false;

        if(type === 'knight') result = true;
        else if(type === 'mechaarmure') {
            if(who?.system?.piloteId) {
                const pilote = game.actors.get(who.system.piloteId);

                if(pilote) {
                    if(pilote.type === 'knight') result = true;
                }
            }
        }

        return result;
    }

    get generateButtons() {
      const actor = this.actor;
      const aspects = actor.system.aspects;
      const btn = [];

      for(let a in aspects) {
        const ae = aspects?.[a]?.ae;

        if(ae?.mineur?.value > 0 || ae?.majeur?.value > 0) {
          btn.push(new InformationButton({
            type:a,
            label:CONFIG.KNIGHT.LIST.aspectsCaracteristiques[a],
            icon:'modules/enhancedcombathud-knight/assets/info.svg',
          }));
        }
      }

      return btn;
    }

    async _getButtons() {
      let list = [];

      if(!this.isPJ) {
        const listButtons = this.generateButtons;

        for(let n = 0;n < listButtons.length;n += 2) {
          if(listButtons[n] && listButtons[n+1]) list.push(new ARGON.MAIN.BUTTONS.SplitButton(listButtons[n], listButtons[n+1]));
          else list.push(listButtons[n]);
        }
      }

      return list;
    }
  }
}

export function makeKnightSpecialPanel(ARGON) {
  class SpecialButton extends ARGON.MAIN.BUTTONS.ActionButton {
    constructor(options = {}) {
        const {
          type,
          label,
          icon,
          // Le reste ira au parent
          ...parentArgs
        } = options;

        super(parentArgs); // n’envoie que ce que le parent comprend

        this.type = type;
        this.spLabel = label;
        this.spIcon = icon;
    }

    get colorScheme() {
      return 4;
    }

    get label() {
      return this.spLabel;
    }

    get icon() {
      return this.spIcon;
    }

    async _onLeftClick(event) {
      const actor = this.actor;
      const type = this.type;

      switch(type) {
        case 'debordement':
          actor.system.doDebordement();
          break;

        case 'increaseTurn':
          const turn = actor.system.debordement.tour;

          actor.update({[`system.debordement.tour`]:turn+1});
          const roll = new game.knight.RollKnight(actor, {
              name:`${actor.name}`,
          }, false);

          roll.sendMessage({text:game.i18n.localize('KNIGHT.JETS.DebordementAugmente'), classes:'important'});
          break;
      }
    }
  }

  return class KnightSpecialPanel extends ARGON.MAIN.ActionPanel {
    constructor(...args) {
      super(...args);
    }

    get label() {
      return "enhancedcombathud-knight.TITLES.ActionSpeciales";
    }

    get bandeList() {
      	return [
          new SpecialButton({
            type:'debordement',
            label:'KNIGHT.AUTRE.Debordement',
            icon:'modules/enhancedcombathud-knight/assets/debordement.svg',
          }),
          new SpecialButton({
            type:'increaseTurn',
            label:'KNIGHT.JETS.AugmenterDebordement',
            icon:'modules/enhancedcombathud-knight/assets/increaseTurn.svg',
          })
        ];
    }

    async _getButtons() {
      let list = [];

      switch(this.actor.type) {
        case 'bande':
          list = this.bandeList;
          break;
      }

      return list;
    }
  }
}