import React, { useState, useRef } from 'react';
import { MediaItem } from '../types';
import { StorageService } from '../services/storage';
import { Image as ImageIcon, Upload, X, Check, Search, Smartphone } from 'lucide-react';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  title?: string;
}

export const MediaSelectorModal: React.FC<MediaSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Select Image from Gallery or Upload'
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => StorageService.getMedia());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredMedia = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeKb = Math.round(file.size / 1024) + ' KB';

      const newMedia = StorageService.addMedia({
        name: file.name,
        url: dataUrl,
        mime_type: file.type || 'image/jpeg',
        size: sizeKb,
        dimensions: 'Original Size'
      });

      const updated = StorageService.getMedia();
      setMediaItems(updated);
      setSelectedUrl(newMedia.url);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelectImage(selectedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1d2327] text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F58220] flex items-center justify-center text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">Pick from stored media or upload directly from phone/device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close media selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + Phone Upload Button */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search media files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#F58220] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#238B3D] hover:bg-[#1b6b2f] text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Smartphone className="w-4 h-4" />
              <span>Upload from Phone / PC</span>
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-4 overflow-y-auto flex-1 min-h-[300px]">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">No media items found</p>
              <p className="text-xs text-slate-400">Upload a new photo using the green button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredMedia.map(item => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#F58220] ring-2 ring-[#F58220]/30 shadow-md scale-[1.02]'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="aspect-square bg-slate-100 overflow-hidden relative">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#F58220]/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#F58220] text-white flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-[11px] font-bold text-slate-800 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.size}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
            {selectedUrl ? (
              <span className="text-slate-800 font-medium">Selected: <code className="text-[10px] bg-slate-200 px-1 py-0.5 rounded">{selectedUrl.slice(0, 45)}...</code></span>
            ) : (
              'Click an image above to select'
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedUrl}
              className="px-5 py-2 text-xs font-bold text-white bg-[#F58220] hover:bg-[#e07318] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Use Selected Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
