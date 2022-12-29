import { ContentBuildProvider } from '../service'

/**
 * Default action prints the message to console
 * @returns An SmsSendProvider instance
 */
export const createDefaultContentProvider = (basePath: string): ContentBuildProvider => async (message) => `${basePath}${message.verificationCode}`
