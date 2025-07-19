// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/PrismaEnums.ts

export enum EvalContentType {
    content = "content",
    toolCall = "toolCall"
}

export enum EvalResultType {
    pass = "pass",
    fail = "fail",
    skip = "skip"
}

// Add this to global scope to mimic @prisma/client import
(global as any).EvalContentType = EvalContentType;
(global as any).EvalResultType = EvalResultType;