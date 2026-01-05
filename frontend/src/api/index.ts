export { apiClient } from "./client";
export { trackingApi } from "./api-endpoints/tracking";
export { resultsApi } from "./api-endpoints/results";

export * from "./api-types";

import { trackingApi } from "./api-endpoints/tracking";
import { resultsApi } from "./api-endpoints/results";

export const startTracking = trackingApi.start;
export const getSessionStatus = trackingApi.getStatus;
export const stopTracking = trackingApi.stop;

export const getResults = resultsApi.getResults;
export const getLeaderboard = resultsApi.getLeaderboard;
export const getPrompts = resultsApi.getPrompts;
export const getPromptDetail = resultsApi.getPromptDetail;
export const getCompetitiveMatrix = resultsApi.getCompetitiveMatrix;
