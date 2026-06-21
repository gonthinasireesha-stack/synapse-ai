// src/utils/fileSystem.js
//
// Small wrapper around deleting a file from disk, with the kind of
// defensive handling real production code needs around filesystem I/O.

import fs from 'fs/promises';

export async function deleteFileFromDisk(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    // ENOENT = "file doesn't exist". We deliberately DON'T throw here —
    // if the file is already gone (manually deleted, already cleaned up,
    // or never successfully written in the first place), that's fine;
    // the end state we want (file not present) is already true.
    // Any OTHER error (permissions, disk issues) we DO want to surface.
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}