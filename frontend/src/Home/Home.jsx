import React from 'react'
import NavBar from '../navbar/NavBar'
import Footer from '../Footer/Footer'
import HeroSection from './HeroSection'
import Cart from '../components/Cart/Cart'
import Product from '../Product/Product'

const Home = () => {
  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-[#e0f7fa] to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300'>
        <NavBar/>
        <main className='flex-grow'>
          <div className='container mx-auto px-4'>
            <HeroSection/>
          </div>
        </main>
        <Footer/>
        <Cart />
    </div>
  )
}

export default Home