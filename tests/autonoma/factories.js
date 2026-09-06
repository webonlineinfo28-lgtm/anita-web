// Autonoma Factories for Anita Festival
import * as sdk from "./sdk.js";
export const createSession = sdk.seedSession;
export const createPlaylist = sdk.seedPlaylist;
export const createHistory = sdk.seedHistory;
export const createBingoSharedState = sdk.seedBingoSharedState;
export const createBingoWinners = sdk.seedBingoWinners;
export const createBingoUserCards = sdk.seedBingoUserCards;
export const createBingoPermanentCounts = sdk.seedBingoPermanentCounts;
export const createBingoCurrentGame = sdk.seedBingoCurrentGame;
export const createAvatars = sdk.seedAvatars;
export const createRoomState = sdk.seedRoomState;
export const teardown = sdk.clearStorage;
export default sdk;