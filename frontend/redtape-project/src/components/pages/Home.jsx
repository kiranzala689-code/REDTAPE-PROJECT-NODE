import React, { useEffect, useState } from "react";
import Slider from "../slider/Slider";
import { Link } from "react-router-dom";
import axios from "axios";

function Home() {
  const [shoes, setShoes] = useState([]);

  useEffect(() => {
    const getTrendingShoes = async () => {
      try {
        const response = await axios.get(
          "https://wrogn-clone-react-1.onrender.com/shoes"
        );

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.products || [];

        setShoes(data.slice(0, 4));
      } catch (error) {
        console.log("TRENDING SHOES ERROR:", error);
      }
    };

    getTrendingShoes();
  }, []);

  const getPrice = (product) => {
    return Number(
      product.discountPrice ||
      product.salePrice ||
      product.price ||
      0
    );
  };

  const getOriginalPrice = (product) => {
    return Number(product.price || 0);
  };

  const getDiscount = (product) => {
    const originalPrice = getOriginalPrice(product);
    const salePrice = getPrice(product);

    if (originalPrice > salePrice && salePrice > 0) {
      return Math.round(
        ((originalPrice - salePrice) / originalPrice) * 100
      );
    }

    return 0;
  };

  const getImage = (product) => {
    return (
      product.images?.[0] ||
      product.image ||
      product.img ||
      ""
    );
  };

  return (
    <div>
      <Slider />

      <div className="banner">
        <h1>NEVER STEP BACK</h1>
      </div>

      <div className="container py-5">
        <div className="row px-1">

          <div className="col-lg-3 col-md-6 py-2 border border-1 col-6">
            <Link
              to="/category/footwear"
              className="text-decoration-none text-dark"
            >
              <div>
                <img
                  src="https://redtape.com/cdn/shop/files/size_800x933_02_copy_2_9e68bb47-0c5c-4f1f-aa2f-e9ef2738805d.webp?v=1775109227&width=450"
                  alt="Footwear"
                  className="w-100"
                />

                <div className="d-flex mt-2 justify-content-between">
                  <h5 className="font-bold">
                    FOOTWEAR
                  </h5>

                  <p className="fs-5">
                    <i className="bi bi-chevron-right fw-bolder fs-5"></i>
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-lg-3 col-md-6 border border-1 py-2 col-6">
            <Link
              to="/category/shirt"
              className="text-decoration-none text-dark"
            >
              <div>
                <img
                  src="https://redtape.com/cdn/shop/files/size_800x933_03_copy_2_8a46b805-116f-4202-b6e7-f60ceec54a53.webp?v=1775109253&width=450"
                  alt="Shirts"
                  className="w-100"
                />

                <div className="d-flex mt-2 justify-content-between">
                  <h5>
                    SHIRTS
                  </h5>

                  <p className="fs-5">
                    <i className="bi bi-chevron-right fw-bolder fs-5"></i>
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-lg-3 col-md-6 py-2 border border-1 col-6">
            <Link
              to="/category/new-arrival"
              className="text-decoration-none text-dark"
            >
              <div>
                <img
                  src="https://redtape.com/cdn/shop/files/size_800x933_06_copy.jpg?v=1775028749&width=450"
                  alt="Fresh Arrival"
                  className="w-100"
                />

                <div className="d-flex mt-2 justify-content-between">
                  <h5>
                    FRESH ARRIVALS
                  </h5>

                  <p className="fs-5">
                    <i className="bi bi-chevron-right fw-bolder fs-5"></i>
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-lg-3 col-md-6 py-2 border border-1 col-6">
            <Link
              to="/category/accessories"
              className="text-decoration-none text-dark"
            >
              <div>
                <img
                  src="https://redtape.com/cdn/shop/files/size_800x933_05_copy_51fd601b-fef9-4658-9f19-a86e08f4bc6b.webp?v=1775109253&width=450"
                  alt="Accessories"
                  className="w-100"
                />

                <div className="d-flex mt-2 justify-content-between">
                  <h5>
                    ACCESSORIES
                  </h5>

                  <p className="fs-5">
                    <i className="bi bi-chevron-right fw-bolder fs-5"></i>
                  </p>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>

      <div className="container-fluid px-0">
        <div className="w-100">
          <img
            src="https://redtape.com/cdn/shop/files/Banner_copy_51cc834c-627d-4eb6-bb7c-45f73fc62f08.jpg?v=1775109462"
            alt="RedTape Banner"
            className="img-fluid w-100 d-block"
          />
        </div>
      </div>

      <div className="container-fluid px-0 mt-4">
        <div className="d-flex flex-column flex-lg-row w-100">

          <div
            className="w-100"
            style={{
              flex: "0 0 50%",
              height: 300
            }}
          >
            <Link to="/category/shirt">
              <img
                src="https://redtape.com/cdn/shop/files/5_82e54660-d645-4777-872f-2eb51d7b4cd4.webp?v=1775109327&width=800"
                alt="Shirts"
                className="img-fluid w-100 d-block"
                style={{ cursor: "pointer" }}
              />
            </Link>
          </div>

          <div
            className="w-100"
            style={{
              flex: "0 50%"
            }}
          >
            <Link to="/category/womens">
              <img
                src="https://redtape.com/cdn/shop/files/4_79887107-a5e8-4815-9037-9b817421cc83.webp?v=1775109326&width=800"
                alt="Women Top"
                className="img-fluid w-100 d-block"
                style={{ cursor: "pointer" }}
              />
            </Link>
          </div>

        </div>
      </div>

      {shoes.length > 0 && (
        <section className="trending-shoes-section">

          <div className="container-fluid px-3 px-lg-4">

            <div className="trending-shoes-header">

              <div>
                <h2>
                  TRENDING SHOES
                </h2>

                <p>
                  Step into the latest styles
                </p>
              </div>

              <Link to="/category/shoes">
                VIEW ALL
                <i className="bi bi-arrow-right ms-2"></i>
              </Link>

            </div>

            <div className="row g-3 g-lg-4">

              {shoes.map((product) => {

                const image = getImage(product);
                const price = getPrice(product);
                const originalPrice =
                  getOriginalPrice(product);
                const discount =
                  getDiscount(product);

                const productId =
                  product._id || product.id;

                return (
                  <div
                    className="col-6 col-md-4 col-lg-3"
                    key={productId}
                  >

                    <div className="trending-shoe-card">

                      <div className="trending-shoe-image">

                        <Link
                          to={`/category/shoes/${productId}`}
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                            />
                          ) : (
                            <div className="trending-no-image">
                              No Image
                            </div>
                          )}
                        </Link>

                        <button
                          type="button"
                          className="trending-heart"
                        >
                          ♡
                        </button>

                      </div>

                      <Link
                        to={`/category/shoes/${productId}`}
                        className="trending-shoe-info"
                      >

                        <h5>
                          {product.name}
                        </h5>

                        <div className="trending-price">

                          {discount > 0 && (
                            <span className="trending-save">
                              Save {discount}%
                            </span>
                          )}

                          <span className="trending-sale-price">
                            ₹{" "}
                            {price.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {originalPrice > price && (
                            <span className="trending-old-price">
                              ₹{" "}
                              {originalPrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}

                        </div>

                      </Link>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </section>
      )}

    </div>
  );
}

export default Home;