"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getServiceById, updateService, getServiceCategories, LaundryService } from "@/api/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
  estimatedTime?: string;
  [key: string]: string | undefined;
}

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<LaundryService | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    estimatedTime: 0,
    category: "",
    isActive: true,
    priceModel: "per_kg", // Default to per_kg
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getServiceCategories();
        if (response?.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load service categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        
        if (!id) {
          toast.error("Invalid service ID");
          router.push("/services");
          return;
        }

        const serviceData = await getServiceById(id);
        
        if (serviceData) {
          setService(serviceData);
          
          // Map API response to form data
          setFormData({
            name: serviceData.name || "",
            description: serviceData.description || "",
            price: serviceData.price || 0,
            estimatedTime: serviceData.processingTimeHours || serviceData.estimatedTime || 0,
            category: serviceData.category || "",
            isActive: serviceData.isActive !== undefined ? serviceData.isActive : true,
            priceModel: serviceData.priceModel || "per_kg",
          });
        } else {
          toast.error("Service not found");
          router.push("/services");
        }
      } catch (error) {
        console.error("Error fetching service:", error);
        toast.error("Failed to load service data");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id, router]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.estimatedTime || formData.estimatedTime <= 0) {
      newErrors.estimatedTime = "Processing time must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: isNaN(numberValue) ? 0 : numberValue }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);

    try {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      
      if (!id) {
        toast.error("Invalid service ID");
        return;
      }

      // Map form data to API request
      const updateData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        estimatedTime: formData.estimatedTime,
        category: formData.category,
        isActive: formData.isActive,
        priceModel: formData.priceModel,
      };

      await updateService(id, updateData);
      toast.success("Service updated successfully");
      router.push("/services");
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Failed to update service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/services");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Service</CardTitle>
          <CardDescription>Update the details of an existing service</CardDescription>
        </CardHeader>
        {loading ? (
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter service description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Rp) <span className="text-red-500">*</span></Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleNumberChange}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceModel">Price Model <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.priceModel}
                    onValueChange={(value) => handleSelectChange("priceModel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_kg">Per Kilogram</SelectItem>
                      <SelectItem value="per_piece">Per Piece</SelectItem>
                      <SelectItem value="flat_rate">Flat Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Processing Time (hours) <span className="text-red-500">*</span></Label>
                  <Input
                    id="estimatedTime"
                    name="estimatedTime"
                    type="number"
                    value={formData.estimatedTime}
                    onChange={handleNumberChange}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                  {errors.estimatedTime && (
                    <p className="text-sm text-red-500">{errors.estimatedTime}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                />
                <Label htmlFor="isActive">Active Service</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update Service"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
} 