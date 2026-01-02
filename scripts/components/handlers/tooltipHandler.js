import {
    capitalizeFirstLetter,
    getArmor,
  } from "/systems/knight/module/helpers/common.mjs";
  import ArmureAPI from "/systems/knight/module/utils/armureAPI.mjs";

export const ascensionHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, title, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
        label: game.i18n.localize("KNIGHT.LATERAL.Energie"),
        value: `${data.energie.min} - ${data.energie.max}`,
        });

        details.push({
        label: game.i18n.localize("KNIGHT.AUTRE.GainImpregnation"),
        value: `${data.impregnation}`,
        });

        details.push({
        label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
        value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
        label: game.i18n.localize("KNIGHT.DUREE.Label"),
        value: data.duree,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const totemHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.TOTEM.ENERGIE.Matérialiser")}`,
        value: `${data.energie.base} / ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.TOTEM.Totem")}`,
        });

        details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.TOTEM.ENERGIE.Prolonger")}`,
        value: `${data.energie.prolonger} / ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.TOTEM.Totem")}`,
        });

        details.push({
        label: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.TOTEM.Nombre"),
        value: `${data.nombre}`,
        });

        details.push({
        label: game.i18n.localize("KNIGHT.AUTRE.GainImpregnation"),
        value: `${data.impregnation}`,
        });

        details.push({
        label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
        value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
        label: game.i18n.localize("KNIGHT.DUREE.Label"),
        value: data.duree,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
        value: `${data.energie.prolonger*actor.system.equipements.armure.capacites.totem.nombre}`,
      });
    }
}

export const borealisHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
    let{ data, description, details, propertiesLabel, properties } = ctx;

    description.push(data.description);

      if(special === 'support') {
        description = data.support.description;

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.BOREALIS.SUPPORT.Base")}`,
          value: `${data.support.energie.base}`,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.BOREALIS.SUPPORT.Allie")}`,
          value: `${data.support.energie.allie}`,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.support.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.support.duree,
        });
      } else if(special === 'utilitaire') {
        description = data.utilitaire.description;

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
          value: `${data.utilitaire.energie}`,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.utilitaire.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.utilitaire.duree,
        });
      }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const oriflammeHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        if(special.includes('degats')) {
            details.push({
              label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
              value: `${data.energie}`,
            });

            details.push({
              label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
              value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
            });

            details.push({
              label:'KNIGHT.AUTRE.Degats',
              value:`${data?.degats?.dice ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data?.degats?.fixe ?? 0}`,
            });

            if(special.includes('violence')) {
              details.push({
                label:'KNIGHT.AUTRE.Violence',
                value:`${data?.violence?.dice ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data?.violence?.fixe ?? 0}`,
              });
            }

            details.push({
              label:'KNIGHT.PORTEE.Label',
              value:game.i18n.localize(`KNIGHT.PORTEE.${capitalizeFirstLetter(data?.portee)}`)
            });

            details.push({
              label:'KNIGHT.DUREE.Label',
              value:data.duree
            });
        }

        if(special.includes('violence') && !special.includes('degats')) {
            details.push({
              label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
              value: `${data.energie}`,
            });

            details.push({
              label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
              value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
            });

            details.push({
              label:'KNIGHT.AUTRE.Violence',
              value:`${data?.violence?.dice ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data?.violence?.fixe ?? 0}`,
            });

            details.push({
              label: game.i18n.localize("KNIGHT.DUREE.Label"),
              value: data.duree,
            });

            details.push({
              label:'KNIGHT.PORTEE.Label',
              value:game.i18n.localize(`KNIGHT.PORTEE.${capitalizeFirstLetter(data?.portee)}`)
            });

            details.push({
              label:'KNIGHT.DUREE.Label',
              value:data.duree
            });
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const changelingHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        if(special === 'personnel') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: `${data.energie.personnel}`,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.duree,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.PORTEE.Label"),
            value: data.portee,
          });
        } else if(special === 'etendue') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: `${data.energie.etendue}`,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.duree,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.PORTEE.Label"),
            value: data.portee,
          });
        } else if(special === 'fauxEtre') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} (${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.ENERGIE.ParFauxEtres")})`,
            value: `${data.energie.fauxEtre.value}`,
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.CHANGELING.FauxEtresMax")})`,
            value: `${data.energie.fauxEtre.max}`,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.duree,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.PORTEE.Label"),
            value: data.portee,
          });
        } else if(special === 'explosive') {
          details.push({
            label: game.i18n.localize("KNIGHT.PORTEE.Label"),
            value: game.i18n.localize(`KNIGHT.PORTEE.${capitalizeFirstLetter(data.desactivationexplosive.portee)}`),
          });

          details.push({
            label:'KNIGHT.AUTRE.Degats',
            value:`${data?.desactivationexplosive?.degats?.dice ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data?.desactivationexplosive?.degats?.fixe ?? 0}`,
          });

          details.push({
            label:'KNIGHT.AUTRE.Violence',
            value:`${data?.desactivationexplosive?.violence?.dice ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data?.desactivationexplosive?.violence?.fixe ?? 0}`,
          });

          propertiesLabel.push(`KNIGHT.EFFETS.Label`);

          for(let e of data?.desactivationexplosive?.effets?.raw ?? []) {
            const generator = generateProperties(e);

            // On vérifie si properties n'inclut pas déjà un objet avec le même label
            if (!properties.some(prop => prop.label === generator.label)) {
              properties.push(generator);
            }
          }
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;
      let energy = 0;

      energy += data?.active?.personnel ? data.energie.personnel : 0;
      energy += data?.active?.etendue ? data.energie.etendue : 0;
      energy += data?.active?.fauxEtre ? data.energie.fauxEtre.value*dataActorCapacite?.fauxetres ?? 0 : 0;

      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
        value: `${energy}`,
      });
    }
}

export const companionsHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
            label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.ENERGIE.Base")}`,
            value: `${data.energie.base}`,
        });

        details.push({
            label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.ENERGIE.Prolonger")}`,
            value: `${data.energie.prolonger}`,
        });

        details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.duree,
        });

        if(special === 'lion') {
            for(let dl in data.lion.aspects) {
                details.push({
                    label: game.i18n.localize(`KNIGHT.ASPECTS.${dl.toUpperCase()}.Label`),
                    value: `${data.lion.aspects[dl].value} / ${game.i18n.localize("KNIGHT.ASPECTS.Exceptionnel-short")} : ${data.lion.aspects[dl].ae > 5 ? `${game.i18n.localize("KNIGHT.AUTRE.Majeur")} ${data.lion.aspects[dl].ae}` : `${game.i18n.localize("KNIGHT.AUTRE.Mineur")} ${data.lion.aspects[dl].ae}`}`,
                });
            }

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Defense"),
                value: data.lion.defense.base,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Reaction"),
                value: data.lion.reaction.base,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Initiative"),
                value: `${data.lion.initiative.value}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data.lion.initiative.fixe}`,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Armure"),
                value: data.lion.armure.base,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.ChampDeForce"),
                value: data.lion.champDeForce.base,
            });
        } else if(special === 'wolf') {
            for(let dl in data.wolf.aspects) {
                details.push({
                    label: game.i18n.localize(`KNIGHT.ASPECTS.${dl.toUpperCase()}.Label`),
                    value: `${data.wolf.aspects[dl].value} / ${game.i18n.localize("KNIGHT.ASPECTS.Exceptionnel-short")} : ${data.wolf.aspects[dl].ae > 5 ? `${game.i18n.localize("KNIGHT.AUTRE.Majeur")} ${data.wolf.aspects[dl].ae}` : `${game.i18n.localize("KNIGHT.AUTRE.Mineur")} ${data.wolf.aspects[dl].ae}`}`,
                });
            }

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Defense"),
                value: data.wolf.defense.base,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Reaction"),
                value: data.wolf.reaction.base,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Initiative"),
                value: `${data.wolf.initiative.value}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data.wolf.initiative.fixe}`,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Armure"),
                value: data.wolf.armure.base,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.ChampDeForce"),
                value: data.wolf.champDeForce.base,
            });
        } else if(special === 'crow') {
            for(let dl in data.crow.aspects) {
                details.push({
                label: game.i18n.localize(`KNIGHT.ASPECTS.${dl.toUpperCase()}.Label`),
                value: `${data.crow.aspects[dl].value}`,
                });
            }

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Defense"),
                value: data.crow.defense.base,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Reaction"),
                value: data.crow.reaction.base,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Initiative"),
                value: `${data.crow.initiative.value}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data.crow.initiative.fixe}`,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.Cohesion"),
                value: data.crow.cohesion.base,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.LATERAL.ChampDeForce"),
                value: data.crow.champDeForce.base,
            });

            details.push({
                label: game.i18n.localize("KNIGHT.AUTRE.Debordement"),
                value: data.crow.debordement.base,
            });
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
        value: `${data.energie.prolonger}`,
      });
    }
}

export const ghostHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
            label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.ENERGIE.Tour")}`,
            value: `${data.energie.tour}`,
        });

        details.push({
            label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.ENERGIE.Minute")}`,
            value: `${data.energie.minute}`,
        });

        details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.duree,
        });

        details.push({
            label: data.interruption.label,
        });

        details.push({
            label: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GHOST.BonusPasserInaperçu"),
            value: data.bonus.reussites,
        });

        details.push({
            label: game.i18n.localize("KNIGHT.BONUS.Attaque"),
            value: game.i18n.localize(CONFIG.KNIGHT.caracteristiques[data.bonus.attaque]),
        });

        details.push({
            label: game.i18n.localize("KNIGHT.BONUS.Degats"),
            value: `${game.i18n.localize(CONFIG.KNIGHT.caracteristiques[data.bonus.degats.caracteristique])} / ${data.bonus.degats.od ? game.i18n.localize("KNIGHT.INCLUS.Od") :  game.i18n.localize("KNIGHT.NOINCLUS.Od")}`,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
        value: `${data.active.conflit ? data.energie.tour : data.energie.minute}`,
      });
    }
}

export const goliathHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GOLIATH.TailleBonus")} - ${game.i18n.localize("KNIGHT.AUTRE.Maximum-short")}`,
          value: `${data.taille.max}`,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} / ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GOLIATH.MBonus")}`,
          value: `${data.energie}`,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.BONUS.Succes")} / ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GOLIATH.Metre")} - ${game.i18n.localize("KNIGHT.ASPECTS.CHAIR.CARACTERISTIQUES.FORCE.Label")}`,
          value: data.bonus.force.value,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.BONUS.Succes")} / ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.GOLIATH.Metre")} - ${game.i18n.localize("KNIGHT.ASPECTS.CHAIR.CARACTERISTIQUES.ENDURANCE.Label")}`,
          value: data.bonus.endurance.value,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const rageHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        if(special === 'blaze') {
          description = data.blaze.description;

          details.push({
            label:'KNIGHT.AUTRE.Degats',
            value:`${data?.blaze.degats ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
          });

          details.push({
            label:'KNIGHT.AUTRE.Violence',
            value:`${data?.blaze.violence ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.PORTEE.Label"),
            value: game.i18n.localize(`KNIGHT.PORTEE.${capitalizeFirstLetter(data.blaze.portee)}`),
          });
        } else if(special === 'degats') {
          let niveau = '';

          if(data.niveau.colere) niveau = 'colere';
          else if(data.niveau.rage) niveau = 'rage';
          else if(data.niveau.fureur) niveau = 'fureur';

          details.push({
            label:'KNIGHT.AUTRE.Degats',
            value:`${data[niveau].subis}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
          });
        } else {
          description.push(data.description);

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.duree,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.AUTRE.CoutEspoir"),
            value: data.espoir,
          });
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const illuminationHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });

        if(special === 'candle') {
          description = data.candle.description;

          details.push({
            label: game.i18n.localize("KNIGHT.PORTEE.Label"),
            value: game.i18n.localize(`KNIGHT.PORTEE.${capitalizeFirstLetter(data.candle.portee)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.LATERAL.Espoir"),
            value: `${data.candle.espoir.dice}${game.i18n.localize("KNIGHT.JETS.Des-short")}${data.candle.espoir.face}`,
          });
        } else if(special === 'torch' ||
          special === 'lighthouse' ||
          special === 'lantern' ||
          special === 'blaze' ||
          special === 'beacon' ||
          special === 'projector') {
          description = data[special].description;

          details.push({
            label: game.i18n.localize("KNIGHT.PORTEE.Label"),
            value: game.i18n.localize(`KNIGHT.PORTEE.${capitalizeFirstLetter(data[special].portee)}`),
          });

          if(special === 'torch') {
            details.push({
              label: game.i18n.localize("KNIGHT.BONUS.Egide"),
              value: data[special].bonus,
            });
          } else if(special === 'lantern') {
            details.push({
              label: game.i18n.localize("KNIGHT.AUTRE.Degats"),
              value: `${data.lantern.degats}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
            });

            propertiesLabel.push(`KNIGHT.EFFETS.Label`);

            for(let e of data?.lantern?.effets?.raw ?? []) {
              const generator = generateProperties(e);

              // On vérifie si properties n'inclut pas déjà un objet avec le même label
              if (!properties.some(prop => prop.label === generator.label)) {
                properties.push(generator);
              }
            }
          } else if(special === 'blaze') {
            details.push({
              label: game.i18n.localize("KNIGHT.AUTRE.Degats"),
              value: `${data.blaze.degats}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
            });

            details.push({
              label: game.i18n.localize("KNIGHT.AUTRE.Violence"),
              value: `${data.blaze.violence}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
            });
          } else if(special === 'beacon') {
            details.push({
              label: game.i18n.localize("KNIGHT.BONUS.Reussites"),
              value: data.beacon.bonus,
            });
          }

          details.push({
            label: `${game.i18n.localize("KNIGHT.AUTRE.CoutEspoir")} - ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.Utiliser")}`,
            value: data[special].espoir.base,
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.AUTRE.CoutEspoir")} - ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.Prolonger")}`,
            value: data[special].espoir.prolonger,
          });
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;
      let energy = 0;

      if(special === 'beacon') {
        energy += data.beacon.espoir.prolonger;
      } else if(special === 'blaze') {
        energy += data.blaze.espoir.prolonger;
      } else if(special === 'lantern') {
        energy += data.lantern.espoir.prolonger;
      } else if(special === 'lighthouse') {
        energy += data.lighthouse.espoir.prolonger;
      } else if(special === 'projector') {
        energy += data.projector.espoir.prolonger;
      } else if(special === 'torch') {
        energy += data.torch.espoir.prolonger;
      }

      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Espoir")}`,
        value: `${energy}`,
      });
    }
}

export const visionHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} - ${game.i18n.localize("KNIGHT.AUTRE.Minimum")}`,
          value: data.energie.min,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} - ${game.i18n.localize("KNIGHT.AUTRE.Maximum")}`,
          value: data.energie.max,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const nanocHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        if(special === 'base') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.base,
          });
        } else if(special === 'detaille') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.detaille,
          });
        } else if(special === 'mecanique') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.mecanique,
          });
        }

        details.push({
          label: `${game.i18n.localize("KNIGHT.AUTRE.Prolonger")} / ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.NANOC.ParMinute")}`,
          value: data.energie.prolonger,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
        value: `${data.energie.prolonger}`,
      });
    }
}

export const mechanicHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        if(special === 'contact') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.contact,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MECHANIC.Reparation"),
            value: `${data.reparation.contact.dice}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data.reparation.contact.fixe}`,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation.contact)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.reparation.contact.duree,
          });
        } else if(special === 'distance') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.distance,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MECHANIC.Reparation"),
            value: `${data.reparation.distance.dice}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data.reparation.distance.fixe}`,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation.distance)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.reparation.distance.duree,
          });
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const morphHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        if(!special) {
          description.push(data.description);

          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie,
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Espoir")}`,
            value: data.espoir,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.duree,
          });
        } else if(special === 'vol') {
          description = data.vol.description;
        } else if(special === 'metal') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.BONUS.ChampDeForce")}`,
            value: data.metal.bonus.champDeForce,
          });
        } else if(special === 'fluide') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.BONUS.Defense")}`,
            value: data.fluide.bonus.defense,
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.BONUS.Reaction")}`,
            value: data.fluide.bonus.reaction,
          });
        } else if(special === 'phase') {
          description = data.phase.description;

          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.phase.energie,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.phase.activation)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.phase.duree,
          });
        } else if(special === 'phaseN2') {
          description = data.phase.description;

          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.phase.niveau2.energie,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.phase.niveau2.activation)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.phase.niveau2.duree,
          });
        } else if(special === 'etirement') {
          description = data.etirement.description;

          details.push({
            label: `${game.i18n.localize("KNIGHT.PORTEE.Label")}`,
            value: data.etirement.portee,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.MORPH.CAPACITES.ETIREMENT.Bonus"),
            value: data.etirement.bonus,
          });
        } else if(special === 'polymorphie') {
          description = data.polymorphie.description;

        } else if(special === 'polymorphieLame') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.PORTEE.Label")}`,
            value: game.i18n.localize(`KNIGHT.PORTEE.${capitalizeFirstLetter(data.polymorphie.lame.portee)}`),
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.AUTRE.Degats")}`,
            value: `${data.polymorphie.lame.degats.dice}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.AUTRE.Violence")}`,
            value: `${data.polymorphie.lame.violence.dice}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
          });

          propertiesLabel.push(`KNIGHT.EFFETS.Label`);

          for(let e of data?.polymorphie?.lame?.effets?.raw ?? []) {
            const generator = generateProperties(e);

            // On vérifie si properties n'inclut pas déjà un objet avec le même label
            if (!properties.some(prop => prop.label === generator.label)) {
              properties.push(generator);
            }
          }
        } else if(special === 'polymorphieGriffe') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.PORTEE.Label")}`,
            value: game.i18n.localize(`KNIGHT.PORTEE.${capitalizeFirstLetter(data.polymorphie.griffe.portee)}`),
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.AUTRE.Degats")}`,
            value: `${data.polymorphie.griffe.degats.dice}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.AUTRE.Violence")}`,
            value: `${data.polymorphie.griffe.violence.dice}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
          });

          propertiesLabel.push(`KNIGHT.EFFETS.Label`);

          for(let e of data?.polymorphie?.griffe?.effets?.raw ?? []) {
            const generator = generateProperties(e);

            // On vérifie si properties n'inclut pas déjà un objet avec le même label
            if (!properties.some(prop => prop.label === generator.label)) {
              properties.push(generator);
            }
          }
        } else if(special === 'polymorphieCanon') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.PORTEE.Label")}`,
            value: game.i18n.localize(`KNIGHT.PORTEE.${capitalizeFirstLetter(data.polymorphie.canon.portee)}`),
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.AUTRE.Degats")}`,
            value: `${data.polymorphie.canon.degats.dice}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.AUTRE.Violence")}`,
            value: `${data.polymorphie.canon.violence.dice}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
          });

          propertiesLabel.push(`KNIGHT.EFFETS.Label`);

          for(let e of data?.polymorphie?.canon?.effets?.raw ?? []) {
            const generator = generateProperties(e);

            // On vérifie si properties n'inclut pas déjà un objet avec le même label
            if (!properties.some(prop => prop.label === generator.label)) {
              properties.push(generator);
            }
          }
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const puppetHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.PUPPET.Ordre")}`,
          value: data.energie.ordre,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.PUPPET.Creature")}`,
          value: data.energie.supplementaire,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.PUPPET.Prolonger")}`,
          value: data.energie.prolonger,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.PUPPET.Ordre")}`,
          value: data.flux.ordre,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.PUPPET.Creature")}`,
          value: data.flux.supplementaire,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.PUPPET.Prolonger")}`,
          value: data.energie.prolonger,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.PUPPET.Max")}`,
          value: data.creatures,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
        value: `${data.energie.prolonger*dataActorCapacite?.cible ?? 0}`,
      });

      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
        value: `${data.flux.prolonger*dataActorCapacite?.cible ?? 0}`,
      });
    }
}

export const discordHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        if(special === 'tour') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.tour.energie,
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
            value: data.tour.flux,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.tour.activation)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.tour.duree,
          });
        } else {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.scene.energie,
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
            value: data.scene.flux,
          });

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.scene.activation)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: data.scene.duree,
          });
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

      if(data.active.tour) {
        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
          value: `${data.tour.energie}`,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
          value: `${data.tour.flux}`,
        });
      } else if(data.active.scene) {
        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
          value: `${data.scene.energie}`,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
          value: `${data.scene.flux}`,
        });
      }
    }
}

export const windtalkerHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
          value: data.energie,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
          value: data.flux,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const typeHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        if(variant === 'conflit') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.tour,
          });
        } else {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.scene,
          });
        }

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });

        for(let t in data.type[special].liste) {
          details.push({
            label: `${game.i18n.localize(`${CONFIG.KNIGHT.caracteristiques[t]}`)} - ${game.i18n.localize('KNIGHT.BONUS.Overdrives')}`,
            value: data.type[special].liste[t].value,
          });
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;
      let energy = 0;

      if(variant === 'conflit') energy += data.energie.tour;
      else energy += data.energie.scene;

      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
        value: `${energy}`,
      });
    }
}

export const warlordHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        const dataWarlord = data?.impulsions?.[special];

        if(dataWarlord) {
          description = dataWarlord.bonus.description;

          if(special === 'energie') {
            details.push({
              label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}} - ${game.i18n.localize("KNIGHT.AUTRE.Minimum")}`,
              value: dataWarlord.energie.min,
            });

            details.push({
              label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}} - ${game.i18n.localize("KNIGHT.AUTRE.Maximum")}`,
              value: dataWarlord.energie.max,
            });
          } else {
            if(variant === 'allie') {
              details.push({
                label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
                value: dataWarlord.energie.allie,
              });
            } else if(variant === 'porteur') {
              details.push({
                label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
                value: dataWarlord.energie.porteur,
              });
            }
          }

          details.push({
            label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
            value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(dataWarlord.activation)}`),
          });

          details.push({
            label: game.i18n.localize("KNIGHT.DUREE.Label"),
            value: dataWarlord.duree,
          });

          if(special === 'force') {
            details.push({
              label: game.i18n.localize("KNIGHT.BONUS.ChampDeForce"),
              value: dataWarlord.bonus.champDeForce,
            });
          } else if(special === 'esquive') {
            details.push({
              label: game.i18n.localize("KNIGHT.BONUS.Defense"),
              value: dataWarlord.bonus.defense,
            });

            details.push({
              label: game.i18n.localize("KNIGHT.BONUS.Reaction"),
              value: dataWarlord.bonus.reaction,
            });
          } else if(special === 'guerre') {
            details.push({
              label: game.i18n.localize("KNIGHT.BONUS.Degats"),
              value: `${dataWarlord.bonus.degats}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
            });

            details.push({
              label: game.i18n.localize("KNIGHT.BONUS.Violence"),
              value: `${dataWarlord.bonus.violence}${game.i18n.localize("KNIGHT.JETS.Des-short")}6`,
            });
          }
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ actor, data, description, details, propertiesLabel, properties } = ctx;
      const dataWarlord = data?.impulsions?.[special];
      const dataActorCapacite = actor?.system?.equipements?.armure?.capacites?.[capacite];
      let energy = 0;

      if(dataWarlord) {
        energy += data?.active?.[special]?.allie
          ? (Number(dataWarlord?.energie?.prolonger) || 0) * (Number(dataActorCapacite?.[special]?.nbre) || 0)
          : 0;

        energy += data?.active?.[special]?.porteur
          ? (Number(dataWarlord?.energie?.porteur) || 0)
          : 0;

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
          value: `${energy}`,
        });
      }
    }
}

export const forwardHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
          value: data.energie,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const recordHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
          value: data.energie,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const rewindHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
          value: data.energie,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const watchtowerHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
          value: data.energie,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const shrineHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: `${game.i18n.localize("KNIGHT.BONUS.ChampDeForce")}`,
          value: data.champdeforce,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.REQUIS.Force")}`,
          value: data.requis.force,
        });

        details.push({
          label: `${game.i18n.localize("KNIGHT.REQUIS.Chair")}`,
          value: data.requis.chair,
        });

        if(special === 'personnel') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.personnel,
          });
        } else if(special === 'personnel6') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.personnel6tours,
          });
        } else if(special === 'distance') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.distance,
          });
        } else if(special === 'personnel6') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.distance6tours,
          });
        }

        if(special === 'personnel') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
            value: data.energie.personnel,
          });
        }

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.PORTEE.Label"),
          value: data.portee,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const contrecoupsHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;

        description.push(data.description);

        details.push({
          label: data.relance.value ?
          game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.CONTRECOUPS.Relance") :
          game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.CONTRECOUPS.NoRelance")
        });

        details.push({
          label: data.armedistance.value ?
          game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.CONTRECOUPS.ArmeDistance") :
          game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.CONTRECOUPS.NoArmeDistance")
        });

        if(data.maxeffets.value) {
          details.push({
            label: game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.CONTRECOUPS.MaxEffetsLabel"),
            value:data.maxeffets.max
          });
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;
      let energy = 0;

      energy += data?.active?.personnel ? data?.energie?.personnel ?? 0 : 0;
      energy += data?.active?.distance ? data?.energie?.distance ?? 0 : 0;
      energy += data?.active?.personnel6 ? data?.energie?.personnel6tours ?? 0 : 0;
      energy += data?.active?.distance6 ? data?.energie?.distance6tours ?? 0 : 0;

      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
        value: `${energy}`,
      });
    }
}

export const falconHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;
        description.push(data.description);

        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Energie")}`,
          value: data.energie,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
          value: game.i18n.localize(`KNIGHT.ACTIVATION.${capitalizeFirstLetter(data.activation)}`),
        });

        details.push({
          label: game.i18n.localize("KNIGHT.DUREE.Label"),
          value: data.duree,
        });

        details.push({
          label: game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.FALCON.INFORMATIONS.Label"),
          value: data.informations,
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const zenHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;
        description.push(data.description);

        details.push({
            label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ZEN.Difficulte")}`,
            value: data.difficulte,
        });

        let str = [];

        for(let a in data.aspects) {
            for(let c in data.aspects[a].caracteristiques) {
                if(data.aspects[a].caracteristiques[c].value) str.push(game.i18n.localize(CONFIG.KNIGHT.LIST.aspectsCaracteristiques[c]));
            }
        }

        details.push({
            label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ZEN.Caracteristiques")}`,
            value: str.join(' / '),
        });
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const energiedeficienteHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;
        description.push(data.description);
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const impregnationHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;
        description.push(data.description);
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const recoltefluxHandler = {
    async activate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
        let{ data, description, details, propertiesLabel, properties } = ctx;
        description.push(data.description);

        if(special === 'horsconflit') {
          details.push({
            label: `${game.i18n.localize("KNIGHT.ITEMS.ARMURE.SPECIAL.RECOLTEFLUX.FLUXHORSCONFLIT.FluxParCreature")}`,
            value:data.horsconflit.base
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.AUTRE.Limite")}`,
            value:data.horsconflit.limite
          });

          details.push({
            label: `${game.i18n.localize("KNIGHT.PORTEE.Label")}`,
            value:data.horsconflit.portee
          });
        } else if(special === 'conflit') {
          if(variant === 'debut') {
            details.push({
              label: `${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
              value:data.conflit.base
            });
          } else if(variant === 'tour') {
            details.push({
              label: ` ${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
              value:data.conflit.tour
            });
          } else if(variant === 'hostile') {
            details.push({
              label: ` ${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
              value:data.conflit.hostile
            });
          } else if(variant === 'salopard') {
            details.push({
              label: ` ${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
              value:data.conflit.salopard
            });
          } else if(variant === 'patron') {
            details.push({
              label: ` ${game.i18n.localize("KNIGHT.LATERAL.Flux")}`,
              value:data.conflit.patron
            });
          }
        }
    },
    async prolongate(ctx, generateProperties, { capacite = '', special = '', variant = ''}) {
      let{ data, description, details, propertiesLabel, properties } = ctx;

    }
}

export const moduleHandler = {
  async activate(ctx, generateProperties) {
    let{ actor, data, description, details, propertiesLabel, properties } = ctx;

    const actuel = data.niveau.actuel;
    const getArmure = await getArmor(actor);
    const armure = getArmure ? new ArmureAPI(getArmure) : null;

    description.push(data.description);

    details.push({
      label: game.i18n.localize("KNIGHT.ACTIVATION.Label"),
      value: `${game.i18n.localize(`KNIGHT.ACTIVATION.${actuel.activation.toString().charAt(0).toUpperCase()+actuel.activation.toString().substr(1)}`)}`,
    });

    if(actuel.energie.tour.value > 0) {
      details.push({
        label: `${armure?.espoirRemplaceEnergie ? game.i18n.localize("KNIGHT.LATERAL.Espoir") : game.i18n.localize("KNIGHT.LATERAL.Energie")} / ${actuel.energie.tour.label}`,
        value: `${actuel.energie.tour.value}`,
      });
    }

    if(actuel.energie.minute.value > 0) {
      details.push({
        label: `${armure?.espoirRemplaceEnergie ? game.i18n.localize("KNIGHT.LATERAL.Espoir") : game.i18n.localize("KNIGHT.LATERAL.Energie")} / ${actuel.energie.minute.label}`,
        value: `${actuel.energie.minute.value}`,
      });
    }

    if(actuel.energie.supplementaire > 0) {
      details.push({
        label: `${armure?.espoirRemplaceEnergie ? game.i18n.localize("KNIGHT.AUTRE.EspoirSupplementaireComplet") : game.i18n.localize("KNIGHT.AUTRE.EnergieSupplementaireComplet")}`,
        value: `${actuel.energie.supplementaire}`,
      });
    }

    details.push({
      label: `${game.i18n.localize("KNIGHT.PORTEE.Label")}`,
      value: `${game.i18n.localize(`KNIGHT.PORTEE.${actuel.portee.toString().charAt(0).toUpperCase()+actuel.portee.toString().substr(1)}`)}`,
    });

    if(actuel.duree || actuel.permanent) {
      details.push({
        label: `${game.i18n.localize("KNIGHT.DUREE.Label")}`,
        value: `${actuel.permanent ? game.i18n.localize("KNIGHT.DUREE.Permanent") : actuel.duree.replaceAll(/(?:\r\n|\r|\n)/g, "<br/>")}`,
      });
    }
  }
}

export const capaciteHandler = {
  async generate(ctx, generateProperties) {
    let{ actor, item, description, details, propertiesLabel, properties } = ctx;
    const data = item.system;

    description.push(data.description);

    if(data.degats.has) {
      details.push({
        label:'KNIGHT.AUTRE.Degats',
        value:`${data?.degats?.system?.dice ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data?.degats?.system?.fixe ?? 0}`,
      });

      propertiesLabel.push(`KNIGHT.EFFETS.Label`);

      for(let e of data?.degats?.system?.effets?.raw ?? []) {
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
    } else if(data.attaque.has) {
      details.push({
        label: `${game.i18n.localize("KNIGHT.PORTEE.Label")}`,
        value: `${game.i18n.localize(`KNIGHT.PORTEE.${data.attaque.portee.toString().charAt(0).toUpperCase()+data.attaque.portee.toString().substr(1)}`)}`,
      });

      details.push({
        label:'KNIGHT.AUTRE.Degats',
        value:`${data?.attaque?.degats?.dice ?? 0}${game.i18n.localize("KNIGHT.JETS.Des-short")}6+${data?.attaque?.degats?.fixe ?? 0}`,
      });

      propertiesLabel.push(`KNIGHT.EFFETS.Label`);

      for(let e of data?.attaque?.effets?.raw ?? []) {
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
    }
  }
}

export const maHandler = {
  async activate(ctx, generateProperties) {
    let{ actor, item, description, details, propertiesLabel, properties } = ctx;

    const hasTranslatedDuree = ['volMarkIV', 'sautMarkIV', 'canonNoe', 'moduleInferno', 'nanoBrume', 'dronesAirain', 'stationDefenseAutomatisee'];
    const hasTranslatedPortee = [
      'vagueSoin', 'offering', 'curse', 'podMiracle', 'lamesCinetiquesGeantes',
      'tourellesLasersAutomatisees', 'moduleInferno', 'souffleDemoniaque', 'poingsSoniques', 'chocSonique', 'canonMagma',
      'mitrailleusesSurtur', 'dronesAirain', 'podInvulnerabilite', 'stationDefenseAutomatisee', 'missilesJericho'];
    const hasNotTranslatedPortee = ['dronesEvacuation', 'moduleInferno'];
    const hasDgts = ['canonMetatron', 'lamesCinetiquesGeantes', 'souffleDemoniaque', 'poingsSoniques', 'canonMagma',
      'mitrailleusesSurtur', 'missilesJericho'];
    const hasViolence = ['canonMetatron', 'lamesCinetiquesGeantes', 'souffleDemoniaque', 'poingsSoniques', 'canonMagma',
      'mitrailleusesSurtur', 'missilesJericho'];
    const hasEffets = ['canonMetatron', 'lamesCinetiquesGeantes', 'souffleDemoniaque', 'poingsSoniques', 'chocSonique', 'canonMagma',
      'mitrailleusesSurtur', 'missilesJericho'];
    const key = item.system.key;
    const type = item.system.mainType;
    const data = item.system.data;

    const labelDice = "KNIGHT.JETS.Des-short";

    console.error(data);
    console.error(type);

    description.push(game.i18n.localize(`KNIGHT.MECHAARMURE.MODULES.${key.toUpperCase()}.Description`));

    details.push({
      label: `${game.i18n.localize("KNIGHT.ACTIVATION.Label")}`,
      value: game.i18n.localize(`KNIGHT.ACTIVATION.${data.activation}`),
    });

    if(typeof data.noyaux === "number" && !isNaN(data.noyaux)) {
      if(data.noyaux > 0) {
        details.push({
          label: `${game.i18n.localize("KNIGHT.LATERAL.Noyaux")}`,
          value: data.noyaux,
        });
      }
    } else if(key === 'moduleWraith' && type === 'activation') {
      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Noyaux")}`,
        value: `${data.noyaux.base}`,
      });
    } else if(key === 'moduleWraith' && type === 'special') {
      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Noyaux")}`,
        value: `${data.noyaux.prolonger}`,
      });
    } else if(key === 'canonMagma' && type === 'attaque') {
      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Noyaux")}`,
        value: `${data.noyaux.simple}`,
      });
    } else if(key === 'canonMagma' && type === 'special') {
      details.push({
        label: `${game.i18n.localize("KNIGHT.LATERAL.Noyaux")}`,
        value: `${data.noyaux.bande}`,
      });
    }

    if(hasTranslatedDuree.includes(key)) {
      details.push({
        label: `${game.i18n.localize("KNIGHT.DUREE.Label")}`,
        value: game.i18n.localize(`KNIGHT.DUREE.${data.duree}`),
      });
    } else if(
      key === 'dronesEvacuation') {
      details.push({
        label: `${game.i18n.localize("KNIGHT.DUREE.Label")}`,
        value: `${data.duree} ${game.i18n.localize("KNIGHT.AUTRE.Tour")}`,
      });
    } else if(
      key === 'podMiracle') {
      details.push({
        label: `${game.i18n.localize("KNIGHT.DUREE.Label")}`,
        value: `${data.duree}${game.i18n.localize(labelDice)}6 ${game.i18n.localize("KNIGHT.AUTRE.Tours")}`,
      });
    } else if(
      key === 'offering' ||
      key === 'curse' ||
      key === 'podInvulnerabilite') {
      details.push({
        label: `${game.i18n.localize("KNIGHT.DUREE.Label")}`,
        value: `${data.duree}${game.i18n.localize(labelDice)}3 ${game.i18n.localize("KNIGHT.AUTRE.Tours")}`,
      });
    } else if(key === 'moduleWraith') {
      details.push({
        label: `${game.i18n.localize("KNIGHT.DUREE.Label")}`,
        value: game.i18n.localize(`KNIGHT.MECHAARMURE.MODULES.${key.toUpperCase()}.Duree`),
      });
    } else if(
      key === 'bouclierAmrita' ||
      key === 'dronesAirain' ||
      key === 'modeSiegeTower'
    ) {
      details.push({
        label: `${game.i18n.localize("KNIGHT.DUREE.Label")}`,
        value: game.i18n.localize(`KNIGHT.MECHAARMURE.MODULES.${key.toUpperCase()}.Duree`),
      });
    }

    if(hasTranslatedPortee.includes(key)) {
      details.push({
        label: `${game.i18n.localize("KNIGHT.PORTEE.Label")}`,
        value: game.i18n.localize(`KNIGHT.PORTEE.${data.portee}`),
      });
    } else if(hasNotTranslatedPortee.includes(key)) {
      details.push({
        label: `${game.i18n.localize("KNIGHT.PORTEE.Label")}`,
        value: data.portee,
      });
    }

    if(hasDgts.includes(key)) {
      details.push({
        label: `${game.i18n.localize("KNIGHT.AUTRE.Degats")}`,
        value: data.degats.fixe ? `${data.degats.dice}${game.i18n.localize(labelDice)}6+${data.degats.fixe}` : `${data.degats.dice}${game.i18n.localize(labelDice)}6`,
      });
    }

    if(hasViolence.includes(key)) {
      details.push({
        label: `${game.i18n.localize("KNIGHT.AUTRE.Violence")}`,
        value: data.violence.fixe ? `${data.violence.dice}${game.i18n.localize(labelDice)}6+${data.violence.fixe}` : `${data.violence.dice}${game.i18n.localize(labelDice)}6`,
      });
    }

    if(hasEffets.includes(key)) {
      propertiesLabel.push(`KNIGHT.EFFETS.Label`);

      for(let e of data?.polymorphie?.griffe?.effets?.raw ?? []) {
        const generator = generateProperties(e);

        // On vérifie si properties n'inclut pas déjà un objet avec le même label
        if (!properties.some(prop => prop.label === generator.label)) {
          properties.push(generator);
        }
      }
    }
  }
}