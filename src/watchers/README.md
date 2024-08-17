# BaseWatcher Class

The `BaseWatcher` class provides a foundational implementation for creating file and directory watchers in Node.js. This
class is intended to be extended by other classes to implement specific watch behaviors, such as monitoring file
changes, directory modifications, or other filesystem events.

## Features

- **Core Functionality:** Provides essential methods for starting, stopping, and managing file system watchers.
- **Error Handling:** Includes robust error handling mechanisms to manage common file system errors.
- **Extendable:** Designed to be extended by subclasses, enabling custom watch behavior implementations.

## Usage

### Importing the BaseWatcher Class

```typescript
import BaseWatcher from 'your-library-name';
```

### Creating a Custom Watcher

To use `BaseWatcher`, you will typically extend it in your own class to implement specific watching functionality:

```typescript
import BaseWatcher from 'your-library-name';
import fs from 'fs';

class MyCustomWatcher extends BaseWatcher {
	constructor(path: string) {
		super(path, { usePolling: true, pollingInterval: 1000 });
	}

	public start() {
		this.setWatcher(
			fs.watch(this.watchPath, (eventType, filename) => {
				console.log(`File ${filename} was modified with event type ${eventType}`);
			}),
		);
	}
}

const watcher = new MyCustomWatcher('/path/to/watch');
watcher.start();
```

### Methods

#### `constructor(watchPath: string, options?: IWatcherOptions)`

- **`watchPath`**: The absolute path to the file or directory to be watched.
- **`options`**: Optional configuration for the watcher, which includes:
  - `usePolling`: A boolean indicating whether to use polling instead of event-driven watching.
  - `pollingInterval`: The interval in milliseconds for polling (if polling is enabled).

#### `start()`

- **Description**: Starts the watching process. This method must be implemented by subclasses.
- **Throws**: Always throws an error to enforce subclass implementation.

#### `stop()`

- **Description**: Stops the watcher and clears any active watcher instance. Emits a 'stopped' event when the watcher is
  stopped.

#### `handleError(err: NodeJS.ErrnoException)`

- **Description**: Handles errors that occur during the watching process. Emits an 'error' event with a more descriptive
  error message based on the error code.

#### `validatePath(targetPath: string)`

- **Description**: Validates that the provided path is non-empty and absolute.
- **Throws**: If the path is empty or not absolute.

#### `checkPathExists()`

- **Description**: Checks if the provided path exists and is accessible.
- **Throws**: If the path does not exist or is not accessible.

#### `setWatcher(watcher: fs.FSWatcher)`

- **Description**: Sets the current watcher instance and starts watching. Stops any active watcher before setting a new
  one.

## Events

The `BaseWatcher` class emits the following events:

- **`stopped`**: Emitted when the watcher is successfully stopped.
- **`error`**: Emitted when an error occurs during the watching process.
