'use client'

import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { navItems } from '@/constants'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
const Sidebar = (
  {fullName, email,avatar}:
  {fullName:string,
  email:string,
  avatar:string}

) => {
  const pathname=usePathname();
  return (
  <aside className='sidebar'>
    <Link href="/">
    <Image
    src="/assets/icons/logo-full-brand.svg"
    alt="logo"
    width={160}
    height={50}
    className="hidden h-auto lg:block"
    
    />
    <Image
    src="/assets/icons/logo-brand.svg"
    alt="logo"
    width={52}
    height={52}
    className='lg:hidden'
    />
  
    </Link>
    <nav className='sidebar-nav'>
      <ul  className=' flex flex-1 flex-col gab-6'>

      {navItems.map((item)=> (
          <Link key={item.name} href={item.url} className='lg:w-full'>
        <li className={cn("sidebar-nav-item", 

        // when pathname come from url === item.url change the layout
          pathname===item.url && "shad-active")}>
            <Image 
            src={item.icon}
             alt={item.name} 
            width={24} 
            height={24} 
            className={cn(
              "nav-icon",
              pathname===item.url && "nav-icon-active"
            )}

            />
            <p className='hidden lg:block'>{item.name}</p>
        </li>
          </Link>
      ))}

     </ul>
    </nav>

    <Image
    src="/assets/images/files-2.png"
    alt="logo"
    width={506}
    height={418}
    className='w-full'
    />
    <div className='sidebar-user-info'>
      <Image
      src="https://avatar.iran.liara.run/public/35"
      alt="avtar"
      width={44}
      height={44}
      className='sidebar-user-avatar'
      />

      <div className='hidden break-all lg:block'>
        <p className=' subtitle-2 capitalize ' >
          {fullName}
        </p>
        <p className=' capitalize '>{email}</p>
 
      </div>



    </div>

  </aside>
  )
}

export default Sidebar