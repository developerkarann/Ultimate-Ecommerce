import React, { useEffect, useState } from 'react'
import './products.css'
import { useSelector, useDispatch } from 'react-redux'
import { clearErrors, getProduct } from '../../actions/productAction'
import Loader from '../layout/loader/Loader'
import ProductCard from '../layout/home/ProductCard'
import { useParams } from 'react-router-dom'
import Pagination from 'react-js-pagination'
import Slider from '@material-ui/core/Slider'
import { Typography } from '@material-ui/core'
import { useAlert } from 'react-alert'
import MetaData from '../layout/MetaData'
export default function Products() {

    const dispatch = useDispatch()
    const { products, loading, error, productsCount, resultPerPage, } = useSelector(state => state.products)
    const { keyword } = useParams()
    const alert = useAlert()
    // console.log(keyword)
    // console.log(productsCount)
    const [currentPage, setCurrentPage] = useState(1);
    // const [price, setPrice] = useState([0,500000]);
    const [category, setCategory] = useState('')
    const [ratings, setRating] = useState(0)


    const setCurrentPageNo = (e) => {
        // console.log(e)
        setCurrentPage(e)
    }

    // const priceHandler = (event, newPrice) =>{
    //     setPrice(newPrice)
    // }

    const categories = [
        "Laptop",
        "Footwear",
        "Bottom",
        "Tops",
        "Attire",
        "Camera",
        "Mobile",
    ];


    useEffect(() => {
        if(error){
            alert.error(error)
            dispatch(clearErrors())
        }
        dispatch(getProduct(keyword, currentPage, category, ratings))
    }, [dispatch, keyword, currentPage,category, ratings, alert, error])

    return (
        <>
            {loading ? <Loader /> :
                <>
                <MetaData title='Products - Ecommerce'/>
                    <h2 className='productsHeading'>Products</h2>
                    <div className="products">
                        {products &&
                            products.map((product) => {
                                return (
                                    <ProductCard key={product._id} product={product} />
                                )
                            })}
                    </div>

                    <div className="filterBox">
                        <Typography>Price</Typography>
                        <Slider
                        // value={price}
                        // onChange={priceHandler}
                        valueLabelDisplay='auto'
                        aria-labelledby='range-slider'
                        min={0}
                        max={25000}
                        />
                        <Typography>Categories</Typography>
                        <ul className='categoryBox'>
                            {categories.map((category) => {
                                return (
                                    <li className='category-link' key={category} onClick={() => setCategory(category)}>{category}</li>
                                )
                            })}
                        </ul>

                        <fieldset>
                            <Typography component="legend">Ratings</Typography>
                            <Slider
                            value={ratings}
                            onChange={(e, newRating)=> {setRating(newRating)}}
                            aria-labelledby='continous-slider'
                            min={0}
                            max={5}
                            valueLabelDisplay='auto'
                            >
                            </Slider>
                        </fieldset>
                    </div>

                    {resultPerPage < productsCount && (
                        <div className="paginationBox">
                            <Pagination
                                activePage={currentPage}
                                itemsCountPerPage={resultPerPage}
                                totalItemsCount={productsCount}
                                onChange={setCurrentPageNo}
                                nextPageText="Next"
                                prevPageText="First"
                                firstPageText="1st"
                                lastPageText='Last'
                                itemClass='page-item'
                                linkClass='page-link'
                                activeClass='pageItemActive'
                                activeLinkClass='pageLinkActive'
                            >

                            </Pagination>
                        </div>
                    )}
                </>
            }
        </>
    )
}
