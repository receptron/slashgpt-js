import { ChatSession } from "./index";
export declare const callback: (callback_type: string, data: unknown) => void;
export declare const justRun: (fileFullName: string) => Promise<ChatSession>;
