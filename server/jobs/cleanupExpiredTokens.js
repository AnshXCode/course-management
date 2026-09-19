import { deleteExpiredRefreshTokens } from "../services/refreshTokenService.js";
import { logger } from "../lib/logger.js";
 
export async function cleanupExpiredTokensJob() {
    const deleted = await deleteExpiredRefreshTokens();
    logger.info({ deleted }, "Expired refresh tokens cleaned up");
    return { deleted };
}