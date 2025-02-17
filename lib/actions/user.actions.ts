'use server'

import { ID } from "node-appwrite"
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers"
import { encryptId, parseStringify } from "../utils"
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid"
import { plaidClient } from "../plaid"
import { revalidatePath } from "next/cache"
import { addFundingSource } from "./dwolla.actions"

const {
   APPWRITE_DATABASE_ID : DATABASE_ID,
   APPWRITE_USER_COLLECTION_ID : USER_COLLECTION_ID,
   APPWRITE_BANK_COLLECTION_ID : BANK_COLLECTION_ID,
} = process.env;

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


export const createBankAccount = async ({
   userId,
   bankId,
   accountId,
   accessToken,
   fundingSourceUrl,
   sharableId,
}: createBankAccountProps) => {
   try {

      const {database} = await createAdminClient()

      const bankAccount = await database.createDocument(
         DATABASE_ID!,
         BANK_COLLECTION_ID!,
         ID.unique(),
         {
            userId,
            bankId,
            accountId,
            accessToken,
            fundingSourceUrl,
            sharableId,
         }
      )

      return parseStringify(bankAccount)
      
   } catch(error) {
      console.log('Error while creating bank account:' , error)
   }
}


export const exchangePublicToken = async ({publicToken, user} : exchangePublicTokenProps) => {
   try {
      // used to exchange public token
      const response =await plaidClient.itemPublicTokenExchange({
         public_token: publicToken})

      const accessToken = response.data.access_token; // get access token
      const itemId = response.data.item_id; // get item id

      //get account information from plaid using the access token
      const accountsResponse = await plaidClient.accountsGet({
         access_token: accessToken
      })

      const accountData = accountsResponse.data.accounts[0] // get account data from plaid

      //create a processor token for dwolla using the access token and account id
      const request: ProcessorTokenCreateRequest = {
         access_token: accessToken,
         account_id: accountData.account_id,
         processor: 'dwolla' as ProcessorTokenCreateRequestProcessorEnum,
      }

      const processorTokenResponse = await plaidClient.processorTokenCreate(request);
      const processorToken = processorTokenResponse.data.processor_token; // get processor token

      // create a funding source URL for the account using the Dwolla customer Id, processor token, and bank name
      const fundingSourceUrl = await addFundingSource({
         dwollaCustomerId: user.dwollaCustomerId,
         processorToken,
         bankName: accountData.name
      })

      if(!fundingSourceUrl) throw Error; //if funding source url is not created then throw error

      await createBankAccount({
         userId: user.$id,
         bankId: itemId,
         accountId: accountData.account_id,
         accessToken,
         fundingSourceUrl,
         sharableId: encryptId(accountData.account_id)
      })
      // revalidate the page
      revalidatePath("/")

      return parseStringify({
         publicTokenExchange: "complete"
      })

   } catch(error) {
      console.log('Error while exchangePublicToken:' , error)
   }
}
