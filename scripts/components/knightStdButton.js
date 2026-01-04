import {
  getTooltipDetails,
} from "./knightTooltip.js";

import ArmureAPI from "/systems/knight/module/utils/armureAPI.mjs";

import {
  getArmor,
  getArmorLegend,
} from "/systems/knight/module/helpers/common.mjs";

import { PARTIALS_PATH } from "/modules/enhancedcombathud/scripts/core/hud.js";
import { TargetPicker } from "/modules/enhancedcombathud/scripts/core/targetPicker.js";

export function makeKnightItemButton(ARGON) {
    return class KnightItemButton extends ARGON.MAIN.BUTTONS.ItemButton {
        constructor(...args) {
          super(...args);
        }

        get hasTooltip() {
          return true;
        }

        get targets() {
          if(this.isWPN) return 1;
          return null;
        }

        get isWPN() {
          const item = this.item;
          let result = false;

          if(item.type === 'arme') result = true;
          else if(item.type === 'module' &&
          (((item.system?.active?.base ?? false) ||
          (item.system?.niveau?.actuel?.permanent ?? false)) &&
          (item.system?.niveau?.actuel?.arme?.has ?? false))) result = true;
          else if(item.type === 'capacite' &&
            item.system.attaque.has
          ) result = true;

          return result;
        }

        async getTooltipData() {
          const tooltipData = await getTooltipDetails(this.actor, this.item);
          return tooltipData;
        }

        async _onSetChange() {
          this.setItem(this.item);
        }

        async _onLeftClick(event) {
          if(this.isWPN) {
            const dialog = this.actor.system.useWpn('wpn', {
              id:this.item.id,
            });

            if(game.settings.get('enhancedcombathud', "dialogTheme")) dialog.options.classes.push('ech-highjack-window');
          }
        }
    }
}

export function makeKnightActionAsItemButton(ARGON) {
    return class KnightActionAsItemButton extends ARGON.MAIN.BUTTONS.ActionButton {
      constructor({key, data}) {
        super();
        this.key = key;
        this.data = data;
      }

      get template() {
          return `${PARTIALS_PATH}ActionButton.hbs`;
      }

      get hasTooltip() {
        return true;
      }

      get tooltipCls() {
          return CONFIG.ARGON.CORE.Tooltip;
      }

      get ranges(){
        return {
          normal: null,
          long: null
        }
      }

      get targets() {
        return 1;
      }

      get useTargetPicker() {
        return game.settings.get("enhancedcombathud", "rangepicker");
      }

      async _onLeftClick(event) {
        let isTargetPicker = false;

        if (this.useTargetPicker && this.targets > 0) {
          isTargetPicker = true;
          const picker = new TargetPicker({token: this.token, targets: this.targets, ranges: this.ranges});
          const result = await picker.promise;
          isTargetPicker = false;
          return result;
        }
      }
    }
}

export function makeKnightModulePanelButton(ARGON, KnightActionAsItemButton) {
    class KnightModuleButton extends KnightActionAsItemButton {
        constructor(options = {}) {
          const {
            name,
            icon,
            // Le reste ira au parent
            ...parentArgs
          } = options;

          super(parentArgs); // n’envoie que ce que le parent comprend

          this.name = name;
          this.img = icon;
        }

        get classes() {
          return ["feature-element"];
        }

        // le getter retourne une Promise (pense à faire await à l'usage)
        get module() {
          return this.data;
        }

        get label() {
          return this.name;
        }

        get icon() {
          return this.img;
        }

        get base() {
          const base = this.key.split('/_');

          return base?.[0] ?? "";
        }

        get pnj() {
          const base = this.key.split('/_');

          return base?.[1] ?? "";
        }

        get typepnj() {
          const base = this.key.split('/_');

          return base?.[2] ?? "";
        }

        get isActive() {
          return this.base === 'pnj' ? this.module.system.active.pnj : this.module.system.active.base;
        }


        get targets() {
          let result = 0;

          return result;
        }

        async getTooltipData() {
          const tooltipData = await getTooltipDetails(this.actor, {name:`${this.module.name}`, type:'module', system:this.data.system, actor:this.actor}, this.key);
          return tooltipData;
        }

        async _onLeftClick(event) {
          const target = await super._onLeftClick(event);
          const module = this.module;
          const activate = this.isActive ? false : true;
          const key = this.base;

          if(key === 'supplementaire') await module.system.supplementaire();
          else if(key === 'pnj') await module.system.activateNPC(activate, this.typepnj, this.pnj);
          else await module.system.activate(activate, key);
        }

        async _renderInner() {
          await super._renderInner();

          this.element.classList.add("capacity-element");
          this.element.classList.add("module-element");

          if(!this.isActive) this.element.classList.add("inactivate");

          const title = this.element.querySelector(".action-element-title");
          title.classList.remove("action-element-title");
          title.classList.add("feature-element-title");
        }
    }

    return class KnightModulePanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
      constructor({items=null}) {
        super();

        this.modules = items?.filter(itm => itm.type === 'module') ?? null;
        this._items = this._prepareItm();
      }

      get id() {
          return `modules-${this.actor.id}-${this._items.length}`;
      }

      get label() {
        return game.i18n.localize("KNIGHT.ITEMS.MODULE.Label");
      }

      get icon() {
        return "modules/enhancedcombathud-knight/assets/module.svg";
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

      get armorIsWear() {
          const wear = this.actor.system?.wear ?? '';
          let result = false;

          if(wear === 'armure' || wear === 'ascension' || !this.isPJ || this.actor.type === 'vehicule') result = true;

          return result;
      }

      async _getPanel() {
        const panel = new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel({ id: this.id, accordionPanelCategories: this._items.map(({ label, buttons, uses }) => new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory({ label, buttons, uses })) });

        return panel;
      }

      _prepareItm() {
        let prepared = [];

        if(!this.armorIsWear) return prepared;

        for(let m of this.modules) {
          const data = m;
          const actuel = data?.system?.niveau?.actuel ?? {};
          const isPermanent = actuel.permanent;
          const hasPNJ = actuel.pnj?.has ?? false;
          const energieTour = actuel.energie?.tour?.value ?? 0;
          const energieMinute = actuel.energie?.minute?.value ?? 0;
          const energieSupp = actuel.energie?.supplementaire ?? 0;
          const activeBase = data?.system?.active?.base;
          const activePNJ = data?.system?.active?.pnj;
          const listPNJ = actuel?.pnj?.liste ?? {};

          let buttons = [];

          const std = {
            data:data,
            icon:m.img,
          };

          if(energieMinute === 0 && energieTour === 0 && !hasPNJ && !isPermanent && !activeBase) {
            buttons.push(new KnightModuleButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')}`,
              key:`other`,
            })));
          }

          if(energieTour > 0  && !isPermanent && !activeBase) {
            buttons.push(new KnightModuleButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')} (${actuel.energie.tour.label})`,
              key:`tour`,
            })));
          }

          if(energieMinute > 0  && !isPermanent && !activeBase) {
            buttons.push(new KnightModuleButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')} (${actuel.energie.minute.label})`,
              key:`minute`,
            })));
          }

          if(!isPermanent && activeBase) {
            buttons.push(new KnightModuleButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize('KNIGHT.AUTRE.Desactiver')}`,
              key:'desactiver',
            })));
          }

          if(!isPermanent && activePNJ) {
            buttons.push(new KnightModuleButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize('KNIGHT.AUTRE.Desactiver')}`,
              key:'pnj',
            })));
          }

          if(energieSupp > 0  && !isPermanent && (activeBase || activePNJ)) {
            buttons.push(new KnightModuleButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize('KNIGHT.ITEMS.MODULE.DepenseSupplementaire')}`,
              key:`supplementaire`,
            })));
          }

          if(hasPNJ && !activePNJ) {
            for(let pnj in listPNJ) {
              if(energieMinute === 0 && energieTour === 0 && !isPermanent) {
                buttons.push(new KnightModuleButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')} : ${listPNJ[pnj].nom}`,
                  key:`pnj/_${pnj}`,
                })));
              }

              if(energieTour > 0  && !isPermanent) {
                buttons.push(new KnightModuleButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')} : ${listPNJ[pnj].nom} (${game.i18n.localize('KNIGHT.AUTRE.Tour')})`,
                  key:`pnj/_${pnj}/_tour`,
                })));
              }

              if(energieMinute > 0  && !isPermanent) {
                buttons.push(new KnightModuleButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')} : ${listPNJ[pnj].nom} (${game.i18n.localize('KNIGHT.AUTRE.Minute')})`,
                  key:`pnj/_${pnj}/_minute`,
                })));
              }
            }
          }

          if(buttons.length > 0) {
            prepared.push({
              label: data.name,
              buttons,
            });
          }
        }

        return prepared;
      }
    }
}

export function makeKnightProlongerButton(KnightActionAsItemButton) {
    return class KnightProlongerButton extends KnightActionAsItemButton {
      constructor(options = {}) {
        const {
          name,
          icon,
          legende,
          // Le reste ira au parent
          ...parentArgs
        } = options;

        super(parentArgs); // n’envoie que ce que le parent comprend

        this.name = name;
        this.img = icon;
        this.legende = legende;
      }

      get classes() {
        return ["feature-element"];
      }

      get label() {
        return this.name;
      }

      get icon() {
        return this.img;
      }

      get targets() {
        return 0;
      }

      get armure() {
        return this.actor.items?.find(itm => itm.type === 'armure');
      }

      get capacite() {
        const capacite = this.key.split('/_');

        return capacite?.[0] ?? "";
      }

      get special() {
        const capacite = this.key.split('/_');

        return capacite?.[1] ?? "";
      }

      get variant() {
        const capacite = this.key.split('/_');

        return capacite?.[2] ?? "";
      }

      get dataCapacity() {
        const getArmure = new ArmureAPI(this.armure);

        return getArmure.getCapacite(this.capacite);
      }

      async getTooltipData() {
        const tooltipData = await getTooltipDetails(this.actor, {name:`${this.label}`, type:'prolonger', system:this.data}, this.key);
        return tooltipData;
      }

      async _onLeftClick(event) {
        const target = await super._onLeftClick(event);
        const capacite = this.capacite;
        const special = this.special;
        const variant = this.variant;
        const armure = await getArmor(this.actor);
        const armureLegende = await getArmorLegend(this.actor);
        const isLegend = this.legende;
        const whatArmor = isLegend ? armureLegende : armure;

        await whatArmor.system.prolongateCapacity({capacite, special, variant});
      }

      async _renderInner() {
        await super._renderInner();

        this.element.classList.add("capacity-element");

        const title = this.element.querySelector(".action-element-title");
        title.classList.remove("action-element-title");
        title.classList.add("feature-element-title");
      }
    }
}