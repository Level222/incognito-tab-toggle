import isWithId from "./is-with-id";

const safeSetActionIcon = (
  details: chrome.action.TabIconDetails
): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.action.setIcon(details, () => {
      const { lastError } = chrome.runtime;
      if (lastError) {
        reject(lastError);
      } else {
        resolve();
      }
    });
  });
};

const updateActionIcon = async (tab: chrome.tabs.Tab) => {
  if (!isWithId(tab)) {
    return false;
  }

  const iconName = tab.incognito ? "incognito" : "normal";

  try {
    await safeSetActionIcon({
      tabId: tab.id,
      path: {
        "16": `icons/icon-${iconName}-16.png`,
        "24": `icons/icon-${iconName}-24.png`,
        "32": `icons/icon-${iconName}-32.png`
      }
    });
  } catch {
    return false;
  }

  return true;
};

export default updateActionIcon;
