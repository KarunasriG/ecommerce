import toast from "react-hot-toast";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useState } from "react";

const ProductCard = ({ product, onQuickView }) => {
	const { user } = useUserStore();
	const { addToCart } = useCartStore();
	const [isWishlisted, setIsWishlisted] = useState(false);

	const handleAddToCart = () => {
		if (!user) {
			toast.error("Please login to add products to cart", { id: "login" });
			return;
		} else {
			addToCart(product);
		}
	};

	const handleWishlist = () => {
		if (!user) {
			toast.error("Please login to add to wishlist", { id: "login" });
			return;
		}
		setIsWishlisted(!isWishlisted);
		toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
	};

	return (
		<div className='group flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg hover:border-emerald-500 transition-all duration-300'>
			<div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
				<img 
					className='object-cover w-full transform transition-transform duration-500 group-hover:scale-110' 
					src={product.image} 
					alt='product image' 
				/>
				<div className='absolute inset-0 transition-all duration-300 group-hover:bg-[rgba(196,192,186,0.1)]' />

				<div className='absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
					<button 
						onClick={handleWishlist}
						className={`p-2 rounded-full ${isWishlisted ? 'bg-red-500' : 'bg-white'} shadow-lg hover:scale-110 transition-transform duration-200`}
					>
						<Heart size={20} className={isWishlisted ? 'text-white' : 'text-red-500'} fill={isWishlisted ? 'white' : 'none'} />
					</button>
					<button 
						onClick={() => onQuickView?.(product)}
						className='p-2 rounded-full bg-white shadow-lg hover:scale-110 transition-transform duration-200'
					>
						<Eye size={20} className='text-gray-700' />
					</button>
				</div>
			</div>

			<div className='mt-4 px-5 pb-5'>
				<h5 className='text-xl font-semibold tracking-tight text-white group-hover:text-emerald-400 transition-colors duration-300'>{product.name}</h5>
				<div className='mt-2 mb-5 flex items-center justify-between'>
					<p>
						<span className='text-3xl font-bold text-emerald-400'>${product.price}</span>
					</p>
				</div>
				<button
					className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
					 text-white hover:bg-emerald-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300'
					onClick={handleAddToCart}
				>
					<ShoppingCart size={22} className='mr-2' />
					Add to cart
				</button>
			</div>
		</div>
	);
};
export default ProductCard;