import React, { useEffect, useState } from "react";
import "./Slider.css";

function Slider() {
  const images = [
    "https://redtape.com/cdn/shop/files/1700X700_1700x.jpg?v=1784611398",
    "https://redtape.com/cdn/shop/files/1700X-700_1700x.png?v=1785498726",
    "https://redtape.com/cdn/shop/files/1700x700.-VEGAN-png_1_1700x.png?v=1786109135",
    "https://redtape.com/cdn/shop/files/FINAL-BANNNER--1700X700_1700x.jpg?v=1785930292",
    "https://redtape.com/cdn/shop/files/shoes-banner-1700x700_1700x.jpg?v=1787120984"
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent(
      (prev) => (prev - 1 + images.length) % images.length
    );
  };

  return (
    <div className="container-fluid p-0">
      <div className="slider">

        <img
          src={images[current]}
          alt={`Banner ${current + 1}`}
          className="slide-img img-fluid"
        />

        <button
          type="button"
          className="prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <button
          type="button"
          className="next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <i className="bi bi-chevron-right"></i>
        </button>

        <div className="dots">
          {images.map((_, index) => (
            <button
              type="button"
              key={index}
              className={
                current === index
                  ? "dot active"
                  : "dot"
              }
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Slider;