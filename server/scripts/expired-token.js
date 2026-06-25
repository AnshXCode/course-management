import "../env.js";
import {cleanupExpiredTokensJob} from '../jobs/cleanupExpiredTokens.js';

await cleanupExpiredTokensJob();

process.exit(0);