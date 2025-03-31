
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Current password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "New password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Confirm password must be at least 6 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const emailSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const AccountSection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, updateUserPassword, updateUserEmail, deleteUserAccount } = useAuth();
  const [isEmailChangeLoading, setIsEmailChangeLoading] = useState(false);
  
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      const result = await updateUserPassword(values.currentPassword, values.newPassword);
      
      if (result) {
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated",
        });
        passwordForm.reset();
      }
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      setIsEmailChangeLoading(true);
      
      const result = await updateUserEmail(values.email);
      
      if (result) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox to confirm your new email address",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating email",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setIsEmailChangeLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/splash");
  };

  const handleDeleteAccount = async () => {
    try {
      const success = await deleteUserAccount();
      if (success) {
        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted",
        });
        navigate("/splash");
      }
    } catch (error: any) {
      toast({
        title: "Error deleting account",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="glass-panel p-6 rounded-lg text-center">
        <p className="text-muted-foreground">
          You need to be logged in to manage your account. 
          <Button 
            variant="link" 
            className="px-1"
            onClick={() => navigate("/auth/callback")}
          >
            Sign in
          </Button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{user.email}</h3>
            <p className="text-sm text-muted-foreground">Logged in</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      
      <div className="glass-panel p-4 rounded-lg">
        <h3 className="font-medium mb-4 flex items-center">
          <Mail className="mr-2 h-4 w-4" />
          Update Email Address
        </h3>
        
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isEmailChangeLoading || emailForm.formState.isSubmitting}
            >
              Send Verification Email
            </Button>
          </form>
        </Form>
      </div>
      
      <div className="glass-panel p-4 rounded-lg">
        <h3 className="font-medium mb-4 flex items-center">
          <Lock className="mr-2 h-4 w-4" />
          Change Password
        </h3>
        
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={passwordForm.formState.isSubmitting}
            >
              Update Password
            </Button>
          </form>
        </Form>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline"
            className="w-full border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountSection;
