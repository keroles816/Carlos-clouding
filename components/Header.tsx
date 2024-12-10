import React from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { signOutUser } from '@/lib/actions/user.actions'
import FileUploader from './FileUploader'
import Search from './Search'
const Header = ({accountId,ownerId}:{accountId:string,ownerId:string}) => {
  return (
    <header className='header'>
          <Search/>
        <div className=' header-wrapper' >
            <FileUploader 
            
            accountId={accountId}
            ownerId={ownerId}
            />
            <form action={async()=>{
                'use server'
                await signOutUser()
            }} >
                <Button type="submit" className='sign-out-button'>
                    <Image src="/assets/icons/logout.svg"
                    alt="logout"
                    width={24}
                    height={24}
                    className='w-6'
                    
                    />

                </Button>
            </form>

        </div>
    </header>
  )
}

export default Header