"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserById } from "@/services/userService";
import { User, UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("User Detail Page Rendering", params);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        console.log("Fetching user with ID:", params.id);
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        
        if (!id) {
          toast.error("Invalid user ID");
          router.push("/users");
          return;
        }
        
        const userData = await getUserById(id);
        console.log("User data received:", userData);
        
        if (userData) {
          setUser(userData);
        } else {
          toast.error("User not found");
          router.push("/users");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id, router]);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case UserRole.STAFF:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case UserRole.USER:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleDelete = () => {
    toast.error("Delete functionality not implemented");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        {!loading && user && (
          <div className="flex space-x-2">
            <Link href={`/users/edit/${user.id}`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete User
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
      ) : user ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription>User ID: {user.id}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                  {user.role.toUpperCase()}
                </Badge>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                  <p className="text-base">{user.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-base">{user.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="text-base">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Updated At</h3>
                  <p className="text-base">{new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-4">
            <Button variant="outline" asChild>
              <Link href="/admin/users">View All Users</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>The requested user could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/users">
              <Button>Go to Users List</Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 