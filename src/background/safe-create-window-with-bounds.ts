import { ScreenAvailBounds } from "../offscreen/get-screen-avail-bounds";
import {
  GetScreenSizeError,
  GetScreenSizeMessage,
  GetScreenSizeResponse
} from "../utils/message";

const getCurrentScreenAvailBounds =
  async (): Promise<GetScreenSizeResponse> => {
    await chrome.offscreen.createDocument({
      reasons: [chrome.offscreen.Reason.BLOBS],
      url: "offscreen.html",
      justification: "To get screen size"
    });

    const unknownResponse =
      await chrome.runtime.sendMessage<GetScreenSizeMessage>({
        type: "GET_SCREEN_SIZE"
      });

    await chrome.offscreen.closeDocument();

    const response = GetScreenSizeResponse.parse(unknownResponse);

    return response;
  };

type WindowBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const calculateSafeWindowBounds = async (
  windowBounds: WindowBounds,
  screenAvailBounds: ScreenAvailBounds
): Promise<WindowBounds> => {
  const { left, top, width, height } = windowBounds;
  const { availLeft, availTop, availWidth, availHeight } = screenAvailBounds;

  const safeWidth = Math.min(width, availWidth);
  const safeHeight = Math.min(height, availHeight);

  const safeLeft = Math.min(
    Math.max(left, availLeft),
    availWidth - safeWidth + availLeft
  );
  const safeTop = Math.min(
    Math.max(top, availTop),
    availHeight - safeHeight + availTop
  );

  return { left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight };
};

export type SuccessfulCreateResult = {
  success: true;
  window: chrome.windows.Window;
};

export type FailedCreateResult = {
  success: false;
  error: GetScreenSizeError;
};

export type CreateResult = SuccessfulCreateResult | FailedCreateResult;

const safeCreateWindowWithBounds = async (
  createData: chrome.windows.CreateData
): Promise<CreateResult> => {
  const { left, top, width, height, ...otherCreateData } = createData;

  const result = await getCurrentScreenAvailBounds();

  if (!result.success) {
    return result;
  }

  const safeWindowBounds = await calculateSafeWindowBounds(
    { left: left ?? 0, top: top ?? 0, width: width ?? 0, height: height ?? 0 },
    result.data
  );

  try {
    const window = await chrome.windows.create({
      ...safeWindowBounds,
      ...otherCreateData
    });

    return {
      success: true,
      window
    };
  } catch (error) {
    return {
      success: false,
      error: { type: "UNKNOWN", message: String(error) }
    };
  }
};

export default safeCreateWindowWithBounds;
