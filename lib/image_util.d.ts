/// <reference types="node" />
export declare const base64Image: (imagePath: string) => string;
export declare const getImageType: (imageBuffer: Buffer) => "png" | "jpeg" | "unknown";
