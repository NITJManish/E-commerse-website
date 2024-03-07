import React from 'react'
import './Breadscrum.css'
import arrow_icon from '../Assests/breadcrum_arrow.png';

const Breadscrum = (props) => {
    const {product}=props;
  return (
    <div className='breadscrum'>
    Home <img src={arrow_icon} alt="" />SHOP <img src={arrow_icon} alt="" /> {product.category} <img src={arrow_icon} alt="" /> {product.name}
    </div>
  )
}

export default Breadscrum
