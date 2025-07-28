export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Record<string, FileSystemNode>;
  size?: number;
  permissions?: string;
  owner?: string;
  modified?: string;
}

export interface FileSystem {
  root: Record<string, FileSystemNode>;
  currentPath: string[];
}

export interface DownloadedFile {
  name: string;
  content: string;
  sourceIp: string;
  downloadedAt: Date;
  size: number;
}