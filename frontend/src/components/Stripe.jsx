import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import axios from 'axios';
import CheckoutForm from './CheckoutForm';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)

const Stripe = ({ price, orderId }) => {
    const [clientSecret, setClientSecret] = useState('')
    const apperance = {
        theme: 'stripe'
    }
    const options = {
        apperance,
        clientSecret
    }

    const create_payment = async () => {
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/order/create-payment`,{price},{withCredentials:true})
            setClientSecret(data.clientSecret)
        } catch (error) {
            console.log(error.response.data)
        }
    }

    return (
        <div className='mt-4'>
            {
                clientSecret ? (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm orderId={orderId} />
                    </Elements>
                ) : <button onClick={create_payment} className='px-10 py-[6px] rounded-sm hover:shadow-green-700/30 hover:shadow-lg bg-green-700 text-white'>Start Payment</button>
            }
        </div>
    );
}; 

export default Stripe;