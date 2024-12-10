import React from 'react'
import Link from 'next/link'
import { Models } from 'node-appwrite'
import Thumbnail from './Thumbnail'
import { convertFileSize } from '@/lib/utils'
import { Divide } from 'lucide-react'
import FormattedDateTime from './FormattedDateTime'
import ActionDropDown from './ActionDropDown'
const Card = ({
file
}:{
   file:Models.Document

}) => {
    const {url,name,type,extension,size}=file
  return (
    <Link href={url} target='_blank' className='file-card' >
        <div className='flex justify-between'>
            <Thumbnail url={url} 
            className='!size-20'
             type={type} 
             extension={extension}
             imageClassName='!size-11'
             />
             <div className=' flex   items-end flex-col  justify-between'>
                <ActionDropDown file={file}/>
                <p className=' body-1'>

                    {convertFileSize(size)}
                </p>
                
             </div>
            
        </div>
        <div className='file-card-details'>
            
           <p className='subtitle-2 line-clamp-1'></p> {name}</div>
           <FormattedDateTime
           createDate={file.$createdAt}
           className='body-2 text-light-100'
           />
           <p className='text-lig-200 caption line-clamp-1'>
            By: {file.owner.fullName}
             </p>
       
    </Link>
  )
}

export default Card