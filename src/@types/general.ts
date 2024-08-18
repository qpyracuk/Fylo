//#region Imports
import * as fs from 'fs';
//#endregion

/**
 * Extracts the type of the argument at the specified index `I` from the function type `T`.
 *
 * @template T - The type of the function from which to extract the argument type.
 * @template I - The index of the argument to extract (0-based).
 *
 * @example
 * type FirstArg = TArgumentAtIndex<(a: string, b: number) => void, 0>; // string
 * type SecondArg = TArgumentAtIndex<(a: string, b: number) => void, 1>; // number
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TArgumentAtIndex<T extends (...args: any[]) => any, I extends number> = Parameters<T>[I];

/**
 * The options that can be passed to `fs.createWriteStream`.
 *
 * This type represents the second argument to the `fs.createWriteStream` function, which
 * defines options such as encoding, flags, and other stream settings.
 *
 * @see https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
 *
 * @example
 * const options: WriteStreamOptions = { flags: 'a', encoding: 'utf8' };
 * const stream = fs.createWriteStream('file.txt', options);
 */
export type IWriteStreamOptions = TArgumentAtIndex<typeof fs.createWriteStream, 1>;

/**
 * The options that can be passed to `fs.createReadStream`.
 *
 * This type represents the second argument to the `fs.createReadStream` function, which
 * defines options such as encoding, flags, start, end, and other stream settings.
 *
 * @see https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
 *
 * @example
 * const options: ReadStreamOptions = { start: 0, end: 100, encoding: 'utf8' };
 * const stream = fs.createReadStream('file.txt', options);
 */
export type IReadStreamOptions = TArgumentAtIndex<typeof fs.createReadStream, 1>;

/**
 * Possible flags for file mode operations.
 *
 * @typedef TFileModeFlag
 * @type {'r' | 'r+' | 'w' | 'w+' | 'a' | 'a+' | 'ax' | 'ax+' | 'wx' | 'wx+'}
 * @description Represents the various file open modes. These flags determine how a file should be opened or created.
 *
 * - `'r'`: Open file for reading. An exception occurs if the file does not exist.
 * - `'r+'`: Open file for reading and writing. An exception occurs if the file does not exist.
 * - `'w'`: Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
 * - `'w+'`: Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
 * - `'a'`: Open file for appending. The file is created if it does not exist.
 * - `'a+'`: Open file for reading and appending. The file is created if it does not exist.
 * - `'ax'`: Like `'a'` but fails if the file exists.
 * - `'ax+'`: Like `'a+'` but fails if the file exists.
 * - `'wx'`: Like `'w'` but fails if the file exists.
 * - `'wx+'`: Like `'w+'` but fails if the file exists.
 */
export type TFileModeFlag = 'r' | 'r+' | 'w' | 'w+' | 'a' | 'a+' | 'ax' | 'ax+' | 'wx' | 'wx+';

/**
 * Options for configuring file access permissions.
 *
 * @interface IAccessOptions
 * @property {boolean} [read] - Permission to read the file.
 * @property {boolean} [write] - Permission to write to the file.
 * @property {boolean} [execute] - Permission to execute the file.
 * @description Specifies the access permissions for a file or directory.
 */
export interface IAccessOptions {
	read?: boolean;
	write?: boolean;
	execute?: boolean;
}

/**
 * Options for configuring file operations.
 *
 * @interface IFileOptions
 * @property {BufferEncoding} [encoding] - Encoding to use when reading or writing to the file.
 * @property {number} [mode] - The file's permission mode.
 * @property {TFileModeFlag} [flag] - The mode flag for opening the file.
 * @description Defines the options available when performing file operations like reading or writing.
 */
export interface IFileOptions {
	encoding?: BufferEncoding;
	mode?: number;
	flag?: TFileModeFlag;
}

/**
 * Options for creating directories.
 *
 * @interface IDirectoryOptions
 * @property {boolean} [recursive] - If true, all subdirectories will be created as necessary.
 * @property {number} [mode] - The directory's permission mode.
 * @description Provides options for directory creation, including whether to create parent directories as needed.
 */
export interface IDirectoryOptions {
	recursive?: boolean;
	mode?: number;
}

/**
 * Interface representing the events emitted by ReadStream.
 *
 * @interface IReadStreamEvents
 * @property {Buffer | string} data - Data read from the stream.
 * @property {void} end - Emitted when the stream ends.
 * @property {Error} error - Emitted when an error occurs in the stream.
 * @property {void} close - Emitted when the stream is closed.
 * @property {void} pause - Emitted when the stream is paused.
 * @property {void} resume - Emitted when the stream is resumed.
 * @description Defines the structure of events emitted by a ReadStream.
 */
export interface IReadStreamEvents {
	data: Buffer | string;
	end: void;
	error: Error;
	close: void;
	pause: void;
	resume: void;
}

/**
 * Interface representing the events emitted by WriteStream.
 *
 * @interface IWriteStreamEvents
 * @property {void} finish - Emitted when the writing is finished.
 * @property {Error} error - Emitted when an error occurs in the stream.
 * @property {void} close - Emitted when the stream is closed.
 * @property {void} drain - Emitted when the write buffer is emptied.
 * @description Defines the structure of events emitted by a WriteStream.
 */
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
 * @description Provides options for setting up a file or directory watcher, including whether to use polling and the polling interval.
 */
export interface IWatcherOptions {
	usePolling?: boolean;
	pollingInterval?: number;
}

/**
 * Types of events that can be emitted by FileWatcher.
 *
 * @typedef {'changed' | 'error'} IFileWatcherEvents
 * @description Events that can be emitted by a FileWatcher, such as when a file changes or when an error occurs.
 */
export type IFileWatcherEvents = 'changed' | 'error';

/**
 * Types of events that can be emitted by DirectoryWatcher.
 *
 * @typedef {'added' | 'removed' | 'changed' | 'error'} IDirectoryWatcherEvents
 * @description Events that can be emitted by a DirectoryWatcher, such as when a file is added, removed, changed, or an error occurs.
 */
export type IDirectoryWatcherEvents = 'added' | 'removed' | 'changed' | 'error';

//#endregion
