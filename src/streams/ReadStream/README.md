# ReadStream

## Introduction

The `ReadStream` class is a powerful and flexible solution for handling file reading operations in Node.js. Unlike the standard `fs.ReadStream` provided by Node.js, this class offers enhanced control over stream behavior, robust error handling, and additional features like flowing mode management and integration with custom writable streams. It is designed to be developer-friendly, making it easier to work with large files, stream data efficiently, and manage the lifecycle of file streams with precision.

This documentation will guide you through the usage of the `ReadStream` class, covering all its public methods, events, and providing numerous examples to help you get started.

## Key Features

- **Enhanced Control**: Easily manage the opening, closing, and destruction of streams with built-in timeout mechanisms.
- **Flowing Mode Management**: Switch between manual and automatic data consumption modes.
- **Event Handling**: Comprehensive event system for handling various stream events like `data`, `end`, `error`, `close`, `pause`, and `resume`.
- **Async Iterator Support**: Iterate over stream data using modern JavaScript async iterators.
- **Custom Stream Integration**: Seamlessly pipe data into both standard Node.js writable streams and custom `WriteStream` instances.
- **Debugging Support**: Optional debug mode for detailed logging of stream operations and errors.

## Usage Examples

### Basic Usage

```typescript
import ReadStream from './ReadStream';

const stream = new ReadStream('path/to/file.txt', true);

stream.on('data', (chunk) => {
  console.log('Received data chunk:', chunk);
});

stream.on('end', () => {
  console.log('Stream ended.');
});

stream.on('error', (err) => {
  console.error('Stream error:', err);
});

stream
  .open()
  .then(() => {
    console.log('Stream opened.');
  })
  .catch((err) => {
    console.error('Failed to open stream:', err);
  });
```

### Using Flowing Mode

```typescript
stream.enableFlowingMode(); // Automatically reads and emits data

// To pause the flowing mode
stream.disableFlowingMode();
```

### Using the Async Iterator

```typescript
for await (const chunk of stream) {
  console.log('Iterating through data chunk:', chunk);
}
```

### Piping to a Custom `WriteStream`

```typescript
import WriteStream from './WriteStream';

const writeStream = new WriteStream('path/to/output.txt');

stream.pipe(writeStream);

stream.open().catch((err) => console.error('Failed to open stream:', err));
```

## Public Methods

### `constructor(filePath: string, debug: boolean = false)`

Creates a new `ReadStream` instance.

- `filePath`: The path to the file to be read.
- `debug`: Optional flag to enable debug mode for detailed logging.

### `open(options: { encoding?: BufferEncoding; highWaterMark?: number } = {}, timeout: number = 30000): Promise<void>`

Opens the stream for reading. This method must be called before any data can be read or events can be triggered.

- `options`: Stream options such as encoding and highWaterMark.
- `timeout`: Optional timeout in milliseconds. If the stream doesn't open within this time, the promise will be rejected.

**Returns**: A promise that resolves when the stream is successfully opened.

**Example**:

```typescript
await stream.open({ encoding: 'utf-8' });
```

### `read(): Promise<Buffer | string | null>`

Reads data from the stream if it is not in flowing mode.

**Returns**: A promise that resolves with the data chunk or `null` if no data is available.

**Example**:

```typescript
const chunk = await stream.read();
console.log('Read chunk:', chunk);
```

### `pipe(destination: NodeJS.WritableStream | WriteStream, options?: { end?: boolean }): NodeJS.WritableStream | WriteStream`

Pipes the data from the read stream to a writable stream. This method supports both standard Node.js writable streams and custom `WriteStream` instances.

- `destination`: The writable stream to pipe the data into.
- `options`: Options for controlling the pipe process, such as whether to end the writable stream when the read stream ends.

**Returns**: The destination stream passed as an argument.

**Example**:

```typescript
stream.pipe(process.stdout);
```

### `enableFlowingMode(): void`

Enables flowing mode for the stream. In this mode, data is automatically read and emitted as `data` events.

**Example**:

```typescript
stream.enableFlowingMode();
```

### `disableFlowingMode(): void`

Disables flowing mode, allowing manual control over data reading.

**Example**:

```typescript
stream.disableFlowingMode();
```

### `isStreamOpen(): boolean`

Checks if the stream is currently open.

**Returns**: A boolean indicating if the stream is open.

**Example**:

```typescript
if (stream.isStreamOpen()) {
  console.log('Stream is open.');
}
```

### `close(timeout: number = 30000): Promise<void>`

Closes the read stream.

- `timeout`: Optional timeout in milliseconds. If the stream doesn't close within this time, the promise will be rejected.

**Returns**: A promise that resolves when the stream is successfully closed.

**Example**:

```typescript
await stream.close();
```

### `destroy(timeout: number = 30000): Promise<void>`

Destroys the read stream, releasing all resources.

- `timeout`: Optional timeout in milliseconds. If the stream doesn't destroy within this time, the promise will be rejected.

**Returns**: A promise that resolves when the stream is successfully destroyed.

**Example**:

```typescript
await stream.destroy();
```

### Async Iterator

The `ReadStream` class supports async iteration, allowing you to easily iterate over the data chunks.

**Example**:

```typescript
for await (const chunk of stream) {
  console.log('Iterating through data chunk:', chunk);
}
```

## Event Handling

### Supported Events

- `data`: Emitted when a chunk of data is available.
- `end`: Emitted when there is no more data to be consumed.
- `error`: Emitted if an error occurs during reading.
- `close`: Emitted when the stream is closed.
- `pause`: Emitted when the stream is paused.
- `resume`: Emitted when the stream is resumed.

### `on(event: EventType, listener: Function): this`

Adds a listener for the specified event.

- `event`: The event name.
- `listener`: The callback function to be invoked when the event is emitted.

**Example**:

```typescript
stream.on('data', (chunk) => {
  console.log('Received data chunk:', chunk);
});
```

### `off(event: EventType, listener: Function): this`

Removes a listener for the specified event.

- `event`: The event name.
- `listener`: The callback function that was previously added.

**Example**:

```typescript
stream.off('data', dataHandler);
```

## Advantages Over Node.js `fs.ReadStream`

- **Better Error Handling**: Built-in timeout handling and more granular control over stream lifecycle events.
- **Enhanced Flowing Mode Management**: Easily switch between manual and automatic data consumption modes.
- **Custom Stream Integration**: Seamlessly pipe data into both standard Node.js writable streams and custom `WriteStream` instances.
- **Debug Mode**: Optional detailed logging to assist in development and debugging.
- **Async Iteration**: Modern async iterator support for cleaner and more readable code when working with stream data.
