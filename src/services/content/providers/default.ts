import { ContentBuildProvider } from '../service'

/**
 * Example content provider
 * @returns A ContentBuildProvider instance
 */
export const createDefaultContentProvider = (basePath: string): ContentBuildProvider => async (message) => `(Default) ${basePath}${message.verificationCode}`
