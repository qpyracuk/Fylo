//#region Import types
import type { IWatcherOptions, IDirectoryWatcherEvents } from '../../@types/general';
//#endregion

//#region Imports
import * as fs from 'fs';
import * as path from 'path';
import BaseWatcher from '../BaseWatcher';
//#endregion

/**
 * A class for watching changes in a directory.
 *
 * @class DirectoryWatcher
 * @extends {BaseWatcher}
 *
 * @description
 * This class provides functionality to watch for changes in a directory, including file additions,
 * removals, and modifications. It supports both polling and event-based directory watching.
 */
export default class DirectoryWatcher extends BaseWatcher {
	private previousFiles: Set<string> = new Set();
	private isInitialized: boolean = false;
	private pollingIntervalId: NodeJS.Timeout | null = null;

	/**
	 * Creates an instance of DirectoryWatcher.
	 *
	 * @param {string} directoryPath - The absolute path to the directory to be watched.
	 * @param {IWatcherOptions} [options] - Optional configuration for the watcher, including polling options.
	 *
	 * @throws {Error} If the provided path is not absolute or if the path does not point to a directory.
	 */
	constructor(directoryPath: string, options?: IWatcherOptions) {
		super(directoryPath, options);
		this.validateDirectoryPath(this.watchPath);
	}

	/**
	 * Starts watching the directory for changes.
	 *
	 * @description
	 * This method starts the watching process. Depending on the options provided, it can use either
	 * polling or event-based watching. The watcher will emit events for added, removed, or changed files/directories.
	 *
	 * @fires DirectoryWatcher#added
	 * @fires DirectoryWatcher#removed
	 * @fires DirectoryWatcher#changed
	 * @fires DirectoryWatcher#error
	 */
	public start(): void {
		if (this.usePolling) {
			this.pollDirectory();
		} else {
			this.initializeDirectoryState();

			const watcher = fs.watch(this.watchPath, (eventType, filename) => {
				if (filename) {
					const fullPath = path.join(this.watchPath, filename);
					if (eventType === 'rename') {
						this.handleRenameEvent(fullPath);
					} else if (eventType === 'change') {
						this.emit('changed', fullPath);
					}
				}
			});

			watcher.on('error', (error) => {
				this.emit('error', error);
				this.recoverWatcher();
			});

			this.setWatcher(watcher);
		}
	}

	/**
	 * Stops watching the directory.
	 *
	 * @description
	 * This method stops the watcher, whether it is using polling or event-based watching. It also clears
	 * any internal intervals used for polling.
	 */
	public stop(): void {
		if (this.pollingIntervalId) {
			clearInterval(this.pollingIntervalId);
			this.pollingIntervalId = null;
		}
		super.stop();
	}

	/**
	 * Polls the directory at regular intervals to detect changes.
	 *
	 * @private
	 *
	 * @description
	 * This method periodically checks the contents of the directory to detect any added or removed files or directories.
	 * It uses `setInterval` to regularly poll the directory and compare its current state with the previous state.
	 */
	private pollDirectory(): void {
		const poll = () => {
			fs.readdir(this.watchPath, (err, currentFiles) => {
				if (err) {
					this.emit('error', err);
					this.recoverWatcher();
					return;
				}

				const currentFilesSet = new Set(currentFiles);

				const addedFiles = Array.from(currentFilesSet).filter((file) => !this.previousFiles.has(file));
				const removedFiles = Array.from(this.previousFiles).filter((file) => !currentFilesSet.has(file));

				addedFiles.forEach((file) => this.emit('added', path.join(this.watchPath, file)));
				removedFiles.forEach((file) => this.emit('removed', path.join(this.watchPath, file)));

				this.previousFiles = currentFilesSet;
			});
		};

		this.pollingIntervalId = setInterval(poll, this.pollingInterval);
		poll();
	}

	/**
	 * Initializes the internal state of the directory being watched.
	 *
	 * @private
	 *
	 * @description
	 * This method scans the directory and saves its initial state, which helps in detecting changes
	 * such as added or removed files and directories after the watcher starts.
	 */
	private initializeDirectoryState(): void {
		if (this.isInitialized) return;

		fs.readdir(this.watchPath, (err, files) => {
			if (err) {
				this.emit('error', err);
				return;
			}

			files.forEach((file) => this.previousFiles.add(file));
			this.isInitialized = true;
		});
	}

	/**
	 * Handles rename events in the directory.
	 *
	 * @private
	 * @param {string} fullPath - The full path of the file or directory that was renamed.
	 *
	 * @description
	 * This method handles `rename` events by checking whether a file or directory was added or removed.
	 * It emits the appropriate event based on the current state of the directory.
	 */
	private handleRenameEvent(fullPath: string): void {
		fs.stat(fullPath, (err, stats) => {
			if (err) {
				if (err.code === 'ENOENT') {
					this.emit('removed', fullPath);
					this.previousFiles.delete(fullPath);
				} else {
					this.emit('error', err);
				}
			} else {
				if (stats.isFile() || stats.isDirectory()) {
					if (!this.previousFiles.has(fullPath)) {
						this.emit('added', fullPath);
						this.previousFiles.add(fullPath);
					}
				}
			}
		});
	}

	/**
	 * Attempts to recover the watcher in case of errors.
	 *
	 * @private
	 *
	 * @description
	 * This method stops the current watcher and tries to restart it after a short delay.
	 * This can be useful in scenarios where the watcher encounters temporary issues or loses connection to the directory.
	 */
	private recoverWatcher(): void {
		this.stop();
		setTimeout(() => {
			this.start();
		}, 1000); // Retry after 1 second
	}

	/**
	 * Adds a listener for the specified event.
	 *
	 * @param {'added'} event - The event to listen for when a file or directory is added.
	 * @param {(path: string) => void} listener - The callback function that handles the event.
	 * @returns {this} The current DirectoryWatcher instance, for chaining.
	 */
	public on(event: 'added', listener: (path: string) => void): this;

	/**
	 * Adds a listener for the specified event.
	 *
	 * @param {'removed'} event - The event to listen for when a file or directory is removed.
	 * @param {(path: string) => void} listener - The callback function that handles the event.
	 * @returns {this} The current DirectoryWatcher instance, for chaining.
	 */
	public on(event: 'removed', listener: (path: string) => void): this;

	/**
	 * Adds a listener for the specified event.
	 *
	 * @param {'changed'} event - The event to listen for when a file or directory is changed.
	 * @param {(path: string) => void} listener - The callback function that handles the event.
	 * @returns {this} The current DirectoryWatcher instance, for chaining.
	 */
	public on(event: 'changed', listener: (path: string) => void): this;

	/**
	 * Adds a listener for the specified event.
	 *
	 * @param {'error'} event - The event to listen for when an error occurs.
	 * @param {(error: Error) => void} listener - The callback function that handles the event.
	 * @returns {this} The current DirectoryWatcher instance, for chaining.
	 */
	public on(event: 'error', listener: (error: Error) => void): this;

	/**
	 * Adds a listener for the specified event.
	 *
	 * @param {IDirectoryWatcherEvents} event - The event to listen for.
	 * @param {(arg: string | Error) => void} listener - The callback function that handles the event.
	 * @returns {this} The current DirectoryWatcher instance, for chaining.
	 */
	public on(event: IDirectoryWatcherEvents, listener: ((arg: string) => void) | ((arg: Error) => void)): this {
		super.on(event, listener);
		return this;
	}

	/**
	 * Validates that the provided path is a directory.
	 *
	 * @protected
	 * @param {string} directoryPath - The path to validate.
	 *
	 * @throws {Error} If the path is not a directory or does not exist.
	 */
	protected validateDirectoryPath(directoryPath: string): void {
		const stats = fs.statSync(directoryPath);
		if (!stats.isDirectory()) {
			throw new Error(`The path ${directoryPath} is not a directory.`);
		}
	}
}
