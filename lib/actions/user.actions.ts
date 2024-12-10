"use server";
 
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appWriteConfig } from "../appwrite/config";
import { ID, Query } from "node-appwrite";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


    const getUserByEmail=async (email:string)=>{
        //first we need to create a admin settion with autorites to update and 
        //check and delete users
    const {database}=await createAdminClient()//2 exports in that file 
 // now we tell where the query we should look at it to get the user
    const result =await database.listDocuments(
        appWriteConfig.databaseId,//i should put the database id 
        appWriteConfig.usersCollectionId,
        [Query.equal("email",[email])]

    )
    //if there is result show me the first one of the array
    return result.total > 0 ? result.documents[0] : null

    }

    const handleError = (error: unknown,message: string) => {
        console.log(error,message)
        throw error;
    }

 export const sendEmailOTP=async ({email}:{
        email:string
    })=>{
        //we will send otp notification to that email to make sure the user under the same email

        //make a dmin session with account 
        const {account}=await createAdminClient()
       //create an account with id and email 
        try {
            //if the user is not exist
            //createEmailToken generates a new account with a unique userId.
            const session =
            await account.createEmailToken(ID.unique(),email)
            return session.userId
            
        } catch (error) {
            handleError(error,"Error creating user")
        }

    }


export const createAccount = 
 async ({fullName,email}:{
    fullName:string,
    email:string
})=>{
    //it start when i press on sign up button on sign up page
    // it takes me here to create an account
    // and send otp to the same account 
    //i will search about the user to see if there is a
    // user with the same email

  const existingUser = await getUserByEmail(email);

  //if the user is not  exist then i will send an otp
  //then i will create a new user
  const accountId =await sendEmailOTP({email}); 
  //always return the account id whatever accouts is exist or not 
  //if exist then i will return the account id from database
  //if not not exist creatEmailToke it will generate unique id 
  if(!accountId)throw new Error("Error to send an OTP")
    //if the user is not exist then i will make the new user 
   //with the data comming from props 
    if(!existingUser){
        const {database}=await createAdminClient();
        await database.createDocument(
            appWriteConfig.databaseId,
            appWriteConfig.usersCollectionId,
            ID.unique(),
            {
                email,
                fullName,
                avatar:"https://avatar.iran.liara.run/public/35",
                
                accountId,
            }
        )
    }
    return parseStringify({accountId})

};

export const veifySecret = async ({accountId
    ,password}:
    {accountId:string,password:string})=>{
        try {
            const { account } = await createAdminClient();
             //This step verifies the provided accountId and password (likely the OTP).
                    //If successful, it creates a new session for the user.
                    //If the credentials are invalid, an error is thrown.
            const session = await account.createSession(accountId, password);
        //The session.secret (a unique session token) is stored as a secure HTTP-only
            (await cookies()).set("appwrite-session", session.secret, {
              path: "/",//The cookie is available across the entire app.
              httpOnly: true,// Prevents client-side scripts from accessing the cookie
              sameSite: "strict",//Ensures the cookie is only sent with requests from your app.

              secure: true,//Ensures the cookie is only sent over HTTPS.
            });

            return parseStringify({sessionId:session.$id})
        } catch (error) {
            handleError(error,"Error creating user")
        }
    }


    export const getCurrentUser = async ()=>{

        try {
            
            const {database,account}=await createSessionClient()
    //account.get(): Retrieves the currently authenticated user's account details (e.g., ID, email, etc.).
    //he result includes a unique $id that identifies the user.
            const result = await account.get();
    
    
            const user = await database.listDocuments(
                appWriteConfig.databaseId,
                appWriteConfig.usersCollectionId,
                [Query.equal("accountId",result.$id)]
    
            )
            if(user.total<=0)return null
    
            return parseStringify(user.documents[0])
        } catch (error) {
            console.log(error)
        }

    }

    export const signOutUser=async()=>{

        const {account}=await createSessionClient()

        try {
          await account.deleteSession("current");
          (await cookies()).delete("appwrite-session");

        } catch (error) {
            console.log('error looging out:',error)
        }finally{
            redirect('/sign-in')}

 
    }
    export const signInUser=async({email}:{email:string})=>{
        try {
            const existingUser = await getUserByEmail(email);
            if(existingUser){
                await sendEmailOTP({email});
                return parseStringify({accountId:existingUser.accountId})
            }

            return parseStringify({accountId:null,error:'user not found '})

        } catch (error) {
            handleError(error,"Error creating user")
        }


    }