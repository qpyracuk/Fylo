//#region Import types
import type { IWatcherOptions } from '../@types/general';
//#endregion

//#region Imports
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
//#endregion

/**
 * Base class for file and directory watchers.
 *
 * @class BaseWatcher
 * @extends {EventEmitter}
 *
 * @description
 * This class provides the core functionality for creating file and directory watchers.
 * It should be extended by subclasses to implement specific watch behaviors.
 */
export default class BaseWatcher extends EventEmitter {
	/** @protected {string} The path to be watched. */
	protected watchPath: string;

	/** @protected {boolean} Flag indicating whether polling should be used. */
	protected usePolling: boolean;

	/** @protected {number} Interval for polling in milliseconds. */
	protected pollingInterval: number;

	/** @protected {fs.FSWatcher | null} The current watcher instance, or null if not set. */
	protected watcher: fs.FSWatcher | null = null;

	/** @protected {boolean} Indicates whether the watcher is currently active. */
	protected isWatching: boolean = false;

	/**
	 * Creates an instance of BaseWatcher.
	 *
	 * @param {string} watchPath - The absolute path to the file or directory to be watched.
	 * @param {IWatcherOptions} [options] - Optional configuration for the watcher.
	 *
	 * @throws {Error} If the provided path is not absolute.
	 */
	constructor(watchPath: string, options?: IWatcherOptions) {
		super();

		this.watchPath = path.normalize(watchPath);
		this.usePolling = options?.usePolling ?? false;
		this.pollingInterval = options?.pollingInterval ?? 500;

		// Validate and check the provided path
		this.validatePath(this.watchPath);
		this.checkPathExists();
	}

	/**
	 * Starts the watching process.
	 *
	 * @description
	 * This method should be implemented by subclasses to start the actual watching process.
	 *
	 * @throws {Error} Always throws an error to enforce subclass implementation.
	 */
	public start(): void {
		throw new Error('start() method must be implemented by subclasses');
	}

	/**
	 * Stops the watching process.
	 *
	 * @description
	 * This method stops the watcher and clears any active watcher instance.
	 * Emits a 'stopped' event when the watcher is stopped.
	 */
	public stop(): void {
		if (this.isWatching && this.watcher) {
			this.watcher.close();
			this.watcher = null;
			this.isWatching = false;
			this.emit('stopped');
		}
	}

	/**
	 * Handles errors that occur during the watching process.
	 *
	 * @protected
	 * @param {NodeJS.ErrnoException} err - The error object.
	 *
	 * @description
	 * This method emits an 'error' event with a more descriptive error message based on the error code.
	 */
	protected handleError(err: NodeJS.ErrnoException): void {
		switch (err.code) {
			case 'ENOENT':
				this.emit('error', new Error(`Path not found: ${this.watchPath}`));
				break;
			case 'EACCES':
				this.emit('error', new Error(`Permission denied: ${this.watchPath}`));
				break;
			default:
				this.emit('error', new Error(`An error occurred: ${err.message}`));
				break;
		}
	}

	/**
	 * Validates that the provided path is non-empty and absolute.
	 *
	 * @protected
	 * @param {string} targetPath - The path to validate.
	 *
	 * @throws {Error} If the path is empty or not absolute.
	 */
	protected validatePath(targetPath: string): void {
		if (!targetPath) {
			throw new Error('Path must be provided.');
		}

		if (!path.isAbsolute(targetPath)) {
			throw new Error('Provided path must be absolute.');
		}
	}

	/**
	 * Checks if the provided path exists and is accessible.
	 *
	 * @protected
	 *
	 * @throws {Error} If the path does not exist or is not accessible.
	 */
	protected checkPathExists(): void {
		try {
			fs.accessSync(this.watchPath, fs.constants.F_OK);
		} catch (err) {
			this.handleError(err as NodeJS.ErrnoException);
			throw new Error(`The path ${this.watchPath} does not exist or is not accessible.`);
		}
	}

	/**
	 * Sets the current watcher instance and starts watching.
	 *
	 * @protected
	 * @param {fs.FSWatcher} watcher - The FSWatcher instance to be set.
	 *
	 * @description
	 * If a watcher is already active, it will be stopped before setting the new one.
	 */
	protected setWatcher(watcher: fs.FSWatcher): void {
		if (this.isWatching) {
			this.stop(); // Stop the previous watcher if it exists
		}
		this.watcher = watcher;
		this.isWatching = true;
	}
}
