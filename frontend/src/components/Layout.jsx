import React from 'react';
import { Outlet } from 'react-router-dom';
// Correct import path for the Cart component
import Cart from './Cart/Cart';

const Layout = () => {
  return (
    <>
      <Outlet />
      <Cart />
    </>
  );
};

export default Layout;
