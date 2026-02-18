import {
  makeKnightPortraitPanel,
  makeKnightDrawerPanel,
  makeKnightSpecialPanel,
  makeKnightInformationPanel,
} from "./components/knightStdPanel.js";

import {
  makeKnightItemButton,
  makeKnightActionAsItemButton,
  makeKnightModulePanelButton,
  makeKnightProlongerButton,
} from "./components/knightStdButton.js";

import {
  makeKnightWpnPanel,
  makeKnightWeaponSets,
} from "./components/knightWpn.js";

import {
  makeKnightCapacitePanel,
} from "./components/knightCapacity.js";

import {
  makeKnightRestorePanel,
} from "./components/knightRestore.js";

import {
  makeKnightConfigurationPanel,
} from "./components/knightConfiguration.js";

import {
  registerAllKnightArgon,
} from "./components/handlers/registry.js";


Hooks.on("setup", () => {
  Hooks.on("updateItem", async (item) => {
      if(item.parent === ui.ARGON._actor && ui.ARGON.rendered) {
        await ui.ARGON.components.weaponSets.refresh();
        ui.ARGON.refresh();
      }
  });

  Hooks.on("updateActor", async (item) => {
      if(item === ui.ARGON._actor && ui.ARGON.rendered) {
        await ui.ARGON.components.weaponSets.refresh();
        ui.ARGON.refresh();
      }
  });

  Hooks.on("argonInit", (CoreHUD) => {
    registerAllKnightArgon();

    const ARGON = CoreHUD.ARGON;

    const KnightActionAsItemButton = makeKnightActionAsItemButton(ARGON);
    const KnightItemButton = makeKnightItemButton(ARGON);
    const KnightModulePanelButton = makeKnightModulePanelButton(ARGON, KnightActionAsItemButton);
    const KnightProlongerButton = makeKnightProlongerButton(KnightActionAsItemButton);

    const KnightPortraitPanel = makeKnightPortraitPanel(ARGON);
    const KnightDrawerPanel = makeKnightDrawerPanel(ARGON);

    const KnightWPNPanel = makeKnightWpnPanel(ARGON, KnightItemButton, KnightActionAsItemButton);
    const KnightCapacitePanel = makeKnightCapacitePanel(ARGON, KnightModulePanelButton, KnightProlongerButton, KnightActionAsItemButton);
    const KnightSpecialPanel = makeKnightSpecialPanel(ARGON);
    const KnightInformation = makeKnightInformationPanel(ARGON);
    const knightConfiguration = makeKnightConfigurationPanel(ARGON);
    const KnightRestore = makeKnightRestorePanel(ARGON);

    const KnightWeaponSets = makeKnightWeaponSets(ARGON);

    CoreHUD.definePortraitPanel(KnightPortraitPanel);
    CoreHUD.defineDrawerPanel(KnightDrawerPanel);
    CoreHUD.defineMainPanels([
      KnightWPNPanel,
      KnightCapacitePanel,
      knightConfiguration,
      KnightInformation,
      KnightSpecialPanel,
      KnightRestore,
      ARGON.PREFAB.MacroPanel,
      ARGON.PREFAB.PassTurnPanel,
    ]);
    CoreHUD.defineMovementHud(null);
    CoreHUD.defineWeaponSets(KnightWeaponSets);
    CoreHUD.defineSupportedActorTypes(["knight", "bande", "creature", "pnj", "vehicule", "mechaarmure"]);
  });
})