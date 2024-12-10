'use client'
import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { Button } from './ui/button'
import { cn, convertFileToUrl } from '@/lib/utils'
import Image from 'next/image'
import {getFileType} from '@/lib/utils'
import Thumbnail from './Thumbnail'
import { MAX_FILE_SIZE } from '@/constants'
import { useToast } from "@/hooks/use-toast"
import { uploadFile } from '@/lib/actions/file.actions'
import { usePathname } from 'next/navigation'



const FileUploader = ({ownerId,accountId,className}:
  {ownerId:string,accountId:string,className?:string}) => {
    const { toast } = useToast()
      const path=usePathname();
    const [files,setfiles]=useState<File[]>([])

  const onDrop = useCallback(async(acceptedFiles:File[])=> {

    setfiles(acceptedFiles)
      //what i want to do is to check the size of the file
      //if it is greater than 50mb then remove it fro array 
    const uploadPromises=acceptedFiles.map(async(file)=>{
        if(file.size > MAX_FILE_SIZE){
          //show all files except the one that will match the name
  setfiles((prevFile)=>prevFile.filter((f)=>f.name !== file.name))

            return toast({
              
              description:(
                <p className=' body-2' text-white>
                  <span className='font-semibold'>
                    {file.name}
                  </span> is too large.
                   Please select a file less than 50MB

                </p>
              ),
              className:'error-toast',
            })
        }
        //upload the file into storage 
        //and the meta data into database
        //then remove the file from the  array when it is uploaded
        return uploadFile({
        file,
        ownerId,
        accountId,
        path,
        }).then((uploadFile)=>{

          if(uploadFile){
            setfiles((prevFile)=>prevFile.filter((f)=>f.name !== file.name))
          }
        })

    });

    await Promise.all(uploadPromises);


    // Do something with the files
  }, [ownerId,accountId,path])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

//here i handle the remove file
//by filltering and show files except the one that will match the name 
//callback function 
  const handleRemoveFile=(e:React.MouseEvent<HTMLImageElement , MouseEvent>,
    filName:string)=>{
   e.stopPropagation();
   setfiles((prevFiles)=>prevFiles.filter((file)=>file.name !== filName))

  }

  return (
    <div {...getRootProps()} className=' cursor-pointer'>
      <input {...getInputProps()} />
      <Button className={cn('uploader-button',className

      )}>

        <Image 
        src="/assets/icons/upload.svg"
        alt="upload"
        width={24}
        height={24}
        />{" "}
        <p> Upload</p>



      </Button>

      {files.length > 0  && <ul className='uploader-preview-list'>
        <h4 className=' h4 text-light-100'>
          Uploading
        </h4>

        {files.map((file,index )=> {
          const {type,extension} = getFileType(file.name)

          return(

          <li key={`${file.name}-${index}`} 
          className='uploader-preview-item'>

            <div className=' flex items-center'>

              <Thumbnail
              type={type}
              extension={extension}
              url={convertFileToUrl(file)}
              
              />

              <div className=' preview-item-name'>

                {file.name}
                <Image
                src="/assets/icons/file-loader.gif"
                width={80}
                height={26}
                alt='loader'
                />
              </div>
            </div>
            
              <Image
              src="/assets/icons/remove.svg"
               height={24}
              width={24}
             alt="remove"
              onClick={(e)=> handleRemoveFile(e ,file.name)}
              />
            </li>
        
        )
        })}

        </ul>}

    </div>
  )
}

export default FileUploader