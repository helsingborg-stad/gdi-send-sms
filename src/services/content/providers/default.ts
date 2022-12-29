import { ContentBuildProvider } from '../service'

/**
 * Example content provider
 * @returns A ContentBuildProvider instance
 */
export const createDefaultContentProvider = (verificationPath: string): ContentBuildProvider => async (message) => `${verificationPath}${message.verificationCode}`
