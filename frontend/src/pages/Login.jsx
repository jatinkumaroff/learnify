import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useLoginUserMutation, useRegisterUserMutation } from "@/features/api/authApi"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const getErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  if (typeof error?.data?.message === "string") return error.data.message;
  if (typeof error?.error === "string") return error.error;
  return fallbackMessage;
};

const Login = () => {
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [registerUser, { data: registerData, error: registerError, isLoading: registerIsLoading, isSuccess: registerisSuccess }] = useRegisterUserMutation();
  const [loginUser, { data: loginData, error: loginError, isLoading: loginIsLoading, isSuccess: loginisSuccess }] = useLoginUserMutation();
  const [signupInput, setSignupInput] = useState({ name: "", email: "", password: "", role: "student" });
  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });

    }
  }
  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;
    await action(inputData);
  }
  const navigate = useNavigate();
  useEffect(()=>{
    if(registerisSuccess && registerData){
      toast.success(registerData.message || "Successfully signed up.")
    }
    if(registerError){
      toast.error(getErrorMessage(registerError, "Signup failed."))
    }
    if(loginisSuccess && loginData){
      toast.success(loginData.message || "Logged in successfully.")
      const userRole = loginData?.user?.role;
      navigate(userRole === "instructor" ? "/admin/dashboard" : "/")
    }
    if(loginError){
      toast.error(getErrorMessage(loginError, "Login failed."))
    }
  },[registerisSuccess, registerData, registerError, loginisSuccess, loginData, loginError, navigate])
  return (
    <div className="flex items-center w-full justify-center mt-20">
    <Tabs defaultValue="login" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
        <TabsTrigger value="login">Login</TabsTrigger>
      </TabsList>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create a new account and click signup when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                name="name"
                value={signupInput.name}
                onChange={(e) => changeInputHandler(e, "signup")}
                placeholder="eg. JohnDoe"
                required="true" />

            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                value={signupInput.email}
                onChange={(e) => changeInputHandler(e, "signup")}
                placeholder="eg. JohnDoe@gmail.com"
                required="true" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role">Account Type</Label>
              <select
                id="role"
                name="role"
                value={signupInput.role}
                onChange={(e) => changeInputHandler(e, "signup")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor (Publisher)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                name="password"
                value={signupInput.password}
                onChange={(e) => changeInputHandler(e, "signup")}
                placeholder="eg. xyz"
                required="true" />

            </div>

          </CardContent>
          <CardFooter>
            <Button disabled={registerIsLoading} onClick={() => handleRegistration("signup")}>
            {
                registerIsLoading ? (
                  <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Please wait
                  </>
                ) : "SignUp"
              }
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Login your with password here. After signup, you'll be logged in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                value={loginInput.email}
                onChange={(e) => changeInputHandler(e, "login")}
                placeholder="eg. JohnDoe@gmail.com"
                required="true" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                name="password"
                value={loginInput.password}
                onChange={(e) => changeInputHandler(e, "login")}
                placeholder="eg. xyz"
                required="true" />
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled={loginIsLoading} onClick={() => handleRegistration("login")}>
              {
                loginIsLoading ? (
                  <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Please wait
                  </>
                ) : "Login"
              }
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
    </div>
  )
}
export default Login;
