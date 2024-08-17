import * as fs from 'fs';

// Функция для проверки существования файла
export const exists = (filePath: string): Promise<boolean> =>
	new Promise((resolve) => {
		fs.access(filePath, fs.constants.F_OK, (err) => resolve(!err));
	});

// Функция для проверки доступа к файлу
export const access = (
	filePath: string,
	options: { read?: boolean; write?: boolean; execute?: boolean },
): Promise<void> => {
	let mode = 0;
	if (options.read) mode |= fs.constants.R_OK;
	if (options.write) mode |= fs.constants.W_OK;
	if (options.execute) mode |= fs.constants.X_OK;

	return new Promise((resolve, reject) => {
		fs.access(filePath, mode, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

// Функция для чтения файла с поддержкой настроек
export const readFile = (
	filePath: string,
	options: { encoding?: BufferEncoding; flag?: string } = { encoding: 'utf8' },
): Promise<string | Buffer> =>
	new Promise((resolve, reject) => {
		fs.readFile(filePath, options, (err, data) => {
			if (err) {
				if (err.code === 'ENOENT') {
					reject(new Error(`Файл по пути ${filePath} не существует.`));
				} else if (err.code === 'EACCES') {
					reject(new Error(`Нет доступа для чтения файла по пути ${filePath}. Файл заблокирован.`));
				} else {
					reject(new Error(`Ошибка при чтении файла по пути ${filePath}: ${err.message}`));
				}
			} else {
				resolve(data);
			}
		});
	});

// Функция для записи в файл с поддержкой настроек
export const write = (
	filePath: string,
	data: string | Buffer,
	options: { encoding?: BufferEncoding; mode?: number; flag?: string } = { encoding: 'utf8', flag: 'w' },
): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.writeFile(filePath, data, options, (err) => {
			if (err) {
				if (err.code === 'EACCES') {
					reject(new Error(`Нет доступа для записи в файл по пути ${filePath}. Файл заблокирован.`));
				} else {
					reject(new Error(`Ошибка при записи файла по пути ${filePath}: ${err.message}`));
				}
			} else {
				resolve();
			}
		});
	});

// Функция для удаления файла
export const remove = (filePath: string): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.unlink(filePath, (err) => {
			if (err) {
				if (err.code === 'ENOENT') {
					reject(new Error(`Файл по пути ${filePath} не существует.`));
				} else if (err.code === 'EACCES') {
					reject(new Error(`Нет доступа для удаления файла по пути ${filePath}. Файл заблокирован.`));
				} else {
					reject(new Error(`Ошибка при удалении файла по пути ${filePath}: ${err.message}`));
				}
			} else {
				resolve();
			}
		});
	});

export const appendFile = (
	filePath: string,
	data: string | Buffer,
	options: { encoding?: BufferEncoding; mode?: number; flag?: string } = { encoding: 'utf8', flag: 'a' },
): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.appendFile(filePath, data, options, (err) => {
			if (err) {
				if (err.code === 'ENOENT') {
					reject(new Error(`Файл по пути ${filePath} не существует.`));
				} else if (err.code === 'EACCES') {
					reject(new Error(`Нет доступа для записи в файл по пути ${filePath}. Файл заблокирован.`));
				} else {
					reject(new Error(`Ошибка при добавлении данных в файл по пути ${filePath}: ${err.message}`));
				}
			} else {
				resolve();
			}
		});
	});

// Функция для переименования файла или перемещения его в другую директорию
export const renameFile = (oldPath: string, newPath: string): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.rename(oldPath, newPath, (err) => {
			if (err) {
				if (err.code === 'ENOENT') {
					reject(new Error(`Файл по пути ${oldPath} не существует.`));
				} else if (err.code === 'EACCES') {
					reject(new Error(`Нет доступа для переименования файла по пути ${oldPath}. Файл заблокирован.`));
				} else if (err.code === 'EXDEV') {
					reject(
						new Error(`Не удается переместить файл между различными устройствами по пути ${oldPath} -> ${newPath}.`),
					);
				} else {
					reject(new Error(`Ошибка при переименовании файла по пути ${oldPath}: ${err.message}`));
				}
			} else {
				resolve();
			}
		});
	});

// Функция для копирования файла
export const copyFile = (srcPath: string, destPath: string): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.copyFile(srcPath, destPath, (err) => {
			if (err) {
				if (err.code === 'ENOENT') {
					reject(new Error(`Файл по пути ${srcPath} не существует.`));
				} else if (err.code === 'EACCES') {
					reject(new Error(`Нет доступа для копирования файла по пути ${srcPath}. Файл заблокирован.`));
				} else {
					reject(new Error(`Ошибка при копировании файла по пути ${srcPath} -> ${destPath}: ${err.message}`));
				}
			} else {
				resolve();
			}
		});
	});

// Функция для перемещения файла
export const moveFile = (srcPath: string, destPath: string): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.rename(srcPath, destPath, (err) => {
			if (err) {
				if (err.code === 'EXDEV') {
					// Если файл находится на разных файловых системах, используем копирование и удаление
					copyFile(srcPath, destPath)
						.then(() => remove(srcPath))
						.then(resolve)
						.catch(reject);
				} else if (err.code === 'ENOENT') {
					reject(new Error(`Файл по пути ${srcPath} не существует.`));
				} else if (err.code === 'EACCES') {
					reject(new Error(`Нет доступа для перемещения файла по пути ${srcPath}. Файл заблокирован.`));
				} else {
					reject(new Error(`Ошибка при перемещении файла по пути ${srcPath} -> ${destPath}: ${err.message}`));
				}
			} else {
				resolve();
			}
		});
	});

export const getFileStats = (filePath: string): Promise<fs.Stats> =>
	new Promise((resolve, reject) => {
		fs.stat(filePath, (err, stats) => {
			if (err) {
				if (err.code === 'ENOENT') {
					reject(new Error(`Файл по пути ${filePath} не существует.`));
				} else {
					reject(new Error(`Ошибка при получении информации о файле по пути ${filePath}: ${err.message}`));
				}
			} else {
				resolve(stats);
			}
		});
	});

// Функция для рекурсивного удаления директории

// Функция для создания символической ссылки
export const symlink = (target: string, path: string, type: 'file' | 'dir' | 'junction' = 'file'): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.symlink(target, path, type, (err) => {
			if (err) {
				if (err.code === 'EEXIST') {
					reject(new Error(`Символическая ссылка по пути ${path} уже существует.`));
				} else if (err.code === 'ENOENT') {
					reject(new Error(`Целевой файл или директория по пути ${target} не существует.`));
				} else if (err.code === 'EACCES') {
					reject(new Error(`Нет доступа для создания символической ссылки по пути ${path}.`));
				} else {
					reject(new Error(`Ошибка при создании символической ссылки по пути ${path}: ${err.message}`));
				}
			} else {
				resolve();
			}
		});
	});

// Функция для создания жесткой ссылки
export const hardlink = (target: string, path: string): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.link(target, path, (err) => {
			if (err) {
				if (err.code === 'ENOENT') {
					reject(new Error(`Файл по пути ${target} не существует.`));
				} else if (err.code === 'EEXIST') {
					reject(new Error(`Файл по пути ${path} уже существует.`));
				} else if (err.code === 'EXDEV') {
					reject(new Error(`Жесткая ссылка не может быть создана между различными файловыми системами.`));
				} else if (err.code === 'EACCES') {
					reject(new Error(`Нет доступа для создания жесткой ссылки по пути ${path}.`));
				} else {
					reject(new Error(`Ошибка при создании жесткой ссылки по пути ${path}: ${err.message}`));
				}
			} else {
				resolve();
			}
		});
	});

// Функция для отслеживания изменений в файле
export const watchFile = (
	filePath: string,
	listener: (curr: fs.Stats, prev: fs.Stats) => void,
	options: { interval?: number; persistent?: boolean } = { interval: 5007, persistent: true },
): void => {
	fs.watchFile(filePath, options, listener);
};

// Функция для остановки отслеживания файла
export const unwatchFile = (filePath: string, listener?: (curr: fs.Stats, prev: fs.Stats) => void): void => {
	fs.unwatchFile(filePath, listener);
};
