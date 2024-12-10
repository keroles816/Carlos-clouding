"use client"

import { set, z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Link from "next/link"
import { createAccount, signInUser  } from "@/lib/actions/user.actions"
import OTPModel from "./OTPModel"


type Formtype= "sign-in" | "sign-up"

const autoFormSchema=(formType : Formtype)=>{
  return z.object({
  email: z.string().email(),
  fullName:formType === "sign-up" ? 
  z.string().min(2).max(50) :z.string().optional(),
  })
}


const AuthForm = ( {type } : { type: Formtype }) => {
  const [isloading,setIsLoading] =useState(false)
  const [errorMessage,setErrorMessage] = useState("")
  const [accountId,setAccountId] = useState(null)
  const formSchema=autoFormSchema(type)
 // 1. Define your form.
 const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    email: "",
    fullName: "",

  },
})

// 2. Define a submit handler.
 const  onSubmit=async(values: z.infer<typeof formSchema>)=> {
  // Do something with the form values.
  // ✅ This will be type-safe and validated.

  setIsLoading(true);
  setErrorMessage("")
   try {
    
     const user =
     
     type==='sign-up'? await createAccount({
      fullName:values.fullName || '',
      email:values.email 
     }): await signInUser({email:values.email})
     
     setAccountId(user.accountId)
   } catch  {
    setErrorMessage("failed to create an account please try again ")
   }finally{
    setIsLoading(false)
   }


}

return (
  <>
  <Form {...form}>
    <form  onSubmit={form.handleSubmit(onSubmit)} 
    className="auth-form">
      <h1 className="form-title">{type==='sign-in'? "Sign In" : "Sign Up"}</h1>


      {type==='sign-up' && (
       
        <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <div className="shad-form-item">
             <FormLabel className="shad-form-label">Fullname</FormLabel>

            <FormControl>
              <Input className="shad-form-input"
               placeholder=" Enter your fullname" {...field} />
            </FormControl>
              </div>

          
            <FormMessage className="shad-form-message" />
          </FormItem>

            

        )}
      />
     )}

      <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <div className="shad-form-item">
           <FormLabel className="shad-form-label">Email</FormLabel>

          <FormControl>
            <Input className="shad-form-input"
             placeholder=" Enter your email" {...field} />
          </FormControl>
            </div>

        
          <FormMessage className="shad-form-message" />
        </FormItem>

      )}
      />

      <Button className="shad-submit-btn" disabled={isloading}
       type="submit">
       {type==='sign-in'? "Sign In" : "Sign Up"}
       {isloading &&
        (<Image src="/assets/icons/loader.svg"
           width={24} 
           height={24}
           alt="loading..."
           className="ml-2 animate-spin "
            />) }
        </Button>

        {errorMessage &&
         <p className="error-message">*{errorMessage}</p>}

         <div className=" body-2 flex justify-center">
          <p className=" text-light-100">
            {type==='sign-in'? "Don't have an account?" : "Already have an account?"}
            </p>
            <Link 
            href={type==='sign-in'? "/sign-up" : "/sign-in"}
            className="ml-1 font-medium text-brand hover:underline"
            >{type==='sign-in'? "sign-up" : "sign-in"}</Link>
         </div>
    </form>
  </Form>
  {accountId && (<OTPModel email={form.getValues("email")} 
  accountId={accountId} />)}
  </>
)
}

export default AuthForm