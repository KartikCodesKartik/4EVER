import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const applyFilter = () => {
    let productsCopy = [...products];
    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory));
    }
    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    const sorted = [...filterProducts];
    switch (sortType) {
      case 'low-high':
        setFilterProducts(sorted.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilterProducts(sorted.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 pt-10 border-t">
      {/* Filters Section */}
      <div className="sm:min-w-60 px-3">
        <div
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center justify-between sm:justify-start cursor-pointer gap-2"
        >
          <p>FILTERS</p>
          <img
            className={`h-3 sm:hidden transition-transform ${showFilter ? 'rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </div>

        <div className={`${showFilter ? 'block' : 'hidden'} sm:block`}>
          {/* Category Filter */}
          <div className="border border-gray-300 pl-5 py-3 mt-4">
            <p className="mb-3 text-sm font-medium">CATEGORIES</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {['Men', 'Women', 'Kids'].map((cat) => (
                <label key={cat} className="flex gap-2 items-center">
                  <input type="checkbox" className="w-3" onChange={toggleCategory} value={cat} />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Subcategory Filter */}
          <div className="border border-gray-300 pl-5 py-3 mt-4">
            <p className="mb-3 text-sm font-medium">TYPE</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {['Topwear', 'Bottomwear', 'Winterwear'].map((subcat) => (
                <label key={subcat} className="flex gap-2 items-center">
                  <input type="checkbox" className="w-3" onChange={toggleSubCategory} value={subcat} />
                  {subcat}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="flex-1 px-3 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-base sm:text-xl mb-4 gap-3">
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border border-gray-300 text-sm px-3 py-1 w-fit"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {filterProducts.map((item, index) => (
              <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.images} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
