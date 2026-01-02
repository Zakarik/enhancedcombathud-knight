import { ModuleName, typeIsActivated } from "../utils.js";
import ArmureAPI from "/systems/knight/module/utils/armureAPI.mjs";
import ArmureLegendeAPI from "/systems/knight/module/utils/armureLegendeAPI.mjs";
import {
  getArmorCapacityHandler
} from "./handlers/registry.js";
import {
  capitalizeFirstLetter,
  getArmor,
  getArmorLegend,
} from "/systems/knight/module/helpers/common.mjs";

import {
  getTooltipDetails,
} from "./knightTooltip.js";
import { promptNumber, promptSelect } from "./helpers/prompt.js";
export function makeKnightCapacitePanel(ARGON, KnightModulePanelButton, KnightProlongerButton, KnightActionAsItemButton) {
  const ignored = ['bande'];

  class KnightArmorCapacityButton extends KnightActionAsItemButton {
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
        let name = this.name;

        if(name === game.i18n.localize("KNIGHT.AUTRE.Activer") && this.isActive) name = game.i18n.localize("KNIGHT.AUTRE.Desactiver");

        return name;
      }

      get icon() {
        return this.img;
      }

      get armure() {
        return this.legende ? this.actor.items?.find(itm => itm.type === 'armurelegende') : this.actor.items?.find(itm => itm.type === 'armure');
      }

      get isActive() {
        const getArmure = this.legende ? new ArmureLegendeAPI(this.armure) : new ArmureAPI(this.armure);
        let result = false;

        if(getArmure.isCapaciteActive(this.capacite, this.special, this.variant)) result = true;

        if((this.capacite === 'changeling' && this.special === 'explosive')
          || (this.capacite === 'illumination' && this.variant === 'dgts')) result = true;

        return result;
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

      get targets() {
        const capacite = this.capacite;
        const special = this.special;
        const variant = this.variant;
        let result = 0;

        if(capacite === 'oriflamme' ||
          (capacite === 'changeling' && special === 'explosive') ||
          (capacite === 'rage' && special === 'blaze') ||
          (special === 'lantern' && variant === 'dgts') ||
          (special === 'blaze' && variant === 'dgts')
        ) result = 1;

        return result;
      }

      async getTooltipData() {
        const tooltipData = await getTooltipDetails(this.actor, {name:`${this.label}`, type:'capacity', system:this.data}, this.key);

        return tooltipData;
      }

      async _onLeftClick(event) {
        const target = await super._onLeftClick(event);
        const capacite = this.capacite;
        const special = this.special;
        const variant = this.variant;
        const isActive = this.isActive;
        const armureLegend = await getArmorLegend(this.actor);
        const armure = await getArmor(this.actor);
        const isLegend = this.legende;
        const whatArmor = isLegend ? armureLegend : armure;

        if(isActive) whatArmor.system.activateCapacity({capacite, special, variant});
        else {
          const ctx = { actor: this.actor, armure, armureLegend, dataCapacity:this.dataCapacity, isLegend}

          const handler = getArmorCapacityHandler(capacite);
          await handler.activate?.(
            ctx,
            { capacite, special, variant }
          );
        }
      }

      async _renderInner() {
        await super._renderInner();

        this.element.classList.add("capacity-element");

        if(!this.isActive) this.element.classList.add("inactivate");

        const title = this.element.querySelector(".action-element-title");
        title.classList.remove("action-element-title");
        title.classList.add("feature-element-title");
      }
  }

  class KnightArmorCapacitePanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
      constructor({items=null}) {
        super();

        this.armure = items?.find(itm => itm.type === 'armure') ?? null;
        this._items = this._prepareItm();
      }

      get id() {
          return `${this.armure.id}-${this.actor.id}`;
      }

      get label() {
        return this?.armure?.name ?? "";
      }

      get icon() {
        return this?.armure?.img ?? "";
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

          if(wear === 'armure' || wear === 'ascension' || !this.isPJ) result = true;

          return result;
      }

      async _getPanel() {
        const panel = new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel({ id: this.id, accordionPanelCategories: this._items.map(({ label, buttons, uses }) => new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory({ label, buttons, uses })) });

        return panel;
      }

      _prepareItm() {
        const getArmure = new ArmureAPI(this.armure);
        const capacites = getArmure.capacites;
        const special = getArmure.special;
        const listIgnore = ['cea', 'longbow', 'personnalise', 'sarcophage'];

        let prepared = [];

        if(!this.armorIsWear) return prepared;

        for(let c in capacites) {
          const data = capacites[c];
          let buttons = [];

          if(listIgnore.includes(c)) continue;
          const std = {
            data,
            icon:this.armure.img,
          };

          switch(c) {
            case 'ascension':
              if(data.permanent) continue;

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')}`,
                key:`${c}`,
              })));
              break;

            case 'borealis':
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.BOREALIS.SUPPORT.Label")}`,
                key:`${c}/_support`,
                data:data
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.BOREALIS.UTILITAIRE.Label")}`,
                key:`${c}/_utilitaire`,
                data:data
              })));
              break;

            case 'changeling':
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.TransformationPersonnelle")}`,
                key:`${c}/_personnel`,
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.TransformationEtendue")}`,
                key:`${c}/_etendue`,
                data:data,
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.FauxEtres")}`,
                key:`${c}/_fauxEtre`,
                data:data
              })));

              if(data?.active?.fauxEtre || data?.active?.personnel || data?.active?.etendue) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}`,
                  data:data
                })));
              }

              if((data?.active?.fauxEtre || data?.active?.personnel || data?.active?.etendue) && data.desactivationexplosive.acces) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.DesactivationExplosive")}`,
                  key:`${c}/_explosive`,
                  data:data
                })));
              }
              break;

            case 'companions':
              const deployables = data?.deployables ?? 1;
              let i = 0;
              if(data.active.lion) i += 1;
              if(data.active.wolf) i += 1;
              if(data.active.crow) i += 1;

              if((!data.active.wolf && !data.active.crow) || (i < deployables || data.active.lion)) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.LION.Label")}`,
                  key:`${c}/_lion`,
                  data:data
                })));
              }

              if(data.active.lion) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.LION.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_lion`,
                  data:data
                })));
              }

              if((!data.active.lion && !data.active.crow) || (i < deployables || data.active.wolf)) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.WOLF.Label")}`,
                  key:`${c}/_wolf`,
                  data:data
                })));
              }

              if(data.active.wolf) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.WOLF.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_wolf`,
                  data:data
                })));
              }

              if((!data.active.wolf && !data.active.lion) || (i < deployables || data.active.crow)) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.CROW.Label")}`,
                  key:`${c}/_crow`,
                  data:data
                })));
              }

              if(data.active.crow) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.CROW.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_crow`,
                  data:data
                })));
              }
              break;

            case 'discord':
              if(!data.active.scene) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.DUREE.UnTour")}`,
                  key:`${c}/_tour`,
                  data:data
                })));
              }
              if(data.active.tour) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.DUREE.UnTour")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_tour`,
                  data:data
                })));
              }

              if(!data.active.tour) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.DUREE.ConflitPhase")}`,
                  key:`${c}/_scene`,
                  data:data
                })));
              }


              if(data.active.scene) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.DUREE.ConflitPhase")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_scene`,
                  data:data
                })));
              }
              break;

            case 'ghost':
              if(!data.active.horsconflit) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.ActivationConflit")}`,
                  key:`${c}/_conflit`,
                  data:data
                })));
              }

              if(data.active.conflit) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_conflit`,
                  data:data
                })));
              }

              if(!data.active.conflit) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.ActivationHorsConflit")}`,
                  key:`${c}/_horsconflit`,
                  data:data
                })));
              }

              if(data.active.horsconflit) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_horsconflit`,
                  data:data
                })));
              }

              if(data.active.conflit || data.active.horsconflit) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.JetPasserInaperçu")}`,
                  key:`${c}/_passerinaperçu`,
                  data:data
                })));
              }
              break;

            case 'illumination':
              if(data.beacon.selectionne) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.BEACON.Label")}`,
                  key:`${c}/_beacon`,
                  data:data
                })));
              }

              if(data.active.beacon) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.BEACON.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_beacon`,
                  data:data
                })));
              }

              if(data.blaze.selectionne) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.BLAZE.Label")}`,
                  key:`${c}/_blaze`,
                  data:data
                })));

                if(data.active.blaze) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.BLAZE.Label')} : ${game.i18n.localize("KNIGHT.AUTRE.Degats")} / ${game.i18n.localize("KNIGHT.AUTRE.Violence")}`,
                    key:`${c}/_blaze/_dgts`,
                    data:data
                  })));

                  buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.BLAZE.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                    key:`${c}/_blaze`,
                    data:data
                  })));
                }
              }

              if(data.candle.selectionne) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.CANDLE.Label")}`,
                  key:`${c}/_candle`,
                  data:data
                })));
              }

              if(data.lantern.selectionne) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.LANTERN.Label")}`,
                  key:`${c}/_lantern`,
                  data:data
                })));

                if(data.active.lantern) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.LANTERN.Label')} : ${game.i18n.localize("KNIGHT.AUTRE.Degats")}`,
                    key:`${c}/_lantern/_dgts`,
                    data:data
                  })));

                  buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.LANTERN.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                    key:`${c}/_lantern`,
                    data:data
                  })));
                }
              }

              if(data.lighthouse.selectionne) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.LIGHTHOUSE.Label")}`,
                  key:`${c}/_lighthouse`,
                  data:data
                })));
              }

              if(data.active.lighthouse) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.LIGHTHOUSE.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_lighthouse`,
                  data:data
                })));
              }

              if(data.projector.selectionne) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.PROJECTOR.Label")}`,
                  key:`${c}/_projector`,
                  data:data
                })));
              }

              if(data.active.projector) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.PROJECTOR.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_projector`,
                  data:data
                })));
              }

              if(data.torch.selectionne) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.TORCH.Label")}`,
                  key:`${c}/_torch`,
                  data:data
                })));
              }

              if(data.active.torch) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.TORCH.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_torch`,
                  data:data
                })));
              }
              break;

            case 'mechanic':
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.AUTRE.Contact")}`,
                key:`${c}/_contact`,
                data:data
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.AUTRE.Distance")}`,
                key:`${c}/_distance`,
                data:data
              })));
              break;

            case 'morph':
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')}`,
                key:`${c}`,
                data:data
              })));

              if(data.active.morph && !data.choisi.fait) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.AUTRE.Choisir')} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.VOL.Label")}`,
                  key:`${c}/_vol/_choix`,
                  data:data
                })));

                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.AUTRE.Choisir')} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.PHASE.Label")}`,
                  key:`${c}/_phase/_choix`,
                  data:data
                })));

                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.AUTRE.Choisir')} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.ETIREMENT.Label")}`,
                  key:`${c}/_etirement/_choix`,
                  data:data
                })));

                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.AUTRE.Choisir')} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.METAL.Label")}`,
                  key:`${c}/_metal/_choix`,
                  data:data
                })));

                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.AUTRE.Choisir')} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.FLUIDE.Label")}`,
                  key:`${c}/_fluide/_choix`,
                  data:data
                })));

                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.AUTRE.Choisir')} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label")}`,
                  key:`${c}/_polymorphie/_choix`,
                  data:data
                })));
              } else if(data.active.morph && data.choisi.fait) {
                if(data.choisi.etirement) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.ETIREMENT.Label')} - ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.ETIREMENT.JetImmobilisation')}`,
                    key:`${c}/_etirement`,
                    data:data
                  })));
                }

                if(data.choisi.phase) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.PHASE.Label')}`,
                    key:`${c}/_phase`,
                    data:data
                  })));

                  if(data.phase.niveau2.acces) {
                    buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                      name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.PHASE.Label2')}`,
                      key:`${c}/_phaseN2`,
                      data:data
                    })));
                  }
                }

                if(data.choisi.polymorphie && !data.polymorphie.max) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label')} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Lame")}`,
                    key:`${c}/_polymorphieLame`,
                    data:data
                  })));

                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label')} :
                    ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Griffe")}`,
                    key:`${c}/_polymorphieGriffe`,
                    data:data
                  })));

                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label')} :
                    ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Canon")}`,
                    key:`${c}/_polymorphieCanon`,
                    data:data
                  })));
                } else if(data.choisi.polymorphie && data.polymorphie.max) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label')} :
                    ${game.i18n.localize("KNIGHT.AUTRE.Reset")}`,
                    key:`${c}/_polymorphieReset`,
                    data:data
                  })));
                }

              }
              break;

            case 'nanoc':
              if(!data.active.detaille && !data.active.mecanique) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.NANOC.ObjetBase')}`,
                  key:`${c}/_base`,
                  data:data
                })));
              }

              if(!data.active.base &&  !data.active.mecanique) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.NANOC.ObjetDetaille')}`,
                  key:`${c}/_detaille`,
                  data:data
                })));
              }


              if(!data.active.base &&  !data.active.detaille) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.NANOC.ObjetMecanique')}`,
                  key:`${c}/_mecanique`,
                  data:data
                })));
              }

              if(data.active.base) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_base`,
                  data:data
                })));
              }

              if(data.active.detaille) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_detaille`,
                  data:data
                })));
              }

              if(data.active.mecanique) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_mecanique`,
                  data:data
                })));
              }
              break;

            case 'oriflamme':
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.AUTRE.Degats')}`,
                key:`${c}/_degats`,
                data:data
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.AUTRE.Violence')}`,
                key:`${c}/_violence`,
                data:data
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.AUTRE.Degats')}` + `${game.i18n.localize('KNIGHT.AUTRE.Violence')}`,
                key:`${c}/_degatsviolence`,
                data:data
              })));
              break;

            case 'shrine':
              if(!data.active.distance6 && !data.active.distance && !data.active.personnel6) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.SHRINE.ENERGIE.Personnel')}`,
                  key:`${c}/_personnel`,
                  data:data
                })));
              }

              if(!data.active.personnel && !data.active.personnel6 && !data.active.distance6) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.SHRINE.ENERGIE.Distance')}`,
                  key:`${c}/_distance`,
                  data:data
                })));
              }

              if(data.energie.acces6tours) {

                if(!data.active.personnel && !data.active.distance && !data.active.distance6) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.SHRINE.ENERGIE.Personnel6Tours')}`,
                    key:`${c}/_personnel6`,
                    data:data
                  })));
                }


                if(!data.active.personnel && !data.active.distance && !data.active.personnel6) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.SHRINE.ENERGIE.Distance6Tours')}`,
                    key:`${c}/_distance6`,
                    data:data
                  })));
                }
              }

              if(data.active.personnel) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_personnel`,
                  data:data
                })));
              }

              if(data.active.distance) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_distance`,
                  data:data
                })));
              }

              if(data.active.personnel6) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_personnel6`,
                  data:data
                })));
              }

              if(data.active.distance6) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}/_distance6`,
                  data:data
                })));
              }
              break;

            case 'type':
              const listType = ['soldier', 'hunter', 'scholar', 'herald', 'scout'];

              const limite = data.legend ? 2 : 1;
              const isActivateToLimite = typeIsActivated(data, listType, limite);
              let count = 0;

              for(let t of listType) {
                if(data?.type?.[t]?.selectionne) {
                  if(data?.type?.[t]?.conflit && !data?.type?.[t]?.horsconflit) {
                    buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                      name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} - ${game.i18n.localize("KNIGHT.AUTRE.EnConflit")}`,
                      key:`${c}/_${t}/_conflit`,
                      data:data
                    })));
                    count++;

                    if(count === limite) break;
                  } else if(data?.type?.[t]?.horsconflit && !data?.type?.[t]?.conflit) {
                    buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                      name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} - ${game.i18n.localize("KNIGHT.AUTRE.HorsConflit")}`,
                      key:`${c}/_${t}/_horsconflit`,
                      data:data
                    })));
                    count++;

                    if(count === limite) break;
                  } else if(isActivateToLimite) {
                    buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                      name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} - ${game.i18n.localize("KNIGHT.AUTRE.EnConflit")}`,
                      key:`${c}/_${t}/_conflit`,
                      data:data
                    })));

                    buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                      name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} - ${game.i18n.localize("KNIGHT.AUTRE.HorsConflit")}`,
                      key:`${c}/_${t}/_horsconflit`,
                      data:data
                    })));
                  }

                  if(data?.type?.[t]?.conflit) {
                    buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                      name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                      key:`${c}/_${t}/_conflit`,
                      data:data
                    })));
                  }

                  if(data?.type?.[t]?.horsconflit) {
                    buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                      name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                      key:`${c}/_${t}/_horsconflit`,
                      data:data
                    })));
                  }
                }
              }
              break;

            case 'warlord':
              const listWalord = ['action', 'force', 'esquive', 'guerre']

              if(data?.impulsions?.energie?.choisi) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.IMPULSIONS.ENERGIE.Label`)}`,
                  key:`${c}/_energie`,
                  data:data
                })));
              }

              for(let t of listWalord) {
                if(data?.impulsions?.[t]?.choisi) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.IMPULSIONS.${t.toUpperCase()}.Label`)} : (${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.ACTIVATION.Allie")})`,
                    key:`${c}/_${t}/_allie`,
                    data:data
                  })));

                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.IMPULSIONS.${t.toUpperCase()}.Label`)} : (${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.ACTIVATION.Porteur")})`,
                    key:`${c}/_${t}/_porteur`,
                    data:data
                  })));

                  if(t !== 'action') {
                    if(data?.active?.[t]?.allie || data?.active?.[t]?.porteur) {
                      buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                        name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.IMPULSIONS.${t.toUpperCase()}.Label`)} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                        key:`${c}/_${t}`,
                        data:data
                      })));
                    }
                  }
                }
              }
              break;

            case 'rage':
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')}`,
                key:`${c}`,
                data:data
              })));

              if(data.active) {
                if(!data.niveau.fureur) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.RAGE.UP.Label')} : ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.RAGE.UP.Espoir')}`,
                    key:`${c}/_niveau/_espoir`,
                    data:data
                  })));

                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.RAGE.UP.Label')} : ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.RAGE.UP.Ennemi')}`,
                    key:`${c}/_niveau/_ennemi`,
                    data:data
                  })));
                } else if(data.niveau.fureur) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.BLAZE.Label')} : ${game.i18n.localize("KNIGHT.AUTRE.Degats")} / ${game.i18n.localize("KNIGHT.AUTRE.Violence")}`,
                    key:`${c}/_blaze`,
                    data:data
                  })));
                }

                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.RAGE.SubirDegats')}`,
                  key:`${c}/_degats`,
                  data:data
                })));

                /*buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.RAGE.TUE.Humain')} : ${game.i18n.localize('KNIGHT.TYPE.Hostile')}`,
                  key:`${c}/_recuperation/_humain/hostile`,
                  data:data
                })));

                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.RAGE.TUE.Anatheme')} : ${game.i18n.localize('KNIGHT.TYPE.Hostile')}`,
                  key:`${c}/_recuperation/_anatheme/hostile`,
                  data:data
                })));*/
              }
              break;

            default:
              const otherPrologated = ['totem', 'puppet'];

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')}`,
                key:`${c}`,
                data:data
              })));

              if(otherPrologated.includes(c) && data?.active) {
                buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                  key:`${c}`,
                  data:data
                })));
              }
              break;
          }

          if(buttons.length > 0) {
            prepared.push({
              label: `KNIGHT.ITEMS.ARMURE.CAPACITES.${c.toUpperCase()}.Label`,
              buttons,
            });
          }
        }

        for(let s in special) {
          const data = special[s];
          let buttons = [];
          if(listIgnore.includes(s)) continue;

          const std = {
            data,
            icon:this.armure.img,
          };

          switch(s) {
            case 'impregnation':
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.JETS.Label")} : ${game.i18n.localize(CONFIG.KNIGHT.caracteristiques[data.jets.c1a])} / ${game.i18n.localize(CONFIG.KNIGHT.caracteristiques[data.jets.c2a])}`,
                key:`${s}/_a`,
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.JETS.Label")} : ${game.i18n.localize(CONFIG.KNIGHT.caracteristiques[data.jets.c1b])} / ${game.i18n.localize(CONFIG.KNIGHT.caracteristiques[data.jets.c2b])}`,
                key:`${s}/_b`,
              })));
              break;

            case 'energiedeficiente':
              for(let m = data.min;m <= data.max;m++) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.ENERGIEDEFICIENTE.Ponctionner")} ${m}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
                  key:`${s}/_${m}`,
                })));
              }
              break;

            case 'recolteflux':
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXHORSCONFLIT.Label")}`,
                key:`${s}/_horsconflit`,
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.Label")} :
                ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.DebutConflit")}`,
                key:`${s}/_conflit/_debut`,
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.Label")} :
                ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.ParTour")}`,
                key:`${s}/_conflit/_tour`,
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.Label")} :
                ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.HostileTue")}`,
                key:`${s}/_conflit/_hostile`,
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.Label")} :
                ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.SalopardTue")}`,
                key:`${s}/_conflit/_salopard`,
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.Label")} :
                ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.PatronTue")}`,
                key:`${s}/_conflit/_patron`,
              })));
              break;

            case 'contrecoups':
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.CONTRECOUPS.JetBase")} :
                ${game.i18n.localize(CONFIG.KNIGHT.caracteristiques[data.jet.c1])}`,
                key:`${s}/_c1`,
              })));

              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.CONTRECOUPS.JetBase")} :
                ${game.i18n.localize(CONFIG.KNIGHT.caracteristiques[data.jet.c2])}`,
                key:`${s}/_c2`,
              })));
              break;
          }

          if(buttons.length > 0) {
            prepared.push({
              label: `KNIGHT.ITEMS.ARMURE.SPECIAL.${s.toUpperCase()}.Label`,
              buttons,
            });
          }
        }

        return prepared;
      }
  }

  class KnightArmorLegendCapacitePanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
    constructor({items}) {
      super();

      this.armure = items?.find(itm => itm.type === 'armurelegende') ?? null;
      this._items = this._prepareItm();
    }

    get id() {
        return `${this.armure.id}-${this.actor.id}`;
    }

    get label() {
      return this?.armure?.name ?? "";
    }

    get icon() {
      return this?.armure?.img ?? "";
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

        if(wear === 'armure' || wear === 'ascension' || !this.isPJ) result = true;

        return result;
    }

    async _getPanel() {
      const panel = new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel({ id: this.id, accordionPanelCategories: this._items.map(({ label, buttons, uses }) => new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory({ label, buttons, uses })) });

      return panel;
    }

    _prepareItm() {
      let prepared = [];

      if(!this.armure) return prepared;

      const getArmure = new ArmureLegendeAPI(this.armure);
      const capacites = getArmure.capacites;
      const special = getArmure.special;

      if(!this.armorIsWear) return prepared;

      for(let c in capacites) {
        const data = capacites[c];
        let buttons = [];

        const std = {
          data,
          icon:this.armure.img,
          legende:true,
        };

        switch(c) {
          case 'changeling':
            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.TransformationPersonnelle")}`,
              key:`${c}/_personnel`,
            })));

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.TransformationEtendue")}`,
              key:`${c}/_etendue`,
              data:data,
            })));

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.FauxEtres")}`,
              key:`${c}/_fauxEtre`,
              data:data
            })));

            if(data?.active?.fauxEtre || data?.active?.personnel || data?.active?.etendue) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}`,
                data:data
              })));
            }
            break;

          case 'companions':
            if(data.lion.choisi) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.LION.Label")}`,
                key:`${c}/_lion`,
                data:data
              })));
            }

            if(data.active?.lion && data.lion.choisi) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.LION.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}/_lion`,
                data:data
              })));
            }

            if(data.wolf.choisi) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.WOLF.Label")}`,
                key:`${c}/_wolf`,
                data:data
              })));
            }

            if(data.wolf.choisi && data.active?.wolf) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.WOLF.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}/_wolf`,
                data:data
              })));
            }

            if(data.crow.choisi) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.CROW.Label")}`,
                key:`${c}/_crow`,
                data:data
              })));
            }

            if(data.crow.choisi && data.active?.crow) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.CROW.Label")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}/_crow`,
                data:data
              })));
            }
            break;

          case 'discord':
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.DUREE.UnTour")}`,
                key:`${c}/_tour`,
                data:data
              })));

            if(data.active?.tour) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.DUREE.UnTour")} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}/_tour`,
                data:data
              })));
            }
            break;

          case 'ghost':
            if(!data.active?.horsconflit) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.ActivationConflit")}`,
                key:`${c}/_conflit`,
                data:data
              })));
            }

            if(data.active?.conflit) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}/_conflit`,
                data:data
              })));
            }

            if(!data.active?.conflit) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.ActivationHorsConflit")}`,
                key:`${c}/_horsconflit`,
                data:data
              })));
            }

            if(data.active?.horsconflit) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}/_horsconflit`,
                data:data
              })));
            }

            if(data.active?.conflit || data.active?.horsconflit) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.JetPasserInaperçu")}`,
                key:`${c}/_passerinaperçu`,
                data:data
              })));
            }
            break;

          case 'mechanic':
            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.AUTRE.Contact")}`,
              key:`${c}/_contact`,
              data:data
            })));

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.AUTRE.Distance")}`,
              key:`${c}/_distance`,
              data:data
            })));
            break;

          case 'nanoc':
            if(!data.active?.detaille) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.NANOC.ObjetBase')}`,
                key:`${c}/_base`,
                data:data
              })));
            }

            if(!data.active?.base) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.NANOC.ObjetDetaille')}`,
                key:`${c}/_detaille`,
                data:data
              })));
            }

            if(data.active?.base) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}/_base`,
                data:data
              })));
            }

            if(data.active?.detaille) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}/_detaille`,
                data:data
              })));
            }
            break;

          case 'oriflamme':
            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize('KNIGHT.AUTRE.Degats')}`,
              key:`${c}/_degats`,
              data:data
            })));

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize('KNIGHT.AUTRE.Violence')}`,
              key:`${c}/_violence`,
              data:data
            })));

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize('KNIGHT.AUTRE.Degats')}` + `${game.i18n.localize('KNIGHT.AUTRE.Violence')}`,
              key:`${c}/_degatsviolence`,
              data:data
            })));
            break;

          case 'shrine':
            if(!data.active?.distance) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.SHRINE.ENERGIE.Personnel')}`,
                key:`${c}/_personnel`,
                data:data
              })));
            }

            if(!data.active?.personnel) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.SHRINE.ENERGIE.Distance')}`,
                key:`${c}/_distance`,
                data:data
              })));
            }

            if(data.active?.personnel) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}/_personnel`,
                data:data
              })));
            }

            if(data.active?.distance) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}/_distance`,
                data:data
              })));
            }
            break;

          case 'type':
            const listType = ['soldier', 'hunter', 'scholar', 'herald', 'scout'];

            const limite = data.legend ? 2 : 1;
            const isActivateToLimite = typeIsActivated(data, listType, limite);
            let count = 0;

            for(let t of listType) {
              if(data?.type?.[t]?.selectionne) {
                if(data?.type?.[t]?.conflit && !data?.type?.[t]?.horsconflit) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} - ${game.i18n.localize("KNIGHT.AUTRE.EnConflit")}`,
                    key:`${c}/_${t}/_conflit`,
                    data:data
                  })));
                  count++;

                  if(count === limite) break;
                } else if(data?.type?.[t]?.horsconflit && !data?.type?.[t]?.conflit) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} - ${game.i18n.localize("KNIGHT.AUTRE.HorsConflit")}`,
                    key:`${c}/_${t}/_horsconflit`,
                    data:data
                  })));
                  count++;

                  if(count === limite) break;
                } else if(isActivateToLimite) {
                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} - ${game.i18n.localize("KNIGHT.AUTRE.EnConflit")}`,
                    key:`${c}/_${t}/_conflit`,
                    data:data
                  })));

                  buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} - ${game.i18n.localize("KNIGHT.AUTRE.HorsConflit")}`,
                    key:`${c}/_${t}/_horsconflit`,
                    data:data
                  })));
                }

                if(data?.type?.[t]?.conflit) {
                  buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                    key:`${c}/_${t}/_conflit`,
                    data:data
                  })));
                }

                if(data?.type?.[t]?.horsconflit) {
                  buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                    name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.TYPE.TYPE.${capitalizeFirstLetter(t)}`)} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                    key:`${c}/_${t}/_horsconflit`,
                    data:data
                  })));
                }
              }
            }
            break;

          case 'warlord':
            const listWalord = ['action', 'force', 'esquive', 'guerre']

            if(data?.impulsions?.energie?.choisi) {
              buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.IMPULSIONS.ENERGIE.Label`)}`,
                key:`${c}/_energie`,
                data:data
              })));
            }

            for(let t of listWalord) {
              if(data?.impulsions?.[t]?.choisi) {
                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.IMPULSIONS.${t.toUpperCase()}.Label`)} : (${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.ACTIVATION.Allie")})`,
                  key:`${c}/_${t}/_allie`,
                  data:data
                })));

                buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
                  name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.IMPULSIONS.${t.toUpperCase()}.Label`)} : (${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.ACTIVATION.Porteur")})`,
                  key:`${c}/_${t}/_porteur`,
                  data:data
                })));

                if(t !== 'action') {
                  if(data?.active?.[t]?.allie || data?.active?.[t]?.porteur) {
                    buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                      name:`${game.i18n.localize(`KNIGHT.ITEMS.ARMURE.CAPACITES.WARLORD.IMPULSIONS.${t.toUpperCase()}.Label`)} : ${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                      key:`${c}/_${t}`,
                      data:data
                    })));
                  }
                }
              }
            }
            break;

          default:
            const otherPrologated = ['totem', 'puppet'];

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize('KNIGHT.AUTRE.Activer')}`,
              key:`${c}`,
              data:data
            })));

            if(otherPrologated.includes(c) && data?.active) {
              buttons.push(new KnightProlongerButton(foundry.utils.mergeObject(std, {
                name:`${game.i18n.localize("KNIGHT.AUTRE.Prolonger")}`,
                key:`${c}`,
                data:data
              })));
            }
            break;
        }

        if(buttons.length > 0) {
          prepared.push({
            label: `KNIGHT.ITEMS.ARMURE.CAPACITES.${c.toUpperCase()}.Label`,
            buttons,
          });
        }
      }

      for(let s in special) {
        const data = special[s];
        let buttons = [];

        const std = {
          data,
          icon:this.armure.img,
          legende:true,
        };

        switch(s) {
          case 'recolteflux':
            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXHORSCONFLIT.Label")}`,
              key:`${s}/_horsconflit`,
            })));

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.Label")} :
              ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.DebutConflit")}`,
              key:`${s}/_conflit/_debut`,
            })));

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.Label")} :
              ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.ParTour")}`,
              key:`${s}/_conflit/_tour`,
            })));

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.Label")} :
              ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.HostileTue")}`,
              key:`${s}/_conflit/_hostile`,
            })));

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.Label")} :
              ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.SalopardTue")}`,
              key:`${s}/_conflit/_salopard`,
            })));

            buttons.push(new KnightArmorCapacityButton(foundry.utils.mergeObject(std, {
              name:`${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.Label")} :
              ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXENCONFLIT.PatronTue")}`,
              key:`${s}/_conflit/_patron`,
            })));
            break;
        }

        if(buttons.length > 0) {
          prepared.push({
            label: `KNIGHT.ITEMS.ARMURE.SPECIAL.${s.toUpperCase()}.Label`,
            buttons,
          });
        }
      }

      return prepared;
    }
  }

	class KnightPhase2Button extends ARGON.MAIN.BUTTONS.ActionButton {
    constructor(options = {}) {
        const {
          // Le reste ira au parent
          ...parentArgs
        } = options;

        super(parentArgs); // n’envoie que ce que le parent comprend
    }

		get label() {
			return this?.actor?.system?.phase2Activate ? `KNIGHT.PHASE2.DesactivatePhase2` : `KNIGHT.PHASE2.ActivatePhase2`;
		}

    get icon() {
      return "modules/enhancedcombathud-knight/assets/phase2.svg";
    }

		async getTooltipData() {
			return null;
		}

		async _onLeftClick(event) {
      this.actor.system.togglePhase2();
    }
  }

  class KnightNPCCapacityButton extends KnightActionAsItemButton {
    constructor(options = {}) {
      const {
        name,
        icon,
        data,
        // Le reste ira au parent
        ...parentArgs
      } = options;

      super(parentArgs); // n’envoie que ce que le parent comprend

      this.data = data;
      this.name = name;
      this.img = icon;
    }

    get classes() {
      return ["feature-element", "center"];
    }

    get hasTooltip() {
      return true;
    }

    get label() {
      return this.name;
    }

    get icon() {
      return this.img;
    }

    get isActive() {
      let result = false;

      return result;
    }

    get targets() {
      let result = 0;

      if(this.data.system.degats.has) result = 1;
      return result;
    }

    async getTooltipData() {
      const tooltipData = await getTooltipDetails(this.actor, this.data, 'none');
      return tooltipData;
    }

    async _onLeftClick(event) {
      const target = await super._onLeftClick(event);
      const item = this.data;

      if(item.system.degats.has) {
        const capacityEffects = item.system.degats.system.effets.raw;
        const label = game.i18n.localize("enhancedcombathud-knight.OTHER.ActiverEffet");
        const effects = [{
          label:game.i18n.localize("KNIGHT.AUTRE.Non"),
          value:'nothing',
        }];
        let obliteration = false;
        let tenebricide = false;

        if(capacityEffects.includes('obliteration')) effects.push({label:game.i18n.localize('KNIGHT.EFFETS.OBLITERATION.Label'), value:'obliteration'});
        if(capacityEffects.includes('tenebricide')) effects.push({label:game.i18n.localize('KNIGHT.EFFETS.TENEBRICIDE.Label'), value:'tenebricide'});
        if(
          capacityEffects.includes('tenebricide') &&
          capacityEffects.includes('obliteration')
        ) effects.push({label:`${game.i18n.localize('KNIGHT.EFFETS.TENEBRICIDE.Label')} + ${game.i18n.localize('KNIGHT.EFFETS.OBLITERATION.Label')}`, value:'tenebricide/obliteration'});

        if(effects.length > 1) {
          const ask = await promptSelect({
            title: item.name,
            label,
            name: "effet",
            list: effects,
            value:'nothing',
            classes:['largeSelect']
          });

          if (ask != null) {
            const split = ask.split('/');
            obliteration = split.includes('obliteration');
            tenebricide = split.includes('tenebricide');

            this.actor.system.doCapacityDgt(item.id, {tenebricide, obliteration});
          }
        } else this.actor.system.doCapacityDgt(item.id, {tenebricide, obliteration});
      } else this.actor.items.get(this.data.id).sheet.render(true);;
    }

    async _renderInner() {
      await super._renderInner();

      this.element.classList.add("capacity-element");

      const title = this.element.querySelector(".action-element-title");
      title.classList.remove("action-element-title");
      title.classList.add("feature-element-title");
    }
  }

  class KnightNPCCapacitePanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
      constructor({items=null}) {
        super();

        this.capacite = items?.filter(itm => itm.type === 'capacite') ?? null;
        this._items = this._prepareItm();
      }

      get id() {
        return `${this.actor.id}-${this._items.length}-KnightNPCCapacitePanelButton`;
      }

      get label() {
        return "KNIGHT.CAPACITES.Label";
      }

      get icon() {
        return "modules/enhancedcombathud-knight/assets/capacite.svg";
      }

      async _getPanel() {
        return new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({buttons: this._items});
      }

      _prepareItm() {
        const capacites = this.capacite;
        let buttons = [];

        for(let c of capacites) {
          if(c.system.degats.has) {
            buttons.push(new KnightNPCCapacityButton({
              name:`${c.name} ${game.i18n.localize('KNIGHT.JETS.Label')} : ${game.i18n.localize('KNIGHT.AUTRE.Degats')}`,
              data:c,
              icon:c.img
            }));
          } else {
            buttons.push(new KnightNPCCapacityButton({
              name:`${c.name}`,
              data:c,
              icon:c.img
            }));
          }
        }

        return buttons;
      }
  }

  class KnightMAButton extends KnightActionAsItemButton {
    constructor(options = {}) {
      const {
        name,
        icon,
        key,
        // Le reste ira au parent
        ...parentArgs
      } = options;

      super(parentArgs); // n’envoie que ce que le parent comprend

      this.name = name;
      this.key = key,
      this.img = icon;
    }

    get classes() {
      return ["feature-element", "center"];
    }

    get hasTooltip() {
      return true;
    }

    get label() {
      return this.name;
    }

    get icon() {
      return this.img;
    }

    get isActive() {
      let result = false;

      return result;
    }

    get targets() {
      let result = 0;

      return result;
    }

    get bonus() {
      return this.actor.system[this.key].value;
    }

    async getTooltipData() {
      return {
        title:this.label,
        details:[{
          label:`${ModuleName}.OTHER.Score`,
          value:`${this.bonus}`,
        }],
        footerText:game.i18n.localize("enhancedcombathud-knight.OTHER.Lock"),
      };
    }

    async _onLeftClick(event) {
      const target = await super._onLeftClick(event);
      ui.ARGON.interceptNextDialog(event.currentTarget);
      const actor = this.actor.token ? this.actor.token.id : this.actor.id;
      let bonus = 0;

      bonus += this.bonus;

      const dialog = new game.knight.applications.KnightRollDialog(actor, {
        label:this.name,
        modificateur:bonus,
      });

      dialog.open();
    }

    async _renderInner() {
      await super._renderInner();

      this.element.classList.add("capacity-element");

      const title = this.element.querySelector(".action-element-title");
      title.classList.remove("action-element-title");
      title.classList.add("feature-element-title");
    }
  }

  class KnightMAPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
      constructor() {
        super();

        this._btn = this._prepareBtn();
      }

      get id() {
        return `${this.actor.id}-${this._btn.length}-KnightMAPanelButton`;
      }

      get label() {
        return "KNIGHT.MECHAARMURE.Caracteristiques";
      }

      get icon() {
        return "modules/enhancedcombathud-knight/assets/mechaarmure.svg";
      }

      async _getPanel() {
        return new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({buttons: this._btn});
      }

      _prepareBtn() {
        const capacites = ['vitesse', 'manoeuvrabilite', 'puissance', 'senseurs', 'systemes'];
        let buttons = [];

        for(let c of capacites) {
          buttons.push(new KnightMAButton({
            name:c === 'vitesse' || c === 'manoeuvrabilite' ? game.i18n.localize(`KNIGHT.VEHICULE.${capitalizeFirstLetter(c)}`) : game.i18n.localize(`KNIGHT.MECHAARMURE.${capitalizeFirstLetter(c)}`),
            key:c,
            icon:"systems/knight/assets/icons/mechaarmure.svg",
          }));
        }

        return buttons;
      }
  }

  class KnightMAModuleButton extends KnightActionAsItemButton {
    constructor(options = {}) {
      const {
        main,
        data,
        name,
        key,
        type,
        img,
        // Le reste ira au parent
        ...parentArgs
      } = options;

      super(parentArgs); // n’envoie que ce que le parent comprend

      this.main = main;
      this.data = data;
      this.name = name;
      this.key = key;
      this.type = type;
      this.img = img;
    }

    get classes() {
      return ["feature-element", "center"];
    }

    get hasTooltip() {
      return true;
    }

    get label() {
      let name = this.name;
      if(name === game.i18n.localize("KNIGHT.AUTRE.Activer") && this.isActive) name = game.i18n.localize("KNIGHT.AUTRE.Desactiver");

      return name;
    }

    get icon() {
      return this.img;
    }

    get isActive() {
      const needActive = ['stationDefenseAutomatise'];
      let result = false;

      if(this.type === 'activation' || (this.type === 'special' && needActive.includes(this.key))) result = this.data.active;

      return result;
    }

    get targets() {
      const key = this.key;
      const maintype = this.type;
      const needTgt = ['attaque', 'degats', 'violence', 'multi/choc', 'special/violence', 'special/degats'];

      let result = needTgt.includes(maintype) ? 1 : 0;

      if(key === 'canonMagma' && maintype === 'special') result = 1;

      return result;
    }

    async getTooltipData() {
      const tooltipData = await getTooltipDetails(this.actor, {
        type:'mechaarmure',
        system:{
          key:this.key,
          mainType:this.type,
          data:this.data,
        }
      });

      return tooltipData;
    }

    async _onLeftClick(event) {
      const target = await super._onLeftClick(event);
      const maintype = this.type;
      const splittype = maintype.split('/');
      const type = splittype[0];
      const key = this.key;
      const complexe = ['moduleWraith', 'offering', 'dronesEvacuation', 'canonMagma'];
      let subkey = null;
      let breakExec = false;

      if(complexe.includes(key)) {
        if(key === 'moduleWraith' && type === 'activation') subkey = 'base';
        else if(key === 'moduleWraith' && type === 'special') subkey = 'prolonger';
        else if(type === 'multi' && splittype[1] === 'noyaux') {
          const ask = await promptNumber({
            title: game.i18n.localize(`KNIGHT.MECHAARMURE.MODULES.${key.toUpperCase()}.Label`),
            label: game.i18n.localize("KNIGHT.BONUS.Noyaux"),
            name: "noyaux",
            value: this.data.noyaux.actuel,
            min: this.data.noyaux.min,
            max: this.data.noyaux.max
          });
          if (ask != null) {
            await this.actor.update({[`system.configurations.liste.${this.main}.modules.${key}.noyaux.actuel`]:ask})
          } else breakExec = true;
        }
        else if(key === 'dronesEvacuation' && type === 'activation') {
          const ask = await promptNumber({
            title: game.i18n.localize(`KNIGHT.MECHAARMURE.MODULES.${key.toUpperCase()}.Label`),
            label: game.i18n.localize("KNIGHT.LATERAL.Noyaux"),
            name: "noyaux",
            value: this.data.noyaux.actuel,
            min: this.data.noyaux.min,
            max: this.data.noyaux.max
          });
          subkey = 'actuel';
          if (ask != null) {
            await this.actor.update({[`system.configurations.liste.${this.main}.modules.${key}.noyaux.actuel`]:ask})
          } else breakExec = true;
        }
        else if(key === 'canonMagma' && type === 'activation') subkey = 'simple';
        else if(key === 'canonMagma' && type === 'special') subkey = 'bande';
      }

      if(!breakExec) await this.actor.system.activateCapacity(this.main, key, maintype, subkey);
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

  class KnightMAModulePanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
    constructor(options = {}) {
      const {
        name,
        type,
        // Le reste ira au parent
        ...parentArgs
      } = options;
        super(parentArgs); // n’envoie que ce que le parent comprend

        this.name = name;
        this.type = type;
        this._btn = this._prepareBtn();
      }

      get id() {
        return `${this.actor.id}-${this._btn.length}-${this.type}-KnightMAModulePanelButton`;
      }

      get label() {
        return this.name;
      }

      get icon() {
        return "modules/enhancedcombathud-knight/assets/mechaarmure.svg";
      }

      async _getPanel() {
        const panel = new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel({ id: this.id, accordionPanelCategories: this._btn.map(({ label, buttons, uses }) => new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory({ label, buttons, uses })) });

        return panel;
      }

      _prepareBtn() {
        const capacites = this.actor.system.configurations.liste[this.type].modules;
        let buttons = [];
        let prepared = [];

        if(!this.actor.system.getPilote) return prepared;
        for(let c in capacites) {
          buttons = this._handlerCapacities(c);

          prepared.push({
            label: `KNIGHT.MECHAARMURE.MODULES.${c.toUpperCase()}.Label`,
            buttons,
          });
        }

        return prepared;
      }

      _handlerCapacities(key) {
        const main = this.type;
        const data = this.actor.system.configurations.liste[main].modules[key];
        const img = "systems/knight/assets/icons/mechaarmure.svg";
        const labelActivation = 'KNIGHT.AUTRE.Activer';
        const labelAttaque = 'KNIGHT.AUTRE.Attaque';
        const labelDegats = 'KNIGHT.AUTRE.Degats';
        const labelViolence = 'KNIGHT.AUTRE.Violence';
        const btn = [];

        switch(key) {
          case 'sautMarkIV':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:game.i18n.localize(labelActivation),
                data,
                type:'activation',
                img,
              }));

              if(data.active) {
                btn.push(new KnightMAModuleButton({
                  main,
                  key,
                  name:game.i18n.localize("KNIGHT.MECHAARMURE.MODULES.SAUTMARKIV.Atterrissage"),
                  data,
                  type:'special',
                  img,
                }));
              }
            break;

          case 'lamesCinetiquesGeantes':
          case 'souffleDemoniaque':
          case 'poingsSoniques':
          case 'canonMetatron':
          case 'mitrailleusesSurtur':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:game.i18n.localize(labelAttaque),
                data,
                type:'attaque',
                img,
              }));
            break;

          case 'tourellesLasersAutomatisees':
          case 'moduleInferno':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:game.i18n.localize(labelDegats),
                data,
                type:'degats',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:game.i18n.localize(labelViolence),
                data,
                type:'violence',
                img,
              }));
            break;

          case 'missilesJericho':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:game.i18n.localize(labelDegats),
                data,
                type:'degats',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelDegats)} : ${game.i18n.localize(`KNIGHT.MECHAARMURE.MODULES.MISSILESJERICHO.ZoneExterieure`)}`,
                data,
                type:'special/degats',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:game.i18n.localize(labelViolence),
                data,
                type:'violence',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelViolence)} : ${game.i18n.localize(`KNIGHT.MECHAARMURE.MODULES.MISSILESJERICHO.ZoneExterieure`)}`,
                data,
                type:'special/violence',
                img,
              }));
            break;

          case 'moduleWraith':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:game.i18n.localize(labelActivation),
                data,
                type:'activation',
                img,
              }));

              if(data.active) {
                btn.push(new KnightMAModuleButton({
                  main,
                  key,
                  name:game.i18n.localize("KNIGHT.AUTRE.Prolonger"),
                  data,
                  type:'special',
                  img,
                }));
              }
            break;

          case 'canonNoe':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.LATERAL.Resilience")}`,
                data,
                type:'special',
                img,
              }));

              btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.AUTRE.Label")}`,
                data,
                type:'activation',
                img,
              }));
            break;

          case 'nanoBrume':
          case 'chocSonique':
          case 'bouclierAmrita':
          case 'volMarkIV':
          case 'vagueSoin':
          case 'podMiracle':
          case 'dronesEvacuation':
          case 'dronesAirain':
          case 'moduleEmblem':
          case 'podInvulnerabilite':
          case 'modeSiegeTower':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:game.i18n.localize(labelActivation),
                data,
                type:'activation',
                img,
              }));
            break;

          case 'stationDefenseAutomatise':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:game.i18n.localize(labelActivation),
                data,
                type:'special',
                img,
              }));
            break;

          case 'canonMagma':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:game.i18n.localize(labelAttaque),
                data,
                type:'attaque',
                img,
              }));

              btn.push(new KnightMAModuleButton({
                  main,
                  key,
                  name:game.i18n.localize('KNIGHT.MECHAARMURE.MODULES.CANONMAGMA.AneantirBande'),
                  data,
                  type:'special',
                  img,
                }));
            break;
          case 'offering':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.BONUS.Degats")} / ${game.i18n.localize("KNIGHT.BONUS.Violence")}`,
                data,
                type:'multi/degats',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.BONUS.BonusCaracteristique")}`,
                data,
                type:'multi/caracteristique',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.BONUS.Action")}`,
                data,
                type:'multi/action',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.BONUS.ChampDeForce")}`,
                data,
                type:'multi/cdf',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.BONUS.Noyau")}`,
                data,
                type:'multi/noyaux',
                img,
              }));
            break;

          case 'curse':
            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.MECHAARMURE.MODULES.CURSE.DiminuerDegatsViolence")}`,
                data,
                type:'multi/degats',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.MECHAARMURE.MODULES.CURSE.RetirerReussite")}`,
                data,
                type:'multi/reussite',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.MECHAARMURE.MODULES.CURSE.BaisserResilience")} (1${game.i18n.localize("KNIGHT.JETS.Des-short")}6)`,
                data,
                type:'multi/baisserresilienceroll',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.MECHAARMURE.MODULES.CURSE.BaisserResilience")} (3 ${game.i18n.localize("KNIGHT.AUTRE.Points")})`,
                data,
                type:'multi/baisserresiliencefixe',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.MECHAARMURE.MODULES.CURSE.AnnulerChampDeForce")}`,
                data,
                type:'multi/champdeforce',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.MECHAARMURE.MODULES.CURSE.AnnulerResilience")}`,
                data,
                type:'multi/annulerresilience',
                img,
              }));

            btn.push(new KnightMAModuleButton({
                main,
                key,
                name:`${game.i18n.localize(labelActivation)} : ${game.i18n.localize("KNIGHT.MECHAARMURE.MODULES.CURSE.Choc")}`,
                data,
                type:'multi/choc',
                img,
              }));
            break;
        }

        return btn;
      }
  }

  return class KnightCapacitePanel extends ARGON.MAIN.ActionPanel {
    constructor(...args) {
      super(...args);
    }

    get label() {
      let label = ``;

      if(this.actor.type === 'vehicule') {
        label += `${game.i18n.localize("KNIGHT.ITEMS.MODULE.Label")}`;
      } else {
        label += game.i18n.localize("KNIGHT.CAPACITES.Label");
        label += this.hasModule ? ` / ${game.i18n.localize("KNIGHT.ITEMS.MODULE.Label")}` : ``;
      }

      return label;
    }

    get hasModule() {
      const actor = this.actor;
      const type = actor.type;
      const typeWithoutModule = ['bande', 'creature'];

      if(typeWithoutModule.includes(type)) return false;
      else {
        const items = actor.items;

        if(items.find(itm => itm.type === 'module')) return true;
        else return false;
      }
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

    get armorISwear() {
      const actor = this.actor;
      const armorISwear = actor.system.armorISwear;

      if(armorISwear) return true;
      else return false;
    }

    async _getButtons() {
      const actor = this.actor;
      const hasPhase2 = actor.system?.options?.phase2;
      const type = actor.type;
      const items = actor.items;
      const buttons = [];

      if(!this.isPJ) {
        if(hasPhase2) buttons.push(new KnightPhase2Button({}));

        if(items.find(itm => itm.type === 'capacite')) buttons.push(new KnightNPCCapacitePanelButton({items}));
      }

      if(ignored.includes(type)) return buttons;

      const armorISwear = this.armorISwear;
      if(actor.type === 'mechaarmure') {
        const config = actor.system.configurations.actuel;
        const base = new KnightMAModulePanelButton({name:`KNIGHT.MECHAARMURE.MODULES.BASE.Label`, type:'base'});
        const c1 = new KnightMAModulePanelButton({name:actor.system.configurations.liste.c1.name, type:'c1'});
        const c2 = new KnightMAModulePanelButton({name:actor.system.configurations.liste.c2.name, type:'c2'});
        buttons.push(new KnightMAPanelButton());

        if(base._btn.length) buttons.push(base);
        if(config === 'c1' && c1._btn.length) buttons.push(c1);
        else if(config === 'c2' && c2._btn.length) buttons.push(c2);
      }
      else if(actor.type === 'vehicule') {
        const modules = new KnightModulePanelButton({items});

        if(modules._items.length) buttons.push(new KnightModulePanelButton({items}));
      }
      else if(items.find(itm => itm.type === 'armure') && armorISwear) {
        buttons.push(new KnightArmorCapacitePanelButton({items}));

        if(items?.find(itm => itm.type === 'armurelegende')) {
          buttons.push(new KnightArmorLegendCapacitePanelButton({items}));
        }

        const modules = new KnightModulePanelButton({items});
        if(modules.modules.length) buttons.push(new KnightModulePanelButton({items}));
      }

      return buttons;
    }
  }
}