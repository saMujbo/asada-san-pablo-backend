import { Inject, Injectable } from '@nestjs/common';
import { Dropbox, files } from 'dropbox';

@Injectable()
export class DropboxService {
  constructor(@Inject('DROPBOX') private readonly dbx: Dropbox) {}

  async uploadBuffer(buffer: Buffer, destPath: string) {
    const { result } = await this.dbx.filesUpload({
      path: destPath.startsWith('/') ? destPath : `/${destPath}`,
      contents: buffer,
      autorename: true,
      mode: { '.tag': 'add' },
      mute: false,
      strict_conflict: false,
    });
    return result; // metadata del archivo
  }

  async uploadMany(files: { buffer: Buffer; path: string }[]) {
    const results: files.FileMetadata[] = [];
    for (const f of files) {
      // Simple (hasta ~150MB). Para >150MB usar sesiones chunked.
      const { result } = await this.dbx.filesUpload({
        path: f.path.startsWith('/') ? f.path : `/${f.path}`,
        contents: f.buffer,
        autorename: true,
        mode: { '.tag': 'add' },
      });
      results.push(result);
    }
    return results;
  }

  async listFolder(path = '') {
    const { result } = await this.dbx.filesListFolder({
      path: path && !path.startsWith('/') ? `/${path}` : path,
    });
    return result.entries;
  }

  async ensureFolder(path: string) {
    const p = path.startsWith('/') ? path : `/${path}`;
    try {
      const { result } = await this.dbx.filesCreateFolderV2({ path: p, autorename: false });
      return result.metadata;
    } catch (e: any) {
      // Si ya existe, la API lanza error; podemos devolver metadata básica
      if (e?.error?.error?.path?.reason?.['.tag'] === 'conflict') {
        return { path_lower: p, name: p.split('/').pop() };
      }
      throw e;
    }
  }

  async getTempLink(path: string) {
    const { result } = await this.dbx.filesGetTemporaryLink({
      path: path.startsWith('/') ? path : `/${path}`,
    });
    return result; // { metadata, link }
  }

  async delete(path: string) {
    const { result } = await this.dbx.filesDeleteV2({
      path: path.startsWith('/') ? path : `/${path}`,
    });
    return result.metadata;
  }
}
