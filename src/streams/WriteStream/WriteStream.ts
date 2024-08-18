//#region Import types
import type { IWriteStreamEvents, IWriteStreamOptions } from '../../@types/general';
//#endregion

//#region Imports
import * as fs from 'fs';
import { EventEmitter } from 'events';
import { allowedFlags, bufferEncodings } from '../../constants/genetal';
//#endregion

export default class WriteStream extends EventEmitter {
	//#region Private Fields

	/**
	 * The path to the file that will be written to.
	 */
	private filePath: string;

	/**
	 * The underlying Node.js WriteStream instance.
	 */
	private stream: fs.WriteStream | null = null;

	/**
	 * Flag indicating whether the stream is currently open.
	 */
	private isOpen: boolean = false;

	/**
	 * Flag for enabling debug mode. When enabled, additional logging will be performed.
	 */
	private debug: boolean;

	//#endregion

	//#region Constructor

	/**
	 * Constructs a new WriteStream instance.
	 *
	 * @param filePath - The path to the file where data will be written.
	 * @param debug - Optional flag to enable debug mode. If true, additional logs will be printed.
	 * @throws Will throw an error if the file path is invalid.
	 */
	constructor(filePath: string, debug: boolean = false) {
		super();
		if (!filePath || typeof filePath !== 'string') {
			throw new Error('Invalid file path provided.');
		}

		this.filePath = filePath;
		this.debug = debug || process.env.DEBUG_MODE === 'true';
	}

	//#endregion

	//#region Public Methods

	/**
	 * Opens the stream for writing. This method must be called before any data can be written.
	 *
	 * @param options - Optional stream options.
	 * @param timeout - Optional timeout in milliseconds. If the stream doesn't open within this time, the promise will be rejected.
	 * @returns A promise that resolves when the stream is successfully opened.
	 * @throws Will reject the promise if the stream is already open or if the stream fails to open.
	 */
	public open(options: IWriteStreamOptions = {}, timeout: number = 30000): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (this.isOpen) {
				return reject(new Error('Stream is already open.'));
			}

			this.log('Opening stream...');

			this.validateStreamOptions(options);

			this.stream = fs.createWriteStream(this.filePath, options);

			if (!this.stream) {
				return reject(new Error('Failed to create write stream.'));
			}

			this.setupStreamListeners(resolve, reject);

			this.withTimeout(Promise.resolve(), timeout, 'open').then(resolve).catch(reject);
		});
	}

	/**
	 * Writes a chunk of data to the stream.
	 *
	 * @param chunk - The data to write. This can be a Buffer or a string.
	 * @returns A promise that resolves when the data has been successfully written.
	 * @throws Will reject the promise if the stream is not open or if an error occurs during writing.
	 */
	public write(chunk: Buffer | string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (!this.isOpen || !this.stream) {
				return reject(new Error('Stream is not open.'));
			}

			const start = Date.now();
			const handleError = (err: Error | null | undefined) => {
				if (err) {
					return reject(new Error(`Error writing data: ${err.message}`));
				}
				this.log(`Write operation completed in ${Date.now() - start}ms.`);
				resolve();
			};

			const isWritable = this.stream.write(chunk, handleError);

			if (!isWritable) {
				this.stream.once('drain', () => {
					this.log(`Drain event after ${Date.now() - start}ms.`);
					resolve();
				});
			}
		});
	}

	/**
	 * Closes the stream.
	 *
	 * @param timeout - Optional timeout in milliseconds. If the stream doesn't close within this time, the promise will be rejected.
	 * @returns A promise that resolves when the stream is successfully closed.
	 * @throws Will reject the promise if the stream is not open or if an error occurs during closing.
	 */
	public close(timeout: number = 30000): Promise<void> {
		return this.handleStreamClosure('close', timeout);
	}

	/**
	 * Destroys the stream, making it no longer usable.
	 *
	 * @param timeout - Optional timeout in milliseconds. If the stream doesn't destroy within this time, the promise will be rejected.
	 * @returns A promise that resolves when the stream is successfully destroyed.
	 * @throws Will reject the promise if the stream is not open or if an error occurs during destruction.
	 */
	public destroy(timeout: number = 30000): Promise<void> {
		return this.handleStreamClosure('destroy', timeout);
	}

	/**
	 * Checks if the stream is currently open.
	 *
	 * @returns A boolean indicating if the stream is open.
	 */
	public isStreamOpen(): boolean {
		return this.isOpen;
	}

	/**
	 * Retrieves the underlying Node.js WriteStream.
	 *
	 * @returns The native Node.js WriteStream.
	 * @throws Will throw an error if the stream is not initialized.
	 */
	public getNativeStream(): fs.WriteStream {
		if (!this.stream) {
			throw new Error('Stream is not initialized.');
		}
		return this.stream;
	}

	//#endregion

	//#region Event Handling

	/**
	 * Adds a listener for the `finish` event.
	 * This event is emitted when all data has been flushed to the underlying system and the stream is closed.
	 *
	 * @param event - The event name (`finish`).
	 * @param listener - The callback function that will be invoked when the event is emitted.
	 * @returns A reference to the current instance for chaining.
	 */
	public on(event: 'finish', listener: () => void): this;

	/**
	 * Adds a listener for the `error` event.
	 * This event is emitted if an error occurs during writing to the stream.
	 *
	 * @param event - The event name (`error`).
	 * @param listener - The callback function that will be invoked with the error object when the event is emitted.
	 * @returns A reference to the current instance for chaining.
	 */
	public on(event: 'error', listener: (err: Error) => void): this;

	/**
	 * Adds a listener for the `close` event.
	 * This event is emitted when the stream is closed, either by calling `close()` or `destroy()`.
	 *
	 * @param event - The event name (`close`).
	 * @param listener - The callback function that will be invoked when the event is emitted.
	 * @returns A reference to the current instance for chaining.
	 */
	public on(event: 'close', listener: () => void): this;

	/**
	 * Adds a listener for the `drain` event.
	 * This event is emitted when the internal buffer is drained and the stream is ready to accept more data.
	 *
	 * @param event - The event name (`drain`).
	 * @param listener - The callback function that will be invoked when the event is emitted.
	 * @returns A reference to the current instance for chaining.
	 */
	public on(event: 'drain', listener: () => void): this;

	/**
	 * Generic method to add a listener for any supported event.
	 *
	 * @param event - The event name.
	 * @param listener - The callback function that will be invoked when the event is emitted.
	 * @returns A reference to the current instance for chaining.
	 */
	public on<K extends keyof IWriteStreamEvents>(event: K, listener: (arg: IWriteStreamEvents[K]) => void): this {
		return super.on(event, listener);
	}

	/**
	 * Removes a listener for the `finish` event.
	 *
	 * @param event - The event name (`finish`).
	 * @param listener - The callback function that was previously added as a listener.
	 * @returns A reference to the current instance for chaining.
	 */
	public off(event: 'finish', listener: () => void): this;

	/**
	 * Removes a listener for the `error` event.
	 *
	 * @param event - The event name (`error`).
	 * @param listener - The callback function that was previously added as a listener.
	 * @returns A reference to the current instance for chaining.
	 */
	public off(event: 'error', listener: (err: Error) => void): this;

	/**
	 * Removes a listener for the `close` event.
	 *
	 * @param event - The event name (`close`).
	 * @param listener - The callback function that was previously added as a listener.
	 * @returns A reference to the current instance for chaining.
	 */
	public off(event: 'close', listener: () => void): this;

	/**
	 * Removes a listener for the `drain` event.
	 *
	 * @param event - The event name (`drain`).
	 * @param listener - The callback function that was previously added as a listener.
	 * @returns A reference to the current instance for chaining.
	 */
	public off(event: 'drain', listener: () => void): this;

	/**
	 * Generic method to remove a listener for any supported event.
	 *
	 * @param event - The event name.
	 * @param listener - The callback function that was previously added as a listener.
	 * @returns A reference to the current instance for chaining.
	 */
	public off<K extends keyof IWriteStreamEvents>(event: K, listener: (arg: IWriteStreamEvents[K]) => void): this {
		return super.off(event, listener);
	}

	//#endregion

	//#region Private Methods

	/**
	 * Validates the provided stream options.
	 *
	 * @param options - The options to validate.
	 * @throws Will throw an error if any of the options are invalid.
	 */
	private validateStreamOptions(options?: IWriteStreamOptions) {
		if (typeof options === 'string') {
			if (!bufferEncodings.has(options)) {
				throw new Error(`Invalid encoding: ${options}. Allowed encodings are: ${[...bufferEncodings].join(', ')}.`);
			}
			return;
		}

		if (typeof options !== 'object' || options === null) {
			throw new Error('Options must be a non-null object.');
		}

		if (options.flags !== undefined && !allowedFlags.has(options.flags)) {
			throw new Error(`Invalid flag: ${options.flags}. Allowed flags are: ${[...allowedFlags].join(', ')}.`);
		}

		if (options.encoding !== undefined && !bufferEncodings.has(options.encoding)) {
			throw new Error(
				`Invalid encoding: ${options.encoding}. Allowed encodings are: ${[...bufferEncodings].join(', ')}.`,
			);
		}

		if (options.fd !== undefined && !(typeof options.fd === 'number' || typeof options.fd === 'object')) {
			throw new Error(`Invalid fd: ${String(options.fd)}. It must be a number or a FileHandle.`);
		}

		if (options.mode !== undefined && typeof options.mode !== 'number') {
			throw new Error(`Invalid mode: ${String(options.mode)}. It must be a number.`);
		}

		if (options.autoClose !== undefined && typeof options.autoClose !== 'boolean') {
			throw new Error(`Invalid autoClose: ${String(options.autoClose)}. It must be a boolean.`);
		}

		if (options.emitClose !== undefined && typeof options.emitClose !== 'boolean') {
			throw new Error(`Invalid emitClose: ${String(options.emitClose)}. It must be a boolean.`);
		}

		if (options.start !== undefined && typeof options.start !== 'number') {
			throw new Error(`Invalid start: ${String(options.start)}. It must be a number.`);
		}

		if (options.highWaterMark !== undefined && typeof options.highWaterMark !== 'number') {
			throw new Error(`Invalid highWaterMark: ${String(options.highWaterMark)}. It must be a number.`);
		}
	}

	/**
	 * Sets up the necessary event listeners for the underlying Node.js WriteStream.
	 *
	 * @param resolve - The function to call when the stream is successfully opened.
	 * @param reject - The function to call if an error occurs while opening the stream.
	 */
	private setupStreamListeners(resolve: () => void, reject: (err: Error) => void): void {
		if (!this.stream) {
			return reject(new Error('Stream is not initialized.'));
		}

		const handleStreamError = (err: NodeJS.ErrnoException) => {
			this.emit('error', err);

			// Attempt to close the stream after an error occurs
			this.close().catch((closeErr) => {
				this.logError('close after error', closeErr);
			});

			reject(new Error(`Error opening file: ${err.message}`));
		};

		this.stream.once('open', () => {
			this.isOpen = true;
			resolve();
		});

		this.stream.on('finish', () => this.emit('finish'));
		this.stream.on('error', handleStreamError);
		this.stream.on('close', () => {
			this.isOpen = false;
			this.emit('close');
		});
		this.stream.on('drain', () => this.emit('drain'));
	}

	/**
	 * Wraps a promise with a timeout mechanism.
	 *
	 * @param promise - The promise to wrap.
	 * @param timeout - The timeout in milliseconds.
	 * @param action - A description of the action being performed, used in error messages.
	 * @returns A promise that resolves or rejects based on the original promise or the timeout.
	 */
	private withTimeout<T>(promise: Promise<T>, timeout: number, action: string): Promise<T> {
		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				const error = new Error(`${action} timed out.`);
				this.logError(action, error);
				this.close().catch(() => {});
				reject(error);
			}, timeout);

			promise
				.then((result) => {
					clearTimeout(timeoutId);
					resolve(result);
				})
				.catch((error: Error) => {
					clearTimeout(timeoutId);
					reject(error);
				});
		});
	}

	/**
	 * Handles the process of closing or destroying the stream with a timeout.
	 *
	 * @param action - The action to perform ('close' or 'destroy').
	 * @param timeout - The timeout in milliseconds.
	 * @returns A promise that resolves when the action is completed.
	 * @throws Will reject the promise if the stream is not open or if an error occurs during the action.
	 */
	private handleStreamClosure(action: 'close' | 'destroy', timeout: number): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (!this.stream || !this.isOpen) {
				return reject(new Error(`Stream is not open or already ${action}ed.`));
			}

			this.log(`Starting stream ${action} process...`);

			const start = Date.now();
			const timeoutId = setTimeout(() => {
				const error = new Error(`Stream ${action} timed out.`);
				this.logError(action, error);
				reject(error);
			}, timeout);

			const onClose = () => {
				clearTimeout(timeoutId);
				this.isOpen = false;
				this.cleanupStream();
				this.log(`Stream ${action} completed in ${Date.now() - start}ms.`);
				resolve();
			};

			const onError = (err: NodeJS.ErrnoException) => {
				clearTimeout(timeoutId);
				this.cleanupStream();
				reject(new Error(`Error during stream ${action}: ${err.message}`));
			};

			if (action === 'close') {
				this.stream.end(onClose);
			} else {
				this.stream.destroy();
				this.stream.once('close', onClose);
			}

			this.stream.once('error', onError);
		});
	}

	/**
	 * Cleans up the stream by removing all listeners and resetting internal state.
	 */
	private cleanupStream(): void {
		if (this.stream) {
			try {
				this.stream.removeAllListeners();
				this.log('All listeners removed from stream.');
			} catch (err) {
				this.logError('Failed to remove listeners from stream', err);
			} finally {
				this.stream = null;
				this.isOpen = false;
				this.log('Stream reference cleared.');
			}
		}
	}

	/**
	 * Logs a message if debug mode is enabled.
	 *
	 * @param message - The message to log.
	 * @param level - The log level ('info', 'warn', or 'error'). Defaults to 'info'.
	 */
	private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
		if (this.debug) {
			const logMessage = `[ReadStream] [${level.toUpperCase()}]: ${message}`;
			switch (level) {
				case 'info':
					// eslint-disable-next-line no-console
					console.info(logMessage);
					break;
				case 'warn':
					// eslint-disable-next-line no-console
					console.warn(logMessage);
					break;
				case 'error':
					// eslint-disable-next-line no-console
					console.error(logMessage);
					break;
			}
		}
	}

	/**
	 * Logs an error message if debug mode is enabled.
	 *
	 * @param eventName - The name of the event or action where the error occurred.
	 * @param err - The error object or message.
	 */
	private logError(eventName: string, err: unknown): void {
		if (err instanceof Error) {
			this.log(`Error in ${eventName}: [${err.name} | ${err.message}]`, 'error');
		} else {
			this.log(`Error in ${eventName}: [${String(err)}]`, 'error');
		}
	}

	//#endregion
}
