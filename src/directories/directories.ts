import fs from 'fs';
import path from 'path';

export const emptyDir = (dirPath: string): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.readdir(dirPath, (err, files) => {
			if (err) {
				if (err.code === 'ENOENT') {
					return reject(new Error(`Директория по пути ${dirPath} не существует.`));
				} else if (err.code === 'EACCES') {
					return reject(new Error(`Нет доступа для очистки директории по пути ${dirPath}.`));
				} else {
					return reject(new Error(`Ошибка при чтении содержимого директории по пути ${dirPath}: ${err.message}`));
				}
			}

			let pending = files.length;
			if (!pending) return resolve();

			files.forEach((file) => {
				const fullPath = path.join(dirPath, file);
				fs.stat(fullPath, (statErr, stats) => {
					if (statErr) return reject(statErr);

					if (stats.isDirectory()) {
						removeDir(fullPath)
							.then(() => {
								if (!--pending) resolve();
							})
							.catch(reject);
					} else {
						fs.unlink(fullPath, (unlinkErr) => {
							if (unlinkErr) return reject(unlinkErr);
							if (!--pending) resolve();
						});
					}
				});
			});
		});
	});

export const removeDir = (dirPath: string): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.readdir(dirPath, (err, files) => {
			if (err) {
				if (err.code === 'ENOENT') {
					return reject(new Error(`Директория по пути ${dirPath} не существует.`));
				} else if (err.code === 'EACCES') {
					return reject(new Error(`Нет доступа для удаления директории по пути ${dirPath}.`));
				} else {
					return reject(new Error(`Ошибка при чтении содержимого директории по пути ${dirPath}: ${err.message}`));
				}
			}

			let pending = files.length;
			if (!pending) {
				return fs.rmdir(dirPath, (rmdirErr) => {
					if (rmdirErr) return reject(rmdirErr);
					resolve();
				});
			}

			files.forEach((file) => {
				const fullPath = path.join(dirPath, file);
				fs.stat(fullPath, (statErr, stats) => {
					if (statErr) return reject(statErr);

					if (stats.isDirectory()) {
						removeDir(fullPath)
							.then(() => {
								if (!--pending) {
									fs.rmdir(dirPath, (rmdirErr) => {
										if (rmdirErr) return reject(rmdirErr);
										resolve();
									});
								}
							})
							.catch(reject);
					} else {
						fs.unlink(fullPath, (unlinkErr) => {
							if (unlinkErr) return reject(unlinkErr);
							if (!--pending) {
								fs.rmdir(dirPath, (rmdirErr) => {
									if (rmdirErr) return reject(rmdirErr);
									resolve();
								});
							}
						});
					}
				});
			});
		});
	});

export const readDir = (dirPath: string): Promise<string[]> =>
	new Promise((resolve, reject) => {
		fs.readdir(dirPath, (err, files) => {
			if (err) {
				if (err.code === 'ENOENT') {
					reject(new Error(`Директория по пути ${dirPath} не существует.`));
				} else {
					reject(new Error(`Ошибка при чтении содержимого директории по пути ${dirPath}: ${err.message}`));
				}
			} else {
				resolve(files);
			}
		});
	});

// Функция для создания директории
export const mkdir = (dirPath: string): Promise<void> =>
	new Promise((resolve, reject) => {
		fs.mkdir(dirPath, (err) => {
			if (!err) {
				resolve();
			} else if (err.code === 'EEXIST') {
				// Если директория уже существует
				resolve();
			} else if (err.code === 'ENOENT') {
				// Если нет промежуточных директорий
				const parentDir = path.dirname(dirPath);
				mkdir(parentDir)
					.then(() => mkdir(dirPath).then(resolve).catch(reject))
					.catch(reject);
			} else {
				reject(err);
			}
		});
	});
