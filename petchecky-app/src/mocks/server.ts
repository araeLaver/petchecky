import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Node.js 환경용 MSW Server 설정 (테스트용)
export const server = setupServer(...handlers);
