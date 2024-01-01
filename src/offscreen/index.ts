import getScreenAvailBounds from "./get-screen-avail-bounds";
import { Message, GetScreenSizeResponse, SendResponse } from "../utils/message";
import { z } from "zod";

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse: SendResponse<GetScreenSizeResponse>) => {
    const messageParseResult = Message.safeParse(message);

    if (
      !messageParseResult.success ||
      messageParseResult.data.type !== "GET_SCREEN_SIZE"
    ) {
      return;
    }

    getScreenAvailBounds()
      .then((bounds) => {
        sendResponse({
          success: true,
          data: bounds
        });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          sendResponse({
            success: false,
            error: {
              type: "NO_PERMISSION",
              message: error.message
            }
          });
        } else if (error instanceof z.ZodError) {
          sendResponse({
            success: false,
            error: {
              type: "ZOD_ERROR",
              message: error.message
            }
          });
        } else {
          sendResponse({
            success: false,
            error: {
              type: "UNKNOWN",
              message: String(error)
            }
          });
        }
      });

    return true;
  }
);
