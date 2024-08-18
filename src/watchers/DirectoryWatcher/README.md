# DirectoryWatcher Class

The `DirectoryWatcher` class provides functionality to watch for changes in a directory, including file additions,
removals, and modifications. This class is intended to be used in scenarios where monitoring an entire directory is
required. It supports both polling and event-based directory watching.

## Features

- **Directory Monitoring:** Watch for changes, additions, or removals of files and directories within a specific
  directory.
- **Flexible Watching:** Supports both polling and event-driven watching based on user preferences.
- **Error Handling:** Includes mechanisms to handle errors related to directory watching.

## Usage

### Importing the DirectoryWatcher Class

```typescript
import DirectoryWatcher from 'your-library-name';
```

### Creating a Directory Watcher

To use `DirectoryWatcher`, you can instantiate it directly and start monitoring a specific directory:

```typescript
import DirectoryWatcher from 'your-library-name';

const dirWatcher = new DirectoryWatcher('/path/to/directory', { usePolling: true, pollingInterval: 2000 });

dirWatcher.on('added', (path) => {
	console.log(`File or directory added: ${path}`);
});

dirWatcher.on('removed', (path) => {
	console.log(`File or directory removed: ${path}`);
});

dirWatcher.on('changed', (path) => {
	console.log(`File or directory changed: ${path}`);
});

dirWatcher.on('error', (error) => {
	console.error(`Error: ${error.message}`);
});

dirWatcher.start();
```

### Methods

#### `constructor(directoryPath: string, options?: IWatcherOptions)`

- **`directoryPath`**: The absolute path to the directory to be watched.
- **`options`**: Optional configuration for the watcher, which includes:
  - `usePolling`: A boolean indicating whether to use polling instead of event-driven watching.
  - `pollingInterval`: The interval in milliseconds for polling (if polling is enabled).

#### `start()`

- **Description**: Starts watching the directory for changes. Depending on the options provided, it can use either
  polling or event-based watching.
- **Fires**: `DirectoryWatcher#added` when a file or directory is added.
- **Fires**: `DirectoryWatcher#removed` when a file or directory is removed.
- **Fires**: `DirectoryWatcher#changed` when a file or directory is changed.

#### `stop()`

- **Description**: Stops watching the directory. Clears any internal intervals used for polling.

## Events

The `DirectoryWatcher` class emits the following events:

- **`added`**: Emitted when a file or directory is added.
- **`removed`**: Emitted when a file or directory is removed.
- **`changed`**: Emitted when a file or directory is changed.
- **`error`**: Emitted when an error occurs during the watching process.
