import safeCreateWindowWithBounds from "./safe-create-window-with-bounds";
import isWithId, { WithId } from "./is-with-id";

const cloneTab = async (
  tab: chrome.tabs.Tab,
  overrides?: chrome.tabs.CreateProperties
): Promise<chrome.tabs.Tab> => {
  const { url, pinned, active, windowId, autoDiscardable, mutedInfo } = tab;

  const newTab = await chrome.tabs.create({
    url,
    pinned,
    active,
    windowId,
    ...overrides
  });

  if (isWithId(newTab)) {
    await chrome.tabs.update(newTab.id, {
      autoDiscardable,
      ...(mutedInfo ? { muted: mutedInfo.muted } : {})
    });
  }

  return newTab;
};

const toSorted = <T>(
  array: T[],
  ...sortParameters: Parameters<Array<T>["sort"]>
): T[] => [...array].sort(...sortParameters);

const mapGroupBy = <T, U>(
  iterable: Iterable<T>,
  callbackFn: (element: T, index: number) => U
): Map<U, T[]> =>
  [...iterable].reduce((groupsMap, currentValue, index) => {
    const key = callbackFn(currentValue, index);
    const group = groupsMap.get(key) ?? [];

    groupsMap.set(key, [...group, currentValue]);

    return groupsMap;
  }, new Map<U, T[]>());

const asyncFlatMap = async <T, U, This = undefined>(
  array: T[],
  callback: (this: This, value: T, index: number, array: T[]) => Promise<U | ReadonlyArray<U>>,
  thisArg?: This
) => {
  const mappedArray = await Promise.all(array.map(callback, thisArg));
  return mappedArray.flat();
};

type TypeGuardIncludes = <T>(
  this: T[],
  searchElement: unknown
) => searchElement is T;

const moveClonedTabs = async (
  tabs: WithId<chrome.tabs.Tab>[],
  windowId: number
) => {
  const createdTabs = await asyncFlatMap(tabs, async (oldTab) => {
    const newTab = await cloneTab(oldTab, { windowId });

    chrome.windows.update(windowId, { focused: true });

    if (!isWithId(newTab)) {
      return [];
    }

    if (newTab.windowId !== windowId) {
      if (newTab.id !== oldTab.id) {
        await chrome.tabs.remove(newTab.id);
      }

      return [];
    }

    return [{ oldTab, newTab }];
  });

  const groups = mapGroupBy(createdTabs, ({ oldTab }) => oldTab.groupId);

  groups.delete(chrome.tabGroups.TAB_GROUP_ID_NONE);

  await Promise.all(
    [...groups].map(async ([groupId, tabs]) => {
      if (groupId === chrome.tabGroups.TAB_GROUP_ID_NONE) {
        return;
      }

      const { collapsed, color, title } = await chrome.tabGroups.get(groupId);

      const newTabGroupId = await chrome.tabs.group({
        createProperties: { windowId },
        tabIds: tabs.map(({ newTab }) => newTab.id)
      });

      await chrome.tabGroups.update(newTabGroupId, { collapsed, color, title });
    })
  );

  await Promise.all(createdTabs.map(async ({ oldTab }) => {
    await chrome.tabs.remove(oldTab.id);
  }));
};

const toggleTabIncognito = async (): Promise<void> => {
  const highlightedTabs = await chrome.tabs.query({
    highlighted: true,
    currentWindow: true
  });

  const targetTabs = toSorted(
    highlightedTabs.filter(isWithId),
    (a, b) => a.index - b.index
  );

  const currentWidow = await chrome.windows.getLastFocused();

  const { incognito, top, left, height, width, type } = currentWidow;

  const windowCreateResult = await safeCreateWindowWithBounds({
    incognito: !incognito,
    top,
    left,
    height,
    width,
    ...((
      Object.values(chrome.windows.CreateType).includes as TypeGuardIncludes
    )(type)
      ? { type }
      : {})
  });

  if (!windowCreateResult.success) {
    const { error } = windowCreateResult;

    if (error.type === "NO_PERMISSION") {
      const commonOptions = {
        type: chrome.windows.CreateType.POPUP,
        url: "./window-management-permission-popup.html"
      };

      try {
        await chrome.windows.create({
          ...commonOptions,
          width: 500,
          height: 400
        });
      } catch {
        await chrome.windows.create(commonOptions);
      }

      return;
    }

    throw new Error(error.message);
  }

  const newWindow = windowCreateResult.window;

  if (!isWithId(newWindow)) {
    return;
  }

  const newWindowDefaultTabs = newWindow.tabs?.filter(isWithId);

  await moveClonedTabs(targetTabs, newWindow.id);

  if (newWindowDefaultTabs) {
    for (const tab of newWindowDefaultTabs) {
      await chrome.tabs.remove(tab.id);
    }
  }
};

export default toggleTabIncognito;
