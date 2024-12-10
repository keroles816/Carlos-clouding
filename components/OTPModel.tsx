'use client'
import React from 'react'
import { useState } from "react"
import { veifySecret } from "@/lib/actions/user.actions"
import { useRouter } from 'next/navigation'
import { sendEmailOTP } from "@/lib/actions/user.actions"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"

  import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
  } from "@/components/ui/input-otp"
  import Image from 'next/image'
  import { Button } from './ui/button'
import { verify } from 'crypto'

  
  
  

const OTPModel = 
 ({email,accountId}:
    {email:string,accountId:string}) => {
      const router=useRouter()
        const [isOpen, setIsOpen] = useState(true)
        const[password,setPassword] = useState("")
        const[isloading,setIsLoading] = useState(false)

        const handleSubmit=async(e:React.MouseEvent<HTMLButtonElement>)=>{
          e.preventDefault()  
            setIsLoading(true)
            try {
          const sessionId=await veifySecret({accountId,password})

           if(sessionId)router.push("/")
          

            } catch (error) {
                console.log("failed to verify OTP",error)
            }
            setIsLoading(false)
        }

        const handleResendOtp=async()=>{

          await sendEmailOTP({email})

        }

  return (
        <AlertDialog    open={isOpen} onOpenChange={setIsOpen}>
    
    <AlertDialogContent className='shad-alert-dialog '>
        <AlertDialogHeader className=' relative flex justify-center'>
        <AlertDialogTitle className=' h2 text-center' >
         Enter your OTP
         <Image src="/assets/icons/close-dark.svg" 
         alt='close'
         width={20}
          height={20}
          onClick={()=>setIsOpen(false)}
          className=' otp-close-button'
         />
         </AlertDialogTitle>
        <AlertDialogDescription className=' subtitle-2 
        text-light-100
        text-center min-w-[500px]'>
            <div className=' flex flex-col'>
            We've sent a code to
            <span className=' text-brand' >{email}</span>
            </div>
         
        </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP 
        maxLength={6}
        value={password}
        onChange={setPassword}
        >
            <InputOTPGroup className=' shad-otp'>
                <InputOTPSlot index={0} className='shad-otp-slot'/>
                <InputOTPSlot index={1} className='shad-otp-slot'/>
                <InputOTPSlot index={2} className='shad-otp-slot'/>
                <InputOTPSlot index={3} className='shad-otp-slot'/>
                <InputOTPSlot index={4} className='shad-otp-slot'/>
                <InputOTPSlot index={5} className='shad-otp-slot'/>
            </InputOTPGroup>
            </InputOTP>

        <AlertDialogFooter>

           <div className=' flex w-full flex-col gab-4'>
            
        <AlertDialogAction 
        onClick={handleSubmit}
        className=' shad-submit-btn h-12'
        type='button'
        >
        {isloading&& (<Image
          src="/assets/icons/loader.svg"
          alt="loader"
          width={20}
          height={20}
          className=' ml-2 animate-spin'
          />)}  
            
          Submit 
            </AlertDialogAction>
            <div className='
            subtitle-2 mt-2 text-center
             text-light-100 '>
                Did't get a code?
                <Button type='button' variant='link'
                onClick={handleResendOtp} 
                className=' p-1 text-brand '>
                    Resend</Button>
            </div>

            </div> 
       
        </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>

  )
}

export default OTPModel