'use server'

import { ID } from "node-appwrite"
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers"
import { parseStringify } from "../utils"
import { CountryCode, Products } from "plaid"
import { plaidClient } from "../plaid"

export const signIn = async ({ email, password } : signInProps) => {
   try {
      //mutation  / database / make fetch
      const { account } = await createAdminClient();

      const response = await account.createEmailPasswordSession(email, password)
      return parseStringify(response)
      
   } catch(error) {
      console.log('Error:' , error)
   }
}


export const signUp = async (userData : SignUpParams) => {
   const {email, password, firstName, lastName} = userData ;

   try {
      const { account } = await createAdminClient();

      const newUserAccount = await account.create(
         ID.unique(),
         userData.email,
         userData.password,
         `${firstName} ${lastName}`
         );
      const session = await account.createEmailPasswordSession(email, password);

      cookies().set("appwrite-session", session.secret, {
         path: "/",
         httpOnly: true,
         sameSite: "strict",
         secure: true,
      });

      return parseStringify(newUserAccount)


         } catch(error) {
            console.log('Error:' , error)
         }
}


export async function getLoggedInUser() {
   try {
     const { account } = await createSessionClient();
     const user = await account.get();

     return parseStringify(user);
   } catch (error) {
     return null;
   }
}
 

export const logoutAccount = async() => {
   try {
      const {account} = await createSessionClient();
      cookies().delete("appwrite-session");

      await account.deleteSession("current");
      
   } catch(error) {
      return null;
   }
}


export const createLinkToken = async (user : User) => {
   try {
      //token params to create link token
      const tokenParams = {
         user: {
            client_user_id: user.$id
         },
         client_name: user.name,
         products: ['auth'] as Products[],
         language: 'en',
         country_codes: ['US'] as CountryCode[],
      }
      // to create link token
      const response = await plaidClient.linkTokenCreate(tokenParams)
      
      return parseStringify({linkToken: response.data.link_token}) // {linkToken: "token"}


   } catch(error) {
      console.log('Error:' , error)
   }
}



