"use server";

import { Account, Client, Databases,Storage,Avatars } from "node-appwrite";
import { appWriteConfig } from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { get } from "http";

export const createSessionClient= async ()=>{
  //here we are create a session client as we can see cliennt
  //let users access data and perform actions "view","update profile"
  // i identify this cause there is a admin user
    const client = new Client()
    .setEndpoint(appWriteConfig.endpointUrl)
    .setProject(appWriteConfig.projectId)

    const session =(await cookies()).get("appwrite-session")
    if(!session || !session.value) throw new Error("No session found")
        client.setSession(session.value)
    return{
        get account(){
            return new Account(client)
        },
        get database(){
          return new Databases(client)
        }
    }
}

export const createAdminClient= async ()=>{
  //here we are create a admin client as we can see cliennt
  // have same things as users with extra fatuares like
  // "update user" , "delete user" , "create user" , "update user"
  const client = new Client()
    .setEndpoint(appWriteConfig.endpointUrl)
    .setProject(appWriteConfig.projectId)
     .setKey(appWriteConfig.secretKey)
   
    return{
        get account(){
            return new Account(client)
        },
        get database(){
          return new Databases(client)
        },
        get storage(){
          return new Storage(client)
        },
        get avatars(){
            return new Avatars(client)
          }
    }


}