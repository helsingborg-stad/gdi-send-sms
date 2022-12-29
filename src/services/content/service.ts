import { MessageBody } from '../../types'
import { createDefaultContentProvider } from './providers/default'
import { tryCreateHelsingborgFromEnv } from './providers/helsingborg'

/**
 * Required signature of a provider
 */
export type ContentBuildProvider = (message: MessageBody) => Promise<string>

/**
 * The signature of the Contentservice
 */
export interface ContentService {
    build: ContentBuildProvider
}

/**
 * Service instantiation from environment configuration
 * @returns An ContentService instance
 */
export const getContentServiceFromEnv = (): ContentService => {
	return {
		build: tryCreateHelsingborgFromEnv() || createDefaultContentProvider(''),
	}
}

/**
 * Static execution of Service
 * @returns An ContentService instance
 */
export const getContentService = (basePath: string): ContentService => ({ build: createDefaultContentProvider(basePath) })
