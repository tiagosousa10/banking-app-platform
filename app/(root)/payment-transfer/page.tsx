import HeaderBox from '@/components/HeaderBox'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const Transfer = async () => {
    const loggedIn = await getLoggedInUser(); // get logged in user
  
    const accounts = await getAccounts({ 
      userId: loggedIn.$id 
    })
    if(!accounts) return;
    
    const accountsData = accounts?.data;


  return (
    <section className='payment-transfer'>
      <HeaderBox 
        title='Payment Transfer'
        subtext='Please provide the necessary details to initiate a payment transfer.'
      />

      <section className='size-full pt-5'>
        <PaymentTransferForm 

        />
      </section>

    </section>
  )
}

export default Transfer
