
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Trash, UserX } from "lucide-react";
import { UserCodeAuth } from "./UserCodeAuth";

type UserSearchResult = {
  id: string;
  email?: string;
  lastSignIn?: string;
  createdAt?: string;
  source?: string;
};

interface UsersTabProps {
  adminCodeAuthenticated: boolean;
  onAdminCodeVerify: () => void;
  isSearchingUsers: boolean;
  isLoading: boolean;
  searchResults: UserSearchResult[];
  selectedUser: any | null;
  isDeleting: boolean;
  onSearchUsers: (query: string) => void;
  onGetUserDetails: (userId: string) => void;
  onDeleteUserData: (userId: string) => void;
}

export function UsersTab({
  adminCodeAuthenticated,
  onAdminCodeVerify,
  isSearchingUsers,
  isLoading,
  searchResults,
  selectedUser,
  isDeleting,
  onSearchUsers,
  onGetUserDetails,
  onDeleteUserData
}: UsersTabProps) {
  const [userSearchQuery, setUserSearchQuery] = useState("");
  
  const handleSearch = () => {
    onSearchUsers(userSearchQuery);
  };

  return (
    <>
      {!adminCodeAuthenticated && (
        <UserCodeAuth onVerify={onAdminCodeVerify} />
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by email or user ID"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  disabled={!adminCodeAuthenticated}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearchingUsers || !adminCodeAuthenticated}
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearchingUsers ? "Searching..." : "Search"}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs truncate max-w-[100px]">
                          {user.id}
                        </TableCell>
                        <TableCell>{user.email || "—"}</TableCell>
                        <TableCell>{user.source || "Auth"}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGetUserDetails(user.id)}
                            disabled={isLoading}
                          >
                            Details
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isDeleting}
                              >
                                <Trash className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User Data</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete all data associated with this user.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteUserData(user.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Delete User Data
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">User ID</h3>
                <p className="font-mono text-sm bg-secondary/30 p-2 rounded-md">{selectedUser.id}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Weight Logs ({selectedUser.data.weightLogs?.length || 0})</h3>
                {selectedUser.data.weightLogs?.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.data.weightLogs.map((log: any) => (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                            <TableCell>{log.weight}</TableCell>
                            <TableCell>{log.notes || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No weight logs found</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Favorite Foods ({selectedUser.data.favorites?.length || 0})</h3>
                {selectedUser.data.favorites?.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Food ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Added</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.data.favorites.map((fav: any) => (
                          <TableRow key={fav.id}>
                            <TableCell className="font-mono text-xs truncate max-w-[100px]">{fav.food_id}</TableCell>
                            <TableCell>{fav.foods?.name || "Unknown"}</TableCell>
                            <TableCell>{new Date(fav.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No favorite foods found</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
