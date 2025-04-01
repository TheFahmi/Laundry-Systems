import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tag, 
  Banknote, 
  Trash2, 
  FileText, 
  Package, 
  Scale, 
  Hash,
  Edit,
  Copy
} from 'lucide-react';
import { createAuthHeaders } from '@/lib/api-utils';
import { toast } from 'sonner';
import BottomSheet from './BottomSheet';
import { Badge } from '@/components/ui/badge';
import ActionSheet, { ActionItem } from './ActionSheet';
import { Service, ServicePriceModel } from '@/types/service';

interface ServiceDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

export default function ServiceDetailSheet({
  isOpen,
  onClose,
  service,
  onEdit,
  onDelete
}: ServiceDetailSheetProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!service) return null;

  const isWeightBased = service.priceModel === ServicePriceModel.PER_KG;
  
  // Format price with price model
  const formatServicePrice = () => {
    return `Rp ${service.price.toLocaleString('id-ID')}${isWeightBased ? '/kg' : '/item'}`;
  };

  // Get category name
  const getCategoryName = () => {
    const categories: Record<string, string> = {
      'uncategorized': 'Tanpa Kategori',
      'cuci': 'Cuci',
      'setrika': 'Setrika',
      'laundry': 'Laundry',
      'dry clean': 'Dry Clean',
      'express': 'Express'
    };
    
    return categories[service.category?.toLowerCase() || 'uncategorized'] || service.category || 'Tanpa Kategori';
  };

  // Get category color
  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      'cuci': 'bg-blue-50 border-blue-200 text-blue-700',
      'setrika': 'bg-amber-50 border-amber-200 text-amber-700',
      'laundry': 'bg-green-50 border-green-200 text-green-700',
      'dry clean': 'bg-purple-50 border-purple-200 text-purple-700',
      'express': 'bg-red-50 border-red-200 text-red-700',
      'uncategorized': 'bg-gray-50 border-gray-200 text-gray-700'
    };
    
    return colors[service.category?.toLowerCase() || 'uncategorized'] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  // Get price model color and text
  const getPriceModelInfo = () => {
    if (isWeightBased) {
      return {
        color: 'bg-purple-50 border-purple-200 text-purple-700',
        icon: <Scale className="h-4 w-4 mr-1" />,
        text: 'Per Kilogram (KG)'
      };
    } else {
      return {
        color: 'bg-blue-50 border-blue-200 text-blue-700',
        icon: <Hash className="h-4 w-4 mr-1" />,
        text: 'Per Unit/Item'
      };
    }
  };

  // Handle delete service
  const handleDeleteService = async () => {
    if (!service.id) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
        headers: {
          ...createAuthHeaders()
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service');
      }
      
      toast.success('Layanan berhasil dihapus');
      onClose();
      onDelete(service.id);
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error(error.message || 'Gagal menghapus layanan');
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  // Actions for the action sheet
  const actions: ActionItem[] = [
    {
      icon: <Edit className="h-5 w-5 text-blue-500" />,
      label: "Edit Layanan",
      onClick: () => {
        setIsActionsOpen(false);
        setTimeout(() => onEdit(service), 300);
      }
    },
    {
      icon: <Copy className="h-5 w-5 text-green-500" />,
      label: "Duplikat Layanan",
      onClick: () => {
        // Create a duplicate without ID
        const duplicate: Omit<Service, 'id'> & { id?: string } = {
          ...service,
          id: undefined,
          name: `${service.name} (copy)`
        };
        setIsActionsOpen(false);
        setTimeout(() => onEdit(duplicate as Service), 300);
      }
    },
    {
      icon: <Trash2 className="h-5 w-5 text-red-500" />,
      label: "Hapus Layanan",
      onClick: () => {
        setIsActionsOpen(false);
        setTimeout(() => setIsConfirmingDelete(true), 300);
      },
      variant: "destructive"
    }
  ];

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title="Detail Layanan"
        description="Informasi detail layanan"
      >
        <div className="px-4 py-4">
          <div className="space-y-6">
            {/* Service name */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center">
                <Tag className="h-5 w-5 mr-2 text-blue-500" />
                {service.name}
              </h3>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center">
                <Banknote className="h-5 w-5 mr-2 text-green-600" />
                <span className="text-green-700 font-medium">Harga</span>
              </div>
              <div className="text-lg font-bold text-green-700">
                {formatServicePrice()}
              </div>
            </div>

            {/* Category and Price Model */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border space-y-1">
                <div className="text-sm text-gray-500">Kategori</div>
                <Badge 
                  variant="outline" 
                  className={`${getCategoryColor()} mt-1`}
                >
                  <Package className="h-3.5 w-3.5 mr-1" />
                  {getCategoryName()}
                </Badge>
              </div>
              
              <div className="p-3 rounded-lg border space-y-1">
                <div className="text-sm text-gray-500">Model Harga</div>
                <Badge 
                  variant="outline" 
                  className={`${getPriceModelInfo().color} mt-1`}
                >
                  {getPriceModelInfo().icon}
                  {getPriceModelInfo().text}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {service.description && (
              <div className="p-3 rounded-lg border space-y-1">
                <div className="text-sm text-gray-500 flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-gray-400" />
                  Deskripsi
                </div>
                <div className="text-gray-700 whitespace-pre-line">
                  {service.description}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => onEdit(service)}
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Layanan
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setIsActionsOpen(true)}
                className="w-full"
              >
                Opsi Lainnya
              </Button>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Actions sheet */}
      <ActionSheet
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        title="Opsi Layanan"
        description="Pilih tindakan untuk layanan ini"
        actions={actions}
      />

      {/* Delete confirmation */}
      <BottomSheet
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        title="Hapus Layanan?"
        description="Tindakan ini tidak dapat dibatalkan"
      >
        <div className="p-4 space-y-4">
          <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-red-700">
            <p>Anda akan menghapus layanan:</p>
            <p className="font-semibold mt-1">{service.name}</p>
            <p className="text-sm mt-2">Semua data terkait layanan ini akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsConfirmingDelete(false)}
              className="flex-1"
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
              className="flex-1"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus Layanan"}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
} 