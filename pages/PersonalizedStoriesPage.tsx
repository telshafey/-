


import React from 'react';
// FIX: Replaced the 'react-router-dom' namespace import with named imports to resolve component and hook resolution errors, and updated the code to use them directly.
import { useNavigate } from 'react-router-dom';
import { useAdmin, PersonalizedProduct } from '../contexts/AdminContext';
import { useProduct, Prices } from '../contexts/ProductContext';
import PageLoader from '../components/ui/PageLoader';
import { ArrowLeft, Check } from 'lucide-react';
import ShareButtons from '../components/shared/ShareButtons';

const getPriceForProduct = (productKey: string, prices: Prices) => {
    switch(productKey) {
        case 'custom_story':
            return `تبدأ من ${prices.story.electronic} ج.م`;
        case 'coloring_book':
            return `${prices.coloringBook} ج.م`;
        case 'dua_booklet':
            return `${prices.duaBooklet} ج.م`;
        case 'gift_box':
            return `${prices.giftBox} ج.م`;
        default:
            return '';
    }
};

const ProductCard: React.FC<{ product: PersonalizedProduct, price: string }> = ({ product, price }) => {
    const navigate = useNavigate();

    const handleOrderNow = () => {
        navigate(`/order/${product.key}`);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 border">
            <div className="h-64 bg-gray-100 flex items-center justify-center p-4">
                <img src={product.image_url || ''} alt={product.title} className="max-h-full max-w-full object-contain" loading="lazy" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-800">{product.title}</h3>
                <p className="text-2xl font-extrabold text-blue-600 my-3">{price}</p>
                <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
                <ul className="space-y-2 text-gray-600 flex-grow mb-6">
                    {(product.features || []).map((feature, i) => (
                       <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 me-2 mt-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>
                <button 
                    onClick={handleOrderNow}
                    className="mt-auto w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md"
                >
                    <span>اطلب الآن</span>
                    <ArrowLeft size={20} />
                </button>
            </div>
        </div>
    );
};

const PersonalizedStoriesPage: React.FC = () => {
  const { personalizedProducts, loading: adminLoading } = useAdmin();
  const { prices, loading: pricesLoading } = useProduct();
  const pageUrl = window.location.href;

  if (adminLoading || pricesLoading || !prices) {
    return <PageLoader text="جاري تحميل المتجر..." />;
  }

  return (
    <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">متجر "إنها لك"</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
            استكشف منتجاتنا المصممة بحب لتلهم أطفالكم وتصنع ذكريات لا تُنسى. اختر المنتج وابدأ رحلة التخصيص.
          </p>
          <div className="mt-6 flex justify-center">
            <ShareButtons 
              title='اكتشف كنوز "إنها لك" لصناعة قصص الأطفال المخصصة' 
              url={pageUrl} 
              label="شارك المتجر:"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {personalizedProducts
                .sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99))
                .map(product => (
                    <ProductCard 
                        key={product.key} 
                        product={product} 
                        price={prices ? getPriceForProduct(product.key, prices) : ''} 
                    />
            ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedStoriesPage;
