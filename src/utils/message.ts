import { z } from "zod";
import { ScreenAvailBounds } from "../offscreen/get-screen-avail-bounds";

export const GetScreenSizeMessage = z.object({
  type: z.literal("GET_SCREEN_SIZE")
});

export type GetScreenSizeMessage = z.infer<typeof GetScreenSizeMessage>;

export const Message = GetScreenSizeMessage;

export type Message = z.infer<typeof Message>;

export type SendResponse<T> = (response: T) => void;

export const SuccessfulGetScreenSizeResponse = z.object({
  success: z.literal(true),
  data: ScreenAvailBounds
});

export const GetScreenSizeError = z.object({
  type: z.union([
    z.literal("NO_PERMISSION"),
    z.literal("ZOD_ERROR"),
    z.literal("UNKNOWN")
  ]),
  message: z.string()
});

export type GetScreenSizeError = z.infer<typeof GetScreenSizeError>;

export const FailedGetScreenSizeResponse = z.object({
  success: z.literal(false),
  error: GetScreenSizeError
});

export type FailedGetScreenSizeResponse = z.infer<
  typeof FailedGetScreenSizeResponse
>;

export const GetScreenSizeResponse = z.union([
  SuccessfulGetScreenSizeResponse,
  FailedGetScreenSizeResponse
]);

export type GetScreenSizeResponse = z.infer<typeof GetScreenSizeResponse>;
