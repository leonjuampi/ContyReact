
import Button from '../../../components/base/Button';

interface BulkActionsProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onChangePrice: () => void;
  onAssignCategory: () => void;
  onArchive: () => void;
  onClear: () => void;
}

export default function BulkActions({
  selectedCount,
  onActivate,
  onDeactivate,
  onChangePrice,
  onAssignCategory,
  onArchive,
  onClear
}: BulkActionsProps) {
  return (
    <div className="bg-black dark:bg-white text-white dark:text-black rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <i className="ri-checkbox-multiple-line"></i>
            <span className="font-medium">
              {selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onActivate}
              className="border-white/20 text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/10"
            >
              <i className="ri-play-line mr-1"></i>
              Activar
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDeactivate}
              className="border-white/20 text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/10"
            >
              <i className="ri-pause-line mr-1"></i>
              Pausar
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onChangePrice}
              className="border-white/20 text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/10"
            >
              <i className="ri-percent-line mr-1"></i>
              Cambiar precio
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAssignCategory}
              className="border-white/20 text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/10"
            >
              <i className="ri-price-tag-3-line mr-1"></i>
              Categoría
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onArchive}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <i className="ri-archive-line mr-1"></i>
              Archivar
            </Button>
          </div>
        </div>
        
        <button
          onClick={onClear}
          className="p-2 hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
          title="Limpiar selección"
        >
          <i className="ri-close-line"></i>
        </button>
      </div>
    </div>
  );
}
