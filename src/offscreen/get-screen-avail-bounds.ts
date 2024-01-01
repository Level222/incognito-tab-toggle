import { z } from "zod";

export const ScreenAvailBounds = z.object({
  availLeft: z.number(),
  availTop: z.number(),
  availWidth: z.number(),
  availHeight: z.number()
});

export type ScreenAvailBounds = z.infer<typeof ScreenAvailBounds>;

const ScreenDetailedWithAvailLeft = z.object({
  availLeft: z.optional(z.number()).catch(undefined)
});

const ScreenDetailedWithLeft = z.object({
  left: z.optional(z.number()).catch(undefined)
});

const ScreenDetailedWithAvailTop = z.object({
  availTop: z.optional(z.number()).catch(undefined)
});

const ScreenDetailedWithTop = z.object({
  top: z.optional(z.number()).catch(undefined)
});

const getScreenAvailBounds = async (): Promise<ScreenAvailBounds> => {
  const { availWidth, availHeight } = screen;

  let currentScreen: ScreenDetailed | undefined;

  let availLeft = ScreenDetailedWithAvailLeft.parse(screen).availLeft;

  if (availLeft === undefined) {
    currentScreen = (await window.getScreenDetails()).currentScreen;

    availLeft =
      ScreenDetailedWithAvailLeft.parse(currentScreen).availLeft ??
      ScreenDetailedWithLeft.parse(currentScreen).left ??
      ScreenDetailedWithLeft.parse(screen).left;

    if (availLeft === undefined) {
      throw new TypeError("Cannot not detect screen avail left.");
    }
  }

  let availTop = ScreenDetailedWithAvailTop.parse(screen).availTop;

  if (availTop === undefined) {
    currentScreen =
      currentScreen ?? (await window.getScreenDetails()).currentScreen;

    availTop =
      ScreenDetailedWithAvailTop.parse(currentScreen).availTop ??
      ScreenDetailedWithTop.parse(currentScreen).top ??
      ScreenDetailedWithTop.parse(screen).top;

    if (availTop === undefined) {
      throw new TypeError("Cannot detect screen avail top.");
    }
  }

  return {
    availWidth,
    availHeight,
    availLeft,
    availTop
  };
};

export default getScreenAvailBounds;
