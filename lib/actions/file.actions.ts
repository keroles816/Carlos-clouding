'use server'

import { InputFile } from "node-appwrite/file";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appWriteConfig } from "../appwrite/config";
import { ID, Models, Name, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";


const handleError = (error: unknown,message: string) => {
    console.log(error,message)
    throw error;
}
export const uploadFile=async(
    {
        file,
        ownerId,
        accountId,
        path
    }:UploadFileProps
        
    )=>{
      const {storage,database}=await createAdminClient();
      try {
        //here i read the file 
        const inputFile=InputFile.fromBuffer(file,file.name)
          //then i will upload the file
        const bucketFile=await storage.createFile(
            appWriteConfig.bucketId,
            ID.unique(),
            inputFile
        )
        //here we will create a file document
        //meta data and store it in the database

        const fileDocument={
            type : getFileType(bucketFile.name).type,
            name : bucketFile.name,
            url:constructFileUrl(bucketFile.$id),
            extension:getFileType(bucketFile.name).extension,
            size:bucketFile.sizeOriginal,
            owner:ownerId,
            accountId,
            users:[],
            bucketFileId:bucketFile.$id,

        }
          //here i store the meta data with unique id 
        const newFile= await database.createDocument(
            appWriteConfig.databaseId,
            appWriteConfig.filesCollectionId,
            ID.unique(),
            fileDocument,
        )
        //if something goes wrong i will delete the file
        //from storage
        .catch(async(error:unknown) => {
            await storage.deleteFile(appWriteConfig.bucketId,bucketFile.$id);
            handleError(error,"failed to create file document ")
        });

        revalidatePath(path)

        return parseStringify(newFile)
        
      } catch (error) {
        handleError(error,"failed to upload file")
      }

}

      const createQueries=(
        currentUser:Models.Document,
        types:string[],
        searchText:string,
        sort:string,
       limit?:number , 
      )=>{
        const queries = [
             Query.or([
              //owner is relationship to the current user
              //then you own this file 
            Query.equal("owner", [currentUser.$id]),
            //access file has been shared with them 
            //"users"is an array of emails
            //if the current user exist not the owner and 
            //exist in the users array
            Query.contains("users", [currentUser.email]),
          ])
        ]
        //type enum array of document audio image media others
        //in the collectiion file 
        //i already upload each file with its type
        if(types.length > 0 )queries.push(Query.equal("type",types))
          //if there is searchparms text = name of file 
          if(searchText)queries.push(Query.contains("name",searchText))
            if(limit )queries.push(Query.limit(limit))

              if(sort){
                  //The split("-") function splits the sort string into two parts using 
                  //the - character as the delimiter.
                  //sortBy name,date
                  //orderBy asc or desc
                const [sortBy,orderBy]=sort.split("-");
                //orderASc by database the filed sorby=name
                //otherwise the same filed name but descending by database
              queries.push (orderBy === 'asc'? Query.orderAsc(sortBy)
              :Query.orderDesc(sortBy))
              }




          return queries;
      }

  export const getFiles=async({ 
    searchText='',
     sort='$createdAt-desc',
     limit , 
     types = []
    }:GetFilesProps)=>{
    const {database}=await createAdminClient();
    try {
      const currentUser = await getCurrentUser();
      if(!currentUser) throw new Error("User not found")

        const queries =createQueries(
          currentUser,
          types,
          searchText,
           sort,
           limit , 
        )

        const files=await database.listDocuments(
            appWriteConfig.databaseId,
            appWriteConfig.filesCollectionId,
            queries
        )
        return parseStringify(files)

      
    } catch (error) {
      
    }
  }


 export  const renameFile=async({
    fileId,
    name,
    extension,
    path
  }:RenameFileProps)=>{
      const {database}=await createAdminClient();
      try {
        
          const newName=`${name}.${extension}`
          const updatedFile=await database.updateDocument(
                  appWriteConfig.databaseId,
                  appWriteConfig.filesCollectionId,
                  fileId,
                  {
                    name:newName
                  }

          )
          revalidatePath(path)
         return parseStringify(updatedFile)


      } catch (error) {
        handleError(error,"failed to rename file")
      }


  }

//all i need to do is update the users array
//with the new emails
//and database will check if the emails are valid in useres collectio automatically
//then it will share the file with specific email

//this check will be done with function create queries
//in create queries function check if the email is in users array
//current user email exist in users array
//then it will show the file
//by calling getFiles
  export  const updateFileUsers=async({
    fileId,
     emails,
    path 
  }:UpdateFileUsersProps)=>{
      const {database}=await createAdminClient();
      try { 
          const updatedFile=await database.updateDocument(
                  appWriteConfig.databaseId,
                  appWriteConfig.filesCollectionId,
                  fileId,
                  {
                  users:emails,
                  }

          )
          revalidatePath(path)
         return parseStringify(updatedFile)


      } catch (error) {
        handleError(error,"failed to rename file")
      }


  }

  export  const deleteFile=async({
    fileId,
    bucketFileId,
    path 
  }:DeleteFileProps)=>{
      const {database,storage}=await createAdminClient();
      try { 
          const deletedFile=await database.deleteDocument(
                  appWriteConfig.databaseId,
                  appWriteConfig.filesCollectionId,
                  fileId
                  
          )

          if(deletedFile) {
            await storage.deleteFile(appWriteConfig.bucketId,bucketFileId);
          }
          revalidatePath(path)
         return parseStringify({status:'success'})


      } catch (error) {
        handleError(error,"failed to rename file")
      }


  }



  //   ========== total fileee space used 
  
  
  export const getTotalSpaceUsed=async()=>{
      try {
        
          const {database}=await createSessionClient();
          const currentUser = await getCurrentUser();
          if(!currentUser) throw new Error("User not found")


            const files =await database.listDocuments(
              appWriteConfig.databaseId,
              appWriteConfig.filesCollectionId,
              [Query.equal("owner", [currentUser.$id])]
            );

              const totalSpace={
                image:{size:0,lastDate:""},
                document:{size:0,lastDate:""},
                video:{size:0,lastDate:""},
                audio :{size:0,lastDate:""},
               other:{size:0,lastDate:""},
               used:0,
               all:2 * 1024 * 1024 *1024 /* 2GB available bucket storage */,

              };
              files.documents.forEach((file)=>{
                const FileType = file.type as FileType;
                 totalSpace[FileType].size += file.size;// each file type size
                  totalSpace.used += file.size; // all total files sizes 
                  //now i will handle the recent file update
         
          if(!totalSpace[FileType].lastDate ||
    //if date in date base is greater than the current date in totalSpace 
    //update the last date from database
    new Date(file.$updatedAt) > new Date(totalSpace[FileType].lastDate)
                  ){
                    totalSpace[FileType].lastDate=file.$updatedAt             
                  }
              });

              return parseStringify(totalSpace)

      } catch (error) {
        handleError(error,"failed to get total space used")
        
      }



  }








