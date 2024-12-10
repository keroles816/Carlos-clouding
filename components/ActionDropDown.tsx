'use client'
import React,{useState} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

  
  
  
import { Models } from 'node-appwrite'
import { actionsDropdownItems } from '@/constants'
import { constructDownloadUrl, getFileType } from '@/lib/utils'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { set } from 'zod';
import { rename } from 'fs';
import { deleteFile, renameFile, updateFileUsers } from '@/lib/actions/file.actions';
import { usePathname } from 'next/navigation';
import { FileDetails,ShareInput } from './ActionsModelContent';


const ActionDropDown = ({
    file
}:{file:Models.Document}) => {
    const[isModelOpen,setIsModelOpen]=useState(false)
    const[isDropdownOpen,setIsDropDownOpen]=useState(false)
    const[action,setAction]=useState<ActionType|null>(null)
    const [name,setName]=useState(file.name)
    const [isloading,setIsLoading]= useState(false)
    const path = usePathname()

    //setEmails state updated by textInput from ActionModel content
    //then i send the array of emails to database by updateFileUsers
    //by send email state as props
    const [emails,setEmails]=useState<string[]>([])

           //for reset all models      
        const closeAllModels=()=>{
            setIsModelOpen(false);
            setIsDropDownOpen(false);
            setAction(null);
            setName(file.name);

        }
         //to handle the action
         //by call each action from database 
         //rebameffile sharefile deletefile
         //renameFile update file by updateDocument  
        const handleAction= async()=>{
            if(!action)return;
            setIsLoading(true);
            let success=false;

            const actions={
                rename:()=>renameFile({
                    fileId:file.$id,
                    //new name i got from input
                    name:name,
                    extension:file.extension,
                    //url i got from url by use PathName
                    path
                }),
                share:()=>updateFileUsers(
                 { fileId:file.$id,
                  emails,
                  path
                }
                ),
                delete:()=>deleteFile({
                  path,
                  fileId:file.$id,
                  bucketFileId:file.bucketFileId,
                })

            }   
              //when i click on action button
              //if value of action is rename i will call rename function
              //if value of action is share i will call share function
              //if value of action is delete i will call delete function
            success = await actions[action.value as keyof typeof actions]();
            if(success) closeAllModels();
            setIsLoading(false);

        }
          // this function should remove the email user from 
          //share list and it update by ui shareInput 
        const handleRemoveUser=async ( email:string)=>{
          //then i will update the emails array
          // i will showw all emails except the one i press on it 
          const updateedEmails = emails.filter((e)=>e !== email)
            //then if remove exact email from database array just uppdate
            //the whole array with updated array
            const success= await updateFileUsers({
                fileId:file.$id,
                emails:updateedEmails,
                path,

            })
            //then store it in state by setemails to new updated array from db
            if(success) setEmails(updateedEmails);
            closeAllModels();
        }

   const renderDialogContent=()=>{
    if(!action) return null;
    const{value,label}=action
    return(
    <DialogContent className='shad-dialog'>
    <DialogHeader className='flex flex-col gab-3'>
      <DialogTitle className='text-center text-light-100'>
        {label}
        
        </DialogTitle>
    {value === 'rename' && 
    <Input type='text'
     value={name} 
    onChange={(e)=>setName(e.target.value)} 
    className='rename-input-field'/>}

    {value === 'details' && <FileDetails file={file} />}

      {value === 'share' && (
        <ShareInput 
        onInputChange={setEmails} 
        onRemove={handleRemoveUser} 
         file={file}/>
      )}

      {value === 'delete' && (
        <p className=' delete-confirmation'>
          Are you sure you want to delete {' '}
          <span className='delete-file-name'>
            {file.name}
          </span>
        </p>
      )}

    </DialogHeader>

    {["rename","share","delete"].includes(value) && (
        <DialogFooter className='flex gap-3  md:flex-row  items-center  flex-col gab-3 '>
            <Button
            onClick={closeAllModels}
            className='modal-cancel-button'>Cancel</Button>

            <Button onClick={handleAction} className='modal-submit-button'>
                <p className=' capitalize'>{value}</p>
                {isloading &&(
                    <Image
                    src="/assets/icons/loader.svg"
                    alt="loader"
                    width={24}
                    height={24}
                    className='animate-spin ml-2'

                    />
                )}
            </Button>
        </DialogFooter>
    )}


    
  </DialogContent>
  )
  

   }

  return (
    <Dialog open={isModelOpen} onOpenChange={setIsModelOpen}>
    <DropdownMenu 
    open={isDropdownOpen}
    onOpenChange={setIsDropDownOpen}>

  <DropdownMenuTrigger className='shad-no-focus'>
    <Image
    src="/assets/icons/dots.svg"
    alt="dots"
    width={34}
    height={34}
    />

  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel className=' max-w-[200px] truncate'>
        {file.name}
        
        </DropdownMenuLabel>
    <DropdownMenuSeparator />
    {actionsDropdownItems.map((actionItem)=>(
            <DropdownMenuItem
            className='shad-dropdown-item'
             key={actionItem.value}
             onClick={()=>{
                setAction(actionItem)

                //here to open the other model to manage those functionalty
          if(
            ["rename","share","delete","details"].includes(actionItem.value)){
             setIsModelOpen(true)
                }
             }}
             >

             {actionItem.value === 'download' ? 
             (
             <Link href={constructDownloadUrl(file.bucketFileId)}
              download={file.name}
              className='flex items-center gap-2'
              >
                <Image
                src={actionItem.icon}
                alt={actionItem.label}
                width={30}
                height={30}
                />
                {actionItem.label}


              </Link>):(
             <div className='flex items-center gap-2'>
                <Image
                src={actionItem.icon}
                alt={actionItem.label}
                width={30}
                height={30}
                />
                {actionItem.label}
             </div>
              )}

            </DropdownMenuItem>

    ))}
   </DropdownMenuContent>
   </DropdownMenu>
   {renderDialogContent()}
  </Dialog>
  

  )
}

export default ActionDropDown