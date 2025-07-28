import React from 'react';
import { DownloadedFile } from '../types/filesystem';
import { Download, File, Calendar, HardDrive } from 'lucide-react';

interface DownloadsPanelProps {
  downloads: DownloadedFile[];
  isOpen: boolean;
  onClose: () => void;
}

const DownloadsPanel: React.FC<DownloadsPanelProps> = ({ downloads, isOpen, onClose }) => {
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`;
    return `${Math.round(size / (1024 * 1024))}MB`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleViewFile = (file: DownloadedFile) => {
    // Create a modal or new window to view file content
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${file.name} - Downloaded from ${file.sourceIp}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                background: #000; 
                color: #00ff41; 
                padding: 20px; 
                margin: 0;
              }
              .header {
                border-bottom: 1px solid #00ff41;
                padding-bottom: 10px;
                margin-bottom: 20px;
              }
              pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${file.name}</h2>
              <p>Source: ${file.sourceIp} | Downloaded: ${formatDate(file.downloadedAt)} | Size: ${formatFileSize(file.size)}</p>
            </div>
            <pre>${file.content}</pre>
          </body>
        </html>
      `);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border-2 border-purple-400 rounded-lg w-full max-w-4xl h-[80vh] mx-4 shadow-2xl shadow-purple-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-purple-400/30 bg-black/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-mono text-lg font-bold">
              Downloaded Files ({downloads.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-purple-300 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-black">
          {downloads.length === 0 ? (
            <div className="text-center text-purple-300 mt-8">
              <HardDrive className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-mono mb-2">No Downloads Yet</h3>
              <p className="text-purple-400">
                Connect to servers and use the 'download [filename]' command to copy files here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {downloads.map((file, index) => (
                <div
                  key={index}
                  className="bg-purple-900/20 border border-purple-400/30 rounded-lg p-4 hover:bg-purple-900/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <File className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-purple-300 font-mono font-bold">{file.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-purple-400">
                          <span>Source: {file.sourceIp}</span>
                          <span>Size: {formatFileSize(file.size)}</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(file.downloadedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewFile(file)}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm font-mono transition-colors"
                    >
                      View
                    </button>
                  </div>
                  
                  {/* File preview */}
                  <div className="mt-3 bg-black/50 rounded p-3 border border-purple-400/20">
                    <pre className="text-purple-300 text-xs font-mono overflow-hidden">
                      {file.content.length > 200 
                        ? file.content.substring(0, 200) + '...' 
                        : file.content
                      }
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-purple-400/30 bg-black/50">
          <div className="text-center text-purple-400 text-sm font-mono">
            Total files: {downloads.length} | 
            Total size: {formatFileSize(downloads.reduce((sum, file) => sum + file.size, 0))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadsPanel;