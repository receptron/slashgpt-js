"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageType = exports.base64Image = void 0;
const fs = __importStar(require("fs"));
const base64Image = (imagePath) => {
    try {
        // Read the file as a binary buffer
        const imageBuffer = fs.readFileSync(imagePath);
        // Convert the buffer to a base64 string
        const base64String = imageBuffer.toString("base64");
        const imageType = (0, exports.getImageType)(imageBuffer);
        return `data:image/${imageType};base64,${base64String}`;
    }
    catch (error) {
        console.error("Error reading file:", error);
        throw error;
    }
};
exports.base64Image = base64Image;
const getImageType = (imageBuffer) => {
    const head = Array.from(imageBuffer.slice(0, 8))
        .map((a) => {
        return ("00" + a.toString(16)).slice(-2);
    })
        .join("")
        .toLowerCase();
    if (head.startsWith("89504e470d0a1a0a")) {
        return "png";
    }
    if (head.startsWith("ffd8")) {
        return "jpeg";
    }
    return "unknown";
};
exports.getImageType = getImageType;
