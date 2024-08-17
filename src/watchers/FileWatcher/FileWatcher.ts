//#region Import types
import type { IWatcherOptions, IFileWatcherEvents } from '../../@types/general';
//#endregion

//#region Imports
import * as fs from 'fs';
import BaseWatcher from '../BaseWatcher';
//#endregion

/**
 * A class for watching changes on a single file.
 *
 * @class FileWatcher
 * @extends {BaseWatcher}
 *
 * @description
 * This class provides functionality to watch for changes, additions, or deletions of a single file.
 * It supports both polling and event-based file watching.
 */
export default class FileWatcher extends BaseWatcher {
	/**
	 * Creates an instance of FileWatcher.
	 *
	 * @param {string} filePath - The absolute path to the file to be watched.
	 * @param {IWatcherOptions} [options] - Optional configuration for the watcher, including polling options.
	 *
	 * @throws {Error} If the provided path is not absolute or if the path does not point to a file.
	 */
	constructor(filePath: string, options?: IWatcherOptions) {
		super(filePath, options);
		this.validateFilePath(this.watchPath);
	}

	/**
	 * Starts watching the file for changes.
	 *
	 * @description
	 * This method starts the watching process. Depending on the options provided,
	 * it can use either polling or event-based watching.
	 *
	 * @fires FileWatcher#changed
	 */
	public start(): void {
		if (this.usePolling) {
			fs.watchFile(this.watchPath, { interval: this.pollingInterval }, (curr, prev) => {
				if (curr.mtime !== prev.mtime) {
					/**
					 * Emitted when the file changes.
					 *
					 * @event FileWatcher#changed
					 * @type {string}
					 * @property {string} path - The path of the changed file.
					 */
					this.emit('changed', this.watchPath);
				}
			});
		} else {
			const watcher = fs.watch(this.watchPath, (eventType) => {
				if (eventType === 'change') {
					this.emit('changed', this.watchPath);
				}
			});
			this.setWatcher(watcher);
		}
	}

	/**
	 * Adds a listener for the specified event.
	 *
	 * @param {'changed'} event - The event to listen for when the file changes.
	 * @param {(path: string) => void} listener - The callback function that handles the event.
	 * @returns {this} The current FileWatcher instance, for chaining.
	 *
	 * @example
	 * fileWatcher.on('changed', (path) => {
	 *   console.log(`File changed: ${path}`);
	 * });
	 */
	public on(event: 'changed', listener: (path: string) => void): this;

	/**
	 * Adds a listener for the specified event.
	 *
	 * @param {'error'} event - The event to listen for when an error occurs.
	 * @param {(error: Error) => void} listener - The callback function that handles the event.
	 * @returns {this} The current FileWatcher instance, for chaining.
	 *
	 * @example
	 * fileWatcher.on('error', (error) => {
	 *   console.error(`Error: ${error.message}`);
	 * });
	 */
	public on(event: 'error', listener: (error: Error) => void): this;

	/**
	 * Adds a listener for the specified event.
	 *
	 * @param {IFileWatcherEvents} event - The event to listen for.
	 * @param {(arg: string | Error) => void} listener - The callback function that handles the event.
	 * @returns {this} The current FileWatcher instance, for chaining.
	 */
	public on(event: IFileWatcherEvents, listener: ((arg: string) => void) | ((arg: Error) => void)): this {
		super.on(event, listener);
		return this;
	}

	/**
	 * Validates that the provided path is a file.
	 *
	 * @protected
	 * @param {string} filePath - The path to validate.
	 *
	 * @throws {Error} If the path is not a file or does not exist.
	 */
	protected validateFilePath(filePath: string): void {
		const stats = fs.statSync(filePath);
		if (!stats.isFile()) {
			throw new Error(`The path ${filePath} is not a file.`);
		}
	}
}
