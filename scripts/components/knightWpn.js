import {
    capitalizeFirstLetter,
} from "/systems/knight/module/helpers/common.mjs";

import {
  getTooltipDetails,
} from "./knightTooltip.js";


import {
    ModuleName,
  } from "../utils.js";

export function makeKnightWpnPanel(ARGON, KnightItemButton, KnightActionAsItemButton) {
  const ignored = ['bande'];
  const notGrenades = ['creature', 'vehicule', 'mechaarmure'];
  const notNods = ['creature', 'vehicule', 'mechaarmure'];
  const notAI = ['vehicule'];

  class KnightWpnPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
      constructor({label, type, items=null}) {
        super();

        this.name = label;
        this.type = type;
        this.items = items;
        this._items = this._prepareItm();
      }

      get id() {
          return `${this.type}-${this.actor.id}-${this._items.length}`;
      }

      get label() {
        return this.name;
      }

      get isEmpty() {
        return this._items.length > 0 ? false : true;
      }

      get icon() {
        let img = ""

        switch(this.type) {
          case 'armes':
            img = "modules/enhancedcombathud-knight/assets/armes.svg";
            break;
          case 'grenades':
            img = "modules/enhancedcombathud-knight/assets/grenades.svg";
            break;
          case 'armesImproviseesC':
            img = "modules/enhancedcombathud-knight/assets/armeImproviseeCMain.svg";
            break;
          case 'armesImproviseesD':
            img = "modules/enhancedcombathud-knight/assets/armeImproviseeDMain.svg";
            break;
          case 'nods':
            img = "modules/enhancedcombathud-knight/assets/nods.svg";
            break;
        }

        return img;
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
        let panel = [];

        if(this.actor.type !== 'mechaarmure' || (this.actor.type === 'mechaarmure' && this.type !== 'armesImproviseesC' && this.type !== 'armesImproviseesD'))
          panel = new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel({ id: this.id, accordionPanelCategories: this._items.map(({ label, buttons, uses }) => new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory({ label, buttons, uses })) });
        else if(this.actor.type === 'mechaarmure' && (this.type === 'armesImproviseesC' || this.type === 'armesImproviseesD'))
          panel = new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({buttons: this._items});

        return panel;
      }

      _prepareItm() {
        let prepared = [];

        switch(this.type) {
          case 'armes':
            prepared.push(...this._prepareAllWpn());
            break;

          case 'grenades':
            prepared.push(...this._prepareGrenades())
            break;

          case 'armesImproviseesC':
            if(this.actor.type === 'mechaarmure') {
              prepared.push(...this._prepareAI('contact'));
            } else {
              prepared.push(...this._prepareAI('contact').od1);
              prepared.push(...this._prepareAI('contact').od2);
              prepared.push(...this._prepareAI('contact').od3);
              prepared.push(...this._prepareAI('contact').od4);
              prepared.push(...this._prepareAI('contact').od5);
            }
            break;

          case 'armesImproviseesD':
            if(this.actor.type === 'mechaarmure') {
              prepared.push(...this._prepareAI('distance'));
            } else {
              prepared.push(...this._prepareAI('distance').od1);
              prepared.push(...this._prepareAI('distance').od2);
              prepared.push(...this._prepareAI('distance').od3);
              prepared.push(...this._prepareAI('distance').od4);
              prepared.push(...this._prepareAI('distance').od5);
            }
            break;

          case 'nods':
            prepared.push(...this._prepareNods());
            break;
        }

        return prepared;
      }

      _prepareAllWpn() {
        const actor = this.actor ?? {};
        const items = this.items ?? [];
        const isPJ = this.isPJ;
        const wearArmor = this.armorIsWear || actor.type === 'vehicule' || !isPJ ? true : false;
        // Sections dans l'ordre voulu
        const sections = {
          contact: [],
          distance: [],
          tourelle: [],
        };

        let modificateur = 0;

        if(wearArmor) {
          sections.contact.push(...this._prepareCapacity(items).contact);
          sections.distance.push(...this._prepareCapacity(items).distance);
        }

        for (const item of items) {
          let btn;

          if (item.type === "arme") {
            const sys = item.system ?? {};
            if ((!sys.equipped && isPJ) && !sys?.tourelle?.has) continue;
            if(actor.type === 'vehicule' && !sys?.whoActivate && !sys.options.noPassager) continue;

            btn = new KnightItemButton({ item });

            if (sys.type === "contact") {
              sections.contact.push(btn);
              continue;
            }

            if (sys.type === "distance") {
              const isTurret = !!sys?.tourelle?.has;
              if (isTurret) {
                sections.tourelle.push(btn);
              } else {
                sections.distance.push(btn);
              }
              continue;
            }
          } else if(item.type === 'module' && wearArmor) {
            if(
              (item.system?.active?.base ?? false) ||
              (item.system?.niveau?.actuel?.permanent ?? false) &&
              (item.system?.niveau?.actuel?.arme?.has ?? false)) {
                console.error(actor);
              if(actor.type === 'vehicule' && !item?.system?.niveau?.actuel?.whoActivate && !actor.system.options.noPassager) continue;

                if(item.system.niveau.actuel.arme.type === 'contact') {
                  btn = new KnightItemButton({ item });
                  sections.contact.push(btn);
                } else if(item.system.niveau.actuel.arme.type === 'distance') {
                  btn = new KnightItemButton({ item });
                  sections.distance.push(btn);
                }
              }

          } else if(item.type === 'capacite' && item.system.attaque.has) {
            const sys = item.system ?? {};

            btn = new KnightItemButton({ item });

            if (sys.attaque.type === "contact") {
              sections.contact.push(btn);
              continue;
            }

            if (sys.attaque.type === "distance") {
              sections.distance.push(btn);
            }
          }
        }

        const result = [];

        for (const [key, buttons] of Object.entries(sections)) {
          if (buttons.length) {
            result.push({
              label: `${ModuleName}.TITLES.${capitalizeFirstLetter(key)}`,
              buttons,
            });
          }
        }

        return result;
      }

      _prepareCapacity(items) {
        const armure = items.find(itm => itm.type === 'armure');
        const capacites = armure ? armure.system?.capacites?.selected ?? {} : {};
        const sections = {
          contact: [],
          distance: [],
        };

        for(let c in capacites) {
          const dataC = capacites[c];
          let btnC;
          let btnD;
          switch(c) {
              case 'borealis':
                btnC = new KnightWpnCapacityButton({
                  type:'capacity',
                  range:'contact',
                  name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.BOREALIS.Label')} - ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.BOREALIS.OFFENSIF.Label')}`,
                  num:'borealis',
                  armure:armure.id,
                  data:{
                      degats:{
                          dice:dataC.offensif.degats.dice,
                          fixe:0
                      },
                      violence:{
                          dice:dataC.offensif.violence.dice,
                          fixe:0,
                      },
                      type:'contact',
                      effets:{
                          raw:dataC.offensif.effets.raw,
                          custom:dataC.offensif.effets.custom,
                      },
                      energie:dataC.offensif.energie,
                      portee:dataC.offensif.portee,
                }});

                btnD = new KnightWpnCapacityButton({
                  type:'capacity',
                  range:'distance',
                  name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.BOREALIS.Label')} - ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.BOREALIS.OFFENSIF.Label')}`,
                  num:'borealis',
                  armure:armure.id,
                  data:{
                    degats:{
                        dice:dataC.offensif.degats.dice,
                        fixe:0
                    },
                    violence:{
                        dice:dataC.offensif.violence.dice,
                        fixe:0,
                    },
                    type:'distance',
                    effets:{
                        raw:dataC.offensif.effets.raw,
                        custom:dataC.offensif.effets.custom,
                    },
                    energie:dataC.offensif.energie,
                    portee:dataC.offensif.portee,
                }});

                sections.contact.push(btnC);
                sections.distance.push(btnD);
                break;

              case 'cea':
                sections.contact.push(
                  new KnightWpnCapacityButton({
                    type:'capacity',
                    range:'contact',
                    name:game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.CEA.VAGUE.Label'),
                    num:'vague',
                    armure:armure.id,
                    data:{
                      degats:{
                          dice:dataC.vague.degats.dice,
                          fixe:0
                      },
                      violence:{
                          dice:dataC.vague.violence.dice,
                          fixe:0,
                      },
                      type:'contact',
                      effets:{
                          raw:dataC.vague.effets.raw,
                          custom:dataC.vague.effets.custom,
                      },
                      energie:dataC.energie,
                      espoir:dataC.espoir,
                      portee:dataC.vague.portee,
                  }}),
                  new KnightWpnCapacityButton({
                    type:'capacity',
                    range:'contact',
                    name:game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.CEA.SALVE.Label'),
                    num:'salve',
                    armure:armure.id,
                    data:{
                      degats:{
                          dice:dataC.salve.degats.dice,
                          fixe:0
                      },
                      violence:{
                          dice:dataC.salve.violence.dice,
                          fixe:0,
                      },
                      type:'contact',
                      effets:{
                          raw:dataC.salve.effets.raw,
                          custom:dataC.salve.effets.custom,
                      },
                      energie:dataC.energie,
                      espoir:dataC.espoir,
                      portee:dataC.salve.portee,
                  }}),
                  new KnightWpnCapacityButton({
                    type:'capacity',
                    range:'contact',
                    name:game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.CEA.RAYON.Label'),
                    num:'rayon',
                    armure:armure.id,
                    data:{
                      degats:{
                          dice:dataC.rayon.degats.dice,
                          fixe:0
                      },
                      violence:{
                          dice:dataC.rayon.violence.dice,
                          fixe:0,
                      },
                      type:'contact',
                      effets:{
                          raw:dataC.rayon.effets.raw,
                          custom:dataC.rayon.effets.custom,
                      },
                      energie:dataC.energie,
                      espoir:dataC.espoir,
                      portee:dataC.rayon.portee,
                  }}),
                );

                sections.distance.push(
                  new KnightWpnCapacityButton({
                    type:'capacity',
                    range:'distance',
                    name:game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.CEA.VAGUE.Label'),
                    num:'vague',
                    armure:armure.id,
                    data:{
                      degats:{
                          dice:dataC.vague.degats.dice,
                          fixe:0
                      },
                      violence:{
                          dice:dataC.vague.violence.dice,
                          fixe:0,
                      },
                      type:'distance',
                      effets:{
                          raw:dataC.vague.effets.raw,
                          custom:dataC.vague.effets.custom,
                      },
                      energie:dataC.energie,
                      espoir:dataC.espoir,
                      portee:dataC.vague.portee,
                  }}),
                  new KnightWpnCapacityButton({
                    type:'capacity',
                    range:'distance',
                    name:game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.CEA.SALVE.Label'),
                    num:'salve',
                    armure:armure.id,
                    data:{
                      degats:{
                          dice:dataC.salve.degats.dice,
                          fixe:0
                      },
                      violence:{
                          dice:dataC.salve.violence.dice,
                          fixe:0,
                      },
                      type:'distance',
                      effets:{
                          raw:dataC.salve.effets.raw,
                          custom:dataC.salve.effets.custom,
                      },
                      energie:dataC.energie,
                      espoir:dataC.espoir,
                      portee:dataC.salve.portee,
                  }}),
                  new KnightWpnCapacityButton({
                    type:'capacity',
                    range:'distance',
                    name:game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.CEA.RAYON.Label'),
                    num:'rayon',
                    armure:armure.id,
                    data:{
                      degats:{
                          dice:dataC.rayon.degats.dice,
                          fixe:0
                      },
                      violence:{
                          dice:dataC.rayon.violence.dice,
                          fixe:0,
                      },
                      type:'distance',
                      effets:{
                          raw:dataC.rayon.effets.raw,
                          custom:dataC.rayon.effets.custom,
                      },
                      energie:dataC.energie,
                      espoir:dataC.espoir,
                      portee:dataC.rayon.portee,
                  }}),
                );
                break;

              case 'morph':
                if(dataC?.active?.polymorphieLame) {
                  sections.contact.push(
                    new KnightWpnCapacityButton({
                      type:'capacity',
                      range:'contact',
                      name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label')} - ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Lame')}`,
                      num:'lame',
                      armure:armure.id,
                      data:{
                        degats:{
                            dice:dataC.polymorphie.lame.degats.dice,
                            fixe:dataC.polymorphie.lame.degats.fixe,
                        },
                        violence:{
                            dice:dataC.polymorphie.lame.violence.dice,
                            fixe:dataC.polymorphie.lame.violence.fixe,
                        },
                        type:'contact',
                        effets:{
                            raw:dataC.polymorphie.lame.effets.raw,
                            custom:dataC.polymorphie.lame.effets.custom,
                        },
                        portee:dataC.polymorphie.lame.portee,
                    }}),
                  );
                }

                if(dataC?.active?.polymorphieLame2) {
                  sections.contact.push(
                    new KnightWpnCapacityButton({
                      type:'capacity',
                      range:'contact',
                      name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label')} - ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Lame')} 2`,
                      num:'lame2',
                      armure:armure.id,
                      data:{
                        degats:{
                            dice:dataC.polymorphie.lame.degats.dice,
                            fixe:dataC.polymorphie.lame.degats.fixe,
                        },
                        violence:{
                            dice:dataC.polymorphie.lame.violence.dice,
                            fixe:dataC.polymorphie.lame.violence.fixe,
                        },
                        type:'contact',
                        effets:{
                            raw:dataC.polymorphie.lame.effets.raw,
                            custom:dataC.polymorphie.lame.effets.custom,
                        },
                        portee:dataC.polymorphie.lame.portee,
                    }}),
                  );
                }

                if(dataC?.active?.polymorphieGriffe) {
                  sections.contact.push(
                    new KnightWpnCapacityButton({
                      type:'capacity',
                      range:'contact',
                      name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label')} - ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Griffe')}`,
                      key:`capacite_${armure.id}_${c}Griffe`,
                      num:'griffe',
                      armure:armure.id,
                      data:{
                        degats:{
                            dice:dataC.polymorphie.griffe.degats.dice,
                            fixe:dataC.polymorphie.griffe.degats.fixe,
                        },
                        violence:{
                            dice:dataC.polymorphie.griffe.violence.dice,
                            fixe:dataC.polymorphie.griffe.violence.fixe,
                        },
                        type:'contact',
                        effets:{
                            raw:dataC.polymorphie.griffe.effets.raw,
                            custom:dataC.polymorphie.griffe.effets.custom,
                        },
                        portee:dataC.polymorphie.griffe.portee,
                    }}),
                  )
                }

                if(dataC?.active?.polymorphieGriffe2) {
                  sections.contact.push(
                    new KnightWpnCapacityButton({
                      type:'capacity',
                      range:'contact',
                      name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label')} - ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Griffe')} 2`,
                      key:`capacite_${armure.id}_${c}Griffe`,
                      num:'griffe2',
                      armure:armure.id,
                      data:{
                        degats:{
                            dice:dataC.polymorphie.griffe.degats.dice,
                            fixe:dataC.polymorphie.griffe.degats.fixe,
                        },
                        violence:{
                            dice:dataC.polymorphie.griffe.violence.dice,
                            fixe:dataC.polymorphie.griffe.violence.fixe,
                        },
                        type:'contact',
                        effets:{
                            raw:dataC.polymorphie.griffe.effets.raw,
                            custom:dataC.polymorphie.griffe.effets.custom,
                        },
                        portee:dataC.polymorphie.griffe.portee,
                    }}),
                  )
                }

                if(dataC?.active?.polymorphieCanon) {
                  sections.distance.push(
                    new KnightWpnCapacityButton({
                      type:'capacity',
                      range:'distance',
                      name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label')} - ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Canon')}`,
                      num:'canon',
                      armure:armure.id,
                      data:{
                        degats:{
                            dice:dataC.polymorphie.canon.degats.dice,
                            fixe:dataC.polymorphie.canon.degats.fixe,
                        },
                        violence:{
                            dice:dataC.polymorphie.canon.violence.dice,
                            fixe:dataC.polymorphie.canon.violence.fixe,
                        },
                        type:'distance',
                        effets:{
                            raw:dataC.polymorphie.canon.effets.raw,
                            custom:dataC.polymorphie.canon.effets.custom,
                        },
                        portee:dataC.polymorphie.canon.portee,
                    }}),
                  );
                }

                if(dataC?.active?.polymorphieCanon2) {
                  sections.distance.push(
                    new KnightWpnCapacityButton({
                      type:'capacity',
                      range:'distance',
                      name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Label')} - ${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.POLYMORPHIE.Canon')} 2`,
                      num:'canon2',
                      armure:armure.id,
                      data:{
                        degats:{
                            dice:dataC.polymorphie.canon.degats.dice,
                            fixe:dataC.polymorphie.canon.degats.fixe,
                        },
                        violence:{
                            dice:dataC.polymorphie.canon.violence.dice,
                            fixe:dataC.polymorphie.canon.violence.fixe,
                        },
                        type:'distance',
                        effets:{
                            raw:dataC.polymorphie.canon.effets.raw,
                            custom:dataC.polymorphie.canon.effets.custom,
                        },
                        portee:dataC.polymorphie.canon.portee,
                    }}),
                  );
                }
                break;

              case 'longbow':
                sections.distance.push(
                  new KnightWpnCapacityButton({
                    type:'capacity',
                    range:'distance',
                    name:`${game.i18n.localize('KNIGHT.ITEMS.ARMURE.CAPACITES.LONGBOW.Label')}`,
                    num:'longbow',
                    armure:armure.id,
                    data:{
                      energie:0,
                      portee:dataC.portee.min,
                      type:'distance',
                      degats:{
                          dice:dataC.degats.min,
                          fixe:0,
                      },
                      violence:{
                          dice:dataC.violence.min,
                          fixe:0,
                      },
                      effets:{
                          raw:dataC.effets.base.raw,
                          custom:dataC.effets.base.custom,
                      },
                      distance:{
                          raw:dataC.distance.raw,
                          custom:dataC.distance.custom,
                      }
                  }}),
                );
                break;
          }
        }

        return {
          contact:sections.contact,
          distance:sections.distance,
        }
      }

      _prepareGrenades() {
        const grenades = this.actor.system?.combat?.grenades?.liste ?? {};
        let buttons = [];

        for(let g in grenades) {
          const system = grenades[g];
          let btn = new KnightGrenadeButton({ type:'grenade', key:g, data:system });
          buttons.push(btn);
        }

        const result = [{
          label:`KNIGHT.COMBAT.GRENADES.Label`,
          buttons,
          uses: () => {
            return { max: this.actor.system.combat.grenades.quantity.max, value: this.actor.system.combat.grenades.quantity.value };
          },
        }];

        return result;
      }

      _prepareAI(type) {
        const actor = this.actor;
        const armesImprovisees = actor.system?.combat?.armesimprovisees?.liste ?? {};
        const subKey = type === 'contact' ? 'c' : 'd';
        const sections = {
          od1: [],
          od2: [],
          od3: [],
          od4: [],
          od5: [],
        };
        let btnMA = [];

        for(let ai in armesImprovisees) {
            const system = armesImprovisees[ai];
            const buttons = [];

            for(let num in system.liste) {
              const data = system.liste[num];
              let btn = new KnightAIButton({key:`${ai}${num}${subKey}`, data, ai, num});

              if(actor.type === 'mechaarmure') btnMA.push(btn)
              else buttons.push(btn);
            }

            if(actor.type !== 'mechaarmure') {
              sections[`od${system.force}`].push({
                label:`enhancedcombathud-knight.TITLES.OD${system.force}`,
                buttons
              });
            }
        }

        return actor.type === 'mechaarmure' ? btnMA : sections;
      }

      _prepareWpn(type) {
        const result = [];
        const itms = this.items.filter((item) => item.type === 'arme' && item.system.equipped && item.system.type === type).map((item) => new KnightItemButton({ item }));

        if(itms.length) result.push({
          label: `${ModuleName}.TITLES.${capitalizeFirstLetter(type)}`,
          buttons: itms,
        });
        return result;
      }

      _prepareNods() {
        const nods = this.actor.system?.combat?.nods ?? {};
        const results = [];

        for(let n in nods) {
          const system = nods[n];
          const buttons = [];
          buttons.push(new KnightNodsButton({ type:'nods', key:`${n}_/soiMeme`, data:system }));
          buttons.push(new KnightNodsButton({ type:'nods', key:`${n}_/autrui`, data:system }));

          results.push({
            label:`KNIGHT.COMBAT.NODS.${capitalizeFirstLetter(n)}`,
            buttons:buttons,
            uses: () => {
              return { max: system.max, value: system.value };
            },
          });
        }

        return results;
      }
  }

  class KnightWpnCapacityButton extends KnightActionAsItemButton {
      constructor(options = {}) {
        const {
          // Tes options à toi
          name,
          range,
          armure,
          num,
          // Le reste ira au parent
          ...parentArgs
        } = options;

        super(parentArgs); // n’envoie que ce que le parent comprend

        this.armure = armure,
        this.num = num;
        this.name = name;
        this.range = range;
      }

      get classes() {
        return ["feature-element"];
      }

      get keyArmure() {
        return this.armure;
      }

      get keyNum() {
        return this.num
      }

      get label() {
        return this.name;
      }

      get icon() {
        return this.range === 'contact' ? "modules/enhancedcombathud-knight/assets/armeArmureContact.svg" : "modules/enhancedcombathud-knight/assets/armeArmureDistance.svg";
      }

      async getTooltipData() {
        const tooltipData = await getTooltipDetails(this.actor, {name:`${this.label}`, type:'capacity', system:this.data});
        return tooltipData;
      }

      async _onLeftClick(event) {
        const target = await super._onLeftClick(event);

        if(!target) return;
        ui.ARGON.interceptNextDialog(event.currentTarget);

        const dialog = this.actor.system.useWpn('armure', {
          id:this.keyArmure,
          num:this.keyNum,
          type:this.range,
        });

        if(game.settings.get('enhancedcombathud', "dialogTheme")) dialog.options.classes.push('ech-highjack-window');
        /*const hasFumigene = this.actor.statuses.has('fumigene');
        const actor = this.actor.token ? this.actor.token.id : this.actor.id;
        const data = this.data;
        let label = "";
        let dialog = undefined;
        let modificateur = 0;
        ui.ARGON.interceptNextDialog(event.currentTarget);

        label = `${this.label}`;

        if(hasFumigene && this.range === 'distance') modificateur -= 3;

        dialog = new game.knight.applications.KnightRollDialog(actor, {
          label:label,
          wpn:`${this.key}`,
          modificateur,
        });

        if(dialog) {
          if(game.settings.get('enhancedcombathud', "dialogTheme")) dialog.options.classes.push('ech-highjack-window');

          dialog.open();
        }*/
      }

      async _renderInner() {
        await super._renderInner();

        const title = this.element.querySelector(".action-element-title");
        title.classList.remove("action-element-title");
        title.classList.add("feature-element-title");
      }
  }

  class KnightGrenadeButton extends KnightActionAsItemButton {
    constructor(...args) {
        super(...args);
    }

    get classes() {
        return ["feature-element"];
    }

    get label() {
      const data = this.data;
      return data?.custom ? data.label : game.i18n.localize(`KNIGHT.COMBAT.GRENADES.${capitalizeFirstLetter(this.key)}`);
    }

    get icon() {
        return "modules/enhancedcombathud-knight/assets/grenades.png";
    }

    async getTooltipData() {
        const tooltipData = await getTooltipDetails(this.actor, {name:`${this.data.custom ? `${game.i18n.localize(`KNIGHT.COMBAT.GRENADES.Singulier`)} ${this.data.label}` : `${game.i18n.localize(`KNIGHT.COMBAT.GRENADES.Singulier`)} ${this.label}`}`, type:'grenade', system:this.data});
        return tooltipData;
    }

    async _onLeftClick(event) {
      const target = await super._onLeftClick(event);

      if(!target) return;

      ui.ARGON.interceptNextDialog(event.currentTarget);

      const dialog = this.actor.system.useWpn('grenades', {
        type:this.key,
      });

      if(game.settings.get('enhancedcombathud', "dialogTheme")) dialog.options.classes.push('ech-highjack-window');
    }

    async _renderInner() {
        await super._renderInner();

        const title = this.element.querySelector(".action-element-title");
        title.classList.remove("action-element-title");
        title.classList.add("feature-element-title");
    }
  }

  class KnightAIButton extends KnightActionAsItemButton {
      constructor(options = {}) {
        const {
          // Tes options à toi
          ai,
          num,
          // Le reste ira au parent
          ...parentArgs
        } = options;

        super(parentArgs); // n’envoie que ce que le parent comprend

        this.ai = ai;
        this.num = num;
      }

      get classes() {
        return ["feature-element"];
      }

      get label() {
        return `${game.i18n.localize(`KNIGHT.COMBAT.ARMESIMPROVISEES.${this.ai.toUpperCase()}.${this.num}`).split(',')[0]}...`;
      }

      get icon() {
        return this.key.includes('c') ?
        "modules/enhancedcombathud-knight/assets/armeImproviseeCSub.svg" :
        "modules/enhancedcombathud-knight/assets/armeImproviseeDSub.svg";
      }

      async getTooltipData() {
        const tooltipData = await getTooltipDetails(this.actor, {name:game.i18n.localize(`KNIGHT.COMBAT.ARMESIMPROVISEES.${this.ai.toUpperCase()}.${this.num}`), type:'armeImprovisee',system:this.data});
        return tooltipData;
      }

      async _onLeftClick(event) {
        const target = await super._onLeftClick(event);

        if(!target) return;

        ui.ARGON.interceptNextDialog(event.currentTarget);

        const dialog = this.actor.system.useWpn('armesimprovisees', {
          type:this.key.includes('d') ? 'distance' : 'contact',
          name:this.ai,
          num:this.num
        });
        if(game.settings.get('enhancedcombathud', "dialogTheme")) dialog.options.classes.push('ech-highjack-window');
      }

      async _renderInner() {
        await super._renderInner();

        const title = this.element.querySelector(".action-element-title");
        title.classList.remove("action-element-title");
        title.classList.add("feature-element-title");
      }
  }

  class KnightNodsButton extends KnightActionAsItemButton {
    constructor(...args) {
        super(...args);
    }

    get classes() {
        return ["feature-element"];
    }

    get first() {
      return this.key.split('_/')[0];
    }

    get second() {
      return this.key.split('_/')[1];
    }

    get label() {
      return `${game.i18n.localize(`KNIGHT.COMBAT.NODS.${capitalizeFirstLetter(this.second)}`)}`;
    }

    get icon() {
        return "modules/enhancedcombathud-knight/assets/nod.svg";
    }

    get targets() {
      return 0;
    }

    async getTooltipData() {
        //const tooltipData = await getTooltipDetails(this.actor, {name:`${this.data.custom ? `${game.i18n.localize(`KNIGHT.COMBAT.GRENADES.Singulier`)} ${this.data.label}` : `${game.i18n.localize(`KNIGHT.COMBAT.GRENADES.Singulier`)} ${this.label}`}`, type:'grenade', system:this.data});
        //return tooltipData;
    }

    async _onLeftClick(event) {
        if(this.second === 'autrui') this.actor.system.useNods(this.first);
        else this.actor.system.useNods(this.first, true)
    }

    async _renderInner() {
        await super._renderInner();

        const title = this.element.querySelector(".action-element-title");
        title.classList.remove("action-element-title");
        title.classList.add("feature-element-title");
    }
  }

  return class KnightWPNPanel extends ARGON.MAIN.ActionPanel {
      constructor(...args) {
      super(...args);
      }

      get label() {
      return "KNIGHT.COMBAT.Label";
      }

      async _getButtons() {
        const actor = this.actor;
        const type = actor.type;
        const buttons = [];

        if(ignored.includes(type)) return buttons;

        const items = actor.items;
        const armesPanel = new KnightWpnPanelButton({label:"KNIGHT.COMBAT.ARMES.Label", type:'armes', items});
        const capacitiesPanel = new KnightWpnPanelButton({label:"KNIGHT.COMBAT.ARMES.Label", type:'capacities', items});

        if(!armesPanel.isEmpty) buttons.push(armesPanel);
        if(!notGrenades.includes(type)) buttons.push(new KnightWpnPanelButton({label:"KNIGHT.COMBAT.GRENADES.Label", type:'grenades'}));
        if(!capacitiesPanel.isEmpty) buttons.push(capacitiesPanel);
        if(!notAI.includes(type)) buttons.push(new KnightWpnPanelButton({label:"KNIGHT.COMBAT.ARMESIMPROVISEES.LabelContact", type:'armesImproviseesC'}));
        if(!notAI.includes(type)) buttons.push(new KnightWpnPanelButton({label:"KNIGHT.COMBAT.ARMESIMPROVISEES.LabelDistance", type:'armesImproviseesD'}));
        if(!notNods.includes(type)) buttons.push(new KnightWpnPanelButton({label:"KNIGHT.COMBAT.NODS.Label", type:'nods'}));

        return buttons;
      }
  }
}

export function makeKnightWeaponSets(ARGON) {
  const ignored = ['bande', 'creature', 'pnj', 'mechaarmure']

  return class KnightWeaponSets extends ARGON.WeaponSets {

      constructor(...args) {
        super(...args);
      }

      async getDefaultSets() {
        const items = this.actor.items.filter((itm) => itm.type === 'arme' && (itm.system.rack || itm.system.equipped));

        return {
          1: {
              primary: items?.[0]?.id ?? null,
              secondary: null,
          },
          2: {
              primary: items?.[1]?.id ?? null,
              secondary: null,
          },
          3: {
              primary: items?.[2]?.id ?? null,
              secondary: null,
          },
          4: {
              primary: items?.[3]?.id ?? null,
              secondary: null,
          },
          5: {
              primary: items?.[4]?.id ?? null,
              secondary: null,
          },
        };
      }

      async activateListeners(html) {
          super.activateListeners(html);

          const listSet = await this._getSets();
          this.element.querySelectorAll(".weapon-set").forEach(async (element) => {
              const numSet = element.dataset.set;
              if(listSet[numSet].primary) {
                  const dataSet = listSet[numSet].primary;

                  element.classList.toggle("active", dataSet?.system?.equipped);
              } else element.classList.remove("active");
          });
      }

      async getSetData() {
          const sets = await this._getSets();
          // On récupère toutes les clés de sets actifs (par exemple activeWeapon1Set, activeWeapon2Set, etc.)
          const active = this.actor.getFlag("enhancedcombathud", "activeWeaponSet");

          return { sets, active };
      }

      async _getSets() {
        if(ignored.includes(this.actor.type)) return {};

        const defaut = await this.getDefaultSets();
        const sets = foundry.utils.mergeObject(foundry.utils.deepClone(defaut), foundry.utils.deepClone(this.actor.getFlag("enhancedcombathud", "weaponSets") || {}));

        for (const [set, slots] of Object.entries(sets)) {
          let primary = null;

          if(slots.primary) {
            const getWpn = this?.actor?.items?.get(slots?.primary);

            if(getWpn?.system?.equipped || getWpn?.system?.rack) primary = getWpn;
            else primary = this?.actor?.items?.get(defaut?.[set]?.primary);
          } else primary = this?.actor?.items?.get(defaut?.[set]?.primary);

          slots.primary = primary;
          slots.secondary = null;
        }
        return sets;
      }

      async _onClick(event) {
          event.preventDefault();
          event.stopPropagation();
          const set = event.currentTarget.dataset.set;
          let active = this.actor.getFlag("enhancedcombathud", `activeWeaponSet`);

          active[set] = !active[set];
          await this.actor.setFlag("enhancedcombathud", `activeWeaponSet`, active);
          await this.render();
      }

      async _onSetChange({sets, active}) {
        const updates = [];

        for(let a in active) {
            if(active[a] === true && sets[a].primary) updates.push({_id:sets[a].primary.id, "system.equipped":true, "system.rack":false});
            else if(sets[a].primary && sets[a]?.primary?.system?.equipped) updates.push({_id:sets[a].primary.id, "system.equipped":false, "system.rack":true});
        }

        return await this.actor.updateEmbeddedDocuments("Item", updates);
      }

      async _onDrop(event) {
        try {
            event.preventDefault();
            event.stopPropagation();
            const data = JSON.parse(event.dataTransfer.getData("text/plain"));
            if (data?.type !== "wpn") return;
            const set = event.currentTarget.dataset.set;
            const slot = event.currentTarget.dataset.slot;
            const sets = this.actor.getFlag("enhancedcombathud", "weaponSets") || {};
            const getWpn = await fromUuid(data.uuid);
            sets[set] = sets[set] || {};
            sets[set][slot] = getWpn?.id ?? null;

            await this.actor.setFlag("enhancedcombathud", "weaponSets", sets);
            await this.render();
        } catch (error) {}
      }

      async refresh() {
        const actor = this.actor;
        const root  = this.element;
        if (!root?.isConnected) return; // HUD pas encore monté/détruit

        // 1) Récupération des données de set et du flag actuel, une seule fois
        const { sets } = await this.getSetData();
        const currentMap = actor.getFlag("enhancedcombathud", "activeWeaponSet") || {};

        // 2) Préparer la nouvelle map (sans écrire encore)
        const nextMap = { ...currentMap };
        const weaponSetEls = Array.from(root.querySelectorAll(".weapon-set"));

        for (const el of weaponSetEls) {
            const setKey = String(el.dataset.set);
            const setEntry = sets?.[setKey];

            if (setEntry?.primary) {
            const equipped = !!setEntry.primary?.system?.equipped;
            el.classList.toggle("active", equipped);
            nextMap[setKey] = equipped;
            } else {
            el.classList.remove("active");
            // Optionnel: si vous voulez “nettoyer” les clés inexistantes
            if (setKey in nextMap) delete nextMap[setKey];
            }
        }

        // 3) Éviter les écritures inutiles (deep compare léger)
        const changed =
            JSON.stringify(nextMap) !== JSON.stringify(currentMap);

        if (changed) {
            // Une seule écriture persistante
            await actor.setFlag("enhancedcombathud", "activeWeaponSet", nextMap);
        }
      }

      get template() {
        return `modules/${ModuleName}/templates/KnightWeaponSets.hbs`;
      }
  }
}