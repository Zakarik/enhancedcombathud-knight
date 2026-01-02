import {
    getRestoreHandler
  } from "./handlers/registry.js";

export function makeKnightRestorePanel(ARGON) {
    const ignored = ['bande', 'vehicule', 'mechaarmure'];
    const onlyChargeur = ['creature', 'pnj']

	class KnightRestoreButton extends ARGON.MAIN.BUTTONS.ActionButton {
        constructor(options = {}) {
            const {
              type,
              // Le reste ira au parent
              ...parentArgs
            } = options;

            super(parentArgs); // n’envoie que ce que le parent comprend

            this.type = type;
        }

		get label() {
            const type = this.type;
            const handler = getRestoreHandler(this.type);

			return handler.label?.(type);
		}

        get icon() {
            const type = this.type;
            const handler = getRestoreHandler(this.type);

            return handler.icon?.(type);
        }

        get colorScheme() {
          return 2;
        }

		async getTooltipData() {
			return null;
		}

		async _onLeftClick(event) {
            ui.ARGON.interceptNextDialog(event.currentTarget);
            const actor = this.actor;
            const type = this.type;
            const handler = getRestoreHandler(type);
            await handler.activate?.(
                {actor, type}
            );
        }
    }

    return class KnightRestorePanel extends ARGON.MAIN.ActionPanel {
        constructor(...args) {
            super(...args);
        }

        get label() {
            return `${game.i18n.localize("enhancedcombathud-knight.TITLES.Restore")}`;
        }

        async _getButtons() {
            const actor = this.actor;
            const type = actor.type;
            const buttons = [];

            if(ignored.includes(type)) return buttons;

            if(onlyChargeur.includes(type)) {
                buttons.push(new KnightRestoreButton({type:'chargeur'}));
            } else {
                buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new KnightRestoreButton({type:'sante'}), new KnightRestoreButton({type:'armure'})));
                buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new KnightRestoreButton({type:'energie'}), new KnightRestoreButton({type:'espoir'})));
                buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new KnightRestoreButton({type:'contact'}), new KnightRestoreButton({type:'chargeur'})));
                buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new KnightRestoreButton({type:'nods'}), new KnightRestoreButton({type:'grenades'})));
            }

            return buttons;
        }
    }
}