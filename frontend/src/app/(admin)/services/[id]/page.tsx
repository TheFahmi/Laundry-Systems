"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getServiceById, LaundryService } from "@/api/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<LaundryService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const response = await getServiceById(id);
        
        if (response?.data) {
          setService(response.data);
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

  const getPriceModelDisplay = (priceModel?: string) => {
    switch (priceModel) {
      case 'per_kg':
        return 'per Kilogram';
      case 'per_piece':
        return 'per Item';
      case 'flat_rate':
        return 'Flat Rate';
      default:
        return 'Unknown';
    }
  };

  const handleDelete = () => {
    toast.error("Delete functionality not implemented");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
        {!loading && service && (
          <div className="flex space-x-2">
            <Link href={`/services/edit/${service.id}`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Service
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete Service
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ) : service ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{service.name}</CardTitle>
                <CardDescription>Service ID: {service.id}</CardDescription>
              </div>
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                  <p className="text-lg font-semibold">{formatRupiah(service.price)} {getPriceModelDisplay(service.priceModel)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p className="text-base">{service.category || "Uncategorized"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Processing Time</h3>
                  <p className="text-base">{service.processingTimeHours || service.estimatedTime || "N/A"} hours</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="text-base whitespace-pre-wrap">{service.description || "No description provided."}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="text-base">{new Date(service.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Updated At</h3>
                  <p className="text-base">{new Date(service.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-4">
            <Link href="/services">
              <Button variant="ghost">Return to Services List</Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Service Not Found</CardTitle>
            <CardDescription>The requested service could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/services">
              <Button>Go to Services List</Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 