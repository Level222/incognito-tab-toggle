import updateActionIcon from "./update-action-icon";
import toggleTabIncognito from "./toggle-tab-incognito";

const main = async () => {
  chrome.action.onClicked.addListener(toggleTabIncognito);

  const allTabs = await chrome.tabs.query({});

  for (const tab of allTabs) {
    updateActionIcon(tab);
  }

  chrome.tabs.onCreated.addListener(updateActionIcon);

  chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
    updateActionIcon(tab);
  });
};

main();
