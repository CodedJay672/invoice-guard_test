import Link from 'next/link'
import React from 'react'

function Footer() {
  const date = new Date();
  const fullYear = date.getFullYear();


  return (
    <footer className='w-full'>
      <div className='w-full h-[391.99px] py-[81.61px] bg-linear-to-br from-brand-navy-hover to-brand-navy'>
        <div className='w-145 mx-auto space-y-4'>
          <h1 className='text-center text-2xl md:text-4xl text-content-inverse font-black text-pretty'>Start recovering what you're owed</h1>
          <p className='text-sm md:text-base text-content-muted text-center'>Join 1,200+ UK businesses using InvoiceGuard to recover late payments faster and with less stress.</p>

          <Link href="#" className='w-62.25 h-11.5 text-content-inverse bg-brand-teal rounded-[8px] flex justify-center items-center mx-auto hover:underline'>
            Start you 14-day free trial
          </Link>
        </div>
      </div>

      <div className='w-full pt-14 bg-brand-navy'>
        <div className='w-290 h-[181.67px] flex flex-col md:flex-row gap-10 mx-auto'>
          <div className='w-[306.4px] space-y-1'>
            <h2 className='text-base md:text-lg text-content-inverse font-bold'>
              <span className='inline-block p-1.5 rounded-full bg-brand-teal mr-2' />
              Invoice <span className='text-brand-teal'>Guard</span>
            </h2>

            <p className='text-sm md:text-base text-content-muted'>Company risk intelligence and late payment recovery for UK businesses.</p>
          </div>

          <div className='flex-1'>
            <h2 className="text-sm md:text-base text-content-inverse font-semibold">Product</h2>
            <ul className='text-content-muted text-xs md:text-sm mt-4 space-y-4'>
              <li>
                <Link href="#">How it works</Link>
              </li>
              <li>
                <Link href="#">Pricing</Link>
              </li>
              <li>
                <Link href="#">Company Search</Link>
              </li>
              <li>
                <Link href="#">Dashboard</Link>
              </li>
            </ul>
          </div>

          <div className='flex-1'>
            <h2 className="text-sm md:text-base text-content-inverse font-semibold">Legal</h2>
            <ul className='text-content-muted text-xs md:text-sm mt-4 space-y-4'>
              <li>
                <Link href="#">Privacy policy</Link>
              </li>
              <li>
                <Link href="#">Terms of service</Link>
              </li>
              <li>
                <Link href="#">Cookie policy</Link>
              </li>
              <li>
                <Link href="#">GDPR</Link>
              </li>
            </ul>
          </div>

          <div className='flex-1'>
            <h2 className="text-sm md:text-base text-content-inverse font-semibold">Support</h2>
            <ul className='text-content-muted text-xs md:text-sm mt-4 space-y-4'>
              <li>
                <Link href="#">Help center</Link>
              </li>
              <li>
                <Link href="#">Contact us</Link>
              </li>
              <li>
                <Link href="#">Status</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-290 flex justify-between items-center py-[22.4px] mx-auto">
          <p className='text-xs md:text-sm text-content-muted'>
            &copy; {fullYear} InvoiceGuard Ltd. All rights reserved.
          </p>

          <p className='text-xs md:text-sm text-content-muted'>
            Registered in England and Wales · Company No. 14872651
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer