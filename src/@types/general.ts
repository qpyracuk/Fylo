//#region Types

type TFileModeFlag = 'r' | 'r+' | 'w' | 'w+' | 'a' | 'a+' | 'ax' | 'ax+' | 'wx' | 'wx+';

export interface IAccessOptions {
	read?: boolean;
	write?: boolean;
	execute?: boolean;
}

export interface IFileOptions {
	encoding?: BufferEncoding;
	mode?: number;
	flag?: TFileModeFlag;
}

export interface IDirectoryOptions {
	recursive?: boolean;
	mode?: number;
}

//#region Types
export type IReadStreanEventType = 'data' | 'end' | 'error' | 'close' | 'pause' | 'resume';

export interface IReadStreamEvents {
	data: Buffer | string;
	end: void;
	error: Error;
	close: void;
	pause: void;
	resume: void;
}

export type IReadStreamEventHandlers = {
	data: (chunk: Buffer | string) => void | Promise<void>;
	end: () => void | Promise<void>;
	error: (err: Error) => void | Promise<void>;
	close: () => void | Promise<void>;
	pause: () => void | Promise<void>;
	resume: () => void | Promise<void>;
};
//#endregion

export interface IWriteStreamEvents {
	finish: void;
	error: Error;
	close: void;
	drain: void;
}

//#region watchers

/**
 * Options for configuring the watcher behavior.
 *
 * @interface IWatcherOptions
 * @property {boolean} [usePolling] - If true, polling will be used to monitor changes instead of event-based watching.
 * @property {number} [pollingInterval=500] - The interval in milliseconds for polling (used if `usePolling` is true).
 */
export interface IWatcherOptions {
	usePolling?: boolean;
	pollingInterval?: number;
}

/**
 * Types of events that can be emitted by FileWatcher.
 */
export type IFileWatcherEvents = 'changed' | 'error';

/**
 * Types of events that can be emitted by DirectoryWatcher.
 */
export type IDirectoryWatcherEvents = 'added' | 'removed' | 'changed' | 'error';

//#endregion
