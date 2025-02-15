import AuthForm from '@/components/AuthForm'
import React from 'react'

const SignIn = () => {
  return (
    <section className='flex-center size-full max-sm:px-6'>
      <form action="">
        <AuthForm type="sign-in"/>
      </form>
    </section>
  )
}

export default SignIn
