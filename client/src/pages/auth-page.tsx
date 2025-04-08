import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import { SouthAfricanPattern, SouthAfricanAccent } from "@/components/ui/south-african-pattern";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginUserSchema>>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form with extended schema
  const registerForm = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      displayName: "",
      password: "",
      confirmPassword: "",
      bio: "",
      location: "",
      profilePicture: "",
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginUserSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerUserSchema>) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <SouthAfricanPattern />
      
      {/* Left column - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary font-poppins">Sqamtho</h1>
            <p className="mt-2 text-sm text-gray-600">
              Connect with friends and the South African community
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <div className="bg-white py-8 px-6 shadow rounded-lg">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab("register")}
                    >
                      Create new account
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <div className="bg-white py-8 px-6 shadow rounded-lg">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Tell us about yourself" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your city or province" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="profilePicture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Picture (Optional)</FormLabel>
                          <FormControl>
                            <FileUpload 
                              onFileSelect={(fileData) => {
                                field.onChange(fileData || "");
                              }}
                              defaultValue={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab("login")}
                    >
                      Login to existing account
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right column - Hero */}
      <div className="hidden md:flex md:w-1/2 bg-primary/5 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0">
          <SouthAfricanPattern />
        </div>
        
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 font-poppins">Welcome to Sqamtho</h1>
            <SouthAfricanAccent className="my-4" />
            <p className="mt-4 text-xl text-gray-600">
              South Africa's own social platform that brings people together.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Connect with Friends</h2>
                <p className="mt-1 text-gray-600">Stay in touch with friends and family, share updates and photos.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-secondary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Real-time Messaging</h2>
                <p className="mt-1 text-gray-600">Send private messages, create group chats, and stay connected on the go.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-accent/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Join Communities</h2>
                <p className="mt-1 text-gray-600">Find groups that match your interests and connect with like-minded South Africans.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Sqamtho · South Africa's Social Platform
          </div>
        </div>
      </div>
    </div>
  );
}
