// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/SlackService.ts

export class SlackService {
    async sendAnalyticsMessage({ message }: { message: string }) {
        console.log("Mock SlackService.sendAnalyticsMessage called with:", { message });
        return;
    }
}