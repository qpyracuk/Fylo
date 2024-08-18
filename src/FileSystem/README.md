# File and Directory Utilities

This module provides a comprehensive set of utilities for working with files and directories in Node.js. These utilities
include functions for checking file existence, reading and writing files, managing directories, and handling symbolic
and hard links.

## Features

- **File Operations:** Check existence, read, write, append, rename, and delete files.
- **Directory Operations:** Read, create, remove, and clear directories.
- **Link Operations:** Create and manage symbolic and hard links.
- **Error Handling:** Comprehensive error handling with descriptive messages.

## Usage

### Importing the Utilities

```typescript
import {
	exists,
	existsSync,
	access,
	accessSync,
	readFile,
	readFileSync,
	writeFile,
	writeFileSync,
	unlink,
	unlinkSync,
	appendFile,
	appendFileSync,
	renameFile,
	renameFileSync,
	copyFile,
	copyFileSync,
	moveFile,
	moveFileSync,
	stat,
	statSync,
	symlink,
	symlinkSync,
	createHardlink,
	createHardlinkSync,
	readdir,
	readdirSync,
	mkdir,
	mkdirSync,
	rmdir,
	rmdirSync,
	cleardir,
	cleardirSync,
} from 'your-library-name';
```

### Function Details and Examples

#### `exists(filePath: string): Promise<boolean>`

**Description:** Asynchronously checks if a file or directory exists at the specified path.

**Usage Example:**

```typescript
const fileExists = await exists('/path/to/file.txt');
console.log(fileExists); // true or false
```

#### `existsSync(filePath: string): boolean`

**Description:** Synchronously checks if a file or directory exists at the specified path.

**Usage Example:**

```typescript
const fileExistsSync = existsSync('/path/to/file.txt');
console.log(fileExistsSync); // true or false
```

#### `access(filePath: string, options: IAccessOptions = {}): Promise<void>`

**Description:** Asynchronously checks if the process has the specified access permissions for a file or directory. You
can check for `read`, `write`, and `execute` permissions.

**Usage Example:**

```typescript
try {
	await access('/path/to/file.txt', { read: true, write: true });
	console.log('File is accessible');
} catch (error) {
	console.error('Access denied:', error.message);
}
```

#### `accessSync(filePath: string, options: IAccessOptions = {}): void`

**Description:** Synchronously checks if the process has the specified access permissions for a file or directory.

**Usage Example:**

```typescript
try {
	accessSync('/path/to/file.txt', { read: true, write: true });
	console.log('File is accessible');
} catch (error) {
	console.error('Access denied:', error.message);
}
```

#### `readFile(filePath: string, options: IFileOptions = {}): Promise<string | Buffer>`

**Description:** Asynchronously reads the contents of a file. The content is returned as a `string` if an encoding is
specified, or as a `Buffer` otherwise.

**Usage Example:**

```typescript
const data = await readFile('/path/to/file.txt', { encoding: 'utf8' });
console.log(data);
```

#### `readFileSync(filePath: string, options: IFileOptions = {}): string | Buffer`

**Description:** Synchronously reads the contents of a file. The content is returned as a `string` if an encoding is
specified, or as a `Buffer` otherwise.

**Usage Example:**

```typescript
const data = readFileSync('/path/to/file.txt', { encoding: 'utf8' });
console.log(data);
```

#### `writeFile(filePath: string, data: string | Buffer, options: IFileOptions = {}): Promise<void>`

**Description:** Asynchronously writes data to a file, replacing the file if it already exists.

**Usage Example:**

```typescript
await writeFile('/path/to/file.txt', 'New content');
console.log('File written successfully');
```

#### `writeFileSync(filePath: string, data: string | Buffer, options: IFileOptions = {}): void`

**Description:** Synchronously writes data to a file, replacing the file if it already exists.

**Usage Example:**

```typescript
writeFileSync('/path/to/file.txt', 'New content');
console.log('File written successfully');
```

#### `unlink(filePath: string): Promise<void>`

**Description:** Asynchronously removes a file or symbolic link.

**Usage Example:**

```typescript
await unlink('/path/to/file.txt');
console.log('File removed successfully');
```

#### `unlinkSync(filePath: string): void`

**Description:** Synchronously removes a file or symbolic link.

**Usage Example:**

```typescript
unlinkSync('/path/to/file.txt');
console.log('File removed successfully');
```

#### `appendFile(filePath: string, data: string | Buffer, options: IFileOptions = {}): Promise<void>`

**Description:** Asynchronously appends data to a file, creating the file if it does not exist.

**Usage Example:**

```typescript
await appendFile('/path/to/file.txt', 'Appended content');
console.log('Data appended successfully');
```

#### `appendFileSync(filePath: string, data: string | Buffer, options: IFileOptions = {}): void`

**Description:** Synchronously appends data to a file, creating the file if it does not exist.

**Usage Example:**

```typescript
appendFileSync('/path/to/file.txt', 'Appended content');
console.log('Data appended successfully');
```

#### `renameFile(oldPath: string, newPath: string): Promise<void>`

**Description:** Asynchronously renames (moves) a file or directory.

**Usage Example:**

```typescript
await renameFile('/path/to/file.txt', '/new/path/to/file.txt');
console.log('File renamed successfully');
```

#### `renameFileSync(oldPath: string, newPath: string): void`

**Description:** Synchronously renames (moves) a file or directory.

**Usage Example:**

```typescript
renameFileSync('/path/to/file.txt', '/new/path/to/file.txt');
console.log('File renamed successfully');
```

#### `copyFile(srcPath: string, destPath: string): Promise<void>`

**Description:** Asynchronously copies a file from one location to another.

**Usage Example:**

```typescript
await copyFile('/path/to/file.txt', '/new/path/to/file.txt');
console.log('File copied successfully');
```

#### `copyFileSync(srcPath: string, destPath: string): void`

**Description:** Synchronously copies a file from one location to another.

**Usage Example:**

```typescript
copyFileSync('/path/to/file.txt', '/new/path/to/file.txt');
console.log('File copied successfully');
```

#### `moveFile(srcPath: string, destPath: string): Promise<void>`

**Description:** Asynchronously moves a file from one location to another.

**Usage Example:**

```typescript
await moveFile('/path/to/file.txt', '/new/path/to/file.txt');
console.log('File moved successfully');
```

#### `moveFileSync(srcPath: string, destPath: string): void`

**Description:** Synchronously moves a file from one location to another.

**Usage Example:**

```typescript
moveFileSync('/path/to/file.txt', '/new/path/to/file.txt');
console.log('File moved successfully');
```

#### `stat(filePath: string): Promise<fs.Stats>`

**Description:** Asynchronously retrieves the stats (information) of a file or directory.

**Usage Example:**

```typescript
const stats = await stat('/path/to/file.txt');
console.log(`File size: ${stats.size} bytes`);
```

#### `statSync(filePath: string): fs.Stats`

**Description:** Synchronously retrieves the stats (information) of a file or directory.

**Usage Example:**

```typescript
const stats = statSync('/path/to/file.txt');
console.log(`File size: ${stats.size} bytes`);
```

#### `symlink(target: string, linkPath: string, type: 'file' | 'dir' | 'junction' = 'file'): Promise<void>`

**Description:** Asynchronously creates a symbolic link.

**Usage Example:**

```typescript
await symlink('/path/to/target', '/path/to/symlink', 'file');
console.log('Symbolic link created successfully');
```

#### `symlinkSync(target: string, linkPath: string, type: 'file' | 'dir' | 'junction' = 'file'): void`

**Description:** Synchronously creates a symbolic link.

**Usage Example:**

```typescript
symlinkSync('/path/to/target', '/path/to/symlink', 'file');
console.log('Symbolic link created successfully');
```

#### `createHardlink(target: string, linkPath: string): Promise<void>`

**Description:** Asynchronously creates a hard link.

**Usage Example:**

```typescript
await createHardlink('/path/to/file.txt', '/path/to/hardlink.txt');
console.log('Hard link created successfully');
```

#### `createHardlinkSync(target: string, linkPath: string): void`

**Description:** Synchronously creates a hard link.

**Usage Example:**

```typescript
createHardlinkSync('/path/to/file.txt', '/path/to/hardlink.txt');
console.log('Hard link created successfully');
```

### Directory Operations

#### `readdir(dirPath: string): Promise<string[]>`

**Description:** Asynchronously reads the contents of a directory.

**Usage Example:**

```typescript
const files = await readdir('/path/to/directory');
console.log('Files:', files);
```

#### `readdirSync(dirPath: string): string[]`

**Description:** Synchronously reads the contents of a directory.

**Usage Example:**

```typescript
const files = readdirSync('/path/to/directory');
console.log('Files:', files);
```

#### `mkdir(dirPath: string, options: IDirectoryOptions = {}): Promise<void>`

**Description:** Asynchronously creates a directory.

**Usage Example:**

```typescript
await mkdir('/path/to/new-directory', { recursive: true });
console.log('Directory created successfully');
```

#### `mkdirSync(dirPath: string, options: IDirectoryOptions = {}): void`

**Description:** Synchronously creates a directory.

**Usage Example:**

```typescript
mkdirSync('/path/to/new-directory', { recursive: true });
console.log('Directory created successfully');
```

#### `rmdir(dirPath: string): Promise<void>`

**Description:** Asynchronously removes a directory and its contents.

**Usage Example:**

```typescript
await rmdir('/path/to/directory');
console.log('Directory removed successfully');
```

#### `rmdirSync(dirPath: string): void`

**Description:** Synchronously removes a directory and its contents.

**Usage Example:**

```typescript
rmdirSync('/path/to/directory');
console.log('Directory removed successfully');
```

#### `cleardir(dirPath: string): Promise<void>`

**Description:** Asynchronously clears the contents of a directory without removing the directory itself.

**Usage Example:**

```typescript
await cleardir('/path/to/directory');
console.log('Directory cleared successfully');
```

#### `cleardirSync(dirPath: string): void`

**Description:** Synchronously clears the contents of a directory without removing the directory itself.

**Usage Example:**

```typescript
cleardirSync('/path/to/directory');
console.log('Directory cleared successfully');
```

### Link Operations

#### `symlink(target: string, linkPath: string, type: 'file' | 'dir' | 'junction' = 'file'): Promise<void>`

**Description:** Asynchronously creates a symbolic link.

**Usage Example:**

```typescript
await symlink('/path/to/target', '/path/to/symlink', 'file');
console.log('Symbolic link created successfully');
```

#### `symlinkSync(target: string, linkPath: string, type: 'file' | 'dir' | 'junction' = 'file'): void`

**Description:** Synchronously creates a symbolic link.

**Usage Example:**

```typescript
symlinkSync('/path/to/target', '/path/to/symlink', 'file');
console.log('Symbolic link created successfully');
```

#### `createHardlink(target: string, linkPath: string): Promise<void>`

**Description:** Asynchronously creates a hard link.

**Usage Example:**

```typescript
await createHardlink('/path/to/file.txt', '/path/to/hardlink.txt');
console.log('Hard link created successfully');
```

#### `createHardlinkSync(target: string, linkPath: string): void`

**Description:** Synchronously creates a hard link.

**Usage Example:**

```typescript
createHardlinkSync('/path/to/file.txt', '/path/to/hardlink.txt');
console.log('Hard link created successfully');
```
