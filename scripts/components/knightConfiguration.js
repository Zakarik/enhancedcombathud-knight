
export function makeKnightConfigurationPanel(ARGON, KnightModulePanelButton, KnightProlongerButton, KnightActionAsItemButton) {
    class KnightMAMode extends ARGON.MAIN.BUTTONS.ActionButton {
        constructor(options = {}) {
            const {
                name,
                mode,
                // Le reste ira au parent
                ...parentArgs
            } = options;

            super(parentArgs); // n’envoie que ce que le parent comprend

            this.name = name;
            this.mode = mode;
        }

        get label() {
            return this.name;
        }

        get colorScheme() {
          return 2;
        }

        get icon() {
            return "modules/enhancedcombathud-knight/assets/mechaarmure.svg";
        }

        async getTooltipData() {
            return null;
        }

        async _onLeftClick(event) {
            this.actor.system.changeConfiguration(this.mode);
        }

        async _renderInner() {
            await super._renderInner();

            if(this.actor.system.configurations.actuel !== this.mode) this.element.classList.add("inactivate");
        }
    }

    return class KnightConfigurationPanel extends ARGON.MAIN.ActionPanel {
        constructor(...args) {
            super(...args);
        }

        get label() {
            return game.i18n.localize("KNIGHT.MECHAARMURE.CONFIGURATIONS.Label");
        }

        async _getButtons() {
            const actor = this.actor;
            const type = actor.type;
            const buttons = [];

            if(type !== 'mechaarmure') return buttons;
            const configurations = actor.system.configurations.liste;

            for(let c in configurations) {
                if(c === 'base') continue;

                if(configurations[c]?.name) {
                    buttons.push(new KnightMAMode({
                        mode:c,
                        name:configurations[c]?.name ?? '',
                    }));
                }
            }

            return buttons;
        }
    }
}