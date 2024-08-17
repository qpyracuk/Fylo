# `WriteStream`

## Introduction

The `WriteStream` class is a powerful extension of Node.js's native `fs.WriteStream`, offering enhanced control, robust error handling, and additional features that make it easier to manage file writing operations. Whether you're dealing with large files, handling multiple write operations, or integrating with custom read streams, `WriteStream` provides a flexible and developer-friendly solution.

This documentation will guide you through the usage of the `WriteStream` class, detailing all its public methods, events, and offering examples to help you get started.

## Key Features

- **Enhanced Control**: Easily manage the opening, writing, and closing of streams with built-in timeout mechanisms.
- **Event Handling**: A comprehensive event system that includes `finish`, `error`, `close`, and `drain` events.
- **Custom Stream Integration**: Seamlessly integrate with custom read streams.
- **Debugging Support**: Optional debug mode for detailed logging of stream operations and errors.
- **Error Resilience**: Robust error handling ensures that your application can gracefully handle failures during write operations.

## Usage Examples

### Basic Usage

```typescript
import WriteStream from './WriteStream';

const stream = new WriteStream('path/to/output.txt', true);

stream.on('finish', () => {
  console.log('Stream finished writing.');
});

stream.on('error', (err) => {
  console.error('Stream error:', err);
});

stream
  .open()
  .then(() => {
    return stream.write('Hello, world!');
  })
  .then(() => {
    return stream.close();
  })
  .catch((err) => {
    console.error('Failed to write to stream:', err);
  });
```

### Handling `drain` Event

```typescript
stream.on('drain', () => {
  console.log('Stream is ready for more data.');
});

stream.write('Some large chunk of data...').catch((err) => {
  console.error('Failed to write data:', err);
});
```

### Piping from a Custom Read Stream

```typescript
import ReadStream from './ReadStream';

const readStream = new ReadStream('path/to/input.txt');
const writeStream = new WriteStream('path/to/output.txt');

readStream.pipe(writeStream);

readStream.open().catch((err) => console.error('Failed to open read stream:', err));
writeStream.open().catch((err) => console.error('Failed to open write stream:', err));
```

## Public Methods

### `constructor(filePath: string, debug: boolean = false)`

Creates a new `WriteStream` instance.

- `filePath`: The path to the file where data will be written.
- `debug`: Optional flag to enable debug mode for detailed logging.

### `open(options: { encoding?: BufferEncoding; highWaterMark?: number } = {}, timeout: number = 30000): Promise<void>`

Opens the stream for writing. This method must be called before any data can be written.

- `options`: Optional stream options such as encoding and highWaterMark.
- `timeout`: Optional timeout in milliseconds. If the stream doesn't open within this time, the promise will be rejected.

**Returns**: A promise that resolves when the stream is successfully opened.

**Example**:

```typescript
await stream.open({ encoding: 'utf-8' });
```

### `write(chunk: Buffer | string): Promise<void>`

Writes a chunk of data to the stream.

**Returns**: A promise that resolves when the data has been successfully written.

**Example**:

```typescript
await stream.write('Hello, world!');
```

### `close(timeout: number = 30000): Promise<void>`

Closes the stream.

- `timeout`: Optional timeout in milliseconds. If the stream doesn't close within this time, the promise will be rejected.

**Returns**: A promise that resolves when the stream is successfully closed.

**Example**:

```typescript
await stream.close();
```

### `destroy(timeout: number = 30000): Promise<void>`

Destroys the stream, making it no longer usable.

- `timeout`: Optional timeout in milliseconds. If the stream doesn't destroy within this time, the promise will be rejected.

**Returns**: A promise that resolves when the stream is successfully destroyed.

**Example**:

```typescript
await stream.destroy();
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

### `getNativeStream(): fs.WriteStream`

Retrieves the underlying Node.js `WriteStream`.

**Returns**: The native Node.js `WriteStream`.

**Example**:

```typescript
const nativeStream = stream.getNativeStream();
nativeStream.write('Writing directly to native stream');
```

## Event Handling

### Supported Events

- `finish`: Emitted when all data has been flushed to the underlying system and the stream is closed.
- `error`: Emitted if an error occurs during writing to the stream.
- `close`: Emitted when the stream is closed, either by calling `close()` or `destroy()`.
- `drain`: Emitted when the internal buffer is drained and the stream is ready to accept more data.

### `on(event: EventType, listener: Function): this`

Adds a listener for the specified event.

- `event`: The event name.
- `listener`: The callback function to be invoked when the event is emitted.

**Example**:

```typescript
stream.on('finish', () => {
  console.log('Stream finished writing.');
});
```

### `off(event: EventType, listener: Function): this`

Removes a listener for the specified event.

- `event`: The event name.
- `listener`: The callback function that was previously added.

**Example**:

```typescript
stream.off('finish', finishHandler);
```

## Advantages Over Node.js `fs.WriteStream`

- **Timeout Handling**: Built-in timeout mechanisms for opening, writing, and closing the stream.
- **Enhanced Event System**: Additional events and better error handling.
- **Custom Stream Integration**: Supports seamless piping with custom read streams.
- **Debug Mode**: Optional detailed logging to assist in development and debugging.
- **Error Resilience**: Automatically handles errors during write operations, including stream cleanup.
