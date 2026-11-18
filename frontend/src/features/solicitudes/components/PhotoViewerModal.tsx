import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

interface PhotoViewerModalProps {
  imageUrl: string | null;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  imageUrl,
  title,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  // Si la ruta es relativa (/uploads/...), anteponer la URL base del backend si es necesario
  const fullUrl = imageUrl.startsWith('http')
    ? imageUrl
    : `http://localhost:8000${imageUrl}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-700 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <h4 className="text-sm font-bold tracking-tight">{title}</h4>
          <div className="flex items-center space-x-2">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Imagen */}
        <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[75vh] overflow-auto">
          <img
            src={fullUrl}
            alt={title}
            className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg border border-slate-800"
            onError={(e) => {
              // Si falla la carga con localhost:8000, intentar ruta directa
              const target = e.target as HTMLImageElement;
              if (target.src !== imageUrl) {
                target.src = imageUrl;
              }
            }}
          />
        </div>

        {/* Pie */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Evidencia fotográfica oficial registrada en el sistema</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
