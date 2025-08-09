import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SmartSearch from "./SmartSearch";

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
    toast.success("Added to cart");
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/data/products.json");
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const products = await res.json();
        if (isMounted) {
          setData(products);
          setFilter(products);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        isMounted && setLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  const Loading = () => (
    <>
      <div className="col-12 py-5 text-center">
        <Skeleton height={40} width={560} />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="col-md-4 col-sm-6 col-12 mb-4">
          <Skeleton height={592} />
        </div>
      ))}
    </>
  );

  const filterProduct = (cat) => {
    setFilter(data.filter((item) => item.category === cat));
  };

  const ShowProducts = () => {
    if (!Array.isArray(filter)) {
      return (
        <div className="col-12 text-center text-danger">
          Error: invalid data format
        </div>
      );
    }
    if (filter.length === 0) {
      return (
        <div className="col-12 text-center">
          <p>No products found.</p>
        </div>
      );
    }
    return (
      <>
        <div className="buttons text-center py-5">
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => setFilter(data)}>
            All
          </button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("men's clothing")}>Men's Clothing</button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("women's clothing")}>Women's Clothing</button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("jewelery")}>Jewelery</button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("electronics")}>Electronics</button>
        </div>
        {filter.map((product) => (
          <div key={product.id} className="col-md-4 col-sm-6 col-12 mb-4">
            <div className="card text-center h-100">
              <img src={product.image} className="card-img-top p-3" alt={product.title} height={300} />
              <div className="card-body">
                <h5 className="card-title">{product.title.substring(0, 12)}...</h5>
                <p className="card-text">{product.description.substring(0, 90)}...</p>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item lead">$ {product.price}</li>
              </ul>
              <div className="card-body">
                <Link to={`/product/${product.id}`} className="btn btn-dark m-1">Buy Now</Link>
                <button className="btn btn-dark m-1" onClick={() => addProduct(product)}>Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="container my-3 py-3">
      <div className="row">
        <div className="col-12">
          <h2 className="display-5 text-center">Latest Products</h2>
          <hr />
        </div>
      </div>
      <SmartSearch onResults={setFilter} />
      <div className="row justify-content-center">
        {loading ? <Loading /> : <ShowProducts />}
      </div>
    </div>
  );
};

export default Products;
