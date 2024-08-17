# FileWatcher Class

The `FileWatcher` class provides functionality to watch for changes, additions, or deletions of a single file. This
class is intended to be used in scenarios where monitoring a specific file is required. It supports both polling and
event-based file watching.

## Features

- **File Monitoring:** Watch for changes, additions, or deletions of a single file.
- **Flexible Watching:** Supports both polling and event-driven watching based on user preferences.
- **Error Handling:** Includes mechanisms to handle errors related to file watching.

## Usage

### Importing the FileWatcher Class

```typescript
import FileWatcher from 'your-library-name';
```

### Creating a File Watcher

To use `FileWatcher`, you can instantiate it directly and start monitoring a specific file:

```typescript
import FileWatcher from 'your-library-name';

const fileWatcher = new FileWatcher('/path/to/file.txt', { usePolling: true, pollingInterval: 1000 });

fileWatcher.on('changed', (path) => {
	console.log(`File changed: ${path}`);
});

fileWatcher.on('error', (error) => {
	console.error(`Error: ${error.message}`);
});

fileWatcher.start();
```

### Methods

#### `constructor(filePath: string, options?: IWatcherOptions)`

- **`filePath`**: The absolute path to the file to be watched.
- **`options`**: Optional configuration for the watcher, which includes:
  - `usePolling`: A boolean indicating whether to use polling instead of event-driven watching.
  - `pollingInterval`: The interval in milliseconds for polling (if polling is enabled).

#### `start()`

- **Description**: Starts watching the file for changes. Depending on the options provided, it can use either polling or
  event-based watching.
- **Fires**: `FileWatcher#changed` when the file changes.

#### `on(event: 'changed', listener: (path: string) => void): this`

- **Description**: Adds a listener for the `changed` event, which is emitted when the file changes.

#### `on(event: 'error', listener: (error: Error) => void): this`

- **Description**: Adds a listener for the `error` event, which is emitted when an error occurs.

#### `validateFilePath(filePath: string)`

- **Description**: Validates that the provided path is a file.
- **Throws**: If the path is not a file or does not exist.

## Events

The `FileWatcher` class emits the following events:

- **`changed`**: Emitted when the file changes.
- **`error`**: Emitted when an error occurs during the watching process.
