import * as fs from 'fs';

import { EventEmitter } from 'events';
import { default as WriteStream } from '../WriteStream/WriteStream';

type EventType = 'data' | 'end' | 'error' | 'close' | 'pause' | 'resume';

interface ReadStreamEvents {
	data: Buffer | string;
	end: void;
	error: Error;
	close: void;
	pause: void;
	resume: void;
}

type EventHandlers = {
	data: (chunk: Buffer | string) => void | Promise<void>;
	end: () => void | Promise<void>;
	error: (err: Error) => void | Promise<void>;
	close: () => void | Promise<void>;
	pause: () => void | Promise<void>;
	resume: () => void | Promise<void>;
};

/**
 * The `ReadStream` class provides a convenient interface for reading files as a stream.
 *
 * This class allows you to manage the file reading process with support for various reading modes,
 * such as regular reading, streaming (flowing mode), and also provides flexible event handling
 * during the reading process. The class is aimed at developers who need a reliable solution
 * for working with file streams in Node.js.
 *
 * ### Key Features:
 *
 * - **Event Handling:** Supports events such as `data`, `end`, `error`, `close`, `pause`, `resume`.
 * - **Flowing Mode:** Automatically receives data from a file as it becomes available.
 * - **Resource Management:** Allows setting timeouts for stream open and close operations.
 * - **Async Iterator:** Convenient way to iterate over file data using `for await...of`.
 * - **Extended Debugging Capabilities:** Logs events and errors to facilitate debugging.
 *
 * ### When to Use:
 *
 * - When you need to read a large file in chunks, avoiding loading the entire file into memory.
 * - For real-time processing of file data, such as when streaming data between streams.
 * - In situations where it is important to control the state and lifecycle of the file stream,
 *   including error handling and completion.
 *
 * ### Usage Examples:
 *
 * ```typescript
 * const stream = new ReadStream('path/to/file.txt', true);
 *
 * stream.on('data', (chunk) => {
 *   console.log('Received data chunk:', chunk);
 * });
 *
 * stream.open();
 *
 * // Using the async iterator
 * for await (const chunk of stream) {
 *   console.log('Iterating over data:', chunk);
 * }
 *
 * stream.close();
 * ```
 *
 * This class is an ideal choice for working with file streams in Node.js when flexible control over
 * the reading process and data handling is required.
 */
export default class ReadStream extends EventEmitter {
	//#region Private Fields

	/**
	 * The path to the file to be read.
	 */
	private filePath: string;

	/**
	 * The underlying Node.js ReadStream instance.
	 */
	private stream: fs.ReadStream | null = null;

	/**
	 * Flag indicating whether the stream is currently open.
	 */
	private isOpen: boolean = false;

	/**
	 * Flag indicating whether the stream is in flowing mode.
	 */
	private isFlowing: boolean = false;

	/**
	 * Handlers for various stream events.
	 */
	private handlers: { [K in EventType]: Array<EventHandlers[K]> } = {
		data: [],
		end: [],
		error: [],
		close: [],
		pause: [],
		resume: [],
	};

	/**
	 * Flag for enabling debug mode. When enabled, additional logging will be performed.
	 */
	private debug: boolean;

	//#endregion

	//#region Constructor

	/**
	 * Constructs a new ReadStream instance.
	 *
	 * @param filePath - The path to the file to be read.
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
	 * Opens the stream for reading the file. This method must be called before any data can be read.
	 *
	 * @param options - Optional stream options, such as encoding and highWaterMark.
	 * @param timeout - Optional timeout in milliseconds. If the stream doesn't open within this time, the promise will be rejected.
	 * @returns A promise that resolves when the stream is successfully opened.
	 * @throws Will reject the promise if the stream is already open or if the stream fails to open.
	 */
	public open(
		options: { encoding?: BufferEncoding; highWaterMark?: number } = {},
		timeout: number = 30000,
	): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (this.isOpen) {
				return reject(new Error('Stream is already open.'));
			}

			this.log('Opening stream...');

			this.validateStreamOptions(options);

			this.stream = fs.createReadStream(this.filePath, options);

			if (!this.stream) {
				return reject(new Error('Failed to create read stream.'));
			}

			this.setupStreamListeners(resolve, reject);

			this.withTimeout(
				new Promise<void>((resolve) => {
					if (this.stream) {
						this.stream.once('open', () => {
							this.isOpen = true;
							resolve();
						});
					}
				}),
				timeout,
				'open',
			)
				.then(resolve)
				.catch(reject);
		});
	}

	/**
	 * Reads data from the stream if it is not in flowing mode.
	 *
	 * @returns A promise that resolves with a chunk of data from the stream or null if no data is available.
	 * @throws Will reject the promise if the stream is not open, is in flowing mode, or is not initialized.
	 */
	public read(): Promise<Buffer | string | null> {
		return new Promise<Buffer | string | null>((resolve, reject) => {
			if (!this.isOpen || !this.stream || this.isFlowing) {
				return reject(new Error('Stream is either not open or in flowing mode.'));
			}

			this.stream.once('readable', () => {
				try {
					const chunk: Buffer | string | null = this.stream?.read() as Buffer | string | null;
					resolve(chunk);
				} catch (err) {
					reject(new Error(`Error reading data: ${(err as Error).message}`));
				}
			});

			this.stream.once('error', (err: NodeJS.ErrnoException) => {
				reject(new Error(`Error reading data: ${err.message}`));
			});
		});
	}

	/**
	 * Pipes the read stream to a writable stream.
	 *
	 * This method allows redirecting data from the current read stream to the specified write stream.
	 * Both standard Node.js writable streams and custom `WriteStream` instances are supported.
	 *
	 * If a custom `WriteStream` is passed as the `destination`, the method checks if the stream is open.
	 * If the stream is not yet open, it will be automatically opened. After that, the data will be redirected to this stream.
	 *
	 * If a standard Node.js writable stream is passed as the `destination`, the data will be redirected to it directly.
	 *
	 * @param destination - The writable stream to which data will be redirected.
	 * Can be either a standard Node.js writable stream or a custom `WriteStream`.
	 * @param options - Options to control the piping process, such as whether to end the writable stream when the read stream ends.
	 * @returns The writable stream passed as an argument.
	 * @throws Will throw an error if the read stream is not open, if the `destination`
	 * is not a valid writable stream, or if the custom `WriteStream` fails to open.
	 */
	public pipe(
		destination: NodeJS.WritableStream | WriteStream,
		options?: { end?: boolean },
	): NodeJS.WritableStream | WriteStream {
		if (!this.isOpen || !this.stream) {
			throw new Error('Stream is not open.');
		}

		const { end = true } = options || {};

		if (destination instanceof WriteStream) {
			if (!destination.isStreamOpen()) {
				destination.open().catch((err: Error) => {
					this.logError('pipe', new Error(`Failed to open destination stream: ${err.message}`));
					throw err;
				});
			}

			this.stream.pipe(destination.getNativeStream(), { end });

			this.stream.on('error', (err: Error) => {
				destination.emit('error', err);
			});

			if (end) {
				this.stream.on('end', () => {
					destination.close().catch((err: Error) => {
						this.logError('pipe', new Error(`Failed to close destination stream: ${err.message}`));
					});
				});
			}
		} else if (typeof destination.write === 'function') {
			this.stream.pipe(destination, { end });

			this.stream.on('error', (err: Error) => {
				destination.emit('error', err);
			});

			if (end) {
				this.stream.on('end', () => {
					destination.end();
				});
			}
		} else {
			throw new Error('Invalid writable stream provided.');
		}

		return destination;
	}

	/**
	 * Enables flowing mode for the stream.
	 *
	 * In flowing mode, the stream automatically reads data and emits it as `data` events.
	 * Use this mode when you want to handle data as it becomes available.
	 */
	public enableFlowingMode(): void {
		this.setFlowingMode(true);
	}

	/**
	 * Disables flowing mode for the stream.
	 *
	 * Disables automatic reading of data from the stream. Useful when you want to temporarily pause data reading.
	 */
	public disableFlowingMode(): void {
		this.setFlowingMode(false);
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
	 * Closes the read stream.
	 *
	 * @param timeout - Optional timeout in milliseconds. If the stream doesn't close within this time, the promise will be rejected.
	 * @returns A promise that resolves when the stream is successfully closed.
	 * @throws Will reject the promise if the stream is not open or if an error occurs during closing.
	 */
	public close(timeout: number = 30000): Promise<void> {
		return this.handleStreamClosure('close', timeout);
	}

	/**
	 * Destroys the read stream, releasing all resources.
	 *
	 * @param timeout - Optional timeout in milliseconds. If the stream doesn't destroy within this time, the promise will be rejected.
	 * @returns A promise that resolves when the stream is successfully destroyed.
	 * @throws Will reject the promise if the stream is not open or if an error occurs during destruction.
	 */
	public destroy(timeout: number = 30000): Promise<void> {
		return this.handleStreamClosure('destroy', timeout);
	}

	//#endregion

	//#region Private Methods

	/**
	 * Validates the provided stream options.
	 *
	 * @param options - The options to validate.
	 * @throws Will throw an error if any of the options are invalid.
	 */
	private validateStreamOptions(options: { encoding?: BufferEncoding; highWaterMark?: number }) {
		if (options.highWaterMark !== undefined && typeof options.highWaterMark !== 'number') {
			throw new Error('Invalid highWaterMark value.');
		}
		if (options.encoding !== undefined && typeof options.encoding !== 'string') {
			throw new Error('Invalid encoding value.');
		}
	}

	/**
	 * Sets up the necessary event listeners for the underlying Node.js ReadStream.
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

			this.close().catch((closeErr) => {
				this.logError('close after error', closeErr);
			});

			reject(new Error(`Error opening file: ${err.message}`));
		};

		this.stream.once('open', () => {
			this.isOpen = true;
			resolve();
		});

		this.stream.on('data', (chunk: Buffer | string) => {
			if (this.isFlowing) {
				void this.executeHandlers('data', chunk);
			}
		});

		this.stream.on('end', () => {
			this.executeHandlers('end')
				.then(() => this.close())
				.catch(() => this.close());
		});

		this.stream.on('error', handleStreamError);

		this.stream.on('close', () => {
			this.isOpen = false;
			this.emit('close');
		});

		this.stream.on('pause', () => this.emit('pause'));
		this.stream.on('resume', () => this.emit('resume'));
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
				this.stream?.close(onClose);
			} else {
				this.stream?.destroy();
				this.stream?.once('close', onClose);
			}

			this.stream?.once('error', onError);
		});
	}

	/**
	 * Executes all handlers for the specified event.
	 *
	 * @param event - The type of event whose handlers need to be executed.
	 * @param arg - The argument that will be passed to the handlers.
	 */
	private async executeHandlers<K extends EventType>(event: K, arg?: Parameters<EventHandlers[K]>[0]): Promise<void> {
		if (this.handlers[event].length === 0) {
			if (this.debug) {
				this.log(`No handlers registered for event "${event}".`);
			}
			return;
		}

		this.log(`Executing handlers for event "${event}".`);

		await Promise.all(
			this.handlers[event].map(async (handler) => {
				try {
					await handler(arg as (string | Buffer) & Error);
				} catch (err) {
					this.logError(`Handler for event "${event}" failed`, err);
				}
			}),
		);
	}

	/**
	 * Enables or disables flowing mode for the stream.
	 *
	 * @param enable - `true` to enable flowing mode, `false` to disable it.
	 */
	private setFlowingMode(enable: boolean): void {
		if (this.isOpen && this.stream) {
			this.isFlowing = enable;
			if (enable) {
				this.stream.resume();
				this.log('Flowing mode enabled.');
			} else {
				this.stream.pause();
				this.log('Flowing mode disabled.');
			}
		} else {
			this.log('Flowing mode change ignored: stream is not open.');
		}
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
			switch (level) {
				case 'info':
					// eslint-disable-next-line no-console
					console.info(`[ReadStream] [${level.toUpperCase()}]: ${message}`);
					break;
				case 'warn':
					// eslint-disable-next-line no-console
					console.warn(`[ReadStream] [${level.toUpperCase()}]: ${message}`);
					break;
				case 'error':
					// eslint-disable-next-line no-console
					console.error(`[ReadStream] [${level.toUpperCase()}]: ${message}`);
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

	//#endregion

	//#region Event Handling

	/**
	 * Adds a listener for the `data` event.
	 * This event is emitted when a chunk of data is available to be read.
	 *
	 * @param event - The event name (`data`).
	 * @param listener - The callback function that will be invoked when the event is emitted.
	 * @returns A reference to the current instance for chaining.
	 */
	public on(event: 'data', listener: (chunk: Buffer | string) => void): this;

	/**
	 * Adds a listener for the `end` event.
	 * This event is emitted when there is no more data to be consumed from the stream.
	 *
	 * @param event - The event name (`end`).
	 * @param listener - The callback function that will be invoked when the event is emitted.
	 * @returns A reference to the current instance for chaining.
	 */
	public on(event: 'end', listener: () => void): this;

	/**
	 * Adds a listener for the `error` event.
	 * This event is emitted if an error occurs during reading from the stream.
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
	 * Adds a listener for the `pause` event.
	 * This event is emitted when the stream is paused.
	 *
	 * @param event - The event name (`pause`).
	 * @param listener - The callback function that will be invoked when the event is emitted.
	 * @returns A reference to the current instance for chaining.
	 */
	public on(event: 'pause', listener: () => void): this;

	/**
	 * Adds a listener for the `resume` event.
	 * This event is emitted when the stream is resumed.
	 *
	 * @param event - The event name (`resume`).
	 * @param listener - The callback function that will be invoked when the event is emitted.
	 * @returns A reference to the current instance for chaining.
	 */
	public on(event: 'resume', listener: () => void): this;

	/**
	 * Generic method to add a listener for any supported event.
	 *
	 * @param event - The event name.
	 * @param listener - The callback function that will be invoked when the event is emitted.
	 * @returns A reference to the current instance for chaining.
	 */
	public on<K extends keyof ReadStreamEvents>(event: K, listener: (arg: ReadStreamEvents[K]) => void): this {
		return super.on(event, listener);
	}

	/**
	 * Removes a listener for the `data` event.
	 *
	 * @param event - The event name (`data`).
	 * @param listener - The callback function that was previously added as a listener.
	 * @returns A reference to the current instance for chaining.
	 */
	public off(event: 'data', listener: (chunk: Buffer | string) => void): this;

	/**
	 * Removes a listener for the `end` event.
	 *
	 * @param event - The event name (`end`).
	 * @param listener - The callback function that was previously added as a listener.
	 * @returns A reference to the current instance for chaining.
	 */
	public off(event: 'end', listener: () => void): this;

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
	 * Removes a listener for the `pause` event.
	 *
	 * @param event - The event name (`pause`).
	 * @param listener - The callback function that was previously added as a listener.
	 * @returns A reference to the current instance for chaining.
	 */
	public off(event: 'pause', listener: () => void): this;

	/**
	 * Removes a listener for the `resume` event.
	 *
	 * @param event - The event name (`resume`).
	 * @param listener - The callback function that was previously added as a listener.
	 * @returns A reference to the current instance for chaining.
	 */
	public off(event: 'resume', listener: () => void): this;

	/**
	 * Generic method to remove a listener for any supported event.
	 *
	 * @param event - The event name.
	 * @param listener - The callback function that was previously added as a listener.
	 * @returns A reference to the current instance for chaining.
	 */
	public off<K extends keyof ReadStreamEvents>(event: K, listener: (arg: ReadStreamEvents[K]) => void): this {
		return super.off(event, listener);
	}

	//#endregion

	//#region Async Iterator

	/**
	 * Async iterator for the stream.
	 *
	 * Allows iterating over the stream data using `for await...of`.
	 *
	 * @returns An async generator that yields chunks of stream data.
	 * @throws Will throw an error if the stream is closed or destroyed.
	 */
	public async *[Symbol.asyncIterator](): AsyncGenerator<Buffer | string, void, undefined> {
		while (this.isOpen) {
			if (!this.stream) {
				this.log('Stream is closed or destroyed.');
				return;
			}

			try {
				yield await new Promise<Buffer | string>((resolve, reject) => {
					this.stream?.once('data', resolve);
					this.stream?.once('error', reject);
				});
			} catch (err) {
				this.logError('Error while reading data in async iterator', err);
				return;
			}
		}
	}

	//#endregion
}
