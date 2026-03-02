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

  // src/dropbox/dropbox.service.ts
  async ensureFolder(path: string) {
    const p = path.startsWith('/') ? path : `/${path}`;

    try {
      const { result } = await this.dbx.filesCreateFolderV2({ path: p, autorename: false });
      return result.metadata; // carpeta creada
    } catch (e: any) {
      // Ya existe la carpeta -> OK silencioso
      const summary: string | undefined = e?.error?.error_summary;
      const tag: string | undefined = e?.error?.error?.['.tag'];
      const pathTag: string | undefined = e?.error?.error?.path?.['.tag'];
      const conflictTag: string | undefined = e?.error?.error?.path?.conflict?.['.tag'];

      const isConflict =
        summary?.startsWith('path/conflict') ||
        tag === 'path' && pathTag === 'conflict' && conflictTag === 'folder';

      if (isConflict) {
        return { path_lower: p.toLowerCase(), name: p.split('/').pop() };
      }
      throw e; // cualquier otro error sí se propaga
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

  async getFolderLink(folderPath: string) {
    try {
      const sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
        path: folderPath.startsWith('/') ? folderPath : `/${folderPath}`,
      });
      return sharedLink.result.url;
    } catch (error: any) {
      if (error?.error?.error?.shared_link_already_exists?.metadata?.url) {
        return error.error.error.shared_link_already_exists.metadata.url;
      }
      throw error;
    }
  }

  /** Crea o obtiene enlace compartido de un archivo (para foto de perfil, etc.). Devuelve URL directa (?dl=1). */
  async getFileSharedLink(filePath: string): Promise<string> {
    const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const toDirectLink = (url: string) => {
      if (!url) return url;
      try {
        const u = new URL(url);
        u.searchParams.set('dl', '1');
        return u.toString();
      } catch {
        return url.includes('?') ? `${url}&dl=1` : `${url}?dl=1`;
      }
    };
    try {
      const { result } = await this.dbx.sharingCreateSharedLinkWithSettings({
        path,
      });
      return toDirectLink(result.url);
    } catch (error: any) {
      if (error?.error?.error?.shared_link_already_exists?.metadata?.url) {
        return toDirectLink(error.error.error.shared_link_already_exists.metadata.url);
      }
      throw error;
    }
  }

  async getTempLinksForFolder(folderPath: string) {
    // Obtener lista de archivos en la carpeta
    const { result } = await this.dbx.filesListFolder({ path: folderPath });
    
    // Obtener el enlace temporal para cada archivo
    const tempLinks = await Promise.all(
      result.entries.map(async (entry) => {
        if (entry['.tag'] === 'file') {  // Asegúrate de que sea un archivo
          // entry.path_lower puede ser undefined según los tipos, así que comprobamos y usamos path_display como fallback
          const path = entry.path_lower ?? entry.path_display;
          if (!path) return null;
          const { result: fileResult } = await this.dbx.filesGetTemporaryLink({ path });
          return fileResult.link; // Guarda el enlace temporal
        }
        return null;
      })
    );

    // Filtra cualquier enlace nulo (si es que hay carpetas u otros elementos no archivos)
    return tempLinks.filter(Boolean) as string[];
  }

}
