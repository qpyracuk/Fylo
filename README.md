# Fylo: A Versatile Library for File and Stream Management in Node.js

![npm](https://img.shields.io/npm/v/fylo) ![npm downloads](https://img.shields.io/npm/dm/fylo)
![npm license](https://img.shields.io/npm/l/fylo)

Fylo is a powerful library designed to make file system operations in Node.js convenient, fast, and secure. Supporting
Node.js versions 8.16.0 and above, Fylo is ideal for developers working with both modern and legacy versions of the
platform. If you need to ensure reliable file and directory operations on older systems, Fylo will be your indispensable
tool.

## Table of Contents

- [About the Library](#about-the-library)
- [Working with Files and Directories](#working-with-files-and-directories)
  - [File Management](#file-management)
    - [Checking File Existence](#checking-file-existence)
    - [Reading a File](#reading-a-file)
    - [Writing to a File](#writing-to-a-file)
    - [Renaming a File](#renaming-a-file)
    - [Deleting a File](#deleting-a-file)
  - [Directory Management](#directory-management)
    - [Creating a Directory](#creating-a-directory)
    - [Deleting a Directory](#deleting-a-directory)
    - [Reading Directory Contents](#reading-directory-contents)
    - [Clearing a Directory](#clearing-a-directory)
- [Reading and Writing Streams](#reading-and-writing-streams)
  - [Reading Data (ReadStream)](#reading-data-readstream)
  - [Writing Data (WriteStream)](#writing-data-writestream)
- [File and Directory Watchers](#file-and-directory-watchers)
  - [File Watcher (FileWatcher)](#file-watcher-filewatcher)
  - [Directory Watcher (DirectoryWatcher)](#directory-watcher-directorywatcher)
- [License](#license)
- [Author](#author)
- [Reporting Issues](#reporting-issues)
- [Support the Author](#support-the-author)
- [Conclusion](#conclusion)

## About the Library

The development of Fylo started with a real-world challenge: creating software for IoT controllers running Node.js
version 8.16.0. We encountered the problem of many modern libraries being incompatible with this version of the
platform. Fylo was created to solve this problem, offering a powerful, convenient, and reliable tool for working with
files and streams, even supporting outdated Node.js versions.

Fylo is a library that allows you to effortlessly manage files and directories, as well as work with reading and writing
streams, ensuring maximum performance with minimal resource usage. With Fylo, your code becomes cleaner, simpler, and
more reliable.

## Working with Files and Directories

Fylo offers a complete set of functions for working with files and directories. Whether you need to check file
existence, read its contents, or create a new directory, Fylo provides simple and intuitive methods.

### File Management

#### Checking File Existence

The `fileExists` method allows you to instantly check whether a file exists at a given path. This is particularly useful
for operations that require a preliminary check of file availability.

Fylo provides two versions of this method:

1. Asynchronous version `fileExists`.
2. Synchronous version `fileExistsSync`.

**Parameters:**

- `path` (string): The path to the file that needs to be checked.

**Return Value:**

- `boolean`: Returns `true` if the file exists, and `false` otherwise.

##### TypeScript

```typescript
import { fileExists } from 'fylo';

const exists = await fileExists('/path/to/file.txt');
console.log(`File exists: ${exists}`);
```

##### JavaScript (CommonJS)

```javascript
const { fileExists } = require('fylo');

fileExists('/path/to/file.txt').then((exists) => {
	console.log(`File exists: ${exists}`);
});
```

##### TypeScript

```typescript
import { fileExistsSync } from 'fylo';

const exists = fileExistsSync('/path/to/file.txt');
console.log(`File exists: ${exists}`);
```

##### JavaScript (CommonJS)

```javascript
const { fileExistsSync } = require('fylo');

const exists = fileExistsSync('/path/to/file.txt');
console.log(`File exists: ${exists}`);
```

#### Reading a File

The `readFile` method provides a quick and safe way to read the contents of a file. You can specify the desired encoding
or retrieve the data as a buffer.

Fylo provides two versions of this method:

1. Asynchronous version `readFile`.
2. Synchronous version `readFileSync`.

**Parameters:**

- `path` (string): The path to the file whose contents need to be read.
- `encoding` (BufferEncoding, optional): The encoding for reading the file. Defaults to `utf8`.

**Return Value:**

- `string` or `Buffer`: The file contents as a string (if encoding is specified) or a buffer.

##### TypeScript

```typescript
import { readFile } from 'fylo';

const content = await readFile('/path/to/file.txt', 'utf8');
console.log(`File content: ${content}`);
```

##### JavaScript (CommonJS)

```javascript
const { readFile } = require('fylo');

readFile('/path/to/file.txt', 'utf8').then((content) => {
	console.log(`File content: ${content}`);
});
```

##### TypeScript

```typescript
import { readFileSync } from 'fylo';

const content = readFileSync('/path/to/file.txt', 'utf8');
console.log(`File content: ${content}`);
```

##### JavaScript (CommonJS)

```javascript
const { readFileSync } = require('fylo');

const content = readFileSync('/path/to/file.txt', 'utf8');
console.log(`File content: ${content}`);
```

#### Writing to a File

The `writeFile` method allows you to easily write data to a file, choosing the appropriate encoding and access mode.
This method is perfect for both creating new files and updating existing ones.

Fylo provides two versions of this method:

1. Asynchronous version `writeFile`.
2. Synchronous version `writeFileSync`.

**Parameters:**

- `path` (string): The path to the file where the data needs to be written.
- `data` (string | Buffer): The data to be written to the file.
- `options` (IFileOptions, optional): Additional write options:
  - `encoding` (BufferEncoding, optional): The encoding of the data. Defaults to `utf8`.
  - `mode` (number, optional): Sets the file's permissions. Defaults to `0o666`.
  - `flag` (TFileModeFlag, optional): The mode for opening the file. Defaults to `w` (write and overwrite).

**Return Value:**

- `void`

##### TypeScript

```typescript
import { writeFile } from 'fylo';

await writeFile('/path/to/file.txt', 'Hello, World!', { encoding: 'utf8', mode: 0o666, flag: 'w' });
console.log('Data successfully written.');
```

##### JavaScript (CommonJS)

```javascript
const { writeFile } = require('fylo');

writeFile('/path/to/file.txt', 'Hello, World!', { encoding: 'utf8', mode: 0o666, flag: 'w' }).then(() => {
	console.log('Data successfully written.');
});
```

##### TypeScript

```typescript
import { writeFileSync } from 'fylo';

writeFileSync('/path/to/file.txt', 'Hello, World!', { encoding: 'utf8', mode: 0o666, flag: 'w' });
console.log('Data successfully written.');
```

##### JavaScript (CommonJS)

```javascript
const { writeFileSync } = require('fylo');

writeFileSync('/path/to/file.txt', 'Hello, World!', { encoding: 'utf8', mode: 0o666, flag: 'w' });
console.log('Data successfully written.');
```

#### Renaming a File

The `renameFile` method allows you to safely and easily rename or move a file to a new location.

Fylo provides two versions of this method:

1. Asynchronous version `renameFile`.
2. Synchronous version `renameFileSync`.

**Parameters:**

- `oldPath` (string): The current path to the file.
- `newPath` (string): The new path where the file will be moved or renamed.

**Return Value:**

- `void`

##### TypeScript

```typescript
import { renameFile } from 'fylo';

await renameFile('/path/to/file.txt', '/new/path/to/file.txt');
console.log('File renamed.');
```

##### JavaScript (CommonJS)

```javascript
const { renameFile } = require('fylo');

renameFile('/path/to/file.txt', '/new/path/to/file.txt').then(() => {
	console.log('File renamed.');
});
```

##### TypeScript

```typescript
import { renameFileSync } from 'fylo';

renameFileSync('/path/to/file.txt', '/new/path/to/file.txt');
console.log('File renamed.');
```

##### JavaScript (CommonJS)

```javascript
const { renameFileSync } = require('fylo');

renameFileSync('/path/to/file.txt', '/new/path/to/file.txt');
console.log('File renamed.');
```

#### Deleting a File

The `deleteFile` method allows you to quickly and safely delete an unnecessary file.

Fylo provides two versions of this method:

1. Asynchronous version `deleteFile`.
2. Synchronous version `deleteFileSync`.

**Parameters:**

- `path` (string): The path to the file that needs to be deleted.

**Return Value:**

- `void`

##### TypeScript

```typescript
import { deleteFile } from 'fylo';

await deleteFile('/path/to/file.txt');
console.log('File deleted.');
```

##### JavaScript (CommonJS)

```javascript
const { deleteFile } = require('fylo');

deleteFile('/path/to/file.txt').then(() => {
	console.log('File deleted.');
});
```

##### TypeScript

```typescript
import { deleteFileSync } from 'fylo';

deleteFileSync('/path/to/file.txt');
console.log('File deleted.');
```

##### JavaScript (CommonJS)

```javascript
const { deleteFileSync } = require('fylo');

deleteFileSync('/path/to/file.txt');
console.log('File deleted.');
```

### Directory Management

Fylo provides tools for simple and convenient directory management, including creation, deletion, and clearing.

#### Creating a Directory

The `createDirectory` method helps you quickly create a new directory, including all missing directories in the path.

Fylo provides two versions of this method:

1. Asynchronous version `createDirectory`.
2. Synchronous version `createDirectorySync`.

**Parameters:**

- `path` (string): The path where the new directory should be created.
- `options` (IDirectoryOptions, optional): Options for creating the directory:
  - `recursive` (boolean, optional): If `true`, all missing directories in the path are created. Defaults to `false`.
  - `mode` (number, optional): Sets the directory's permissions. Defaults to `0o777`.

**Return Value:**

- `void`

##### TypeScript

```typescript
import { createDirectory } from 'fylo';

await createDirectory('/path/to/directory', { recursive: true, mode: 0o755 });
console.log('Directory created.');
```

##### JavaScript (CommonJS)

```javascript
const { createDirectory } = require('fylo');

createDirectory('/path/to/directory', { recursive: true, mode: 0o755 }).then(() => {
	console.log('Directory created.');
});
```

##### TypeScript

```typescript
import { createDirectorySync } from 'fylo';

createDirectorySync('/path/to/directory', { recursive: true, mode: 0o755 });
console.log('Directory created.');
```

##### JavaScript (CommonJS)

```javascript
const { createDirectorySync } = require('fylo');

createDirectorySync('/path/to/directory', { recursive: true, mode: 0o755 });
console.log('Directory created.');
```

#### Deleting a Directory

The `removeDirectory` method allows you to delete a directory along with all its contents.

Fylo provides two versions of this method:

1. Asynchronous version `removeDirectory`.
2. Synchronous version `removeDirectorySync`.

**Parameters:**

- `path` (string): The path to the directory that needs to be deleted.

**Return Value:**

- `void`

##### TypeScript

```typescript
import { removeDirectory } from 'fylo';

await removeDirectory('/path/to/directory');
console.log('Directory deleted.');
```

##### JavaScript (CommonJS)

```javascript
const { removeDirectory } = require('fylo');

removeDirectory('/path/to/directory').then(() => {
	console.log('Directory deleted.');
});
```

##### TypeScript

```typescript
import { removeDirectorySync } from 'fylo';

removeDirectorySync('/path/to/directory');
console.log('Directory deleted.');
```

##### JavaScript (CommonJS)

```javascript
const { removeDirectorySync } = require('fylo');

removeDirectorySync('/path/to/directory');
console.log('Directory deleted.');
```

#### Reading Directory Contents

The `readDirectory` method returns a list of all files and subdirectories in a specified directory, making content
management easier.

Fylo provides two versions of this method:

1. Asynchronous version `readDirectory`.
2. Synchronous version `readDirectorySync`.

**Parameters:**

- `path` (string): The path to the directory whose contents need to be read.

**Return Value:**

- `string[]`: An array of strings, each representing a file or subdirectory name.

##### TypeScript

```typescript
import { readDirectory } from 'fylo';

const files = await readDirectory('/path/to/directory');
console.log('Directory contents:', files);
```

##### JavaScript (CommonJS)

```javascript
const { readDirectory } = require('fylo');

readDirectory('/path/to/directory').then((files) => {
	console.log('Directory contents:', files);
});
```

##### TypeScript

```typescript
import { readDirectorySync } from 'fylo';

const files = readDirectorySync('/path/to/directory');
console.log('Directory contents:', files);
```

##### JavaScript (CommonJS)

```javascript
const { readDirectorySync } = require('fylo');

const files = readDirectorySync('/path/to/directory');
console.log('Directory contents:', files);
```

#### Clearing a Directory

The `clearDirectory` method deletes all contents of a directory, leaving the directory itself intact.

Fylo provides two versions of this method:

1. Asynchronous version `clearDirectory`.
2. Synchronous version `clearDirectorySync`.

**Parameters:**

- `path` (string): The path to the directory that needs to be cleared.

**Return Value:**

- `void`

##### TypeScript

```typescript
import { clearDirectory } from 'fylo';

await clearDirectory('/path/to/directory');
console.log('Directory cleared.');
```

##### JavaScript (CommonJS)

```javascript
const { clearDirectory } = require('fylo');

clearDirectory('/path/to/directory').then(() => {
	console.log('Directory cleared.');
});
```

##### TypeScript

```typescript
import { clearDirectorySync } from 'fylo';

clearDirectorySync('/path/to/directory');
console.log('Directory cleared.');
```

##### JavaScript (CommonJS)

```javascript
const { clearDirectorySync } = require('fylo');

clearDirectorySync('/path/to/directory');
console.log('Directory cleared.');
```

## Reading and Writing Streams

Fylo offers efficient tools for working with streams for reading and writing data to files, which is especially
important when working with large files.

### Reading Data (ReadStream)

The `ReadStream` class provides a streaming interface for reading data from a file, allowing you to process large files
in parts without loading them entirely into memory.

#### Creating a ReadStream

**Constructor Parameters:**

- `filePath` (string): The path to the file that needs to be read.
- `debug` (boolean, optional): Enables debug mode. If `true`, additional logging is activated.

**Methods:**

- `open(options?: { encoding?: BufferEncoding; highWaterMark?: number }, timeout?: number): Promise<void>`

  - Opens the stream for reading the file. This method must be called before starting to read.
  - **Parameters:**
    - `options` (optional): Options for opening the stream:
      - `encoding` (BufferEncoding): The encoding for reading the file.
      - `highWaterMark` (number): The maximum buffer size for reading.
    - `timeout` (number): The timeout in milliseconds. If the stream does not open within this time, an error is
      returned.
  - **Return Value:** `Promise<void>`

- `read(): Promise<Buffer | string | null>`

  - Reads data from the stream if it is not in flowing mode.
  - **Return Value:** `Promise<Buffer | string | null>`

- `pipe(destination: NodeJS.WritableStream | WriteStream, options?: { end?: boolean }): NodeJS.WritableStream | WriteStream`

  - Pipes data from the read stream to the specified write stream.
  - **Parameters:**
    - `destination`: The write stream to which the data will be piped.
    - `options` (optional): Options for controlling the piping process:
      - `end` (boolean): Whether to end the write stream when the read stream finishes. Defaults to `true`.
  - **Return Value:** The write stream passed as `destination`.

- `enableFlowingMode(): void`

  - Enables flowing mode, where data is automatically read and emitted in `data` events.

- `disableFlowingMode(): void`

  - Disables flowing mode.

- `close(timeout?: number): Promise<void>`
  - Closes the stream.
  - **Parameters:**
    - `timeout` (number): The timeout in milliseconds. If the stream does not close within this time, an error is
      returned.
  - **Return Value:** `Promise<void>`

**Usage Example**

##### TypeScript

```typescript
import { ReadStream } from 'fylo';

const stream = new ReadStream('/path/to/file.txt', true);

stream.on('data', (chunk) => {
	console.log('Received data chunk:', chunk);
});

stream
	.open()
	.then(() => {
		console.log('Stream opened.');
	})
	.catch((err) => {
		console.error('Error opening stream:', err);
	});

// Using asynchronous iterator
for await (const chunk of stream) {
	console.log('Reading data chunk:', chunk);
}

stream.close().then(() => {
	console.log('Stream closed.');
});
```

##### JavaScript (CommonJS)

```javascript
const { ReadStream } = require('fylo');

const stream = new ReadStream('/path/to/file.txt', true);

stream.on('data', (chunk) => {
	console.log('Received data chunk:', chunk);
});

stream
	.open()
	.then(() => {
		console.log('Stream opened.');
	})
	.catch((err) => {
		console.error('Error opening stream:', err);
	});

// Using asynchronous iterator
(async () => {
	for await (const chunk of stream) {
		console.log('Reading data chunk:', chunk);
	}
})();

stream.close().then(() => {
	console.log('Stream closed.');
});
```

### Writing Data (WriteStream)

The `WriteStream` class provides an interface for streaming data to a file. This method is especially useful for writing
large amounts of data.

#### Creating a WriteStream

**Constructor Parameters:**

- `filePath` (string): The path to the file where the data needs to be written.
- `debug` (boolean, optional): Enables debug mode. If `true`, additional logging is activated.

**Methods:**

- `open(options?: { encoding?: BufferEncoding; highWaterMark?: number }, timeout?: number): Promise<void>`

  - Opens the stream for writing data. This method must be called before starting to write.
  - **Parameters:**
    - `options` (optional): Options for opening the stream:
      - `encoding` (BufferEncoding): The encoding for writing data.
      - `highWaterMark` (number): The maximum buffer size for writing.
    - `timeout` (number): The timeout in milliseconds. If the stream does not open within this time, an error is
      returned.
  - **Return Value:** `Promise<void>`

- `write(chunk: Buffer | string): Promise<void>`

  - Writes a chunk of data to the stream.
  - **Parameters:**
    - `chunk` (Buffer | string): The data to be written to the stream.
  - **Return Value:** `Promise<void>`

- `close(timeout?: number): Promise<void>`

  - Closes the stream.
  - **Parameters:**
    - `timeout` (number): The timeout in milliseconds. If the stream does not close within this time, an error is
      returned.
  - **Return Value:** `Promise<void>`

- `destroy(timeout?: number): Promise<void>`
  - Destroys the stream, making it unusable for further operations.
  - **Parameters:**
    - `timeout` (number): The timeout in milliseconds. If the stream is not destroyed within this time, an error is
      returned.
  - **Return Value:** `Promise<void>`

**Usage Example**

##### TypeScript

```typescript
import { WriteStream } from 'fylo';

const stream = new WriteStream('/path/to/file.txt', true);

stream
	.open()
	.then(() => stream.write('Hello, World!'))
	.then(() => stream.write('More data'))
	.then(() => stream.close())
	.then(() => console.log('Data successfully written and stream closed.'))
	.catch((err) => console.error('Error working with stream:', err));
```

##### JavaScript (CommonJS)

```javascript
const { WriteStream } = require('fylo');

const stream = new WriteStream('/path/to/file.txt', true);

stream
	.open()
	.then(() => stream.write('Hello, World!'))
	.then(() => stream.write('More data'))
	.then(() => stream.close())
	.then(() => console.log('Data successfully written and stream closed.'))
	.catch((err) => console.error('Error working with stream:', err));
```

## File and Directory Watchers

Fylo provides convenient tools for monitoring changes in files and directories, allowing you to automate file processing
tasks.

### File Watcher (FileWatcher)

The `FileWatcher` class allows you to monitor changes in a single file. Both event-based monitoring and polling-based
monitoring are supported.

#### Creating a FileWatcher

**Constructor Parameters:**

- `filePath` (string): The path to the file that needs to be monitored.
- `options` (IWatcherOptions, optional): Options for configuring the watcher:
  - `usePolling` (boolean, optional): If `true`, polling is used to monitor changes; otherwise, event-based monitoring
    is used.
  - `pollingInterval` (number, optional): The polling interval in milliseconds if polling mode is used. Defaults to
    `500` ms.

**Methods:**

- `start(): void`

  - Starts the process of monitoring the file. Depending on the settings, either polling or event-based monitoring may
    be used.

- `stop(): void`

  - Stops monitoring the file.

- `on(event: 'changed' | 'error', listener: (arg: string | Error) => void): this`
  - Adds a handler for the specified events.
  - **Parameters:**
    - `event`: The type of event. Possible values: `'changed'` (file changed), `'error'` (error).
    - `listener`: The event handler function.

**Usage Example**

##### TypeScript

```typescript
import { FileWatcher } from 'fylo';

const watcher = new FileWatcher('/path/to/file.txt', { usePolling: true, pollingInterval: 1000 });

watcher.on('changed', (path) => {
	console.log(`File changed: ${path}`);
});

watcher.on('error', (error) => {
	console.error(`Error monitoring file: ${error.message}`);
});

watcher.start();
```

##### JavaScript (CommonJS)

```javascript
const { FileWatcher } = require('fylo');

const watcher = new FileWatcher('/path/to/file.txt', { usePolling: true, pollingInterval: 1000 });

watcher.on('changed', (path) => {
	console.log(`File changed: ${path}`);
});

watcher.on('error', (error) => {
	console.error(`Error monitoring file: ${error.message}`);
});

watcher.start();
```

### Directory Watcher (DirectoryWatcher)

The `DirectoryWatcher` class allows you to monitor changes in a directory. Both polling and event-based monitoring are
supported for tracking additions, deletions, and modifications of files in the directory.

#### Creating a DirectoryWatcher

**Constructor Parameters:**

- `directoryPath` (string): The path to the directory that needs to be monitored.
- `options` (IWatcherOptions, optional): Options for configuring the watcher:
  - `usePolling` (boolean, optional): If `true`, polling is used to monitor changes; otherwise, event-based monitoring
    is used.
  - `pollingInterval` (number, optional): The polling interval in milliseconds if polling mode is used. Defaults to
    `500` ms.

**Methods:**

- `start(): void`

  - Starts the process of monitoring the directory. Depending on the settings, either polling or event-based monitoring
    may be used.

- `stop(): void`

  - Stops monitoring the directory.

- `on(event: 'added' | 'removed' | 'changed' | 'error', listener: (arg: string | Error) => void): this`
  - Adds a handler for the specified events.
  - **Parameters:**
    - `event`: The type of event. Possible values: `'added'` (file added), `'removed'` (file removed), `'changed'` (file
      changed), `'error'` (error).
    - `listener`: The event handler function.

**Usage Example**

##### TypeScript

```typescript
import { DirectoryWatcher } from 'fylo';

const watcher = new DirectoryWatcher('/path/to/directory', { usePolling: true, pollingInterval: 1000 });

watcher.on('added', (path) => {
	console.log(`File added: ${path}`);
});

watcher.on('removed', (path) => {
	console.log(`File removed: ${path}`);
});

watcher.on('changed', (path) => {
	console.log(`File changed: ${path}`);
});

watcher.on('error', (error) => {
	console.error(`Error monitoring directory: ${error.message}`);
});

watcher.start();
```

##### JavaScript (CommonJS)

```javascript
const { DirectoryWatcher } = require('fylo');

const watcher = new DirectoryWatcher('/path/to/directory', { usePolling: true, pollingInterval: 1000 });

watcher.on('added', (path) => {
	console.log(`File added: ${path}`);
});

watcher.on('removed', (path) => {
	console.log(`File removed: ${path}`);
});

watcher.on('changed', (path) => {
	console.log(`File changed: ${path}`);
});

watcher.on('error', (error) => {
	console.error(`Error monitoring directory: ${error.message}`);
});

watcher.start();
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

The author of the library is David Pobedinskiy.

## Reporting Issues

If you encounter unexpected errors, please let me know by email at [qpyracuk@gmail.com](mailto:qpyracuk@gmail.com) or on
[Telegram](https://t.me/qpyracuk).

## Support the Author

If my work has helped you simplify your life, you can support me through:

- [Boosty](https://boosty.to/qpyracuk)
- [Patreon](https://patreon.com/qpyracuk)

Search npm for other libraries with the @qpyracuk prefix. You might find something useful for your project.

## Conclusion

This is an alpha version of the library; if you encounter any bugs, please submit them to the GitHub Issues.

The library's functionality will not change—only the internal components will be updated in case of bugs or
shortcomings. The names and results of the functions and methods will remain unchanged.
