//#region Import types
import { IAccessOptions, IDirectoryOptions, IFileOptions } from '../@types/general';
//#endregion

//#region Imports
import * as fs from 'fs';
import path from 'path';
//#endregion

//#region GENERAL HANDLERS

const normalizePath = (filePath: string): string => {
	if (!filePath) {
		throw new Error('File path must be provided.');
	}
	return path.normalize(filePath);
};

const handleError = (err: NodeJS.ErrnoException, filePath: string): Error => {
	switch (err.code) {
		case 'ENOENT':
			return new Error(`No such file or directory at path: ${filePath}.`);
		case 'EACCES':
			return new Error(`Permission denied at path: ${filePath}.`);
		case 'EISDIR':
			return new Error(`Expected a file but found a directory at path: ${filePath}.`);
		case 'EEXIST':
			return new Error(`File or directory already exists at path: ${filePath}.`);
		case 'EXDEV':
			return new Error(`Cannot perform operation across different file systems.`);
		default:
			return new Error(`Failed to perform operation at path: ${filePath}. Error: ${err.message}`);
	}
};

const mergeFileOptions = (options: Partial<IFileOptions> = {}): IFileOptions => {
	return Object.assign({ encoding: 'utf8', flag: 'r' }, options);
};

const mergeDirectoryOptions = (options: Partial<IDirectoryOptions> = {}): IDirectoryOptions => {
	return Object.assign({ recursive: false, mode: 0o777 }, options);
};

//#endregion

//#region FILES

//#region exists
/**
 * Asynchronously checks if a file or directory exists at the specified path.
 *
 * @param {string} filePath - The path to the file or directory.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the file or directory exists, otherwise `false`.
 */
export const exists = (filePath: string): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(filePath);

		fs.access(normalizedPath, fs.constants.F_OK, (err) => {
			if (err) {
				if (err.code === 'ENOENT') {
					resolve(false);
				} else {
					reject(handleError(err, normalizedPath));
				}
			} else {
				resolve(true);
			}
		});
	});
};

/**
 * Synchronously checks if a file or directory exists at the specified path.
 *
 * @param {string} filePath - The path to the file or directory.
 * @returns {boolean} `true` if the file or directory exists, otherwise `false`.
 */
export const existsSync = (filePath: string): boolean => {
	const normalizedPath = normalizePath(filePath);

	try {
		fs.accessSync(normalizedPath, fs.constants.F_OK);
		return true;
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
			return false;
		} else {
			throw handleError(err as NodeJS.ErrnoException, normalizedPath);
		}
	}
};
//#endregion

//#region access
/**
 * Asynchronously checks if the process has the specified access permissions for a file or directory.
 *
 * @param {string} filePath - The path to the file or directory.
 * @param {IAccessOptions} [options={}] - The access options, specifying which permissions to check (`read`, `write`, `execute`).
 * @returns {Promise<void>} A promise that resolves if the process has the specified permissions, otherwise rejects with an error.
 */
export const access = (filePath: string, options: IAccessOptions = {}): Promise<void> => {
	return new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(filePath);

		let mode = 0;
		if (options.read) mode |= fs.constants.R_OK;
		if (options.write) mode |= fs.constants.W_OK;
		if (options.execute) mode |= fs.constants.X_OK;

		fs.access(normalizedPath, mode, (err) => {
			if (err) {
				reject(handleError(err, normalizedPath));
			} else {
				resolve();
			}
		});
	});
};

/**
 * Synchronously checks if the process has the specified access permissions for a file or directory.
 *
 * @param {string} filePath - The path to the file or directory.
 * @param {IAccessOptions} [options={}] - The access options, specifying which permissions to check (`read`, `write`, `execute`).
 * @returns {void} Throws an error if the process does not have the specified permissions.
 */
export const accessSync = (filePath: string, options: IAccessOptions = {}): void => {
	const normalizedPath = normalizePath(filePath);

	let mode = 0;
	if (options.read) mode |= fs.constants.R_OK;
	if (options.write) mode |= fs.constants.W_OK;
	if (options.execute) mode |= fs.constants.X_OK;

	try {
		fs.accessSync(normalizedPath, mode);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedPath);
	}
};
//#endregion

//#region readFile
/**
 * Asynchronously reads the contents of a file.
 *
 * @param {string} filePath - The path to the file.
 * @param {IFileOptions} [options={}] - The options for reading the file, such as `encoding`, `mode`, and `flag`.
 * @returns {Promise<string | Buffer>} A promise that resolves with the contents of the file, either as a string (if encoding is specified) or as a Buffer.
 */
export const readFile = (filePath: string, options: IFileOptions = {}): Promise<string | Buffer> => {
	return new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(filePath);
		const fileOptions = mergeFileOptions(options);

		fs.readFile(normalizedPath, fileOptions, (err, data) => {
			if (err) {
				reject(handleError(err, normalizedPath));
			} else {
				resolve(data);
			}
		});
	});
};

/**
 * Synchronously reads the contents of a file.
 *
 * @param {string} filePath - The path to the file.
 * @param {IFileOptions} [options={}] - The options for reading the file, such as `encoding`, `mode`, and `flag`.
 * @returns {string | Buffer} The contents of the file, either as a string (if encoding is specified) or as a Buffer.
 * @throws {Error} If the file cannot be read.
 */
export const readFileSync = (filePath: string, options: IFileOptions = {}): string | Buffer => {
	const normalizedPath = normalizePath(filePath);
	const fileOptions = mergeFileOptions(options);

	try {
		return fs.readFileSync(normalizedPath, fileOptions);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedPath);
	}
};
//#endregion

//#region writeFile
/**
 * Asynchronously writes data to a file, replacing the file if it already exists.
 *
 * @param {string} filePath - The path to the file.
 * @param {string | Buffer} data - The data to write to the file.
 * @param {IFileOptions} [options={}] - The options for writing the file, such as `encoding`, `mode`, and `flag`.
 * @returns {Promise<void>} A promise that resolves when the file has been written.
 */
export const writeFile = (filePath: string, data: string | Buffer, options: IFileOptions = {}): Promise<void> => {
	return new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(filePath);
		const fileOptions = mergeFileOptions(options);

		fs.writeFile(normalizedPath, data, fileOptions, (err) => {
			if (err) {
				reject(handleError(err, normalizedPath));
			} else {
				resolve();
			}
		});
	});
};

/**
 * Synchronously writes data to a file, replacing the file if it already exists.
 *
 * @param {string} filePath - The path to the file.
 * @param {string | Buffer} data - The data to write to the file.
 * @param {IFileOptions} [options={}] - The options for writing the file, such as `encoding`, `mode`, and `flag`.
 * @returns {void}
 * @throws {Error} If the file cannot be written.
 */
export const writeFileSync = (filePath: string, data: string | Buffer, options: IFileOptions = {}): void => {
	const normalizedPath = normalizePath(filePath);
	const fileOptions = mergeFileOptions(options);

	try {
		fs.writeFileSync(normalizedPath, data, fileOptions);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedPath);
	}
};
//#endregion

//#region unlink
/**
 * Asynchronously removes a file or symbolic link.
 *
 * @param {string} filePath - The path to the file or symbolic link.
 * @returns {Promise<void>} A promise that resolves when the file has been removed.
 */
export const unlink = (filePath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(filePath);

		fs.unlink(normalizedPath, (err) => {
			if (err) {
				reject(handleError(err, normalizedPath));
			} else {
				resolve();
			}
		});
	});
};

/**
 * Synchronously removes a file or symbolic link.
 *
 * @param {string} filePath - The path to the file or symbolic link.
 * @returns {void}
 * @throws {Error} If the file cannot be removed.
 */
export const unlinkSync = (filePath: string): void => {
	const normalizedPath = normalizePath(filePath);

	try {
		fs.unlinkSync(normalizedPath);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedPath);
	}
};
//#endregion

//#region appendFile
/**
 * Asynchronously appends data to a file, creating the file if it does not exist.
 *
 * @param {string} filePath - The path to the file.
 * @param {string | Buffer} data - The data to append to the file.
 * @param {IFileOptions} [options={}] - The options for appending the file, such as `encoding`, `mode`, and `flag`.
 * @returns {Promise<void>} A promise that resolves when the data has been appended to the file.
 */
export const appendFile = (filePath: string, data: string | Buffer, options: IFileOptions = {}): Promise<void> => {
	return new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(filePath);
		const fileOptions = mergeFileOptions(Object.assign({ flag: 'a' }, options));

		fs.appendFile(normalizedPath, data, fileOptions, (err) => {
			if (err) {
				reject(handleError(err, normalizedPath));
			} else {
				resolve();
			}
		});
	});
};

/**
 * Synchronously appends data to a file, creating the file if it does not exist.
 *
 * @param {string} filePath - The path to the file.
 * @param {string | Buffer} data - The data to append to the file.
 * @param {IFileOptions} [options={}] - The options for appending the file, such as `encoding`, `mode`, and `flag`.
 * @returns {void}
 * @throws {Error} If the data cannot be appended to the file.
 */
export const appendFileSync = (filePath: string, data: string | Buffer, options: IFileOptions = {}): void => {
	const normalizedPath = normalizePath(filePath);
	const fileOptions = mergeFileOptions(Object.assign({ flag: 'a' }, options));

	try {
		fs.appendFileSync(normalizedPath, data, fileOptions);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedPath);
	}
};
//#endregion

//#region renameFile
/**
 * Asynchronously renames (moves) a file or directory.
 *
 * @param {string} oldPath - The current path of the file or directory.
 * @param {string} newPath - The new path for the file or directory.
 * @returns {Promise<void>} A promise that resolves when the file or directory has been renamed.
 */
export const renameFile = (oldPath: string, newPath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const normalizedOldPath = normalizePath(oldPath);
		const normalizedNewPath = normalizePath(newPath);

		fs.rename(normalizedOldPath, normalizedNewPath, (err) => {
			if (err) {
				if (err.code === 'EXDEV') {
					// If the file is on different file systems, use copy and unlink instead
					copyFile(normalizedOldPath, normalizedNewPath)
						.then(() => unlink(normalizedOldPath))
						.then(resolve)
						.catch((copyRemoveErr) => reject(handleError(copyRemoveErr as NodeJS.ErrnoException, normalizedOldPath)));
				} else {
					reject(handleError(err, normalizedOldPath));
				}
			} else {
				resolve();
			}
		});
	});
};

/**
 * Synchronously renames (moves) a file or directory.
 *
 * @param {string} oldPath - The current path of the file or directory.
 * @param {string} newPath - The new path for the file or directory.
 * @returns {void}
 * @throws {Error} If the file or directory cannot be renamed.
 */
export const renameFileSync = (oldPath: string, newPath: string): void => {
	const normalizedOldPath = normalizePath(oldPath);
	const normalizedNewPath = normalizePath(newPath);

	try {
		fs.renameSync(normalizedOldPath, normalizedNewPath);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedOldPath);
	}
};
//#endregion

//#region copyFile
/**
 * Asynchronously copies a file from one location to another.
 *
 * @param {string} srcPath - The path to the source file.
 * @param {string} destPath - The path to the destination file.
 * @returns {Promise<void>} A promise that resolves when the file has been copied.
 */
export const copyFile = (srcPath: string, destPath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const normalizedSrcPath = normalizePath(srcPath);
		const normalizedDestPath = normalizePath(destPath);

		fs.copyFile(normalizedSrcPath, normalizedDestPath, (err) => {
			if (err) {
				reject(handleError(err, normalizedSrcPath));
			} else {
				resolve();
			}
		});
	});
};

/**
 * Synchronously copies a file from one location to another.
 *
 * @param {string} srcPath - The path to the source file.
 * @param {string} destPath - The path to the destination file.
 * @returns {void}
 * @throws {Error} If the file cannot be copied.
 */
export const copyFileSync = (srcPath: string, destPath: string): void => {
	const normalizedSrcPath = normalizePath(srcPath);
	const normalizedDestPath = normalizePath(destPath);

	try {
		fs.copyFileSync(normalizedSrcPath, normalizedDestPath);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedSrcPath);
	}
};
//#endregion

//#region moveFile
/**
 * Asynchronously moves a file from one location to another.
 *
 * @param {string} srcPath - The path to the source file.
 * @param {string} destPath - The path to the destination file.
 * @returns {Promise<void>} A promise that resolves when the file has been moved.
 */
export const moveFile = (srcPath: string, destPath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const normalizedSrcPath = normalizePath(srcPath);
		const normalizedDestPath = normalizePath(destPath);

		fs.rename(normalizedSrcPath, normalizedDestPath, (err) => {
			if (err) {
				if (err.code === 'EXDEV') {
					// If the file is on different file systems, use copy and unlink instead
					copyFile(normalizedSrcPath, normalizedDestPath)
						.then(() => unlink(normalizedSrcPath))
						.then(resolve)
						.catch((copyRemoveErr) => reject(handleError(copyRemoveErr as NodeJS.ErrnoException, normalizedSrcPath)));
				} else {
					reject(handleError(err, normalizedSrcPath));
				}
			} else {
				resolve();
			}
		});
	});
};

/**
 * Synchronously moves a file from one location to another.
 *
 * @param {string} srcPath - The path to the source file.
 * @param {string} destPath - The path to the destination file.
 * @returns {void}
 * @throws {Error} If the file cannot be moved.
 */
export const moveFileSync = (srcPath: string, destPath: string): void => {
	const normalizedSrcPath = normalizePath(srcPath);
	const normalizedDestPath = normalizePath(destPath);

	try {
		fs.renameSync(normalizedSrcPath, normalizedDestPath);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === 'EXDEV') {
			// If the file is on different file systems, use copy and unlink instead
			try {
				copyFileSync(normalizedSrcPath, normalizedDestPath);
				unlinkSync(normalizedSrcPath);
			} catch (copyRemoveErr) {
				throw handleError(copyRemoveErr as NodeJS.ErrnoException, normalizedSrcPath);
			}
		} else {
			throw handleError(err as NodeJS.ErrnoException, normalizedSrcPath);
		}
	}
};
//#endregion

//#region stat
/**
 * Asynchronously retrieves the stats (information) of a file or directory.
 *
 * @param {string} filePath - The path to the file or directory.
 * @returns {Promise<fs.Stats>} A promise that resolves with the stats of the file or directory.
 */
export const stat = (filePath: string): Promise<fs.Stats> =>
	new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(filePath);

		fs.stat(normalizedPath, (err, stats) => {
			if (err) {
				reject(handleError(err, normalizedPath));
			} else {
				resolve(stats);
			}
		});
	});

/**
 * Synchronously retrieves the stats (information) of a file or directory.
 *
 * @param {string} filePath - The path to the file or directory.
 * @returns {fs.Stats} The stats of the file or directory.
 * @throws {Error} If the stats cannot be retrieved.
 */
export const statSync = (filePath: string): fs.Stats => {
	const normalizedPath = normalizePath(filePath);

	try {
		return fs.statSync(normalizedPath);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedPath);
	}
};
//#endregion

//#region symlink
/**
 * Asynchronously creates a symbolic link.
 *
 * @param {string} target - The path to the target file or directory.
 * @param {string} linkPath - The path where the symbolic link should be created.
 * @param {'file' | 'dir' | 'junction'} [type='file'] - The type of the symbolic link (file, directory, or junction).
 * @returns {Promise<void>} A promise that resolves when the symbolic link has been created.
 */
export const symlink = (target: string, linkPath: string, type: 'file' | 'dir' | 'junction' = 'file'): Promise<void> =>
	new Promise((resolve, reject) => {
		const normalizedTarget = normalizePath(target);
		const normalizedLinkPath = normalizePath(linkPath);

		fs.symlink(normalizedTarget, normalizedLinkPath, type, (err) => {
			if (err) {
				reject(handleError(err, normalizedLinkPath));
			} else {
				resolve();
			}
		});
	});

/**
 * Synchronously creates a symbolic link.
 *
 * @param {string} target - The path to the target file or directory.
 * @param {string} linkPath - The path where the symbolic link should be created.
 * @param {'file' | 'dir' | 'junction'} [type='file'] - The type of the symbolic link (file, directory, or junction).
 * @returns {void}
 * @throws {Error} If the symbolic link cannot be created.
 */
export const symlinkSync = (target: string, linkPath: string, type: 'file' | 'dir' | 'junction' = 'file'): void => {
	const normalizedTarget = normalizePath(target);
	const normalizedLinkPath = normalizePath(linkPath);

	try {
		fs.symlinkSync(normalizedTarget, normalizedLinkPath, type);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedLinkPath);
	}
};
//#endregion

//#region hardlink
/**
 * Asynchronously creates a hard link.
 *
 * @param {string} target - The path to the target file.
 * @param {string} linkPath - The path where the hard link should be created.
 * @returns {Promise<void>} A promise that resolves when the hard link has been created.
 */
export const createHardlink = (target: string, linkPath: string): Promise<void> =>
	new Promise((resolve, reject) => {
		const normalizedTarget = normalizePath(target);
		const normalizedLinkPath = normalizePath(linkPath);

		fs.link(normalizedTarget, normalizedLinkPath, (err) => {
			if (err) {
				reject(handleError(err, normalizedLinkPath));
			} else {
				resolve();
			}
		});
	});

/**
 * Synchronously creates a hard link.
 *
 * @param {string} target - The path to the target file.
 * @param {string} linkPath - The path where the hard link should be created.
 * @returns {void}
 * @throws {Error} If the hard link cannot be created.
 */
export const createHardlinkSync = (target: string, linkPath: string): void => {
	const normalizedTarget = normalizePath(target);
	const normalizedLinkPath = normalizePath(linkPath);

	try {
		fs.linkSync(normalizedTarget, normalizedLinkPath);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedLinkPath);
	}
};
//#endregion

//#endregion

//#region DIRECTORIES

//#region readdir
/**
 * Asynchronously reads the contents of a directory.
 *
 * @param {string} dirPath - The path to the directory.
 * @returns {Promise<string[]>} A promise that resolves with an array of file names in the directory.
 */
export const readdir = (dirPath: string): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(dirPath);

		fs.readdir(normalizedPath, (err, files) => {
			if (err) {
				reject(handleError(err, normalizedPath));
			} else {
				resolve(files);
			}
		});
	});
};

/**
 * Synchronously reads the contents of a directory.
 *
 * @param {string} dirPath - The path to the directory.
 * @returns {string[]} An array of file names in the directory.
 * @throws {Error} If the directory contents cannot be read.
 */
export const readdirSync = (dirPath: string): string[] => {
	const normalizedPath = normalizePath(dirPath);

	try {
		return fs.readdirSync(normalizedPath);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedPath);
	}
};
//#endregion

//#region mkdir
/**
 * Asynchronously creates a directory.
 *
 * @param {string} dirPath - The path to the directory.
 * @param {IDirectoryOptions} [options={}] - The options for creating the directory, such as `recursive` and `mode`.
 * @returns {Promise<void>} A promise that resolves when the directory has been created.
 */
export const mkdir = (dirPath: string, options: IDirectoryOptions = {}): Promise<void> => {
	return new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(dirPath);
		const dirOptions = mergeDirectoryOptions(options);

		fs.mkdir(normalizedPath, dirOptions.mode, (err) => {
			if (err) {
				if (err.code === 'ENOENT' && dirOptions.recursive) {
					const parentDir = path.dirname(normalizedPath);
					mkdir(parentDir, dirOptions)
						.then(() => mkdir(normalizedPath, dirOptions))
						.then(resolve)
						.catch(reject);
				} else {
					reject(handleError(err, normalizedPath));
				}
			} else {
				resolve();
			}
		});
	});
};

/**
 * Synchronously creates a directory.
 *
 * @param {string} dirPath - The path to the directory.
 * @param {IDirectoryOptions} [options={}] - The options for creating the directory, such as `recursive` and `mode`.
 * @returns {void}
 * @throws {Error} If the directory cannot be created.
 */
export const mkdirSync = (dirPath: string, options: IDirectoryOptions = {}): void => {
	const normalizedPath = normalizePath(dirPath);
	const dirOptions = mergeDirectoryOptions(options);

	try {
		fs.mkdirSync(normalizedPath, dirOptions.mode);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT' && dirOptions.recursive) {
			const parentDir = path.dirname(normalizedPath);
			mkdirSync(parentDir, dirOptions);
			mkdirSync(normalizedPath, dirOptions);
		} else {
			throw handleError(err as NodeJS.ErrnoException, normalizedPath);
		}
	}
};
//#endregion

//#region rmdir
/**
 * Asynchronously removes a directory and its contents.
 *
 * @param {string} dirPath - The path to the directory.
 * @returns {Promise<void>} A promise that resolves when the directory has been removed.
 */
export const rmdir = (dirPath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(dirPath);

		fs.readdir(normalizedPath, (err, files) => {
			if (err) {
				reject(handleError(err, normalizedPath));
			}

			let pending = files.length;
			if (!pending) {
				return fs.rmdir(normalizedPath, (rmdirErr) => {
					if (rmdirErr) return reject(handleError(rmdirErr, normalizedPath));
					resolve();
				});
			}

			files.forEach((file) => {
				const fullPath = path.join(normalizedPath, file);
				fs.stat(fullPath, (statErr, stats) => {
					if (statErr) return reject(handleError(statErr, fullPath));

					if (stats.isDirectory()) {
						rmdir(fullPath)
							.then(() => {
								if (!--pending) {
									fs.rmdir(normalizedPath, (rmdirErr) => {
										if (rmdirErr) return reject(handleError(rmdirErr, normalizedPath));
										resolve();
									});
								}
							})
							.catch(reject);
					} else {
						fs.unlink(fullPath, (unlinkErr) => {
							if (unlinkErr) return reject(handleError(unlinkErr, fullPath));
							if (!--pending) {
								fs.rmdir(normalizedPath, (rmdirErr) => {
									if (rmdirErr) return reject(handleError(rmdirErr, normalizedPath));
									resolve();
								});
							}
						});
					}
				});
			});
		});
	});
};

/**
 * Synchronously removes a directory and its contents.
 *
 * @param {string} dirPath - The path to the directory.
 * @returns {void}
 * @throws {Error} If the directory cannot be removed.
 */
export const rmdirSync = (dirPath: string): void => {
	const normalizedPath = normalizePath(dirPath);

	try {
		const files = fs.readdirSync(normalizedPath);

		files.forEach((file) => {
			const fullPath = path.join(normalizedPath, file);
			const stats = fs.statSync(fullPath);

			if (stats.isDirectory()) {
				rmdirSync(fullPath);
			} else {
				fs.unlinkSync(fullPath);
			}
		});

		fs.rmdirSync(normalizedPath);
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedPath);
	}
};
//#endregion

//#region cleardir
/**
 * Asynchronously clears the contents of a directory without removing the directory itself.
 *
 * @param {string} dirPath - The path to the directory.
 * @returns {Promise<void>} A promise that resolves when the directory has been cleared.
 */
export const cleardir = (dirPath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const normalizedPath = normalizePath(dirPath);

		fs.readdir(normalizedPath, (err, files) => {
			if (err) {
				reject(handleError(err, normalizedPath));
			}

			let pending = files.length;
			if (!pending) {
				resolve();
				return;
			}

			files.forEach((file) => {
				const fullPath = path.join(normalizedPath, file);
				fs.stat(fullPath, (statErr, stats) => {
					if (statErr) return reject(handleError(statErr, fullPath));

					if (stats.isDirectory()) {
						cleardir(fullPath)
							.then(() =>
								fs.rmdir(fullPath, (rmdirErr) => {
									if (rmdirErr) return reject(handleError(rmdirErr, fullPath));
									if (!--pending) resolve();
								}),
							)
							.catch(reject);
					} else {
						fs.unlink(fullPath, (unlinkErr) => {
							if (unlinkErr) return reject(handleError(unlinkErr, fullPath));
							if (!--pending) resolve();
						});
					}
				});
			});
		});
	});
};

/**
 * Synchronously clears the contents of a directory without removing the directory itself.
 *
 * @param {string} dirPath - The path to the directory.
 * @returns {void}
 * @throws {Error} If the directory contents cannot be cleared.
 */
export const cleardirSync = (dirPath: string): void => {
	const normalizedPath = normalizePath(dirPath);

	try {
		const files = fs.readdirSync(normalizedPath);

		files.forEach((file) => {
			const fullPath = path.join(normalizedPath, file);
			const stats = fs.statSync(fullPath);

			if (stats.isDirectory()) {
				cleardirSync(fullPath);
				fs.rmdirSync(fullPath);
			} else {
				fs.unlinkSync(fullPath);
			}
		});
	} catch (err) {
		throw handleError(err as NodeJS.ErrnoException, normalizedPath);
	}
};
//#endregion

//#endregion
